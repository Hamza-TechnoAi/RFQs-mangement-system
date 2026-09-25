"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Plus,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "RFQs",
      href: "/rfqs",
      icon: FileText,
    },
    {
      label: "New RFQ",
      href: "/rfqs/new",
      icon: Plus,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-white">
      <div className="border-b px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900">
          RFQ Manager
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Quotation Management
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;

          const active =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}