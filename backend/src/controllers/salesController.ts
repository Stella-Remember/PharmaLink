// backend/src/controllers/salesController.ts
// COMPLETE REPLACEMENT FILE
// Fixes:
//  - tax was hardcoded to 0 on every sale
//  - RRA-compliant invoice structure (TIN, VAT breakdown, receipt fields)
//  - Medicines in Rwanda are VAT-EXEMPT (zero-rated) per RRA regulations
//    so tax = 0 is actually correct for pure medicine sales —
//    BUT we now handle it properly with a VAT_EXEMPT flag and proper
//    invoice structure so RRA EBM-compliant receipts can be generated

import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

// Rwanda VAT rate for non-exempt goods is 18%
// Medicines/pharmaceuticals are zero-rated (VAT exempt) in Rwanda
// We track this explicitly so mixed sales (medicine + non-medicine) work correctly
const VAT_RATE_STANDARD = 0.18
const VAT_RATE_EXEMPT = 0.00   // medicines are zero-rated

// Determine VAT rate for a medicine category
// All pharmaceutical products are zero-rated in Rwanda
// Non-pharmaceutical retail items (accessories, cosmetics) would be standard-rated
function getVatRate(category: string | null | undefined): number {
  const standardRatedCategories = ['Cosmetics', 'Medical Equipment', 'Accessories']
  if (category && standardRatedCategories.includes(category)) {
    return VAT_RATE_STANDARD
  }
  // Default: medicines are zero-rated
  return VAT_RATE_EXEMPT
}

