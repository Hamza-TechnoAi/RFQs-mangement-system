"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
import type { User } from "@/types/auth";
import type { RFQPayload } from "@/types/rfq";

const schema = z.object({
  rfqNumber: z.string().trim().min(1, "RFQ number is required"),
  rfqDate: z.string().min(1, "RFQ date is required"),
  customer: z.string().trim().min(1, "Customer is required"),
  contactPerson: z.string().trim().min(1, "Contact person is required"),
  email: z.email("Enter a valid email"),
  subject: z.string().trim().min(1, "Subject is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  status: z.enum(["Pending", "Waiting Supplier Quotation", "Submitted"]),
  submissionDate: z.string().optional(),
  preparedBy: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.status === "Submitted") {
    if (!data.submissionDate) ctx.addIssue({ code: "custom", path: ["submissionDate"], message: "Submission date is required" });
    if (!data.preparedBy) ctx.addIssue({ code: "custom", path: ["preparedBy"], message: "Prepared by is required" });
  }
});

export type RFQFormValues = z.infer<typeof schema>;
const blank: RFQFormValues = { rfqNumber: "", rfqDate: new Date().toISOString().slice(0, 10), customer: "", contactPerson: "", email: "", subject: "", assignedTo: "", status: "Pending", submissionDate: "", preparedBy: "" };

export default function RFQForm({ initialValues, onSubmit, pending, serverError, submitLabel, lockDetails = false, assignedToName }: { initialValues?: RFQFormValues; onSubmit: (payload: RFQPayload) => void; pending: boolean; serverError?: string; submitLabel: string; lockDetails?: boolean; assignedToName?: string }) {
  const users = useQuery({ queryKey: ["users"], queryFn: async () => (await api.get<{ data: User[] }>("/users")).data.data });
  const { register, handleSubmit, control, formState: { errors } } = useForm<RFQFormValues>({ resolver: zodResolver(schema), defaultValues: initialValues || blank });
  const submitted = useWatch({ control, name: "status" }) === "Submitted";
  const submit = (values: RFQFormValues) => onSubmit({ ...values, submissionDate: submitted ? values.submissionDate : undefined, preparedBy: submitted ? values.preparedBy : undefined });
  return <form onSubmit={handleSubmit(submit)} className="space-y-6"><div className="grid gap-5 md:grid-cols-2"><Field label="RFQ Number" error={errors.rfqNumber?.message}><input disabled={lockDetails} className="input disabled:cursor-not-allowed disabled:bg-slate-100" {...register("rfqNumber")} /></Field><Field label="RFQ Date" error={errors.rfqDate?.message}><input type="date" disabled={lockDetails} className="input disabled:cursor-not-allowed disabled:bg-slate-100" {...register("rfqDate")} /></Field><Field label="Customer" error={errors.customer?.message}><input disabled={lockDetails} className="input disabled:cursor-not-allowed disabled:bg-slate-100" {...register("customer")} /></Field><Field label="Contact Person" error={errors.contactPerson?.message}><input disabled={lockDetails} className="input disabled:cursor-not-allowed disabled:bg-slate-100" {...register("contactPerson")} /></Field><Field label="Email" error={errors.email?.message}><input type="email" disabled={lockDetails} className="input disabled:cursor-not-allowed disabled:bg-slate-100" {...register("email")} /></Field><Field label="Assigned To" error={errors.assignedTo?.message}>{lockDetails ? <><input type="hidden" {...register("assignedTo")} /><input value={assignedToName || "Assigned team member"} disabled readOnly className="input disabled:cursor-not-allowed disabled:bg-slate-100" /></> : <select className="select" {...register("assignedTo")}><option value="">Select team member</option>{users.data?.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select>}</Field><Field label="Subject" error={errors.subject?.message} full><textarea rows={3} disabled={lockDetails} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100" {...register("subject")} /></Field><Field label="Status" error={errors.status?.message}><select className="select" {...register("status")}><option>Pending</option><option>Waiting Supplier Quotation</option><option>Submitted</option></select></Field><Field label="Submission Date" error={errors.submissionDate?.message} optional={!submitted}><input type="date" disabled={!submitted} className="input disabled:cursor-not-allowed disabled:bg-slate-100" {...register("submissionDate")} /></Field><Field label="Prepared By" error={errors.preparedBy?.message} optional={!submitted}><select disabled={!submitted} className="select disabled:cursor-not-allowed disabled:bg-slate-100" {...register("preparedBy")}><option value="">Select preparer</option>{users.data?.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select></Field></div><p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">Submission Date and Prepared By are enabled and required when Status is set to Submitted.</p>{users.isError && <p className="text-sm text-red-600">Unable to load team members.</p>}{serverError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}<div className="flex justify-end gap-3 border-t pt-5"><Link href="/rfqs" className="flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-slate-50">Cancel</Link><button disabled={pending || users.isPending} className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">{pending && <LoaderCircle size={16} className="animate-spin" />}{submitLabel}</button></div></form>;
}
function Field({ label, error, full, optional, children }: { label: string; error?: string; full?: boolean; optional?: boolean; children: React.ReactNode }) { return <label className={full ? "md:col-span-2" : ""}><span className="mb-2 block text-sm font-medium">{label}{optional ? <span className="ml-1 text-xs font-normal text-slate-400">(when submitted)</span> : <span className="text-red-500"> *</span>}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>; }
