// src/controllers/inventoryController.ts
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

export const getInventory = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId || req.query.pharmacyId as string
    
    if (!pharmacyId) {
      return res.status(400).json({ error: 'No pharmacy associated with user' })
    }

    const { category, expiry, lowStock, search } = req.query

    const where: any = { 
      pharmacyId,
      medicine: {}
    }

    if (category) {
      where.medicine.category = category as string
    }
    
    if (expiry === 'expiring') {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      where.expiryDate = { lte: thirtyDaysFromNow }
    }
    
    if (lowStock === 'true') {
      where.quantity = {
        lte: prisma.inventory.fields.reorderLevel
      }
    }
    
    if (search) {
      where.medicine.name = { 
        contains: search as string, 
        mode: 'insensitive' 
      }
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        medicine: true,
        supplier: true
      },
      orderBy: [
        { expiryDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    const formatted = inventory.map((item) => ({
      id: item.id,
      medicineName: item.medicine.name,
      genericName: item.medicine.genericName,
      strength: item.medicine.strength,
      form: item.medicine.form,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      currentStock: item.quantity,
      reorderLevel: item.reorderLevel,
      unitPrice: item.unitPrice,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier?.name,
      location: item.location,
      status: item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock',
      daysToExpiry: Math.ceil((item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Get inventory error:', error)
    res.status(500).json({ error: 'Failed to fetch inventory' })
  }
}

export const addInventoryItem = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    const {
      medicineName, genericName, category, manufacturer, strength, form,
      batchNumber, expiryDate, quantity, reorderLevel, unitPrice, sellingPrice,
      supplierId, location, requiresPrescription
    } = req.body

    // First, find or create the medicine
    let medicine = await prisma.medicine.findFirst({
      where: {
        name: medicineName,
        pharmacyId
      }
    })

    if (!medicine) {
      medicine = await prisma.medicine.create({
        data: {
          name: medicineName,
          genericName,
          category,
          manufacturer,
          strength,
          form,
          requiresPrescription,
          pharmacyId
        }
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
        reorderLevel: parseInt(reorderLevel),
        unitPrice: parseFloat(unitPrice),
        sellingPrice: parseFloat(sellingPrice),
        supplierId,
        location
      },
      include: {
        medicine: true,
        supplier: true
      }
    })

    // Create low stock alert if needed
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

    res.status(201).json(inventory)
  } catch (error) {
    console.error('Add inventory error:', error)
    res.status(500).json({ error: 'Failed to add inventory item' })
  }
}

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { quantity, sellingPrice, location } = req.body

    // Ensure id is a string, not an array
    const itemId = Array.isArray(id) ? id[0] : id

    const inventory = await prisma.inventory.update({
      where: { id: itemId },
      data: {
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        sellingPrice: sellingPrice !== undefined ? parseFloat(sellingPrice) : undefined,
        location
      },
      include: {
        medicine: true
      }
    })

    // Check if we need to create/resolve low stock alert
    if (inventory.quantity <= inventory.reorderLevel) {
      await prisma.lowStockAlert.create({
        data: {
          inventoryId: inventory.id,
          pharmacyId: inventory.pharmacyId,
          currentStock: inventory.quantity,
          reorderLevel: inventory.reorderLevel
        }
      })
    } else {
      await prisma.lowStockAlert.updateMany({
        where: {
          inventoryId: itemId,
          isResolved: false
        },
        data: {
          isResolved: true,
          resolvedAt: new Date()
        }
      })
    }

    res.json(inventory)
  } catch (error) {
    console.error('Update inventory error:', error)
    res.status(500).json({ error: 'Failed to update inventory item' })
  }
}

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const itemId = Array.isArray(id) ? id[0] : id

    await prisma.$transaction([
      prisma.lowStockAlert.deleteMany({
        where: { inventoryId: itemId }
      }),
      prisma.inventory.delete({
        where: { id: itemId }
      })
    ])

    res.json({ message: 'Inventory item deleted successfully' })
  } catch (error) {
    console.error('Delete inventory error:', error)
    res.status(500).json({ error: 'Failed to delete inventory item' })
  }
}

export const adjustStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const itemId = Array.isArray(id) ? id[0] : id
    const { adjustment, reason } = req.body

    const inventory = await prisma.inventory.findUnique({
      where: { id: itemId },
      include: {
        medicine: true  // This fixes the 'medicine' property error
      }
    })

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory item not found' })
    }

    const newQuantity = inventory.quantity + parseInt(adjustment)

    const updated = await prisma.inventory.update({
      where: { id: itemId },
      data: { 
        quantity: newQuantity 
      },
      include: { 
        medicine: true 
      }
    })

    res.json(updated)
  } catch (error) {
    console.error('Adjust stock error:', error)
    res.status(500).json({ error: 'Failed to adjust stock' })
  }
}