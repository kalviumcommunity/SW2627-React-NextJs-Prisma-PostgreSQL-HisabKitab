"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shopName, setShopName] = useState("Your Khata");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.name) setShopName(session.user.name + "'s Khata");
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex flex-col justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-[#D97706]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs font-sans text-[#6C6967] mt-4 uppercase tracking-widest">Loading Ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6EE] text-[#1C1917]">
      <header className="border-b border-[#1C1917]/10 bg-white/70 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl font-bold tracking-tight">हिसाब <span className="text-[#D97706] italic">किताब</span></span>
          <span className="text-xs border border-[#1C1917]/20 rounded px-1.5 py-0.5 text-[#1C1917]/60 font-sans uppercase hidden sm:inline">Active Shop</span>
          <span className="text-sm font-sans font-medium text-[#1C1917] hidden sm:inline">{shopName}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-sans text-[#5A5A5A] hidden md:inline">
            Welcome, <strong className="text-[#1C1917] font-medium">{session?.user?.name || session?.user?.email}</strong>
          </span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="border border-[#1C1917]/15 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#3C3937] px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer">
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-serif font-medium tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#5A5A5A] font-sans mt-1">Real-time shop balances and financial summaries</p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Dues (Receivable)", value: "0.00", color: "#10B981", sub: "From 0 contacts" },
            { label: "Total Payable", value: "0.00", color: "#EF4444", sub: "To 0 vendors" },
            { label: "Salary Payable", value: "0.00", color: "#3B82F6", sub: "For 0 workers" },
            { label: "Monthly Loss", value: "0.00", color: "#D97706", sub: "Expiries & damages" },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-[#1C1917]/10 rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: card.color }}></div>
              <p className="text-xs font-sans text-[#5A5A5A] uppercase tracking-wider font-medium pl-2">{card.label}</p>
              <h3 className="text-3xl font-serif font-bold mt-2 pl-2" style={{ color: card.color }}>₹{card.value}</h3>
              <p className="text-[10px] text-[#6C6967] font-sans mt-3 pl-2">{card.sub}</p>
            </div>
          ))}
        </section>

        <section className="bg-white border border-[#1C1917]/10 rounded-2xl p-12 text-center max-w-3xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-[#F9F6EE] rounded-full flex justify-center items-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif font-medium text-[#1C1917]">Your digital khatabook is empty</h3>
          <p className="text-sm text-[#5A5A5A] font-sans max-w-md mx-auto mt-2 leading-relaxed">
            Get started by adding your first customer contact or importing existing ledgers.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button className="bg-[#1C1917] hover:bg-[#3C3937] text-[#F9F6EE] px-5 py-2.5 rounded-lg text-xs font-sans font-medium transition-all shadow-sm cursor-pointer">
              Add First Contact
            </button>
            <button className="border border-[#1C1917]/20 hover:bg-[#F9F6EE] text-[#1C1917] px-5 py-2.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer">
              Import from Paper Khata (AI)
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}