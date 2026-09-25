import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorMiddleware";
import Notification from "../models/Notification";
export const getUsers = asyncHandler(async (_req: AuthRequest, res: Response) => { res.json({ success: true, data: await User.find().select("name email role isActive").sort({ name: 1 }) }); });

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id).select("name email role isActive");
  if (!user) { res.status(404); throw new Error("User not found"); }
  res.json({ success: true, data: user });
});

export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, role = "member" } = req.body as { name?: string; email?: string; password?: string; role?: string };
  if (!name?.trim() || name.trim().length > 160 || !email?.trim() || !password) { res.status(400); throw new Error("Name, email and password are required"); }
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || password.length < 12 || !["admin", "member"].includes(role)) { res.status(400); throw new Error("Provide a valid email, role and password of at least 12 characters"); }
  if (await User.exists({ email: email.toLowerCase() })) { res.status(409); throw new Error("Email already exists"); }
  const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password, role: role as "admin" | "member" });
  res.status(201).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, role, isActive = true } = req.body as { name?: string; email?: string; role?: string; isActive?: boolean };
  if (!name?.trim() || name.trim().length > 160 || !email?.trim() || email.length > 254 || !role || !["admin", "member"].includes(role) || typeof isActive !== "boolean") { res.status(400); throw new Error("Valid name, email and role are required"); }
  const duplicate = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
  if (duplicate) { res.status(409); throw new Error("Email already exists"); }
  const user = await User.findByIdAndUpdate(req.params.id, { name: name.trim(), email: email.toLowerCase(), role, isActive }, { new: true, runValidators: true }).select("name email role isActive");
  if (!user) { res.status(404); throw new Error("User not found"); }
  res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?._id.toString() === req.params.id) { res.status(400); throw new Error("You cannot delete your own account"); }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }
  await Notification.deleteMany({ recipient: user._id });
  res.json({ success: true, message: "User deleted" });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword || newPassword.length < 12) { res.status(400); throw new Error("Current password and a new password of at least 12 characters are required"); }
  const user = await User.findById(req.user?._id);
  if (!user || !(await user.comparePassword(currentPassword))) { res.status(400); throw new Error("Current password is incorrect"); }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password changed successfully" });
});
