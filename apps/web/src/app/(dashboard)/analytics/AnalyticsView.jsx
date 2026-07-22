"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreHorizontal, 
  FileText,
  Edit2
} from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";
import styles from "./Transactions.module.css";
import TransactionModal from "./TransactionModal";
import { createTransaction } from "@/actions/analytics";

export default function AnalyticsView({ initialTransactions }) {
  const [filter, setFilter] = useState("ALL");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleAddTransaction = async (newTx) => {
    // Optimistic UI update
    setTransactions([{ ...newTx, id: `temp-${Date.now()}` }, ...transactions]);

    const result = await createTransaction(newTx);
    if (!result.success) {
      setTransactions(transactions); // Revert on failure
      console.error(result.error);
      alert("Failed: " + result.error);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "ALL") return true;
    return tx.type === filter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate totals
  const totalGave = transactions.filter(t => t.type === "YOU_GAVE").reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalGot = transactions.filter(t => t.type === "YOU_GOT").reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

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
            <span className={styles.summaryValue} style={{ color: "#dc2626" }}>₹ {totalGave.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
            <span className={styles.summaryValue} style={{ color: "#059669" }}>₹ {totalGot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </motion.div>
      </motion.section>

      {/* TRANSACTIONS LIST */}
      <motion.section className={styles.listContainer} variants={itemVariants}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Recent Activity</h3>
          <div className={styles.listFilters}>
            <div className={styles.itemsPerPage}>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={styles.perPageSelect}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
            <button 
              onClick={() => { setFilter("ALL"); setCurrentPage(1); }}
              className={`${styles.filterBtn} ${filter === "ALL" ? styles.filterBtnActive : ""}`}
            >
              All
            </button>
            <button 
              onClick={() => { setFilter("YOU_GAVE"); setCurrentPage(1); }}
              className={`${styles.filterBtn} ${filter === "YOU_GAVE" ? styles.filterBtnActive : ""}`}
            >
              Given
            </button>
            <button 
              onClick={() => { setFilter("YOU_GOT"); setCurrentPage(1); }}
              className={`${styles.filterBtn} ${filter === "YOU_GOT" ? styles.filterBtnActive : ""}`}
            >
              Got
            </button>
          </div>
        </div>

        <div className={styles.transactionList}>
          <AnimatePresence mode="popLayout">
            {paginatedTransactions.map((tx) => {
              const formattedDate = new Date(tx.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              return (
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
                      <span className={styles.contactName}>{tx.partyName}</span>
                      <span className={styles.transactionDate}>{formattedDate}</span>
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
                      ₹ {parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
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
              );
            })}
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

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.section>
      </motion.div>

      {/* MODAL */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTransaction={handleAddTransaction}
      />
    </>
  );
}
