import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

export const getClaims = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    const { status } = req.query

    const where: any = { pharmacyId }
    
    if (status) {
      where.status = status
    }

    const claims = await prisma.claim.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        inventory: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(claims)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claims' })
  }
}

export const createClaim = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId
    const userId = req.user.id
    const { inventoryId, claimType, description, quantity, amount } = req.body

    // Generate claim number
    const claimNumber = `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const claim = await prisma.claim.create({
      data: {
        claimNumber,
        pharmacyId,
        userId,
        inventoryId,
        claimType,
        description,
        quantity,
        amount,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        inventory: {
          include: {
            medicine: true
          }
        }
      }
    })

    res.status(201).json(claim)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create claim' })
  }
}

export const updateClaimStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { status, notes } = req.body
    const approverId = req.user.id

    const claim = await prisma.claim.update({
      where: { id },
      data: {
        status,
        notes,
        approvedBy: approverId,
        approvedAt: new Date()
      },
      include: {
        user: true,
        inventory: {
          include: { medicine: true }
        }
      }
    })

    // If claim is approved and involves inventory, adjust stock
    if (status === 'APPROVED' && claim.inventoryId) {
      await prisma.inventory.update({
        where: { id: claim.inventoryId! },
        data: {
          quantity: {
            decrement: claim.quantity
          }
        }
      })
    }

    res.json(claim)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update claim status' })
  }
}

export const getPendingClaimsCount = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId

    const count = await prisma.claim.count({
      where: {
        pharmacyId,
        status: 'PENDING'
      }
    })

    res.json({ count })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending claims count' })
  }
}
