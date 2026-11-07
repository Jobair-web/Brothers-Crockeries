"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { isPhoneEmail, normalizeBdPhone } from "@/lib/phone";

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-md rounded-box bg-base-100 p-7 shadow-xl shadow-secondary/5 sm:p-9">
        <Link href="/" className="mb-5 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-10 w-auto" />
          <span className="font-brand text-sm font-extrabold tracking-widest text-secondary">BROTHERS CROCKERIES</span>
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-base-content/60">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (normalizeBdPhone(value) || isPhoneEmail(value)) {
      return toast.info("Phone-only accounts have no email on file. Please call the shop and we will help you reset it.");
    }
    setBusy(true);
    const { error } = await authClient.requestPasswordReset({ email: value.toLowerCase(), redirectTo: "/reset-password" });
    setBusy(false);
    if (error) return toast.error(error.message ?? "Could not send the reset link");
    setSent(true);
  };

  return (
    <Shell title="Forgot your password?" subtitle="Enter the email you signed up with and we will send a reset link.">
      {sent ? (
        <div role="status" className="rounded-box bg-success/10 p-4 text-sm">
          If an account exists for <strong>{email}</strong>, a reset link is on its way. It is valid for 1 hour.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="input input-bordered flex w-full items-center gap-2">
            <Mail size={16} className="text-base-content/50" />
            <input required className="grow" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <button disabled={busy} className="btn btn-secondary w-full">{busy && <Loader2 size={16} className="animate-spin" />} Send reset link</button>
        </form>
      )}
      <p className="mt-6 text-center text-sm"><Link href="/login" className="font-semibold text-secondary hover:underline">Back to sign in</Link></p>
    </Shell>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  if (!token || params.get("error")) {
    return (
      <Shell title="Link expired" subtitle="This reset link is invalid or has expired.">
        <Link href="/forgot-password" className="btn btn-primary w-full">Request a new link</Link>
      </Shell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setBusy(false);
    if (error) return toast.error(error.message ?? "Could not reset the password");
    toast.success("Password updated. Please sign in.");
    router.push("/login");
  };

  return (
    <Shell title="Choose a new password" subtitle="Use at least 6 characters.">
      <form onSubmit={submit} className="space-y-4">
        <label className="input input-bordered flex w-full items-center gap-2">
          <Lock size={16} className="text-base-content/50" />
          <input required type="password" className="grow" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </label>
        <label className="input input-bordered flex w-full items-center gap-2">
          <Lock size={16} className="text-base-content/50" />
          <input required type="password" className="grow" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </label>
        <button disabled={busy} className="btn btn-secondary w-full">{busy && <Loader2 size={16} className="animate-spin" />} Update password</button>
      </form>
    </Shell>
  );
}
