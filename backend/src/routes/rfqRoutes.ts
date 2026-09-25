import { Router } from "express";

import {
  createRFQ,
  getRFQs,
  getRFQById,
  updateRFQ,
  deleteRFQ,
  getStats
} from "../controllers/rfqController";
import { adminOnly, protect } from "../middleware/authMiddleware";
import { validateObjectId } from "../middleware/securityMiddleware";

const router = Router();

router.use(protect);
router.get("/stats", getStats);
router.post("/", adminOnly, createRFQ);
router.get("/", getRFQs);
router.get("/:id", validateObjectId(), getRFQById);
router.put("/:id", validateObjectId(), updateRFQ);
router.delete("/:id", validateObjectId(), adminOnly, deleteRFQ);

export default router;
