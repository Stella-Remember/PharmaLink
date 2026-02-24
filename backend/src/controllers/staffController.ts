import { Request, Response } from "express"
import { prisma } from "../utils/prisma"
import { hashPassword } from "../utils/bcrypt"

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, pharmacyId } = req.body

    // Only owners allowed
    if (req.user.role !== "PHARMACY_OWNER") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    const hashedPassword = await hashPassword(password)

    // Create pharmacist
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "PHARMACIST"
      }
    })

    // Link to pharmacy
    await prisma.staff.create({
      data: {
        userId: newUser.id,
        pharmacyId
      }
    })

    res.status(201).json({
      message: "Pharmacist created successfully"
    })

  } catch (error) {
    res.status(500).json({ error: "Failed to create staff" })
  }
}
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (req.user.role !== "PHARMACY_OWNER") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    await prisma.staff.deleteMany({
      where: { userId }
    })

    await prisma.user.delete({
      where: { id: userId }
    })

    res.json({ message: "User deleted" })

  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" })
  }
}