"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar } from "lucide-react";

import TotalBalanceCard from "@/components/dashboard/TotalBalanceCard";
import KpiGrid from "@/components/dashboard/KpiGrid";
import ActionCards from "@/components/dashboard/ActionCards";
import CurrenciesMarket from "@/components/dashboard/CurrenciesMarket";
import TopSpending from "@/components/dashboard/TopSpending";
import BalanceChart from "@/components/dashboard/BalanceChart";
import { getDashboardData } from "./actions";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      getDashboardData().then((res) => {
        if (res.success) {
          setDashboardData(res.data);
        } else {
          console.error("Dashboard fetch error:", res.error);
        }
        setDataLoading(false);
      });
    }
  }, [status, router]);

  if (status === "loading" || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold">Loading Dashboard</p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12 w-full max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Area */}
      <motion.div className="flex justify-between items-end mb-4" variants={itemVariants}>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 mt-1">A real-time snapshot of your financial health.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <User size={16} className="text-gray-400" />
            Personal
          </button>
          
          <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar size={16} className="text-gray-400" />
            January 12, 2026 - January 31, 2026
          </button>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (4 spans on lg) */}
        <motion.div className="lg:col-span-4 flex flex-col gap-4" variants={itemVariants}>
          <TotalBalanceCard balance={dashboardData?.totalBalance || 0} />
          <CurrenciesMarket topDebtors={dashboardData?.topDebtors || []} />
          <TopSpending topCreditors={dashboardData?.topCreditors || []} />
        </motion.div>

        {/* Middle and Right Columns Container (8 spans on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Top Row of Middle/Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KPI Grid (takes 2 spans) */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <KpiGrid 
                totalGiven={dashboardData?.totalGiven || 0}
                totalReceived={dashboardData?.totalReceived || 0}
                totalContacts={dashboardData?.totalContacts || 0}
              />
            </motion.div>
            
            {/* Action Cards (takes 1 span) */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <ActionCards recentNotes={dashboardData?.recentNotes || []} />
            </motion.div>
          </div>

          {/* Bottom Row of Middle/Right */}
          <motion.div className="flex-1 min-h-[300px]" variants={itemVariants}>
            <BalanceChart />
          </motion.div>
          
        </div>
        
      </div>
    </motion.div>
  );
}