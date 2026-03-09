// backend/src/controllers/pharmacyController.ts
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

// GET /api/pharmacies — owner sees their pharmacies with real stats
export const getPharmacies = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user.id

    const pharmacies = await prisma.pharmacy.findMany({
      where: { ownerId },
      include: {
        _count: {
          select: {
            staff: { where: { isActive: true } }
          }
        }
      }
    })

    // For each pharmacy, fetch real stats
    const enriched = await Promise.all(pharmacies.map(async (p) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get all inventory for manual low stock calculation (Prisma can't compare two columns)
      const [allInventory, todaySalesAgg, pendingClaims] = await Promise.all([
        prisma.inventory.findMany({
          where: { pharmacyId: p.id },
          select: { quantity: true, reorderLevel: true }
        }),
        prisma.sale.aggregate({
          where: { pharmacyId: p.id, createdAt: { gte: today } },
          _sum: { total: true }
        }),
        prisma.claim.count({ where: { pharmacyId: p.id, status: 'PENDING' } })
      ])

      const lowStockCount = allInventory.filter(i => i.quantity <= i.reorderLevel).length

      return {
        id: p.id,
        name: p.name,
        location: p.address || '',   // schema uses 'address' not 'location'
        address: p.address || '',
        phone: p.phone || '',
        email: p.email || '',
        licenseNumber: p.licenseNumber,
        status: p.isActive ? 'active' : 'inactive',
        totalMedicines: allInventory.length,
        lowStock: lowStockCount,
        todaySales: todaySalesAgg._sum.total || 0,
        employees: p._count.staff,
        pendingClaims,
        createdAt: p.createdAt
      }
    }))

    res.json(enriched)
  } catch (error) {
    console.error('Get pharmacies error:', error)
    res.status(500).json({ error: 'Failed to fetch pharmacies' })
  }
}

// POST /api/pharmacies — owner creates a new branch/store
export const createPharmacy = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user.id
    const { name, location, address, phone, email, licenseNumber } = req.body
    // Accept both 'location' and 'address' from frontend
    const storeAddress = address || location || ''

    if (!name || !licenseNumber) {
      return res.status(400).json({ error: 'Store name and license number are required' })
    }

    const existing = await prisma.pharmacy.findUnique({ where: { licenseNumber } })
    if (existing) {
      return res.status(400).json({ error: 'A pharmacy with this license number already exists' })
    }

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name,
        address: storeAddress,   // schema field is 'address'
        phone: phone || null,
        email: email || null,
        licenseNumber,
        ownerId,
        isActive: true
      }
    })

    res.status(201).json({
      ...pharmacy,
      location: pharmacy.address || '',
      totalMedicines: 0,
      lowStock: 0,
      todaySales: 0,
      employees: 0,
      pendingClaims: 0,
      status: 'active'
    })
  } catch (error: any) {
    console.error('Create pharmacy error:', error)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'License number already registered' })
    }
    res.status(500).json({ error: 'Failed to create pharmacy' })
  }
}

// PUT /api/pharmacies/:id
export const updatePharmacy = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const ownerId = req.user.id
    const { name, location, address, phone, email, isActive } = req.body
    const storeAddress = address || location

    const pharmacy = await prisma.pharmacy.findFirst({ where: { id, ownerId } })
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' })

    const updated = await prisma.pharmacy.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(storeAddress !== undefined && { address: storeAddress }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(isActive !== undefined && { isActive })
      }
    })
    res.json({ ...updated, location: updated.address || '' })
  } catch (error) {
    console.error('Update pharmacy error:', error)
    res.status(500).json({ error: 'Failed to update pharmacy' })
  }
}

// DELETE /api/pharmacies/:id
export const deletePharmacy = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const ownerId = req.user.id

    const pharmacy = await prisma.pharmacy.findFirst({ where: { id, ownerId } })
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' })

    await prisma.pharmacy.update({ where: { id }, data: { isActive: false } })
    res.json({ message: 'Store deactivated successfully' })
  } catch (error) {
    console.error('Delete pharmacy error:', error)
    res.status(500).json({ error: 'Failed to delete pharmacy' })
  }
}

// GET /api/pharmacies/dashboard — owner dashboard summary across all stores
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const pharmacies = await prisma.pharmacy.findMany({
      where: { ownerId, isActive: true },
      select: { id: true }
    })
    const pharmacyIds = pharmacies.map(p => p.id)

    if (pharmacyIds.length === 0) {
      return res.json({
        totalRevenue: 0, todaySales: 0, totalMedicines: 0,
        lowStockCount: 0, totalEmployees: 0, pendingClaims: 0,
        totalStores: 0
      })
    }

    const [todaySalesAgg, allInventory, staffCount, pendingClaims] = await Promise.all([
      prisma.sale.aggregate({
        where: { pharmacyId: { in: pharmacyIds }, createdAt: { gte: today } },
        _sum: { total: true }
      }),
      prisma.inventory.findMany({
        where: { pharmacyId: { in: pharmacyIds } },
        select: { quantity: true, reorderLevel: true }
      }),
      prisma.staff.count({
        where: { pharmacyId: { in: pharmacyIds }, isActive: true }
      }),
      prisma.claim.count({
        where: { pharmacyId: { in: pharmacyIds }, status: 'PENDING' }
      })
    ])

    const lowStockCount = allInventory.filter(i => i.quantity <= i.reorderLevel).length

    res.json({
      totalStores: pharmacyIds.length,
      todaySales: todaySalesAgg._sum.total || 0,
      totalMedicines: allInventory.length,
      lowStockCount,
      totalEmployees: staffCount,
      pendingClaims
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
}

// GET /api/pharmacies/inventory-report — stock report across all stores
export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user.id
    const pharmacies = await prisma.pharmacy.findMany({
      where: { ownerId, isActive: true },
      select: { id: true, name: true }
    })
    const pharmacyMap = Object.fromEntries(pharmacies.map(p => [p.id, p.name]))
    const pharmacyIds = pharmacies.map(p => p.id)

    const inventory = await prisma.inventory.findMany({
      where: { pharmacyId: { in: pharmacyIds } },
      include: { medicine: true },
      orderBy: { quantity: 'asc' }
    })

    const report = inventory.map(item => ({
      id: item.id,
      medicineName: item.medicine?.name || 'Unknown',
      genericName: item.medicine?.genericName || '',
      medicineType: (item.medicine as any)?.medicineType || 'GENERIC',
      category: item.medicine?.category || '',
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      sellingPrice: item.sellingPrice,
      pharmacyName: pharmacyMap[item.pharmacyId] || 'Unknown',
      status: item.quantity === 0 ? 'OUT_OF_STOCK'
        : item.quantity <= item.reorderLevel ? 'LOW_STOCK'
        : new Date(item.expiryDate) < new Date() ? 'EXPIRED'
        : 'OK'
    }))

    res.json(report)
  } catch (error) {
    console.error('Inventory report error:', error)
    res.status(500).json({ error: 'Failed to fetch inventory report' })
  }
}