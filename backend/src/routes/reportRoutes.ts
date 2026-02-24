import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { getOwnerSalesReport } from "../controllers/reportController"

const router = Router()

router.get("/owner/sales", authenticate, getOwnerSalesReport)

export default router