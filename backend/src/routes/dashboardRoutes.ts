import { Router } from "express";
import { getStats } from "../controllers/rfqController";
import { protect } from "../middleware/authMiddleware";
const router = Router();
router.get("/stats", protect, getStats);
export default router;
