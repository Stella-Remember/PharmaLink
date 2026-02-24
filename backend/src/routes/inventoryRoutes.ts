import { Router } from 'express'
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock
} from '../controllers/inventoryController'
import { authenticate, requirePharmacist } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(requirePharmacist)

router.get('/', getInventory)
router.post('/', addInventoryItem)
router.put('/:id', updateInventoryItem)
router.delete('/:id', deleteInventoryItem)
router.patch('/:id/stock', adjustStock)

export default router