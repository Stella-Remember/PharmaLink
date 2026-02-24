import { Request, Response } from "express"
import { prisma } from "../utils/prisma"

export const getOwnerSalesReport = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user.id

    // Get pharmacies owned by this owner
    const pharmacies = await prisma.pharmacy.findMany({
      where: { ownerId },
      select: { id: true }
    })

    const pharmacyIds = pharmacies.map(p => p.id)

    // Get all sales from those pharmacies
    const sales = await prisma.sale.findMany({
      where: {
        pharmacyId: { in: pharmacyIds }
      },
      include: {
        user: true
      }
    })

    const totalSales = sales.reduce(
      (sum, sale) => sum + sale.total,
      0
    )

    res.json({
      totalSales,
      totalOrders: sales.length,
      sales
    })

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" })
  }
}