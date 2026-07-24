import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ArrowDownLeft, FileText, Plus, Trash2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { getContactTransactions } from "@/actions/ledger";
import styles from "./PartyLedgerModal.module.css";



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

export default function PartyLedgerModal({ isOpen, onClose, party, onNewTransaction, onDeleteParty }) {
  const { data: session } = useSession();
  const isOwner = session?.user?.shopRole === "OWNER";
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && party) {
      setIsLoading(true);
      getContactTransactions(party.id).then(data => {
        setTransactions(data);
        setIsLoading(false);
      });
    } else {
      setTransactions([]);
    }
  }, [isOpen, party]);

  if (!isOpen || !party) return null;

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, tx) => {
    if (!groups[tx.date]) {
      groups[tx.date] = [];
    }
    groups[tx.date].push(tx);
    return groups;
  }, {});

  const balanceVal = party.balance ? parseFloat(party.balance) : 0;
  const isToCollect = balanceVal > 0;

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
                {party.name ? party.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className={styles.contactDetails}>
                <h3 className={styles.contactName}>{party.name}</h3>
                <p className={styles.contactPhone}>{party.phone}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: 'auto' }}>
                <button 
                  className={styles.newTxBtn}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#4f46e5', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                  onClick={() => {
                    onClose();
                    onNewTransaction(party);
                  }}
                >
                  <Plus size={16} />
                  New Transaction
                </button>
                {isOwner && (
                  <button 
                    className={styles.deletePartyBtn}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#fee2e2', color: '#dc2626', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this party? All transactions will remain but the party will be removed from your ledger.")) {
                        onDeleteParty(party.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Party
                  </button>
                )}
              </div>
            </div>

            <div className={styles.balanceBanner}>
              <span className={styles.balanceLabel}>Net Balance</span>
              <span className={`${styles.balanceValue} ${isToCollect ? styles.amountCollect : styles.amountGive}`}>
                ₹ {Math.abs(balanceVal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, marginLeft: '0.5rem', color: 'rgba(26,26,26,0.5)' }}>
                  {isToCollect ? "(To Collect)" : "(To Give)"}
                </span>
              </span>
            </div>
          </div>

          {/* BODY / TRANSACTIONS LIST */}
          <div className={styles.content}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#4f46e5' }}>
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : Object.keys(groupedTransactions).length === 0 ? (
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
                      <motion.div 
                        key={tx.id} 
                        className={styles.txCard}
                        initial={{ opacity: 0, scale: 0.8, y: 50, filter: 'blur(10px)' }}
                        whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                      >
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
                      </motion.div>
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
