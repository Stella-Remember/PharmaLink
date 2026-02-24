// src/routes/dashboardRoutes.ts
import { Router } from 'express'
import { getDashboardStats, getLowStockAlerts } from '../controllers/dashboardController'
import { authenticate, requirePharmacist } from '../middleware/auth'

const router = Router()

router.use(authenticate) // All dashboard routes require login
router.use(requirePharmacist) // Only pharmacists can access

router.get('/stats', getDashboardStats)
router.get('/low-stock', getLowStockAlerts)

export default router