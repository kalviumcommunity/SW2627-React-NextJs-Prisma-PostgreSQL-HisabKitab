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
import { createTransaction, approveTransaction, rejectTransaction, editTransaction, deleteTransaction, approveDeletion, rejectDeletion } from "@/actions/analytics";
import { useSession } from "next-auth/react";
import { Check, X, Trash2 } from "lucide-react";

export default function AnalyticsView({ initialTransactions }) {
  const { data: session } = useSession();
  const isOwner = session?.user?.shopRole === "OWNER";
  
  const [filter, setFilter] = useState("ALL");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [processingId, setProcessingId] = useState(null);

  const handleAddTransaction = async (newTx) => {
    setTransactions([{ ...newTx, id: `temp-${Date.now()}` }, ...transactions]);
    const result = await createTransaction(newTx);
    if (!result.success) {
      setTransactions(transactions); // Revert on failure
      console.error(result.error);
      alert("Failed: " + result.error);
    }
  };

  const handleEditClick = (tx) => {
    setEditingTransaction({
      id: tx.id,
      partyName: tx.partyName,
      type: tx.type,
      amount: tx.amount,
      date: tx.date,
      note: tx.note
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSaveTransaction = async (data) => {
    if (editingTransaction) {
      const result = await editTransaction(editingTransaction.id, data);
      if (result.success) {
        setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...data, status: isOwner ? "APPROVED" : "PENDING", amount: data.amount.toString(), editedAt: new Date().toISOString() } : t));
      } else {
        alert("Failed to edit: " + result.error);
      }
    } else {
      await handleAddTransaction(data);
    }
    handleModalClose();
  };

  const handleDeleteClick = async (txId) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      const result = await deleteTransaction(txId);
      if (result.success) {
        if (isOwner) {
          setTransactions(prev => prev.filter(t => t.id !== txId));
        } else {
          setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: "PENDING_DELETION" } : t));
        }
      } else {
        alert("Failed to delete: " + result.error);
      }
    }
  };

  const handleApprove = async (txId) => {
    setProcessingId(txId);
    const res = await approveTransaction(txId);
    if (res.success) {
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: "APPROVED" } : t));
    } else {
      alert(res.error);
    }
    setProcessingId(null);
  };

  const handleReject = async (txId) => {
    setProcessingId(txId);
    const res = await rejectTransaction(txId);
    if (res.success) {
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: "REJECTED" } : t));
    } else {
      alert(res.error);
    }
    setProcessingId(null);
  };

  const handleApproveDel = async (txId) => {
    setProcessingId(txId);
    const res = await approveDeletion(txId);
    if (res.success) {
      setTransactions(prev => prev.filter(t => t.id !== txId));
    } else alert(res.error);
    setProcessingId(null);
  };

  const handleRejectDel = async (txId) => {
    setProcessingId(txId);
    const res = await rejectDeletion(txId);
    if (res.success) {
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: "APPROVED" } : t));
    } else alert(res.error);
    setProcessingId(null);
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
                      <span className={styles.transactionDate}>
                        {formattedDate} 
                        {tx.status === "PENDING" && <span style={{ marginLeft: "8px", color: "#d97706", fontWeight: "bold", fontSize: "10px", background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>PENDING</span>}
                        {tx.status === "REJECTED" && <span style={{ marginLeft: "8px", color: "#dc2626", fontWeight: "bold", fontSize: "10px", background: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>REJECTED</span>}
                        {tx.status === "PENDING_DELETION" && <span style={{ marginLeft: "8px", color: "#dc2626", fontWeight: "bold", fontSize: "10px", background: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>DELETION REQUESTED</span>}
                        {tx.editedAt && <span style={{ marginLeft: "8px", color: "#6b7280", fontSize: "10px", fontStyle: "italic" }}>(Edited)</span>}
                      </span>
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
                    {isOwner && tx.status === "PENDING" && (
                      <>
                        <button 
                          className={styles.actionBtn} 
                          style={{ color: '#059669', background: '#d1fae5', marginRight: '4px' }} 
                          title="Approve"
                          onClick={() => handleApprove(tx.id)}
                          disabled={processingId === tx.id}
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          className={styles.actionBtn} 
                          style={{ color: '#dc2626', background: '#fee2e2', marginRight: '8px' }} 
                          title="Reject"
                          onClick={() => handleReject(tx.id)}
                          disabled={processingId === tx.id}
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {isOwner && tx.status === "PENDING_DELETION" && (
                      <>
                        <button 
                          className={styles.actionBtn} 
                          style={{ color: '#059669', background: '#d1fae5', marginRight: '4px' }} 
                          title="Approve Deletion"
                          onClick={() => handleApproveDel(tx.id)}
                          disabled={processingId === tx.id}
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          className={styles.actionBtn} 
                          style={{ color: '#dc2626', background: '#fee2e2', marginRight: '8px' }} 
                          title="Reject Deletion"
                          onClick={() => handleRejectDel(tx.id)}
                          disabled={processingId === tx.id}
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    <button className={styles.actionBtn} aria-label="Edit" onClick={() => handleEditClick(tx)} disabled={tx.status === "PENDING_DELETION"}>
                      <Edit2 size={16} />
                    </button>
                    <button className={styles.actionBtn} aria-label="Delete" onClick={() => handleDeleteClick(tx.id)} disabled={tx.status === "PENDING_DELETION"}>
                      <Trash2 size={16} />
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
        onClose={handleModalClose} 
        onAddTransaction={handleSaveTransaction}
        initialData={editingTransaction}
      />
    </>
  );
}
