import type { RFQStatus } from "@/types/rfq";
const styles: Record<RFQStatus, string> = { Pending: "bg-amber-50 text-amber-700 ring-amber-600/20", "Waiting Supplier Quotation": "bg-blue-50 text-blue-700 ring-blue-600/20", Submitted: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" };
export default function StatusBadge({ status }: { status: RFQStatus }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>{status}</span>; }
