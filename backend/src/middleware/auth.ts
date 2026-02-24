import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { prisma } from '../utils/prisma'

declare global {
  namespace Express {
    interface Request {
      user: any
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'PHARMACY_OWNER') {
    return res.status(403).json({ error: 'Access denied. Owner only.' })
  }
  next()
}

export const requirePharmacist = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'PHARMACIST' && req.user?.role !== 'PHARMACY_OWNER') {
    return res.status(403).json({ error: 'Access denied. Pharmacist only.' })
  }
  next()
}