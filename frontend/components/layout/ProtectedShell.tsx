"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import api from "@/lib/api";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { User } from "@/types/auth";
import Toast from "./Toast";

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("token"));
  const query = useQuery({ queryKey: ["me"], queryFn: async () => (await api.get<{ data: User }>("/auth/me")).data.data, enabled: hasToken, retry: false });
  useEffect(() => { if (!hasToken || query.isError) router.replace("/login"); }, [hasToken, query.isError, router]);
  if (!hasToken || query.isPending) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading workspace…</div>;
  return <div className="min-h-screen overflow-x-hidden bg-slate-50"><Toast /><Sidebar user={query.data!} /><div className="min-w-0 md:pl-64"><Header user={query.data!} /><main className="p-3 sm:p-6 lg:p-8">{children}</main></div></div>;
}
