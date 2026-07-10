"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res?.error) {
        setError(res.error || "Invalid email or password.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#F9F6EE] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#1C1917]/20 pointer-events-none"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#1C1917]/20 pointer-events-none"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[#1C1917]/20 pointer-events-none"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#1C1917]/20 pointer-events-none"></div>

      <div className="w-full max-w-[440px] z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl font-semibold text-[#1C1917] tracking-tight">
              हिसाब <span className="text-[#D97706] font-normal italic">किताब</span>
            </h1>
          </Link>
          <p className="text-xs font-sans text-[#5A5A5A] uppercase tracking-[0.2em] mt-2">Digital Khata Ledger</p>
        </div>

        <div className="bg-white border border-[#1C1917]/10 shadow-lg rounded-xl px-8 py-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[3px] bg-[#D97706] rounded-b-full"></div>
          <h2 className="text-xl font-serif font-medium text-[#1C1917] mb-2 text-center">Welcome Back</h2>
          <p className="text-sm font-sans text-[#6C6967] text-center mb-8">Access your secure digital ledger</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-sans font-medium text-[#3C3937] uppercase tracking-wider">Email Address</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-[#FBFBFA] border border-[#1C1917]/15 rounded-lg px-4 py-3 text-sm text-[#1C1917] placeholder-[#1C1917]/30 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-sans font-medium text-[#3C3937] uppercase tracking-wider">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#FBFBFA] border border-[#1C1917]/15 rounded-lg px-4 py-3 text-sm text-[#1C1917] placeholder-[#1C1917]/30 outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#1C1917] text-[#F9F6EE] font-sans font-medium text-sm py-3 px-4 rounded-lg flex justify-center items-center gap-2 cursor-pointer">
              {loading ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>Authenticating...</span></> : <span>Log In</span>}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-[#1C1917]/5">
            <p className="text-xs font-sans text-[#6C6967]">New to Hisab Kitab?{" "}<Link href="/register" className="text-[#D97706] hover:underline font-medium ml-1">Create a free account</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
}
