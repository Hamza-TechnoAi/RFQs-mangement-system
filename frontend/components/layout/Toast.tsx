"use client";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { notificationEvent, takeNotification, type Notification } from "@/lib/notification";
export default function Toast() {
  const [notice, setNotice] = useState<Notification | null>(() => takeNotification());
  useEffect(() => {
    const handler = (event: Event) => setNotice((event as CustomEvent<Notification>).detail);
    window.addEventListener(notificationEvent, handler);
    return () => window.removeEventListener(notificationEvent, handler);
  }, []);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 3500); return () => window.clearTimeout(timer); }, [notice]);
  if (!notice) return null;
  const Icon = notice.type === "success" ? CheckCircle2 : XCircle;
  return <div className={`fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-xl border bg-white p-4 shadow-lg ${notice.type === "success" ? "text-emerald-700" : "text-red-700"}`}><Icon size={20} /><span className="text-sm font-medium">{notice.message}</span><button onClick={() => setNotice(null)} className="ml-2 text-slate-400"><X size={16} /></button></div>;
}
