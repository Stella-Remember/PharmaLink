// backend/src/controllers/claimsController.ts
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

// GET /api/claims — returns all claims for the pharmacy (pharmacist) or all pharmacies (owner)
export const getClaims = async (req: Request, res: Response) => {
  try {
    const { pharmacyId, role, id: userId } = req.user
    const { status, startDate, endDate, limit = 200 } = req.query

    let pharmacyIds: string[] = []

    if (role === 'OWNER') {
      // Owner sees all their pharmacies
      const pharmacies = await prisma.pharmacy.findMany({
        where: { ownerId: userId, isActive: true },
        select: { id: true }
      })
      pharmacyIds = pharmacies.map(p => p.id)
    } else {
      if (!pharmacyId) return res.status(400).json({ error: 'No pharmacy associated' })
      pharmacyIds = [pharmacyId]
    }

    if (pharmacyIds.length === 0) return res.json([])

    const where: any = { pharmacyId: { in: pharmacyIds } }
    if (status && status !== 'all') where.status = status
    if (startDate) {
      where.createdAt = { gte: new Date(startDate as string) }
    }
    if (endDate) {
      const end = new Date(endDate as string)
      end.setHours(23, 59, 59, 999)
      where.createdAt = { ...where.createdAt, lte: end }
    }

    const claims = await prisma.claim.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        pharmacy: { select: { id: true, name: true } },
        inventory: {
          include: {
            medicine: { select: { name: true, genericName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    })

    res.json(claims)
  } catch (error) {
    console.error('Get claims error:', error)
    res.status(500).json({ error: 'Failed to fetch claims' })
  }
}

// GET /api/claims/:id — single claim detail
export const getClaimById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { pharmacyId, role, id: userId } = req.user

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        pharmacy: { select: { id: true, name: true, address: true, phone: true, licenseNumber: true } },
        inventory: {
          include: {
            medicine: { select: { name: true, genericName: true, category: true, strength: true } }
          }
        }
      }
    })

    if (!claim) return res.status(404).json({ error: 'Claim not found' })

    // Access check
    if (role === 'OWNER') {
      const pharmacy = await prisma.pharmacy.findFirst({ where: { id: claim.pharmacyId, ownerId: userId } })
      if (!pharmacy) return res.status(403).json({ error: 'Access denied' })
    } else {
      if (claim.pharmacyId !== pharmacyId) return res.status(403).json({ error: 'Access denied' })
    }

    res.json(claim)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claim' })
  }
}

// PUT /api/claims/:id/status — update claim status (owner only)
export const updateClaimStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { status, notes: additionalNotes } = req.body
    const { role, id: userId } = req.user

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
    }

    // Check the claim exists and belongs to owner
    const existing = await prisma.claim.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Claim not found' })

    if (role === 'OWNER') {
      const pharmacy = await prisma.pharmacy.findFirst({ where: { id: existing.pharmacyId, ownerId: userId } })
      if (!pharmacy) return res.status(403).json({ error: 'Access denied' })
    }

    // Merge status update into notes
    let existingNotes: any = {}
    if (existing.notes) {
      try { existingNotes = JSON.parse(existing.notes) } catch {}
    }

    const updatedNotes = JSON.stringify({
      ...existingNotes,
      statusHistory: [
        ...(existingNotes.statusHistory || []),
        { status, updatedBy: userId, updatedAt: new Date().toISOString(), notes: additionalNotes }
      ]
    })

    const updated = await prisma.claim.update({
      where: { id },
      data: {
        status,
        notes: updatedNotes,
        ...(status === 'PROCESSED' && { processedAt: new Date() } as any)
      },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    })

    res.json(updated)
  } catch (error) {
    console.error('Update claim status error:', error)
    res.status(500).json({ error: 'Failed to update claim status' })
  }
}