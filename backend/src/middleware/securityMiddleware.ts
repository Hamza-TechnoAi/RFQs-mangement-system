import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

const cleanse = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(cleanse);
  if (value && typeof value === "object") {
    const safe: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith("$") || key.includes(".")) throw new Error("Invalid request input");
      safe[key] = cleanse(nested);
    }
    return safe;
  }
  return value;
};

export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) req.body = cleanse(req.body);
    if (req.query) cleanse(req.query);
    next();
  } catch (error) { res.status(400); next(error); }
};

export const validateObjectId = (param = "id") => (req: Request, res: Response, next: NextFunction) => {
  const value = req.params[param];
  if (typeof value !== "string" || !Types.ObjectId.isValid(value)) { res.status(400); return next(new Error("Invalid resource identifier")); }
  next();
};

export const securityLog = (event: string, details: Record<string, unknown> = {}) => {
  // Keep logs useful without recording credentials, tokens, or other secrets.
  console.info(JSON.stringify({ event, ...details, at: new Date().toISOString() }));
};
