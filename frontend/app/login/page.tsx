"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, Globe2, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
import { apiMessage } from "@/lib/auth";
import type { LoginResponse } from "@/types/auth";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (localStorage.getItem("token")) router.replace("/dashboard");
  }, [router]);

  const finishLogin = useCallback(({ token, user }: LoginResponse) => {
    queryClient.clear();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    router.replace("/dashboard");
  }, [queryClient, router]);

  const mutation = useMutation({
    mutationFn: async (values: Form) => (await api.post<{ data: LoginResponse }>("/auth/login", values)).data.data,
    onSuccess: finishLogin,
  });

  return <main className="relative grid min-h-screen items-center justify-items-end overflow-hidden bg-[#0f1a1b] p-4 sm:p-8 lg:pr-[12vw]">
    <Image src="/rfq-login-background.png" alt="RFQ management workspace" fill priority className="object-cover" />
    <div className="absolute inset-0 bg-[#0f1a1b]/60" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_45%,transparent_0%,rgba(15,26,27,.55)_80%)]" />
    <a href="https://technoai.ae/" target="_blank" rel="noreferrer" aria-label="Visit TechnoAI website" title="TechnoAI" className="absolute right-5 top-5 z-10 grid size-12 place-items-center rounded-2xl border border-white/25 bg-[#0f1a1b]/55 text-white shadow-lg backdrop-blur-xl transition hover:bg-[#0f1a1b]/80 sm:right-8 sm:top-8"><Globe2 size={24} strokeWidth={2.2} /></a>
    <section className="relative w-full max-w-[470px] rounded-[28px] border border-white/70 bg-white/85 p-7 text-[#0f1a1b] shadow-[0_30px_80px_rgba(15,26,27,.5)] backdrop-blur-xl sm:p-10">
      <div className="mb-7 flex items-center gap-4"><div className="grid size-16 place-items-center rounded-2xl bg-white shadow-lg"><Image src="/technoai-mark-transparent.png" alt="TechnoAI" width={54} height={32} className="h-auto w-12 object-contain" /></div><div><h1 className="text-3xl font-bold tracking-tight">RFQ Management</h1><p className="mt-1 text-sm font-medium text-[#136b8b]">Powered by TechnoAI</p></div></div>
      <div className="mb-7"><h2 className="text-2xl font-bold">Welcome back</h2><p className="mt-1 text-base text-slate-600">Sign in to manage your quotation requests.</p></div>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-5">
        <Field label="Work email" error={errors.email?.message}><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#136b8b]" size={21} /><input {...register("email")} type="email" autoComplete="email" className="h-12 w-full rounded-xl border border-[#9fe7e7] bg-white/70 pl-12 pr-4 text-base outline-none placeholder:text-slate-400 focus:border-[#289fb7] focus:ring-4 focus:ring-[#9fe7e7]/40" placeholder="you@company.com" /></Field>
        <Field label="Password" error={errors.password?.message}><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[#136b8b]" size={21} /><input {...register("password")} type={showPassword ? "text" : "password"} autoComplete="current-password" className="h-12 w-full rounded-xl border border-[#9fe7e7] bg-white/70 pl-12 pr-12 text-base outline-none placeholder:text-slate-400 focus:border-[#289fb7] focus:ring-4 focus:ring-[#9fe7e7]/40" placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#136b8b]">{showPassword ? <EyeOff size={21} /> : <Eye size={21} />}</button></Field>
        {mutation.isError && <p className="rounded-xl bg-red-50/90 p-3 text-sm text-red-700">{apiMessage(mutation.error, "Unable to sign in")}</p>}
        <button disabled={mutation.isPending} className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#289fb7] to-[#136b8b] text-base font-semibold text-white shadow-lg shadow-[#136b8b]/25 hover:from-[#2189a3] hover:to-[#115672] disabled:opacity-60">{mutation.isPending ? <LoaderCircle className="animate-spin" size={20} /> : <>Sign in <ArrowRight size={20} /></>}</button>
      </form>
      <div className="mt-8 flex items-center gap-4 text-sm text-slate-600"><span className="h-px flex-1 bg-[#9fe7e7]" /><span className="flex items-center gap-2"><ShieldCheck size={18} className="text-[#136b8b]" />Secure workspace</span><span className="h-px flex-1 bg-[#9fe7e7]" /></div>
    </section>
  </main>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><span className="relative block">{children}</span>{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
