import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import rfqRoutes from "./routes/rfqRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler, notFound } from "./middleware/errorMiddleware";
import dashboardRoutes from "./routes/dashboardRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { sanitizeRequest } from "./middleware/securityMiddleware";

const app = express();

const defaultFrontendUrl = process.env.NODE_ENV === "production"
  ? "https://portal.technoai.ae"
  : "http://localhost:3000";
const trustedOrigins = (process.env.FRONTEND_URL || defaultFrontendUrl).split(",").map((origin) => origin.trim()).filter(Boolean);
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" }, hsts: process.env.NODE_ENV === "production" ? undefined : false }));
app.use(cors({ origin(origin, callback) { if (!origin || trustedOrigins.includes(origin)) return callback(null, true); return callback(new Error("Origin not allowed by CORS")); }, methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"], credentials: false }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: "draft-8", legacyHeaders: false, message: { success: false, message: "Too many requests. Please try again later." } }));
app.use(express.json({ limit: "100kb" }));
app.use(sanitizeRequest);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RFQ Management API is running",
    health: "/api/health"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "RFQ Management API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rfqs", rfqRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
