// src/controllers/userController.ts
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import bcrypt from 'bcrypt'

// ─── GET /api/users/pharmacists ───────────────────────────────────────────────
// Only returns pharmacists assigned to the owner's pharmacy
export const getPharmacists = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId

    if (!pharmacyId) {
      return res.status(400).json({ error: 'No pharmacy associated with your account' })
    }

    // Get pharmacists via Staff table — only those assigned to THIS pharmacy
    const staffEntries = await prisma.staff.findMany({
      where: { pharmacyId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        },
        pharmacy: {
          select: { id: true, name: true }
        }
      }
    })

    const formatted = staffEntries.map(s => ({
      id: s.user.id,
      email: s.user.email,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      phone: s.user.phone || '',
      role: s.user.role,
      isActive: s.user.isActive,
      pharmacyId: s.pharmacyId,
      pharmacyName: s.pharmacy.name,
      staffId: s.id,
      joinedAt: s.joinedAt
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Error getting pharmacists:', error)
    res.status(500).json({ error: 'Failed to get pharmacists' })
  }
}

// ─── GET /api/users ───────────────────────────────────────────────────────────
// Returns all users scoped to the owner's pharmacy
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.user.pharmacyId

    if (!pharmacyId) {
      return res.status(400).json({ error: 'No pharmacy associated with your account' })
    }

    const staffEntries = await prisma.staff.findMany({
      where: { pharmacyId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        },
        pharmacy: {
          select: { id: true, name: true }
        }
      }
    })

    const formatted = staffEntries.map(s => ({
      id: s.user.id,
      email: s.user.email,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      phone: s.user.phone || '',
      role: s.user.role,
      isActive: s.user.isActive,
      pharmacyId: s.pharmacyId,
      pharmacyName: s.pharmacy.name,
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
}

// ─── POST /api/users/pharmacists ─────────────────────────────────────────────
// Creates the user AND links them to the owner's pharmacy via Staff table
export const createPharmacist = async (req: Request, res: Response) => {
  try {
    const ownerPharmacyId = req.user.pharmacyId

    if (!ownerPharmacyId) {
      return res.status(400).json({ error: 'No pharmacy associated with your account' })
    }

    const { email, password, firstName, lastName, phone, pharmacyId, role = 'PHARMACIST' } = req.body

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'email, password, firstName and lastName are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Use provided pharmacyId or fall back to owner's pharmacy
    const assignedPharmacyId = pharmacyId || ownerPharmacyId

    // Verify the pharmacy belongs to this owner
    const pharmacy = await prisma.pharmacy.findFirst({
      where: { id: assignedPharmacyId, ownerId: req.user.id }
    })

    if (!pharmacy) {
      return res.status(403).json({ error: 'You can only assign users to your own pharmacies' })
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user AND Staff record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone: phone || null,
          role: role as any,
          // Link pharmacyId directly on user for easy lookup
          pharmacyId: assignedPharmacyId
        }
      })

      // Create Staff record linking user ↔ pharmacy
      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          pharmacyId: assignedPharmacyId,
          isActive: true
        }
      })

      return { user, staff }
    })

    const { password: _, ...userWithoutPassword } = result.user

    res.status(201).json({
      ...userWithoutPassword,
      pharmacyId: assignedPharmacyId,
      pharmacyName: pharmacy.name,
      message: `${role} created and assigned to ${pharmacy.name} successfully`
    })
  } catch (error: any) {
    console.error('Error creating pharmacist:', error)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' })
    }
    res.status(500).json({ error: 'Failed to create user' })
  }
}

// ─── PUT /api/users/pharmacists/:id ──────────────────────────────────────────
export const updatePharmacist = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { firstName, lastName, phone, isActive } = req.body

    // Verify user belongs to owner's pharmacy
    const pharmacyId = req.user.pharmacyId
    const staff = await prisma.staff.findFirst({
      where: { userId, pharmacyId: pharmacyId! }
    })

    if (!staff) {
      return res.status(403).json({ error: 'User not found in your pharmacy' })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone, isActive }
    })

    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
}

// ─── DELETE /api/users/pharmacists/:id ───────────────────────────────────────
export const deletePharmacist = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const pharmacyId = req.user.pharmacyId

    // Verify user belongs to owner's pharmacy before deleting
    const staff = await prisma.staff.findFirst({
      where: { userId, pharmacyId: pharmacyId! }
    })

    if (!staff) {
      return res.status(403).json({ error: 'User not found in your pharmacy' })
    }

    // Delete Staff record first, then user
    await prisma.$transaction([
      prisma.staff.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ])

    res.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(500).json({ error: 'Failed to delete user' })
  }
}