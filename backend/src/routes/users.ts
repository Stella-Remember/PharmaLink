import { Router } from 'express';
import {
  getPharmacists,
  createPharmacist,
  updatePharmacist,
  deletePharmacist
} from '../controllers/userController';
import { authenticate, requireOwner } from '../middleware/auth';

const router = Router();

// All routes require authentication and owner role
router.use(authenticate);
router.use(requireOwner);

router.get('/pharmacists', getPharmacists);
router.post('/pharmacists', createPharmacist);
router.put('/pharmacists/:id', updatePharmacist);
router.delete('/pharmacists/:id', deletePharmacist);

export default router;