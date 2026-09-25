import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { RFQ } from "@/types/rfq";
import type { User } from "@/types/auth";

const date = (value?: string) => value
  ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value))
  : "—";

export default function RFQTable({ rfqs, user, onDelete }: { rfqs: RFQ[]; user?: User; onDelete?: (rfq: RFQ) => void }) {
  return <>
    <div className="divide-y sm:hidden">{rfqs.map((rfq) => <article key={rfq._id} className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`/rfqs/${rfq._id}`} className="font-semibold text-blue-700">{rfq.rfqNumber}</Link><p className="mt-1 truncate text-sm font-medium text-slate-900">{rfq.customer}</p></div><StatusBadge status={rfq.status} /></div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs"><div><dt className="text-slate-400">RFQ Date</dt><dd className="mt-0.5 text-slate-700">{date(rfq.rfqDate)}</dd></div><div><dt className="text-slate-400">Assigned to</dt><dd className="mt-0.5 truncate text-slate-700">{rfq.assignedTo.name}</dd></div><div className="col-span-2"><dt className="text-slate-400">Subject</dt><dd className="mt-0.5 line-clamp-2 text-slate-700">{rfq.subject}</dd></div></dl>
      {onDelete && <div className="flex justify-end border-t border-slate-100 pt-2"><Actions rfq={rfq} user={user} onDelete={onDelete} /></div>}
    </article>)}</div>
    <div className="hidden overflow-x-auto sm:block"><table className="w-full min-w-[1120px] text-left text-sm"><thead><tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><th className="px-5 py-3">RFQ Number</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Assigned To</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Submission</th><th className="px-4 py-3">Prepared By</th>{onDelete && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead><tbody className="divide-y">{rfqs.map((rfq) => <tr key={rfq._id} className="hover:bg-slate-50/70"><td className="px-5 py-4 font-medium">{rfq.rfqNumber}</td><td className="px-4 py-4 text-slate-600">{date(rfq.rfqDate)}</td><td className="px-4 py-4">{rfq.customer}</td><td className="px-4 py-4 text-slate-600">{rfq.contactPerson}</td><td className="max-w-56 truncate px-4 py-4 text-slate-600">{rfq.subject}</td><td className="px-4 py-4">{rfq.assignedTo.name}</td><td className="px-4 py-4"><StatusBadge status={rfq.status} /></td><td className="px-4 py-4 text-slate-600">{date(rfq.submissionDate)}</td><td className="px-4 py-4 text-slate-600">{rfq.preparedBy?.name || "—"}</td>{onDelete && <td className="px-4 py-4"><Actions rfq={rfq} user={user} onDelete={onDelete} /></td>}</tr>)}</tbody></table></div>
  </>;
}

function Actions({ rfq, user, onDelete }: { rfq: RFQ; user?: User; onDelete: (rfq: RFQ) => void }) {
  return <div className="flex justify-end gap-1"><Link href={`/rfqs/${rfq._id}`} aria-label={`View ${rfq.rfqNumber}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><Eye size={17} /></Link><Link href={`/rfqs/${rfq._id}/edit`} aria-label={`Edit ${rfq.rfqNumber}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><Pencil size={17} /></Link>{user?.role === "admin" && <button aria-label={`Delete ${rfq.rfqNumber}`} onClick={() => onDelete(rfq)} className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button>}</div>;
}
