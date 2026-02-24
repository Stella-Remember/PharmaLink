import { Router } from 'express'
import { createSale, getSales, getTodaySales } from '../controllers/salesController'
import { authenticate, requirePharmacist } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(requirePharmacist)

router.post('/', createSale)
router.get('/', getSales)
router.get('/today', getTodaySales)

export default router