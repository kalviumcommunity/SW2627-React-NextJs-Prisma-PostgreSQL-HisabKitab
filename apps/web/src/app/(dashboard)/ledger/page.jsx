"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react";
import styles from "./Ledger.module.css";
import PartyLedgerModal from "./PartyLedgerModal";

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

// Mock Data for Ledger
const mockLedgerData = [
  {
    id: "l1",
    contactName: "Ramesh Trading Co.",
    contactPhone: "+91 98765 43210",
    netBalance: 12500, // Positive means they owe us (To Collect)
  },
  {
    id: "l2",
    contactName: "Suresh Suppliers",
    contactPhone: "+91 98765 12345",
    netBalance: -5500, // Negative means we owe them (To Give)
  },
  {
    id: "l3",
    contactName: "Amit Patel",
    contactPhone: "+91 99988 77766",
    netBalance: 3500,
  },
  {
    id: "l4",
    contactName: "Rajesh Sharma",
    contactPhone: "+91 91234 56789",
    netBalance: 1500,
  },
  {
    id: "l5",
    contactName: "Vikram Logistics",
    contactPhone: "+91 99887 76655",
    netBalance: -8750,
  },
];

export default function LedgerPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("COLLECT"); // COLLECT or GIVE
  const [activeParty, setActiveParty] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div style={{ minHeight: "100vh", backgroundColor: "#f9f6ee" }} />;
  }

  const toCollectList = mockLedgerData.filter(item => item.netBalance > 0);
  const toGiveList = mockLedgerData.filter(item => item.netBalance < 0);

  const totalToCollect = toCollectList.reduce((acc, curr) => acc + curr.netBalance, 0);
  const totalToGive = toGiveList.reduce((acc, curr) => acc + Math.abs(curr.netBalance), 0);

  const displayList = activeTab === "COLLECT" ? toCollectList : toGiveList;

  return (
    <>
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ 
          filter: activeParty ? "blur(8px)" : "none", 
          transition: "filter 0.3s ease",
          pointerEvents: activeParty ? "none" : "auto"
        }}
      >
      {/* HEADER */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div>
          <h2 className={styles.title}>Ledger</h2>
          <p className={styles.subtitle}>Manage outstanding balances with your contacts</p>
        </div>
        <motion.button
          className={styles.primaryBtn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          <span>Add Party</span>
        </motion.button>
      </motion.div>

      {/* SUMMARY CARDS */}
      <motion.section className={styles.summaryGrid} variants={containerVariants}>
        <motion.div 
          className={styles.summaryCard} 
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => setActiveTab("COLLECT")}
          style={{ cursor: 'pointer', border: activeTab === "COLLECT" ? '2px solid #059669' : '' }}
        >
          <div className={styles.summaryAccent} style={{ backgroundColor: "#059669" }} />
          <div className={`${styles.summaryIcon} ${styles.summaryIconGot}`}>
            <ArrowDownLeft size={28} />
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total To Collect</span>
            <span className={styles.summaryValue} style={{ color: "#059669" }}>
              ₹ {totalToCollect.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </motion.div>

        <motion.div 
          className={styles.summaryCard} 
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => setActiveTab("GIVE")}
          style={{ cursor: 'pointer', border: activeTab === "GIVE" ? '2px solid #dc2626' : '' }}
        >
          <div className={styles.summaryAccent} style={{ backgroundColor: "#dc2626" }} />
          <div className={`${styles.summaryIcon} ${styles.summaryIconGave}`}>
            <ArrowUpRight size={28} />
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total To Give</span>
            <span className={styles.summaryValue} style={{ color: "#dc2626" }}>
              ₹ {totalToGive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </motion.div>
      </motion.section>

      {/* TABS */}
      <motion.div className={styles.tabs} variants={itemVariants}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "COLLECT" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("COLLECT")}
        >
          To Collect ({toCollectList.length})
          {activeTab === "COLLECT" && (
            <motion.div layoutId="activeTabIndicator" className={styles.activeIndicator} />
          )}
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "GIVE" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("GIVE")}
        >
          To Give ({toGiveList.length})
          {activeTab === "GIVE" && (
            <motion.div layoutId="activeTabIndicator" className={styles.activeIndicator} />
          )}
        </button>
      </motion.div>

      {/* LIST */}
      <motion.section className={styles.ledgerList} variants={itemVariants}>
        <AnimatePresence mode="popLayout">
          {displayList.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={styles.row}
              onClick={() => setActiveParty(item)}
            >
              <div className={styles.contactGroup}>
                <div className={styles.avatar}>
                  {item.contactName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.contactDetails}>
                  <span className={styles.contactName}>{item.contactName}</span>
                  <span className={styles.contactPhone}>{item.contactPhone}</span>
                </div>
              </div>
              
              <div className={styles.amountGroup}>
                <span className={`${styles.amount} ${activeTab === "COLLECT" ? styles.amountCollect : styles.amountGive}`}>
                  ₹ {Math.abs(item.netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className={styles.amountLabel}>
                  {activeTab === "COLLECT" ? "Owes you" : "You owe"}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {displayList.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '4rem 2rem', textAlign: 'center', color: 'rgba(26,26,26,0.5)' }}
          >
            <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No parties found in this section.</p>
          </motion.div>
        )}
      </motion.section>
      </motion.div>

      {/* MODAL */}
      <PartyLedgerModal 
        isOpen={!!activeParty} 
        onClose={() => setActiveParty(null)} 
        party={activeParty} 
      />
    </>
  );
}
