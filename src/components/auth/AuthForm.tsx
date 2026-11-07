"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { identifierToEmail } from "@/lib/phone";
import { STORE } from "@/lib/constants";

const safeRedirect = (value: string | null) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/");

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const redirect = safeRedirect(useSearchParams().get("redirect"));
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = identifierToEmail(identifier);
    if (!parsed) return toast.error("Enter a valid email or a Bangladeshi mobile number (01XXXXXXXXX)");
    if (!isLogin) {
      if (name.trim().length < 2) return toast.error("Please enter your name");
      if (password.length < 6) return toast.error("Password must be at least 6 characters");
      if (password !== confirm) return toast.error("Passwords do not match");
    }

    setBusy(true);
    const { error } = isLogin
      ? await authClient.signIn.email({ email: parsed.email, password, rememberMe: remember })
      : await authClient.signUp.email({ name: name.trim(), email: parsed.email, password, phone: parsed.phone });
    setBusy(false);

    if (error) return toast.error(error.message ?? "Something went wrong. Please try again.");
    toast.success(isLogin ? "Welcome back!" : "Account created. Welcome!");
    router.push(redirect);
    router.refresh();
  };

  const google = async () => {
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: redirect });
    if (error) toast.error(error.message ?? "Google sign-in is not available right now");
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-neutral p-12 text-neutral-content lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <Link href="/" className="relative flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-14 w-auto" />
          <span className="font-brand leading-tight">
            <span className="block text-lg font-extrabold tracking-[0.18em] text-primary">BROTHERS</span>
            <span className="block text-sm font-semibold tracking-[0.3em] text-white">CROCKERIES</span>
          </span>
        </Link>
        <div className="relative">
          <p className="text-4xl font-bold leading-tight text-white">আপনার ঘরের প্রতিটি প্রয়োজনেই</p>
          <p className="mt-3 max-w-sm text-neutral-content/75">Save your wishlist, track your orders and check out faster with an account.</p>
        </div>
        <p className="relative text-sm text-neutral-content/60">{STORE.tagline}</p>
      </aside>

      {/* Form */}
      <main className="grid place-items-center bg-base-200 px-4 py-10">
        <div className="w-full max-w-md rounded-box bg-base-100 p-7 shadow-xl shadow-secondary/5 sm:p-9">
          <Link href="/" className="mb-5 flex items-center gap-2 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-10 w-auto" />
            <span className="font-brand text-sm font-extrabold tracking-widest text-secondary">BROTHERS CROCKERIES</span>
          </Link>
          <h1 className="text-2xl font-bold">{isLogin ? "Sign in" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-base-content/60">{isLogin ? "Access your account securely." : "It takes less than a minute."}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {!isLogin && (
              <label className="input input-bordered flex w-full items-center gap-2">
                <User size={16} className="text-base-content/50" />
                <input required className="grow" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </label>
            )}
            <label className="input input-bordered flex w-full items-center gap-2">
              <User size={16} className="text-base-content/50" />
              <input required className="grow" placeholder="Email or phone number" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
            </label>
            <label className="input input-bordered flex w-full items-center gap-2">
              <Lock size={16} className="text-base-content/50" />
              <input required type={show ? "text" : "password"} className="grow" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isLogin ? "current-password" : "new-password"} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="text-base-content/50 hover:text-base-content">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </label>
            {!isLogin && (
              <label className="input input-bordered flex w-full items-center gap-2">
                <Lock size={16} className="text-base-content/50" />
                <input required type={show ? "text" : "password"} className="grow" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              </label>
            )}
            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
                </label>
                <Link href="/forgot-password" className="font-medium text-secondary hover:underline">Forgot password?</Link>
              </div>
            )}
            <button type="submit" disabled={busy} className="btn btn-secondary w-full">
              {busy && <Loader2 size={16} className="animate-spin" />} {isLogin ? "Login" : "Create account"}
            </button>
          </form>

          {/* Social login stays at the bottom */}
          <div className="divider my-6 text-xs text-base-content/50">or {isLogin ? "sign in" : "sign up"} with</div>
          <button type="button" onClick={google} className="btn btn-outline w-full gap-3">
            <GoogleIcon /> {isLogin ? "Sign in with Google" : "Sign up with Google"}
          </button>

          <p className="mt-6 text-center text-sm text-base-content/70">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link href={`${isLogin ? "/register" : "/login"}${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="font-semibold text-secondary hover:underline">
              {isLogin ? "Register account" : "Sign in"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
