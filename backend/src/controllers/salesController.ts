import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

export const createSale = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    const userId = req.user.id
    const { items, customerName, customerEmail, discount = 0 } = req.body

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Process sale in transaction
    const sale = await prisma.$transaction(async (tx: { inventory: { findUnique: (arg0: { where: { id: any }; include: { medicine: boolean } }) => any; update: (arg0: { where: { id: any }; data: { quantity: number } }) => any }; sale: { create: (arg0: { data: { invoiceNumber: string; pharmacyId: any; userId: any; customerName: any; customerEmail: any; subtotal: number; tax: number; discount: any; total: number; items: { create: { inventoryId: any; medicineName: any; quantity: any; unitPrice: any; totalPrice: number }[] } }; include: { items: { include: { inventory: { include: { medicine: boolean } } } } } }) => any } }) => {
      // Calculate totals
      let subtotal = 0
      const saleItems = []

      for (const item of items) {
        const inventory = await tx.inventory.findUnique({
          where: { id: item.inventoryId },
          include: { medicine: true }
        })

        if (!inventory) {
          throw new Error(`Inventory item ${item.inventoryId} not found`)
        }

        if (inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${inventory.medicine.name}`)
        }

        const totalPrice = inventory.sellingPrice * item.quantity
        subtotal += totalPrice

        saleItems.push({
          inventoryId: inventory.id,
          medicineName: inventory.medicine.name,
          quantity: item.quantity,
          unitPrice: inventory.sellingPrice,
          totalPrice
        })

        // Update inventory
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: inventory.quantity - item.quantity
          }
        })
      }

      const tax = subtotal * 0.1 // 10% tax
      const total = subtotal + tax - discount

      // Create sale
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          pharmacyId,
          userId,
          customerName,
          customerEmail,
          subtotal,
          tax,
          discount,
          total,
          items: {
            create: saleItems
          }
        },
        include: {
          items: {
            include: {
              inventory: {
                include: { medicine: true }
              }
            }
          }
        }
      })

      return sale
    })

    res.status(201).json(sale)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message || 'Failed to create sale' })
  }
}

export const getSales = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    const { startDate, endDate, limit = 50 } = req.query

    const where: any = { pharmacyId }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            inventory: {
              include: { medicine: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Number(limit)
    })

    res.json(sales)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' })
  }
}

export const getTodaySales = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const result = await prisma.sale.aggregate({
      where: {
        pharmacyId,
        createdAt: {
          gte: today
        }
      },
      _sum: {
        total: true
      },
      _count: true
    })

    res.json({
      total: result._sum.total || 0,
      count: result._count
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today\'s sales' })
  }
}