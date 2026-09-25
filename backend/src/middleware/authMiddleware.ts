import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { securityLog } from "./securityMiddleware";

export interface AuthRequest extends Request { user?: IUser; }

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : undefined;
  if (!token) { securityLog("auth.denied", { reason: "missing_token", path: req.path }); res.status(401); return next(new Error("Authentication required")); }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Server authentication unavailable");
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as JwtPayload;
    if (typeof decoded.id !== "string") throw new Error("Invalid token");
    const user = await User.findById(decoded.id).select("-password");
    if (!user || user.isActive === false) throw new Error();
    req.user = user;
    next();
  } catch { securityLog("auth.denied", { reason: "invalid_token", path: req.path }); res.status(401); next(new Error("Invalid or expired token")); }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") { securityLog("auth.forbidden", { userId: req.user?._id.toString(), path: req.path }); res.status(403); return next(new Error("Admin access required")); }
  next();
};
