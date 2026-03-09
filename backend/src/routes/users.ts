// src/routes/user.ts
import { Router } from 'express'
import {
  getPharmacists,
  getAllUsers,
  createPharmacist,
  updatePharmacist,
  deletePharmacist
} from '../controllers/userController'
import { authenticate, requireOwner } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(requireOwner)

router.get('/', getAllUsers)                        // GET /api/users
router.get('/pharmacists', getPharmacists)         // GET /api/users/pharmacists
router.post('/pharmacists', createPharmacist)      // POST /api/users/pharmacists
router.put('/pharmacists/:id', updatePharmacist)   // PUT /api/users/pharmacists/:id
router.delete('/pharmacists/:id', deletePharmacist) // DELETE /api/users/pharmacists/:id

export default router