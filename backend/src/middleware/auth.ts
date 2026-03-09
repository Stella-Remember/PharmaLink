import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { prisma } from '../utils/prisma'

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string
        email: string
        role: string
        pharmacyId: string | null
        firstName: string
        lastName: string
      }
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
   try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as any

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    // Fetch fresh user from DB (so we always have latest data)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        pharmacyId: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    // If pharmacyId is not directly on user, look up via Staff table
    let pharmacyId = user.pharmacyId

    if (!pharmacyId) {
      // Check Staff table (pharmacist assigned to pharmacy)
      const staff = await prisma.staff.findFirst({
        where: { userId: user.id, isActive: true },
        select: { pharmacyId: true }
      })
      if (staff?.pharmacyId) {
        pharmacyId = staff.pharmacyId
      }
    }

    if (!pharmacyId) {
      // Check if owner (has owned pharmacies)
      const owned = await prisma.pharmacy.findFirst({
        where: { ownerId: user.id },
        select: { id: true }
      })
      if (owned?.id) pharmacyId = owned.id
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      pharmacyId,         
      firstName: user.firstName,
      lastName: user.lastName
    }

    next()
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired, please log in again' })
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    console.error('Auth middleware error:', err)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'PHARMACY_OWNER') {
    return res.status(403).json({ error: 'Access denied. Owner only.' })
  }
  next()
}

export const requirePharmacist = (req: Request, res: Response, next: NextFunction) => {
  const allowed = ['PHARMACIST', 'PHARMACY_OWNER']
  if (!allowed.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Access denied.' })
  }
  next()
}