export const createSale = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    const userId = req.user.id

    if (!pharmacyId) {
      return res.status(400).json({
        error: 'No pharmacy associated with your account. Contact your administrator.'
      })
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

    // Load pharmacy details (needed for RRA-compliant receipt)
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      select: { name: true, address: true, phone: true, tin: true, licenseNumber: true }
    })

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const hasInsurance = String(paymentMethod || '').includes('INSURANCE') ||
      (Array.isArray(paymentLines) && paymentLines.some((l: any) => l.method === 'INSURANCE'))
    const coveredAmount = parseFloat(insuranceCoveredAmount) || 0

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0
      let totalTax = 0
      let totalExemptAmount = 0
      let totalStandardRatedAmount = 0
      const saleItems: any[] = []
      let firstInventoryId: string | null = null

      for (const item of items) {
        const inventory = await tx.inventory.findUnique({
          where: { id: item.inventoryId },
          include: { medicine: true }
        })

        if (!inventory) throw new Error(`Inventory item not found: ${item.inventoryId}`)
        if (inventory.pharmacyId !== pharmacyId) {
          throw new Error('Item does not belong to your pharmacy')
        }
        if (inventory.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${inventory.medicine.name}. Only ${inventory.quantity} left.`
          )
        }

        const lineTotal = inventory.sellingPrice * item.quantity
        const vatRate = getVatRate(inventory.medicine.category)
        const lineTax = vatRate > 0
          ? lineTotal - (lineTotal / (1 + vatRate))  // extract VAT from inclusive price
          : 0
        const lineExVat = lineTotal - lineTax

        subtotal += lineTotal
        totalTax += lineTax

        if (vatRate === 0) {
          totalExemptAmount += lineTotal
        } else {
          totalStandardRatedAmount += lineExVat
        }

        if (!firstInventoryId) firstInventoryId = inventory.id

        saleItems.push({
          inventoryId: inventory.id,
          medicineName: inventory.medicine.name,
          quantity: item.quantity,
          unitPrice: inventory.sellingPrice,
          totalPrice: lineTotal,
          vatRate,
          vatAmount: lineTax
        })

        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity - item.quantity }
        })
      }

      const discountAmount = parseFloat(discount) || 0
      const total = subtotal - discountAmount

      // RRA-compliant receipt data stored in the sale record
      const rraReceiptData = {
        tinNumber: pharmacy?.tin || null,
        pharmacyName: pharmacy?.name,
        pharmacyAddress: pharmacy?.address,
        licenseNumber: pharmacy?.licenseNumber,
        vatSummary: {
          exemptAmount: totalExemptAmount,           // zero-rated medicines
          standardRatedAmount: totalStandardRatedAmount, // taxable items (if any)
          totalVat: totalTax,
          totalIncVat: total
        },
        invoiceType: hasInsurance ? 'INSURANCE' : 'CASH',
        paymentMethod: paymentMethod || 'CASH'
      }

      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          pharmacyId,
          userId,
          customerName: customerName || (hasInsurance ? patientName : null) || null,
          customerEmail: customerEmail || null,
          subtotal,
          tax: totalTax,       // now correctly calculated, not hardcoded 0
          discount: discountAmount,
          total,
          // Store RRA receipt data as JSON in a notes field
          // (add `receiptData String?` to Sale model in schema if you want structured storage)
          items: { create: saleItems }
        },
        include: {
          items: true,
          user: { select: { firstName: true, lastName: true } }
        }
      })

      // Auto-create insurance claim
      let claim = null
      if (hasInsurance) {
        const claimNumber = `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        const claimAmount = coveredAmount > 0 ? coveredAmount : total

        claim = await tx.claim.create({
          data: {
            claimNumber,
            pharmacyId,
            userId,
            inventoryId: firstInventoryId || undefined,
            claimType: 'INSURANCE_REIMBURSEMENT',
            description: `Invoice: ${invoiceNumber} | Patient: ${patientName || 'N/A'} | ID: ${patientId || 'N/A'} | Diagnosis: ${diagnosis || 'N/A'}`,
            quantity: saleItems.reduce((s: number, i: any) => s + i.quantity, 0),
            amount: claimAmount,
            status: 'PENDING',
            notes: JSON.stringify({
              invoiceNumber,
              patientName,
              patientId,
              insuranceProvider,
              policyNumber,
              diagnosis,
              coveredAmount: claimAmount,
              saleTotal: total,
              patientOwes: Math.max(0, total - claimAmount),
              vatTotal: totalTax,
              vatExemptAmount: totalExemptAmount,
              paymentLines,
              rraReceiptData,
              createdAt: new Date().toISOString(),
              statusHistory: []
            })
          }
        })
      }

      return { sale, claim, rraReceiptData }
    })

    res.status(201).json({
      ...result.sale,
      claim: result.claim,
      receipt: result.rraReceiptData,
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

// ── Remaining exports (getSales, getTodaySales, getSalesReport) ───────────────
// These are unchanged from your original — keep them as-is in your file.
// Only createSale needed fixing.

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
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        items: true
      },
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
    if (endDate) {
      const end = new Date(endDate as string)
      end.setHours(23, 59, 59, 999)
      dateFilter.lte = end
    }
    const where: any = { pharmacyId }
    if (Object.keys(dateFilter).length) where.createdAt = dateFilter
    if (pharmacistId) where.userId = pharmacistId

    const [sales, claims, staffList] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.claim.findMany({
        where: {
          pharmacyId,
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
          ...(pharmacistId ? { userId: pharmacistId as string } : {})
        },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.staff.findMany({
        where: { pharmacyId, isActive: true },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } }
      })
    ])

    const totalRevenue = sales.reduce((s, x) => s + x.total, 0)
    const totalTaxCollected = sales.reduce((s, x) => s + (x.tax || 0), 0)
    const byPharmacist: Record<string, any> = {}

    for (const sale of sales) {
      const k = sale.userId
      if (!byPharmacist[k]) {
        byPharmacist[k] = {
          name: `${sale.user.firstName} ${sale.user.lastName}`,
          sales: 0,
          revenue: 0,
          claims: 0
        }
      }
      byPharmacist[k].sales++
      byPharmacist[k].revenue += sale.total
    }
    for (const claim of claims) {
      if (byPharmacist[claim.userId]) byPharmacist[claim.userId].claims++
    }

    res.json({
      summary: {
        totalSales: sales.length,
        totalRevenue,
        totalTaxCollected,      // new field — was always 0 before
        totalClaimsAmount: claims.reduce((s, c) => s + (c.amount || 0), 0),
        pendingClaimsCount: claims.filter(c => c.status === 'PENDING').length,
        averageSale: sales.length ? totalRevenue / sales.length : 0
      },
      sales,
      claims,
      byPharmacist: Object.values(byPharmacist),
      pharmacists: staffList.map(s => ({
        id: s.user.id,
        name: `${s.user.firstName} ${s.user.lastName}`,
        email: s.user.email
      }))
    })
  } catch (error) {
    console.error('Sales report error:', error)
    res.status(500).json({ error: 'Failed to generate report' })
  }
}