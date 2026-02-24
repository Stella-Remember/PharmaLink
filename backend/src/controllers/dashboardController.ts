// src/controllers/dashboardController.ts
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    
    if (!pharmacyId) {
      return res.status(400).json({ error: 'No pharmacy associated with user' })
    }

    const [
      totalMedicines,
      lowStockCount,
      todaySales,
      pendingClaims
    ] = await Promise.all([
      prisma.inventory.count({
        where: { 
          pharmacyId,
          quantity: { gt: 0 }
        }
      }),
      prisma.lowStockAlert.count({
        where: {
          pharmacyId,
          isResolved: false
        }
      }),
      prisma.sale.aggregate({
        where: {
          pharmacyId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: {
          total: true
        }
      }),
      prisma.claim.count({
        where: {
          pharmacyId,
          status: 'PENDING'
        }
      })
    ])

    res.json({
      totalMedicines,
      lowStockCount,
      todaySales: todaySales._sum?.total || 0,
      pendingClaims
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
}

export const getLowStockAlerts = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    
    if (!pharmacyId) {
      return res.status(400).json({ error: 'No pharmacy associated with user' })
    }

    const lowStockItems = await prisma.lowStockAlert.findMany({
      where: {
        pharmacyId,
        isResolved: false
      },
      include: {
        inventory: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const formatted = lowStockItems.map((alert: { inventory: { medicine: { name: any } }; currentStock: any; reorderLevel: any }) => ({
      medicine: alert.inventory.medicine.name,
      currentStock: alert.currentStock,
      reorderLevel: alert.reorderLevel,
      status: 'Low Stock'
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Low stock alerts error:', error)
    res.status(500).json({ error: 'Failed to fetch low stock alerts' })
  }
}