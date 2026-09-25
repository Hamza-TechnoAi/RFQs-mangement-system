"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import RFQForm, { RFQFormValues } from "@/components/rfq/RFQForm";
import api from "@/lib/api";
import { apiMessage } from "@/lib/auth";
import type { RFQ, RFQPayload } from "@/types/rfq";
import { notify } from "@/lib/notification";
import type { User } from "@/types/auth";
export default function EditRFQPage() {
  const { id } = useParams<{ id: string }>(), router = useRouter(), client = useQueryClient();
  const query = useQuery({ queryKey: ["rfq", id], queryFn: async () => (await api.get<{ data: RFQ }>(`/rfqs/${id}`)).data.data });
  const me = useQuery({ queryKey: ["me", "rfq-edit"], queryFn: async () => (await api.get<{ data: User }>("/auth/me")).data.data });
  const mutation = useMutation({ mutationFn: (payload: RFQPayload) => api.put(`/rfqs/${id}`, me.data?.role === "member" ? { status: payload.status, submissionDate: payload.submissionDate, preparedBy: payload.preparedBy } : payload), onSuccess: async () => { await client.invalidateQueries({ queryKey: ["rfqs"] }); await client.invalidateQueries({ queryKey: ["dashboard"] }); notify("RFQ updated successfully"); router.push("/rfqs"); } });
  if (query.isPending || me.isPending) return <State text="Loading RFQ…" />;
  if (query.isError || me.isError) return <State text="Unable to load this RFQ." />;
  const item = query.data;
  const values: RFQFormValues = { rfqNumber: item.rfqNumber, rfqDate: item.rfqDate.slice(0, 10), customer: item.customer, contactPerson: item.contactPerson, email: item.email, subject: item.subject, assignedTo: item.assignedTo._id, status: item.status, submissionDate: item.submissionDate?.slice(0, 10) || "", preparedBy: item.preparedBy?._id || "" };
  return <div className="mx-auto max-w-7xl"><div className="mb-6"><p className="text-sm text-slate-500">RFQs / {item.rfqNumber}</p><h1 className="text-2xl font-semibold tracking-tight">Edit RFQ</h1></div><div className="rounded-xl border bg-white p-5 shadow-sm sm:p-7"><RFQForm initialValues={values} lockDetails={me.data.role === "member"} assignedToName={item.assignedTo.name} submitLabel="Save changes" pending={mutation.isPending} serverError={mutation.isError ? apiMessage(mutation.error, "Unable to update RFQ") : undefined} onSubmit={(v) => mutation.mutate(v)} /></div></div>;
}
function State({ text }: { text: string }) { return <div className="rounded-xl border bg-white p-12 text-center text-sm text-slate-500">{text}</div>; }
