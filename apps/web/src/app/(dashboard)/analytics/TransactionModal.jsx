import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, IndianRupee, FileText, Calendar } from "lucide-react";
import { overlayVariants, modalVariants } from "@/lib/animations";
import styles from "./TransactionModal.module.css";

export default function TransactionModal({ isOpen, onClose, onAddTransaction }) {
  const [type, setType] = useState("YOU_GAVE");
  const [contactName, setContactName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !amount) return;

    setLoading(true);
    // If the selected date is today, use current time so it sorts properly.
    let finalDate = new Date();
    if (date !== finalDate.toISOString().slice(0, 10)) {
      finalDate = new Date(date);
    }

    const newTransaction = {
      partyName: contactName,
      date: finalDate.toISOString(),
      type,
      amount: parseFloat(amount),
      note
    };
    
    await onAddTransaction(newTransaction);
    
    setLoading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setType("YOU_GAVE");
    setContactName("");
    setAmount("");
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  if (!isOpen) return null;

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
          className={styles.modalContainer}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className={styles.header}>
            <h3 className={styles.title}>New Transaction</h3>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className={styles.content} style={{ flex: 1 }}>
              {/* SEGMENTED CONTROL */}
              <div className={styles.typeSelector}>
                <div 
                  className={styles.activeBackground}
                  style={{ transform: type === "YOU_GAVE" ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
                <button
                  type="button"
                  className={`${styles.typeBtn} ${type === "YOU_GAVE" ? styles.typeBtnActiveGave : ""}`}
                  onClick={() => setType("YOU_GAVE")}
                >
                  You Gave
                </button>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${type === "YOU_GOT" ? styles.typeBtnActiveGot : ""}`}
                  onClick={() => setType("YOU_GOT")}
                >
                  You Got
                </button>
              </div>

              {/* CONTACT NAME */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Name</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    required
                    placeholder="Enter name or business"
                    className={styles.input}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
              </div>

              {/* AMOUNT */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Amount</label>
                <div className={styles.inputWrapper}>
                  <IndianRupee size={22} className={styles.inputIcon} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className={`${styles.input} ${styles.amountInput}`}
                    style={{ color: type === "YOU_GAVE" ? "#dc2626" : "#059669" }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* DATE */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Date</label>
                <div className={styles.inputWrapper}>
                  <Calendar size={18} className={styles.inputIcon} />
                  <input
                    type="date"
                    required
                    className={styles.input}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* NOTE */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Note (Optional)</label>
                <div className={styles.inputWrapper}>
                  <FileText size={18} className={`${styles.inputIcon} ${styles.inputIconTop}`} />
                  <textarea
                    placeholder="What is this for?"
                    className={`${styles.input} ${styles.textarea}`}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <button 
                type="submit" 
                disabled={loading} 
                className={`${styles.submitBtn} ${type === "YOU_GAVE" ? styles.submitBtnGave : styles.submitBtnGot}`}
              >
                {loading ? (
                  <div className={styles.spinner} />
                ) : (
                  <span>Save Transaction</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
