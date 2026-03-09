// src/controllers/inventoryController.ts
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

// ─── Helper: resolve pharmacyId for any user role ────────────────────────────
// Owners have pharmacyId directly on their user record (via ownedStores).
// Pharmacists are linked via the Staff table.
// This helper tries all sources so neither role ever gets a 400.
const resolvePharmacyId = async (user: any, queryPharmacyId?: string): Promise<string | null> => {
  // 1. Directly on user object (set at login)
  if (user.pharmacyId) return user.pharmacyId

  // 2. Passed as query param (owner switching between stores)
  if (queryPharmacyId) return queryPharmacyId

  // 3. Look up via Staff table (pharmacist assigned to a pharmacy)
  const staff = await prisma.staff.findFirst({
    where: { userId: user.id, isActive: true },
    select: { pharmacyId: true }
  })
  if (staff?.pharmacyId) return staff.pharmacyId

  // 4. Owner — find their first owned pharmacy
  const owned = await prisma.pharmacy.findFirst({
    where: { ownerId: user.id },
    select: { id: true }
  })
  if (owned?.id) return owned.id

  return null
}

// ─── GET /api/inventory ───────────────────────────────────────────────────────
export const getInventory = async (req: Request, res: Response) => {
  try {
    const pharmacyId = await resolvePharmacyId(req.user, req.query.pharmacyId as string)

    if (!pharmacyId) {
      return res.status(400).json({
        error: 'No pharmacy associated with your account. Please contact the pharmacy owner.'
      })
    }

    const { category, expiry, lowStock, search } = req.query

    const where: any = { pharmacyId }

    // Category filter (on related medicine)
    const medicineWhere: any = {}
    if (category) medicineWhere.category = category as string
    if (search) medicineWhere.name = { contains: search as string, mode: 'insensitive' }
    if (Object.keys(medicineWhere).length > 0) where.medicine = medicineWhere

    // Expiry filter
    if (expiry === 'expiring') {
      const ninetyDaysFromNow = new Date()
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
      where.expiryDate = { lte: ninetyDaysFromNow }
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: { medicine: true, supplier: true },
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }]
    })

    const formatted = inventory.map((item) => ({
      id: item.id,
      // Both field names so frontend works regardless of which it reads
      name: item.medicine.name,
      medicineName: item.medicine.name,
      genericName: item.medicine.genericName,
      category: item.medicine.category,
      manufacturer: item.medicine.manufacturer,
      strength: item.medicine.strength,
      form: item.medicine.form,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      currentStock: item.quantity,
      reorderLevel: item.reorderLevel,
      unitPrice: item.unitPrice,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier?.name,
      location: item.location,
      status: item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock',
      daysToExpiry: Math.ceil(
        (item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Get inventory error:', error)
    res.status(500).json({ error: 'Failed to fetch inventory' })
  }
}

// ─── POST /api/inventory ──────────────────────────────────────────────────────
export const addInventoryItem = async (req: Request, res: Response) => {
  try {
    const pharmacyId = await resolvePharmacyId(req.user, req.body.pharmacyId)

    if (!pharmacyId) {
      return res.status(400).json({
        error: 'No pharmacy associated with your account. Please contact the pharmacy owner.'
      })
    }

    const {
      medicineName, genericName, category, manufacturer,
      strength, form, batchNumber, expiryDate, quantity,
      reorderLevel, unitPrice, sellingPrice, supplierId,
      location, requiresPrescription
    } = req.body

    if (!medicineName || !batchNumber || !expiryDate || !quantity || !unitPrice) {
      return res.status(400).json({
        error: 'Missing required fields: medicineName, batchNumber, expiryDate, quantity, unitPrice'
      })
    }

    // Find or create the Medicine record
    let medicine = await prisma.medicine.findFirst({
      where: { name: medicineName, pharmacyId }
    })

    if (!medicine) {
      medicine = await prisma.medicine.create({
        data: {
          name: medicineName,
          genericName: genericName || medicineName,
          category: category || 'Other',
          manufacturer: manufacturer || 'Unknown',
          strength: strength || 'N/A',
          form: form || 'Tablet',
          requiresPrescription: requiresPrescription || false,
          pharmacyId
        }
      })
    }

    // Check for duplicate batch
    const existingBatch = await prisma.inventory.findFirst({
      where: { medicineId: medicine.id, pharmacyId, batchNumber }
    })

    if (existingBatch) {
      return res.status(400).json({
        error: `Batch number "${batchNumber}" already exists for ${medicineName}. Use a different batch number or adjust stock instead.`
      })
    }

    // Create inventory item
    const inventory = await prisma.inventory.create({
      data: {
        medicineId: medicine.id,
        pharmacyId,
        batchNumber,
        expiryDate: new Date(expiryDate),
        quantity: parseInt(quantity),
        reorderLevel: parseInt(reorderLevel) || 10,
        unitPrice: parseFloat(unitPrice),
        sellingPrice: parseFloat(sellingPrice || unitPrice),
        supplierId: supplierId || null,
        location: location || 'Main Store'
      },
      include: { medicine: true, supplier: true }
    })

    // Auto-create low stock alert if needed
    if (inventory.quantity <= inventory.reorderLevel) {
      await prisma.lowStockAlert.create({
        data: {
          inventoryId: inventory.id,
          pharmacyId,
          currentStock: inventory.quantity,
          reorderLevel: inventory.reorderLevel
        }
      })
    }

    res.status(201).json({
      id: inventory.id,
      name: inventory.medicine.name,
      medicineName: inventory.medicine.name,
      batchNumber: inventory.batchNumber,
      quantity: inventory.quantity,
      sellingPrice: inventory.sellingPrice,
      unitPrice: inventory.unitPrice,
      message: 'Inventory item added successfully'
    })
  } catch (error: any) {
    console.error('Add inventory error:', error)

    // Prisma unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'This batch number already exists for this medicine in your pharmacy.'
      })
    }

    res.status(500).json({ error: 'Failed to add inventory item', detail: error.message })
  }
}

