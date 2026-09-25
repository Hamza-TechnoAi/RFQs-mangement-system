"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FilePlus2, FileText, LayoutDashboard, LogOut, Settings, Users, X } from "lucide-react";
import { clearAuth } from "@/lib/auth";
import type { User } from "@/types/auth";
import api from "@/lib/api";

export default function Sidebar({ user, open = false, onClose }: { user: User; open?: boolean; onClose?: () => void }) {
  const pathname = usePathname(), router = useRouter();
  const links = [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }, { label: "RFQs", href: "/rfqs", icon: FileText }, ...(user.role === "admin" ? [{ label: "New RFQ", href: "/rfqs/new", icon: FilePlus2 }, { label: "Team Members", href: "/users", icon: Users }] : []), { label: "Settings", href: "/settings", icon: Settings }];
  const logout = async () => { try { await api.post("/auth/logout"); } finally { clearAuth(); router.replace("/login"); } };
  return <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-blue-900/40 bg-[#071a3d] text-white shadow-xl transition-transform md:translate-x-0`}>
    <div className="flex min-h-28 items-center justify-between border-b border-white/10 px-5"><div className="flex items-center gap-3"><Image src="/technoai-mark-transparent.png" alt="TechnoAI" width={72} height={42} className="h-auto w-[72px] mix-blend-screen brightness-0 invert" /><div className="border-l border-white/20 pl-3"><p className="text-lg font-bold tracking-tight">RFQ System</p><p className="mt-0.5 text-xs text-blue-200/65">{user.role === "admin" ? "Admin Login" : "Team Login"}</p></div></div>{onClose && <button onClick={onClose} className="md:hidden"><X size={20} /></button>}</div>
    <nav className="flex-1 space-y-2 p-4">{links.map(({ label, href, icon: Icon }) => { const active = pathname === href || (href === "/rfqs" && pathname.startsWith("/rfqs/") && pathname !== "/rfqs/new"); return <Link key={href} onClick={onClose} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-blue-100/80 hover:bg-white/10 hover:text-white"}`}><Icon size={19} />{label}</Link>; })}</nav>
    <div className="border-t border-white/10 p-4"><div className="mb-3 flex items-center gap-3 px-2"><span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 font-semibold">{user.name.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{user.name}</p><p className="text-xs text-blue-200/65">{user.role === "admin" ? "Administrator" : "Team Member"}</p></div></div><button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-blue-100/80 hover:bg-white/10 hover:text-white"><LogOut size={17} />Log out</button></div>
  </aside>;
}
