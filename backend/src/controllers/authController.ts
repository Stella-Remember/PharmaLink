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
        createdAt: true
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValid = await comparePassword(password, user.password)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      // Prisma type is string | null; convert null to undefined
      pharmacyId: user.pharmacyId ?? undefined
    })

    const { password: _, ...userWithoutPassword } = user

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    // allow optional first/last names and default to empty strings
    const { email, password, pharmacyName, licenseNumber, firstName = '', lastName = '' } = req.body

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
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

      // 🔥 update user with pharmacyId
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          pharmacyId: pharmacy.id
        }
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
    res.status(500).json({ error: 'Registration failed' })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user
    res.json(userWithoutPassword)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
}