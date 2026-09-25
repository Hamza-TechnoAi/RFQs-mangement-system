import { Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorMiddleware";
import { securityLog } from "../middleware/securityMiddleware";

const publicUser = (user: { _id: unknown; name: string; email: string; role: string }) => ({ _id: user._id, name: user.name, email: user.email, role: user.role });
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail || typeof password !== "string") { res.status(401); throw new Error("Invalid email or password"); }
  const user = await User.findOne({ email: normalizedEmail, isActive: true });
  if (!user || !(await user.comparePassword(password))) { securityLog("login.failed", { email: normalizedEmail }); res.status(401); throw new Error("Invalid email or password"); }
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  securityLog("login.success", { userId: user._id.toString() });
  res.json({ success: true, data: { token: jwt.sign({ id: user._id.toString() }, secret, { algorithm: "HS256", expiresIn: "1h" }), user: publicUser(user) } });
});
export const me = asyncHandler(async (req: AuthRequest, res: Response) => { res.json({ success: true, data: publicUser(req.user!) }); });
export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => { res.json({ success: true, message: "Logged out successfully" }); });

export const googleLogin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { credential } = req.body as { credential?: string };
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!credential || !clientId) { res.status(400); throw new Error("Google login is not configured"); }
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!response.ok) { res.status(401); throw new Error("Google sign-in could not be verified"); }
  const identity = await response.json() as { aud?: string; email?: string; email_verified?: string };
  if (identity.aud !== clientId || identity.email_verified !== "true" || !identity.email) { res.status(401); throw new Error("Google account verification failed"); }
  const user = await User.findOne({ email: identity.email.toLowerCase(), isActive: true });
  if (!user) { res.status(403); throw new Error("This Google account is not authorized. Ask an administrator to add your work email first."); }
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  securityLog("google_login.success", { userId: user._id.toString() });
  res.json({ success: true, data: { token: jwt.sign({ id: user._id.toString() }, secret, { algorithm: "HS256", expiresIn: "1h" }), user: publicUser(user) } });
});
