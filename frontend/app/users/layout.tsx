import ProtectedShell from "@/components/layout/ProtectedShell";
export default function Layout({ children }: { children: React.ReactNode }) { return <ProtectedShell>{children}</ProtectedShell>; }
