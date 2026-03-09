// backend/src/controllers/salesController.ts
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

export const createSale = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    const userId = req.user.id

    if (!pharmacyId) {
      return res.status(400).json({ error: 'No pharmacy associated with your account. Contact your administrator.' })
    }

    const {
      items, customerName, customerEmail, discount = 0,
      paymentMethod, paymentLines = [],
      patientName, patientId, insuranceProvider,
      policyNumber, diagnosis, insuranceCoveredAmount
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' })
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const hasInsurance = String(paymentMethod || '').includes('INSURANCE') ||
      (Array.isArray(paymentLines) && paymentLines.some((l: any) => l.method === 'INSURANCE'))
    const coveredAmount = parseFloat(insuranceCoveredAmount) || 0

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0
      const saleItems: any[] = []
      let firstInventoryId: string | null = null

      for (const item of items) {
        const inventory = await tx.inventory.findUnique({
          where: { id: item.inventoryId },
          include: { medicine: true }
        })

        if (!inventory) throw new Error(`Inventory item not found: ${item.inventoryId}`)
        if (inventory.pharmacyId !== pharmacyId) throw new Error('Item does not belong to your pharmacy')
        if (inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${inventory.medicine.name}. Only ${inventory.quantity} left.`)
        }

        const totalPrice = inventory.sellingPrice * item.quantity
        subtotal += totalPrice
        if (!firstInventoryId) firstInventoryId = inventory.id

        saleItems.push({
          inventoryId: inventory.id,
          medicineName: inventory.medicine.name,
          quantity: item.quantity,
          unitPrice: inventory.sellingPrice,
          totalPrice
        })

        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity - item.quantity }
        })
      }

      const total = subtotal - (parseFloat(discount) || 0)

      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          pharmacyId,
          userId,
          customerName: customerName || (hasInsurance ? patientName : null) || null,
          customerEmail: customerEmail || null,
          subtotal,
          tax: 0,
          discount: parseFloat(discount) || 0,
          total,
          items: { create: saleItems }
        },
        include: {
          items: true,
          user: { select: { firstName: true, lastName: true } }
        }
      })

      // Auto-create claim when insurance is selected
      let claim = null
      if (hasInsurance) {
        const claimNumber = `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        const claimAmount = coveredAmount > 0 ? coveredAmount : total

        claim = await tx.claim.create({
          data: {
            claimNumber,
            pharmacyId,
            userId,
            inventoryId: firstInventoryId,
            claimType: 'INSURANCE_REIMBURSEMENT',
            description: `Invoice: ${invoiceNumber} | Patient: ${patientName || 'N/A'} | ID: ${patientId || 'N/A'} | Diagnosis: ${diagnosis || 'N/A'}`,
            quantity: saleItems.reduce((s: number, i: any) => s + i.quantity, 0),
            amount: claimAmount,
            status: 'PENDING',
            notes: JSON.stringify({
              invoiceNumber, patientName, patientId,
              insuranceProvider, policyNumber, diagnosis,
              coveredAmount: claimAmount,
              saleTotal: total,
              patientOwes: Math.max(0, total - claimAmount),
              paymentLines,
              createdAt: new Date().toISOString()
            })
          }
        })
      }

      return { sale, claim }
    })

    res.status(201).json({
      ...result.sale,
      claim: result.claim,
      message: hasInsurance && result.claim
        ? `Sale saved. Claim ${result.claim.claimNumber} created.`
        : 'Sale completed successfully.'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create sale'
    console.error('Create sale error:', error)
    res.status(500).json({ error: message })
  }
}

export const getSales = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    if (!pharmacyId) return res.status(400).json({ error: 'No pharmacy associated' })
    const { startDate, endDate, limit = 100, userId: filterUserId } = req.query
    const where: any = { pharmacyId }
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate as string), lte: new Date(endDate as string) }
    }
    if (filterUserId) where.userId = filterUserId
    const sales = await prisma.sale.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true } }, items: true },
      orderBy: { createdAt: 'desc' },
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
    if (!pharmacyId) return res.status(400).json({ error: 'No pharmacy associated' })
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result = await prisma.sale.aggregate({
      where: { pharmacyId, createdAt: { gte: today } },
      _sum: { total: true },
      _count: true
    })
    res.json({ total: result._sum?.total || 0, count: result._count })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch today's sales" })
  }
}

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    if (!pharmacyId) return res.status(400).json({ error: 'No pharmacy associated' })
    const { startDate, endDate, pharmacistId } = req.query
    const dateFilter: any = {}
    if (startDate) dateFilter.gte = new Date(startDate as string)
    if (endDate) { const end = new Date(endDate as string); end.setHours(23,59,59,999); dateFilter.lte = end }
    const where: any = { pharmacyId }
    if (Object.keys(dateFilter).length) where.createdAt = dateFilter
    if (pharmacistId) where.userId = pharmacistId
    const [sales, claims, staffList] = await Promise.all([
      prisma.sale.findMany({ where, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, items: true }, orderBy: { createdAt: 'desc' } }),
      prisma.claim.findMany({ where: { pharmacyId, ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}), ...(pharmacistId ? { userId: pharmacistId as string } : {}) }, include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.staff.findMany({ where: { pharmacyId, isActive: true }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } })
    ])
    const totalRevenue = sales.reduce((s, x) => s + x.total, 0)
    const byPharmacist: Record<string, any> = {}
    for (const sale of sales) {
      const k = sale.userId
      if (!byPharmacist[k]) byPharmacist[k] = { name: `${sale.user.firstName} ${sale.user.lastName}`, sales: 0, revenue: 0, claims: 0 }
      byPharmacist[k].sales++; byPharmacist[k].revenue += sale.total
    }
    for (const claim of claims) { if (byPharmacist[claim.userId]) byPharmacist[claim.userId].claims++ }
    res.json({
      summary: { totalSales: sales.length, totalRevenue, totalClaimsAmount: claims.reduce((s, c) => s + (c.amount || 0), 0), pendingClaimsCount: claims.filter(c => c.status === 'PENDING').length, averageSale: sales.length ? totalRevenue / sales.length : 0 },
      sales, claims,
      byPharmacist: Object.values(byPharmacist),
      pharmacists: staffList.map(s => ({ id: s.user.id, name: `${s.user.firstName} ${s.user.lastName}`, email: s.user.email }))
    })
  } catch (error) {
    console.error('Sales report error:', error)
    res.status(500).json({ error: 'Failed to generate report' })
  }
}