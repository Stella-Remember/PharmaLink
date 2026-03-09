// backend/src/routes/pharmacyRoutes.ts
import { Router } from 'express'
import {
  getPharmacies,
  createPharmacy,
  updatePharmacy,
  deletePharmacy,
  getDashboardStats,
  getInventoryReport
} from '../controllers/pharmacyController'
import { authenticate, requireOwner } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(requireOwner)

router.get('/dashboard-stats', getDashboardStats)      // GET /api/pharmacies/dashboard-stats
router.get('/inventory-report', getInventoryReport)    // GET /api/pharmacies/inventory-report
router.get('/', getPharmacies)                         // GET /api/pharmacies
router.post('/', createPharmacy)                       // POST /api/pharmacies
router.put('/:id', updatePharmacy)                     // PUT /api/pharmacies/:id
router.delete('/:id', deletePharmacy)                  // DELETE /api/pharmacies/:id

export default router