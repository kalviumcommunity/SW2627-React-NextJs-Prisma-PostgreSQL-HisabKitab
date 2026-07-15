"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import styles from "./Dashboard.module.css";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading Ledger</p>
      </div>
    );
  }

  const kpiData = [
    { label: "Total Dues", value: "0.00", color: "#10B981", sub: "Receivable from 0 contacts" },
    { label: "Total Payable", value: "0.00", color: "#EF4444", sub: "Owed to 0 vendors" },
    { label: "Salary Payable", value: "0.00", color: "#3B82F6", sub: "For 0 workers" },
    { label: "Monthly Loss", value: "0.00", color: "#D97706", sub: "Expiries & damages" },
  ];

  return (
    <motion.div
      className={styles.dashboard}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div className={styles.header} variants={itemVariants}>
        <h2 className={styles.title}>Overview</h2>
        <p className={styles.subtitle}>Real-time shop balances and financial summaries</p>
      </motion.div>

      <motion.section className={styles.kpiGrid} variants={containerVariants}>
        {kpiData.map((card, idx) => (
          <motion.div
            key={idx}
            className={styles.kpiCard}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className={styles.cardAccent} style={{ backgroundColor: card.color }}></div>
            <span className={styles.cardLabel}>{card.label}</span>
            <span className={styles.cardValue} style={{ color: card.color }}>
              ₹{card.value}
            </span>
            <span className={styles.cardSub}>{card.sub}</span>
          </motion.div>
        ))}
      </motion.section>

      <motion.section className={styles.emptyState} variants={itemVariants}>
        <div className={styles.emptyIcon}>
          <BookOpen size={32} />
        </div>
        <h3 className={styles.emptyTitle}>Your digital khatabook is empty</h3>
        <p className={styles.emptyDesc}>
          Get started by adding your first customer contact or importing your existing paper ledgers using our AI vision tool.
        </p>
        <div className={styles.actionGroup}>
          <motion.button
            className={styles.primaryBtn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Add First Contact
          </motion.button>
          <motion.button
            className={styles.secondaryBtn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Import from Paper Khata
          </motion.button>
        </div>
      </motion.section>
    </motion.div>
  );
}