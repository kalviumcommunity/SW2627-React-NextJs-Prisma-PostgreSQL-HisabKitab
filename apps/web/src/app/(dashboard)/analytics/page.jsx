"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreHorizontal, 
  FileText, 
  Filter,
  Edit2,
  Trash2
} from "lucide-react";
import styles from "./Transactions.module.css";
import TransactionModal from "./TransactionModal";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
};

// Mock Data
const initialMockTransactions = [
  {
    id: "tx1",
    contactName: "Ramesh Trading Co.",
    date: "Today, 10:30 AM",
    type: "YOU_GAVE",
    amount: "5,000.00",
    balanceAfter: "12,500.00",
    note: "Advance for bulk order",
  },
  {
    id: "tx2",
    contactName: "Suresh Suppliers",
    date: "Yesterday, 04:15 PM",
    type: "YOU_GOT",
    amount: "15,250.00",
    balanceAfter: "0.00",
    note: "Full payment received for invoice #1024",
  },
  {
    id: "tx3",
    contactName: "Amit Patel",
    date: "14 Jul 2023, 11:00 AM",
    type: "YOU_GOT",
    amount: "2,000.00",
    balanceAfter: "3,500.00",
    note: "Partial payment",
  },
  {
    id: "tx4",
    contactName: "Rajesh Sharma",
    date: "12 Jul 2023, 09:45 AM",
    type: "YOU_GAVE",
    amount: "1,500.00",
    balanceAfter: "1,500.00",
    note: "Petty cash",
  },
  {
    id: "tx5",
    contactName: "Vikram Logistics",
    date: "10 Jul 2023, 02:20 PM",
    type: "YOU_GAVE",
    amount: "8,750.00",
    balanceAfter: "8,750.00",
    note: "Transport charges for June",
  },
];

export default function AnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [transactions, setTransactions] = useState(initialMockTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div style={{ minHeight: "100vh", backgroundColor: "#f9f6ee" }} />;
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "ALL") return true;
    return tx.type === filter;
  });

  return (
    <>
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ 
          filter: isModalOpen ? "blur(8px)" : "none", 
          transition: "filter 0.3s ease",
          pointerEvents: isModalOpen ? "none" : "auto"
        }}
      >
      {/* HEADER */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Analytics</h2>
          <p className={styles.subtitle}>Insights into all your money given and received</p>
        </div>
        <motion.button
          className={styles.primaryBtn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          <span>New Transaction</span>
        </motion.button>
      </motion.div>

      {/* SUMMARY CARDS */}
      <motion.section className={styles.summaryGrid} variants={containerVariants}>
        <motion.div 
          className={styles.summaryCard} 
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className={styles.summaryAccent} style={{ backgroundColor: "#dc2626" }} />
          <div className={`${styles.summaryIcon} ${styles.summaryIconGave}`}>
            <ArrowUpRight size={28} />
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total You Gave</span>
            <span className={styles.summaryValue} style={{ color: "#dc2626" }}>₹ 15,250.00</span>
          </div>
        </motion.div>

        <motion.div 
          className={styles.summaryCard} 
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className={styles.summaryAccent} style={{ backgroundColor: "#059669" }} />
          <div className={`${styles.summaryIcon} ${styles.summaryIconGot}`}>
            <ArrowDownLeft size={28} />
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total You Got</span>
            <span className={styles.summaryValue} style={{ color: "#059669" }}>₹ 17,250.00</span>
          </div>
        </motion.div>
      </motion.section>

      {/* TRANSACTIONS LIST */}
      <motion.section className={styles.listContainer} variants={itemVariants}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Recent Activity</h3>
          <div className={styles.listFilters}>
            <button 
              onClick={() => setFilter("ALL")}
              className={`${styles.filterBtn} ${filter === "ALL" ? styles.filterBtnActive : ""}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("YOU_GAVE")}
              className={`${styles.filterBtn} ${filter === "YOU_GAVE" ? styles.filterBtnActive : ""}`}
            >
              Given
            </button>
            <button 
              onClick={() => setFilter("YOU_GOT")}
              className={`${styles.filterBtn} ${filter === "YOU_GOT" ? styles.filterBtnActive : ""}`}
            >
              Got
            </button>
          </div>
        </div>

        <div className={styles.transactionList}>
          <AnimatePresence mode="popLayout">
            {filteredTransactions.map((tx) => (
              <motion.div 
                key={tx.id}
                className={styles.row}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 50, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              >
                <div className={styles.contactGroup}>
                  <div className={`${styles.typeIcon} ${tx.type === "YOU_GAVE" ? styles.typeIconGave : styles.typeIconGot}`}>
                    {tx.type === "YOU_GAVE" ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div className={styles.contactDetails}>
                    <span className={styles.contactName}>{tx.contactName}</span>
                    <span className={styles.transactionDate}>{tx.date}</span>
                  </div>
                </div>

                <div className={styles.noteGroup}>
                  {tx.note ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} style={{ opacity: 0.5 }} />
                      {tx.note}
                    </span>
                  ) : (
                    <span style={{ opacity: 0.3 }}>No note</span>
                  )}
                </div>

                <div className={styles.amountGroup}>
                  <span className={`${styles.amount} ${tx.type === "YOU_GAVE" ? styles.amountGave : styles.amountGot}`}>
                    ₹ {tx.amount}
                  </span>
                  <span className={styles.balanceText}>Bal: ₹ {tx.balanceAfter}</span>
                </div>

                <div className={styles.rowActions}>
                  <button className={styles.actionBtn} aria-label="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className={styles.actionBtn} aria-label="More">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredTransactions.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ padding: '4rem 2rem', textAlign: 'center', color: 'rgba(26,26,26,0.5)' }}
            >
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>No transactions found for this filter.</p>
            </motion.div>
          )}
        </div>
      </motion.section>
      </motion.div>

      {/* MODAL */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTransaction={(newTx) => setTransactions([newTx, ...transactions])}
      />
    </>
  );
}
