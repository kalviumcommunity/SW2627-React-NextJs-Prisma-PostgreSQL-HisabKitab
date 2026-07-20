import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, IndianRupee } from "lucide-react";
import styles from "./AddPartyModal.module.css";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

export default function AddPartyModal({ isOpen, onClose, onAddParty }) {
  const [balanceType, setBalanceType] = useState("COLLECT"); // "COLLECT" or "GIVE"
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactName) return;

    setLoading(true);
    // Mock network delay
    setTimeout(() => {
      const parsedAmount = parseFloat(amount) || 0;
      const netBalance = balanceType === "COLLECT" ? parsedAmount : -parsedAmount;

      const newParty = {
        id: `p${Date.now()}`,
        contactName,
        contactPhone: contactPhone || "No phone",
        netBalance,
      };
      
      onAddParty(newParty);
      setLoading(false);
      resetForm();
      onClose();
    }, 800);
  };

  const resetForm = () => {
    setBalanceType("COLLECT");
    setContactName("");
    setContactPhone("");
    setAmount("");
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
            <h3 className={styles.title}>Add New Party</h3>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.content}>
              
              {/* PARTY DETAILS */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Party Name *</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter party or business name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <div className={styles.inputWrapper}>
                  <Phone size={18} className={styles.inputIcon} />
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="Enter phone number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* SEGMENTED CONTROL FOR BALANCE TYPE */}
              <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                <label className={styles.label}>Opening Balance Type</label>
                <div className={styles.typeSelector}>
                  <motion.div 
                    className={styles.activeBackground}
                    initial={false}
                    animate={{
                      x: balanceType === "COLLECT" ? "0%" : "100%",
                      width: "50%"
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${balanceType === "COLLECT" ? styles.typeBtnActiveGot : ""}`}
                    onClick={() => setBalanceType("COLLECT")}
                  >
                    They Owe You (Collect)
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${balanceType === "GIVE" ? styles.typeBtnActiveGave : ""}`}
                    onClick={() => setBalanceType("GIVE")}
                  >
                    You Owe Them (Give)
                  </button>
                </div>
              </div>

              {/* OPENING BALANCE AMOUNT */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Opening Balance Amount</label>
                <div className={styles.inputWrapper}>
                  <IndianRupee size={22} className={styles.inputIcon} />
                  <input
                    type="number"
                    className={`${styles.input} ${styles.amountInput}`}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className={styles.footer}>
              <button 
                type="submit" 
                className={`${styles.submitBtn} ${styles.submitBtnPrimary}`}
                disabled={!contactName || loading}
              >
                {loading ? <div className={styles.spinner} /> : "Save Party"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
