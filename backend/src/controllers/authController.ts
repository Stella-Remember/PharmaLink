// src/controllers/authController.ts
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { hashPassword, comparePassword } from '../utils/bcrypt'
import { generateToken } from '../utils/jwt'

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        pharmacyId: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive. Contact your administrator.' })
    }

    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // ── Resolve pharmacyId ──────────────────────────────────────────────────
    // Owners have pharmacyId set directly on User.
    // Pharmacists are linked via the Staff table — look it up here at login
    // so the token always carries the correct pharmacyId.
    let pharmacyId: string | undefined = user.pharmacyId ?? undefined
    let pharmacyName: string | undefined

    if (!pharmacyId && user.role === 'PHARMACIST') {
      // Find the pharmacy this pharmacist is assigned to via Staff
      const staff = await prisma.staff.findFirst({
        where: { userId: user.id, isActive: true },
        include: { pharmacy: { select: { id: true, name: true } } }
      })
      if (staff?.pharmacy) {
        pharmacyId = staff.pharmacy.id
        pharmacyName = staff.pharmacy.name
      }
    }

    if (user.role === 'PHARMACY_OWNER') {
      // Also get the owner's pharmacy name for display
      const pharmacy = await prisma.pharmacy.findFirst({
        where: { ownerId: user.id },
        select: { id: true, name: true }
      })
      if (pharmacy) {
        pharmacyId = pharmacyId || pharmacy.id
        pharmacyName = pharmacy.name
      }
    }

    // ── Generate token with pharmacyId baked in ─────────────────────────────
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      pharmacyId
    })

    const { password: _, ...userWithoutPassword } = user

    res.json({
      message: 'Login successful',
      token,
      user: {
        ...userWithoutPassword,
        pharmacyId,      // ← overwrite with resolved value
        pharmacyName     // ← useful for displaying in the UI
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email, password, pharmacyName, licenseNumber,
      firstName = '', lastName = ''
    } = req.body

    if (!email || !password || !pharmacyName || !licenseNumber) {
      return res.status(400).json({
        error: 'email, password, pharmacyName and licenseNumber are all required'
      })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const existingLicense = await prisma.pharmacy.findUnique({
      where: { licenseNumber }
    })
    if (existingLicense) {
      return res.status(400).json({ error: 'License number already registered' })
    }

    const hashedPassword = await hashPassword(password)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'PHARMACY_OWNER',
          firstName,
          lastName
        }
      })

      const pharmacy = await tx.pharmacy.create({
        data: {
          name: pharmacyName,
          licenseNumber,
          owner: { connect: { id: user.id } }
        }
      })

      // Link pharmacyId directly on the owner's user record
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { pharmacyId: pharmacy.id }
      })

      return { user: updatedUser, pharmacy }
    })

    const { password: _, ...userWithoutPassword } = result.user

    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword,
      pharmacy: result.pharmacy
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    // req.user is populated by auth middleware
    // Re-fetch to get latest data including pharmacyId resolved from Staff
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        pharmacyId: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    // Resolve pharmacyId via Staff if missing
    let pharmacyId = user.pharmacyId
    if (!pharmacyId) {
      const staff = await prisma.staff.findFirst({
        where: { userId: user.id, isActive: true },
        select: { pharmacyId: true }
      })
      pharmacyId = staff?.pharmacyId || null
    }

    res.json({ ...user, pharmacyId })
  } catch (error) {
    console.error('GetMe error:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
}