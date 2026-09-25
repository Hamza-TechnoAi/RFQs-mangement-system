import { ErrorRequestHandler, RequestHandler } from "express";

export const notFound: RequestHandler = (req, res) => { res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` }); };
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const value = error as { code?: number; name?: string; message?: string };
  let status = res.statusCode >= 400 ? res.statusCode : 500;
  let message = value.message || "Internal server error";
  if (value.code === 11000) { status = 409; message = "RFQ number already exists"; }
  else if (value.name === "ValidationError" || value.name === "CastError") { status = 400; message = "Invalid request data"; }
  else if (status >= 500) message = "Internal server error";
  res.status(status).json({ success: false, message });
};
export const asyncHandler = <T extends RequestHandler>(handler: T): RequestHandler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
