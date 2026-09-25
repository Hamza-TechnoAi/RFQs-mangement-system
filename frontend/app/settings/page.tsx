"use client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/api";
import { apiMessage } from "@/lib/auth";
import { notify } from "@/lib/notification";

export default function SettingsPage() {
  const [currentPassword, setCurrent] = useState(""), [newPassword, setNew] = useState(""), [confirm, setConfirm] = useState("");
  const mutation = useMutation({ mutationFn: () => api.put("/users/me/password", { currentPassword, newPassword }), onSuccess: () => { setCurrent(""); setNew(""); setConfirm(""); notify("Password changed successfully"); } });
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (newPassword !== confirm) return notify("New passwords do not match", "error"); if (newPassword.length < 12) return notify("New password must be at least 12 characters", "error"); mutation.mutate(); };
  return <div className="mx-auto max-w-7xl"><div className="mb-7 rounded-2xl border border-blue-100 bg-gradient-to-r from-white to-blue-50 px-6 py-6 shadow-sm"><p className="text-sm font-medium text-blue-600">Account</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Settings</h1><p className="mt-2 text-slate-500">Manage your workspace access and password.</p></div><form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="border-b pb-5"><h2 className="font-semibold text-slate-900">Change password</h2><p className="mt-1 text-sm text-slate-500">Use at least 12 characters to keep your account secure.</p></div><Field label="Current password" value={currentPassword} set={setCurrent} /><Field label="New password" value={newPassword} set={setNew} /><Field label="Confirm new password" value={confirm} set={setConfirm} />{mutation.isError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{apiMessage(mutation.error, "Unable to change password")}</p>}<div className="border-t pt-5"><button disabled={mutation.isPending} className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">{mutation.isPending ? "Saving…" : "Change password"}</button></div></form></div>;
}
function Field({ label, value, set }: { label: string; value: string; set: (value: string) => void }) { return <label className="block"><span className="mb-2 block text-sm font-medium">{label}</span><input required type="password" value={value} onChange={(e) => set(e.target.value)} className="input" autoComplete="new-password" /></label>; }
