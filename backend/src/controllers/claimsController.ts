// backend/src/controllers/claimsController.ts
// COMPLETE REPLACEMENT FILE
// Fixes:
//  - Status transition validation (no more PENDING → PROCESSED skips)
//  - approvedBy / approvedAt now written on APPROVED
//  - processedAt now written on PROCESSED (add field to schema first)
//  - Audit trail records both `from` and `to` states

import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

// ── Valid state machine ───────────────────────────────────────────────────────
// PENDING  → APPROVED  (owner approves for submission)
// PENDING  → REJECTED  (owner rejects — e.g. missing info)
// APPROVED → PROCESSED (owner marks as paid/reimbursed by insurer)
// REJECTED → PENDING   (pharmacist resubmits after fixing issues)
// PROCESSED → (terminal — no further transitions)
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:   ['APPROVED', 'REJECTED'],
  APPROVED:  ['PROCESSED'],
  REJECTED:  ['PENDING'],
  PROCESSED: []
}

// ── GET /api/claims ───────────────────────────────────────────────────────────
export const getClaims = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    if (!pharmacyId) return res.status(400).json({ error: 'No pharmacy associated' })

    const { status, startDate, endDate, limit = 100 } = req.query
    const where: any = { pharmacyId }

    if (status) where.status = status
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    }

    const claims = await prisma.claim.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true } },
        inventory: { include: { medicine: { select: { name: true } } } }
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

// ── GET /api/claims/:id ───────────────────────────────────────────────────────
export const getClaimById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const pharmacyId = req.user.pharmacyId

    if (!pharmacyId) return res.status(400).json({ error: 'No pharmacy associated' })

    const claim = await prisma.claim.findFirst({
      where: { id, pharmacyId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        inventory: { include: { medicine: true } }
      }
    })

    if (!claim) return res.status(404).json({ error: 'Claim not found' })
    res.json(claim)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claim' })
  }
}

// ── PUT /api/claims/:id/status ────────────────────────────────────────────────
export const updateClaimStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { status, notes: additionalNotes } = req.body
    const userId = req.user.id
    const role = req.user.role

    // Validate incoming status value
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`
      })
    }

    // Only PHARMACY_OWNER can change claim status
    if (role !== 'PHARMACY_OWNER') {
      return res.status(403).json({
        error: 'Only pharmacy owners can update claim status'
      })
    }

    // Load existing claim
    const existing = await prisma.claim.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Claim not found' })

    // Verify ownership
    const pharmacy = await prisma.pharmacy.findFirst({
      where: { id: existing.pharmacyId, ownerId: userId }
    })
    if (!pharmacy) return res.status(403).json({ error: 'Access denied' })

    // ── Enforce state machine ─────────────────────────────────────────────────
    const allowedTransitions = VALID_TRANSITIONS[existing.status] || []
    if (!allowedTransitions.includes(status)) {
      const message = allowedTransitions.length === 0
        ? `Claim is in terminal state "${existing.status}" and cannot be changed`
        : `Cannot move from "${existing.status}" to "${status}". Allowed next states: ${allowedTransitions.join(', ')}`
      return res.status(400).json({ error: message })
    }

    // ── Build update payload ──────────────────────────────────────────────────
    const updateData: any = { status }

    if (status === 'APPROVED') {
      updateData.approvedBy = userId
      updateData.approvedAt = new Date()
    }

    if (status === 'PROCESSED') {
      // processedAt must exist in your schema — see schema_additions.prisma
      updateData.processedAt = new Date()
    }

    // Append to audit trail stored in notes JSON
    let existingNotes: any = {}
    if (existing.notes) {
      try { existingNotes = JSON.parse(existing.notes) } catch {}
    }

    updateData.notes = JSON.stringify({
      ...existingNotes,
      statusHistory: [
        ...(existingNotes.statusHistory || []),
        {
          from: existing.status,
          to: status,
          updatedBy: userId,
          updatedAt: new Date().toISOString(),
          notes: additionalNotes || null
        }
      ]
    })

    const updated = await prisma.claim.update({
      where: { id },
      data: updateData,
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

// ── GET /api/claims/pending-count ─────────────────────────────────────────────
export const getPendingClaimsCount = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    if (!pharmacyId) return res.status(400).json({ error: 'No pharmacy associated' })

    const count = await prisma.claim.count({
      where: { pharmacyId, status: 'PENDING' }
    })
    const totalAmount = await prisma.claim.aggregate({
      where: { pharmacyId, status: 'PENDING' },
      _sum: { amount: true }
    })

    res.json({
      count,
      totalPendingAmount: totalAmount._sum.amount || 0
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending claims count' })
  }
}