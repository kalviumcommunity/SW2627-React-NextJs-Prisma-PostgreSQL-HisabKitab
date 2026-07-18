import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react";
import styles from "./PartyLedgerModal.module.css";

// Mock specific transactions mapped by party ID
const mockPartyTransactions = {
  l1: [
    { id: 't1', date: 'Today, 18 Jul 2026', time: '10:30 AM', type: 'YOU_GAVE', amount: 5000, note: 'Advance payment' },
    { id: 't2', date: 'Today, 18 Jul 2026', time: '02:15 PM', type: 'YOU_GOT', amount: 2000, note: '' },
    { id: 't3', date: '15 Jul 2026', time: '09:00 AM', type: 'YOU_GAVE', amount: 9500, note: 'Materials cost' }
  ],
  l2: [
    { id: 't4', date: 'Yesterday, 17 Jul 2026', time: '11:45 AM', type: 'YOU_GOT', amount: 5500, note: 'Invoice #1024 clearance' }
  ],
  l3: [
    { id: 't5', date: '14 Jul 2026', time: '11:00 AM', type: 'YOU_GOT', amount: 3500, note: 'Partial payment' }
  ],
  l4: [
    { id: 't6', date: '12 Jul 2026', time: '09:45 AM', type: 'YOU_GAVE', amount: 1500, note: 'Petty cash' }
  ],
  l5: [
    { id: 't7', date: '10 Jul 2026', time: '02:20 PM', type: 'YOU_GAVE', amount: 8750, note: 'Transport charges for June' }
  ]
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { x: "100%", boxShadow: "0 0 0 rgba(0,0,0,0)" },
  visible: { 
    x: 0, 
    boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.15)",
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: { 
    x: "100%", 
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
};

export default function PartyLedgerModal({ isOpen, onClose, party }) {
  if (!isOpen || !party) return null;

  const transactions = mockPartyTransactions[party.id] || [];

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, tx) => {
    if (!groups[tx.date]) {
      groups[tx.date] = [];
    }
    groups[tx.date].push(tx);
    return groups;
  }, {});

  const isToCollect = party.netBalance > 0;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.overlay}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div 
          className={styles.panel}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className={styles.header}>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
            
            <div className={styles.contactInfo}>
              <div className={styles.avatar}>
                {party.contactName.charAt(0).toUpperCase()}
              </div>
              <div className={styles.contactDetails}>
                <h3 className={styles.contactName}>{party.contactName}</h3>
                <p className={styles.contactPhone}>{party.contactPhone}</p>
              </div>
            </div>

            <div className={styles.balanceBanner}>
              <span className={styles.balanceLabel}>Net Balance</span>
              <span className={`${styles.balanceValue} ${isToCollect ? styles.amountCollect : styles.amountGive}`}>
                ₹ {Math.abs(party.netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, marginLeft: '0.5rem', color: 'rgba(26,26,26,0.5)' }}>
                  {isToCollect ? "(To Collect)" : "(To Give)"}
                </span>
              </span>
            </div>
          </div>

          {/* BODY / TRANSACTIONS LIST */}
          <div className={styles.content}>
            {Object.keys(groupedTransactions).length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(26,26,26,0.5)', marginTop: '4rem' }}>
                <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>No transactions found for this party.</p>
              </div>
            ) : (
              Object.keys(groupedTransactions).map(date => (
                <div key={date} className={styles.dateGroup}>
                  <div className={styles.dateHeader}>{date}</div>
                  <div className={styles.transactionList}>
                    {groupedTransactions[date].map(tx => (
                      <div key={tx.id} className={styles.txCard}>
                        <div className={styles.txInfo}>
                          <div className={`${styles.txIcon} ${tx.type === 'YOU_GOT' ? styles.txIconGot : styles.txIconGave}`}>
                            {tx.type === 'YOU_GOT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div className={styles.txDetails}>
                            <span className={styles.txType}>
                              {tx.type === 'YOU_GOT' ? 'You Got' : 'You Gave'}
                            </span>
                            <span className={styles.txTime}>{tx.time}</span>
                            {tx.note && (
                              <span className={styles.txNote}>
                                <FileText size={14} style={{ opacity: 0.5 }} />
                                {tx.note}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`${styles.txAmount} ${tx.type === 'YOU_GOT' ? styles.amountCollect : styles.amountGive}`}>
                          ₹ {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
