"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import RFQForm from "@/components/rfq/RFQForm";
import api from "@/lib/api";
import { apiMessage } from "@/lib/auth";
import type { RFQPayload } from "@/types/rfq";
import { notify } from "@/lib/notification";
export default function NewRFQPage() {
  const router = useRouter(), client = useQueryClient();
  const mutation = useMutation({ mutationFn: (payload: RFQPayload) => api.post("/rfqs", payload), onSuccess: async () => { await client.invalidateQueries({ queryKey: ["rfqs"] }); await client.invalidateQueries({ queryKey: ["dashboard"] }); notify("RFQ created successfully"); router.push("/rfqs"); } });
  return <div className="mx-auto max-w-7xl"><div className="mb-7 rounded-2xl border border-blue-100 bg-gradient-to-r from-white to-blue-50 px-6 py-6 shadow-sm"><p className="text-sm font-medium text-blue-600">RFQs / New RFQ</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Register a quotation request</h1><p className="mt-2 text-slate-500">Capture customer requirements and assign a responsible team member.</p></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b bg-slate-50 px-6 py-4"><h2 className="font-semibold text-slate-900">RFQ details</h2><p className="mt-1 text-sm text-slate-500">Fields marked with an asterisk are required.</p></div><div className="p-5 sm:p-7"><RFQForm submitLabel="Register RFQ" pending={mutation.isPending} serverError={mutation.isError ? apiMessage(mutation.error, "Unable to create RFQ") : undefined} onSubmit={(v) => mutation.mutate(v)} /></div></div></div>;
}
