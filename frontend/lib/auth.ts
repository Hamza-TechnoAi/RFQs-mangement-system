import type { User } from "@/types/auth";
export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("user") || "null") as User | null; } catch { return null; }
};
export const clearAuth = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); };
export const apiMessage = (error: unknown, fallback: string) => {
  const candidate = error as { response?: { data?: { message?: string } } };
  return candidate.response?.data?.message || fallback;
};
