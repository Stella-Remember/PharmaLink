// backend/src/routes/claimsRoutes.ts
import { Router } from 'express'
import { getClaims, getClaimById, updateClaimStatus } from '../controllers/claimsController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/', getClaims)                       // GET /api/claims
router.get('/:id', getClaimById)                 // GET /api/claims/:id
router.put('/:id/status', updateClaimStatus)     // PUT /api/claims/:id/status

export default router