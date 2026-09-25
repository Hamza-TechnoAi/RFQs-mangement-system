import dotenv from "dotenv";
import { connectDB } from "./config/db";
import User from "./models/User";
dotenv.config();
const seed = async () => {
  await connectDB();
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  if (await User.exists({ email })) console.log(`Admin already exists: ${email}`);
  else { await User.create({ name: process.env.SEED_ADMIN_NAME || "Admin", email, password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345", role: "admin" }); console.log(`Created admin: ${email}`); }
  process.exit(0);
};
void seed();
