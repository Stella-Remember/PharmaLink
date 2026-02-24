// src/controllers/pharmacyController.ts
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { hashPassword } from '../utils/bcrypt'  // Make sure to import this!
import { $Enums } from '@prisma/client'

export const getPharmacies = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user.id

    const pharmacies = await prisma.pharmacy.findMany({
      where: { 
        ownerId 
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            inventory: true, 
            sales: true
          }
        }
      }
    })

    res.json(pharmacies)
  } catch (error) {
    console.error('Get pharmacies error:', error)
    res.status(500).json({ error: 'Failed to fetch pharmacies' })
  }
}

export const createPharmacist = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body

  const owner = req.user

  if (owner.role !== "PHARMACY_OWNER") {
    return res.status(403).json({ error: "Only owners can create pharmacists" })
  }

  // use the helper already imported from ../utils/bcrypt
  const hashedPassword = await hashPassword(password)

  const pharmacist = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "PHARMACIST"
    }
  })

  // link the new pharmacist to the owner's pharmacy via the staff table
  if (owner.pharmacyId) {
    await prisma.staff.create({
      data: {
        userId: pharmacist.id,
        pharmacyId: owner.pharmacyId
      }
    })
  }

  res.status(201).json(pharmacist)
}

export const assignPharmacist = async (req: Request, res: Response) => {
  try {
    const { pharmacyId } = req.params
    const pharmacyIdStr = Array.isArray(pharmacyId) ? pharmacyId[0] : pharmacyId
    
    const { email, firstName, lastName } = req.body

    // Check if pharmacist exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Create temporary password (should be reset on first login)
      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await hashPassword(tempPassword)

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'PHARMACIST'
        }
      })
    }

    // Assign to pharmacy
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        pharmacyId: pharmacyIdStr
      },
      include: {
        user: true,
        pharmacy: true
      }
    })

    res.status(201).json(staff)
  } catch (error) {
    console.error('Assign pharmacist error:', error)
    res.status(500).json({ error: 'Failed to assign pharmacist' })
  }
}

export const getPharmacyStaff = async (req: Request, res: Response) => {
  try {
    const { pharmacyId } = req.params
    const pharmacyIdStr = Array.isArray(pharmacyId) ? pharmacyId[0] : pharmacyId

    const staff = await prisma.staff.findMany({
      where: {
        pharmacyId: pharmacyIdStr,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true
          }
        }
      }
    })

    res.json(staff)
  } catch (error) {
    console.error('Get pharmacy staff error:', error)
    res.status(500).json({ error: 'Failed to fetch pharmacy staff' })
  }
}