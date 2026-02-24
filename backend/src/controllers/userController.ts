import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getPharmacists = async (req: Request, res: Response) => {
  try {
    const pharmacists = await prisma.user.findMany({
      where: { role: 'PHARMACIST' },
      include: {
        staffEntries: {
          include: {
            pharmacy: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
    
    // Transform data to match frontend expectations
    const formatted = pharmacists.map(p => ({
      id: p.id,
      email: p.email,
      firstName: p.firstName,
      lastName: p.lastName,
      phone: p.phone || '', // Add null check
      pharmacies: p.staffEntries.map(s => ({
        id: s.pharmacy.id,
        name: s.pharmacy.name,
        role: 'PHARMACIST'
      }))
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error getting pharmacists:', error);
    res.status(500).json({ error: 'Failed to get pharmacists' });
  }
};

export const createPharmacist = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null, // Handle optional phone
        role: 'PHARMACIST'
      }
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating pharmacist:', error);
    res.status(500).json({ error: 'Failed to create pharmacist' });
  }
};

export const updatePharmacist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, isActive } = req.body;
    
    // Ensure id is a string, not an array
    const userId = Array.isArray(id) ? id[0] : id;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        isActive
      }
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating pharmacist:', error);
    res.status(500).json({ error: 'Failed to update pharmacist' });
  }
};

export const deletePharmacist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if id is a valid string
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    await prisma.user.delete({
      where: { id: id }
    });
    
    res.json({ message: 'Pharmacist deleted successfully' });
  } catch (error) {
    console.error('Error deleting pharmacist:', error);
    res.status(500).json({ error: 'Failed to delete pharmacist' });
  }
};