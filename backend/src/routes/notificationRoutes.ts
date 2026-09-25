import { Router } from "express";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notificationController";
import { protect } from "../middleware/authMiddleware";
import { validateObjectId } from "../middleware/securityMiddleware";

const router = Router();
router.use(protect);
router.get("/", getNotifications);
router.put("/read-all", markAllNotificationsRead);
router.put("/:id/read", validateObjectId(), markNotificationRead);
export default router;
