import { Router } from 'express'
import {
  getPharmacies,
  createPharmacist,
  assignPharmacist,
  getPharmacyStaff
} from '../controllers/pharmacyController'
import { authenticate, requireOwner } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(requireOwner)

router.get('/', getPharmacies)
router.post('/', createPharmacist)
router.post('/:pharmacyId/staff', assignPharmacist)
router.get('/:pharmacyId/staff', getPharmacyStaff)

export default router