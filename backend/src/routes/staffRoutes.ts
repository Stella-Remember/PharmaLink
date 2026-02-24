import { Router } from "express"
import { createStaff, deleteStaff } from "../controllers/staffController"
import { authenticate } from "../middleware/auth"

const router = Router()

router.post("/", authenticate, createStaff)
router.delete("/:userId", authenticate, deleteStaff)

export default router