"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function LoginContent() {
  const searchParams = useSearchParams();
  const isResetSuccess = searchParams.get("success") === "password_reset";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await authClient.signIn.email({
      email,
      password,
    });
    if (err) {
      setError(err.message || "Invalid email or password.");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[400px]">

        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--brand-green)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Sign in to your account</p>
        </div>

        {/* Success Banner */}
        {isResetSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p>Your password has been reset successfully. You can now log in with your new password.</p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4"
          style={{ borderColor: "var(--border)" }}>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>Password</label>
              <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "var(--brand-green)" }}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                style={{ color: "var(--muted)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 mt-2 transition-opacity"
            style={{ background: "var(--brand-green)" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "var(--muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold hover:underline" style={{ color: "var(--brand-green)" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--background)" }} />}>
      <LoginContent />
    </Suspense>
  );
}
