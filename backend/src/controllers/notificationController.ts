import { Response } from "express";
import Notification from "../models/Notification";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorMiddleware";

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const [data, unread] = await Promise.all([
    Notification.find({ recipient: req.user?._id }).populate("rfq", "rfqNumber customer").sort({ createdAt: -1 }).limit(limit),
    Notification.countDocuments({ recipient: req.user?._id, isRead: false }),
  ]);
  res.json({ success: true, data, unread });
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user?._id }, { isRead: true }, { new: true });
  if (!notification) { res.status(404); throw new Error("Notification not found"); }
  res.json({ success: true, data: notification });
});

export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ recipient: req.user?._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: "Notifications marked as read" });
});