// ─── PUT /api/inventory/:id ───────────────────────────────────────────────────
export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const itemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { quantity, sellingPrice, unitPrice, location } = req.body

    const inventory = await prisma.inventory.update({
      where: { id: itemId },
      data: {
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(sellingPrice !== undefined && { sellingPrice: parseFloat(sellingPrice) }),
        ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
        ...(location !== undefined && { location })
      },
      include: { medicine: true }
    })

    // Update low stock alerts
    if (inventory.quantity <= inventory.reorderLevel) {
      await prisma.lowStockAlert.create({
        data: {
          inventoryId: inventory.id,
          pharmacyId: inventory.pharmacyId,
          currentStock: inventory.quantity,
          reorderLevel: inventory.reorderLevel
        }
      }).catch(() => {}) // ignore if alert already exists
    } else {
      await prisma.lowStockAlert.updateMany({
        where: { inventoryId: itemId, isResolved: false },
        data: { isResolved: true, resolvedAt: new Date() }
      })
    }

    res.json(inventory)
  } catch (error: any) {
    console.error('Update inventory error:', error)
    res.status(500).json({ error: 'Failed to update inventory item' })
  }
}

// ─── DELETE /api/inventory/:id ────────────────────────────────────────────────
export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const itemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    await prisma.$transaction([
      prisma.lowStockAlert.deleteMany({ where: { inventoryId: itemId } }),
      prisma.inventory.delete({ where: { id: itemId } })
    ])

    res.json({ message: 'Inventory item deleted successfully' })
  } catch (error: any) {
    console.error('Delete inventory error:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Inventory item not found' })
    }
    res.status(500).json({ error: 'Failed to delete inventory item' })
  }
}

// ─── PATCH /api/inventory/:id/stock ──────────────────────────────────────────
export const adjustStock = async (req: Request, res: Response) => {
  try {
    const itemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { adjustment, reason } = req.body

    if (adjustment === undefined || isNaN(parseInt(adjustment))) {
      return res.status(400).json({ error: 'adjustment must be a valid number' })
    }

    const existing = await prisma.inventory.findUnique({
      where: { id: itemId },
      include: { medicine: true }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Inventory item not found' })
    }

    const newQuantity = existing.quantity + parseInt(adjustment)
    if (newQuantity < 0) {
      return res.status(400).json({
        error: `Cannot reduce stock below 0. Current stock: ${existing.quantity}`
      })
    }

    const updated = await prisma.inventory.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
      include: { medicine: true }
    })

    res.json({
      id: updated.id,
      medicineName: updated.medicine.name,
      previousQuantity: existing.quantity,
      adjustment: parseInt(adjustment),
      newQuantity: updated.quantity,
      reason
    })
  } catch (error) {
    console.error('Adjust stock error:', error)
    res.status(500).json({ error: 'Failed to adjust stock' })
  }
}