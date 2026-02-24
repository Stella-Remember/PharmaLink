import { Router } from 'express'
import {
  getClaims,
  createClaim,
  updateClaimStatus,
  getPendingClaimsCount
} from '../controllers/claimsController'
import { authenticate, requirePharmacist } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(requirePharmacist)

router.get('/', getClaims)
router.post('/', createClaim)
router.patch('/:id/status', updateClaimStatus)
router.get('/pending/count', getPendingClaimsCount)

export default router