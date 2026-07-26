"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // The forgetPassword plugin handles generating the token and sending the email 
    // via our configured sendResetPassword hook
    const { error: err } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    
    if (err) {
      // It's generally better security practice not to reveal if an email exists or not, 
      // but Better Auth might return rate limit or other generic errors we should show.
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[400px]">

        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
            style={{ background: "var(--brand-green)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">Reset your password</h1>
          <p className="text-[15px] mt-1.5 text-center text-zinc-500">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-zinc-200/80 p-6 sm:p-8 space-y-5">

          {success ? (
            <div className="flex flex-col items-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-center" style={{ color: "var(--foreground)" }}>Check your inbox</h3>
              <p className="text-sm text-center mb-6" style={{ color: "var(--muted)" }}>
                If an account exists for {email}, you will receive a password reset link shortly.
              </p>
              <Link href="/login" 
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 text-center inline-block"
                style={{ background: "var(--brand-green)" }}>
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-zinc-900">Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 text-[15px] outline-none focus:ring-2 bg-zinc-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading || !email}
                className="w-full py-3 rounded-xl text-white font-semibold text-[15px] hover:opacity-90 disabled:opacity-60 mt-4 transition-all shadow-sm"
                style={{ background: "var(--brand-green)" }}>
                {loading ? "Sending link..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[14px] mt-6 text-zinc-500">
          <Link href="/login" className="font-semibold hover:underline flex items-center justify-center gap-1" style={{ color: "var(--brand-green)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
