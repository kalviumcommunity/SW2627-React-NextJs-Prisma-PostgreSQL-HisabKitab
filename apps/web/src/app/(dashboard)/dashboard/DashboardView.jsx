"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
import TotalBalanceCard from "@/components/dashboard/TotalBalanceCard";
import KpiGrid from "@/components/dashboard/KpiGrid";
import ActionCards from "@/components/dashboard/ActionCards";
import CurrenciesMarket from "@/components/dashboard/CurrenciesMarket";
import TopSpending from "@/components/dashboard/TopSpending";
import BalanceChart from "@/components/dashboard/BalanceChart";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function DashboardView({ dashboardData }) {
  const { data: session } = useSession();
  const permissions = session?.user?.shopPermissions || {};
  const isOwner = session?.user?.shopRole === "OWNER";
  const hideFinancials = !isOwner && permissions.canViewFinancials === false;

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12 w-full max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Area */}
      <motion.div className="flex justify-between items-end mb-4 relative z-50" variants={itemVariants}>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 mt-1">A real-time snapshot of your financial health.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <DateRangePicker />
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (4 spans on lg) */}
        <motion.div className="lg:col-span-4 flex flex-col gap-4" variants={itemVariants}>
          <TotalBalanceCard balance={dashboardData?.totalBalance || 0} hideFinancials={hideFinancials} />
          <CurrenciesMarket topDebtors={dashboardData?.topDebtors || []} hideFinancials={hideFinancials} />
          <TopSpending topCreditors={dashboardData?.topCreditors || []} hideFinancials={hideFinancials} />
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
                hideFinancials={hideFinancials}
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
