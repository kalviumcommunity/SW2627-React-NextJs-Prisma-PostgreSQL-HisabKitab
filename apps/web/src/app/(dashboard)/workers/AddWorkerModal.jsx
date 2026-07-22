import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Briefcase, IndianRupee, Calendar } from "lucide-react";
import { overlayVariants, modalVariants } from "@/lib/animations";
import styles from "./AddWorkerModal.module.css";

export default function AddWorkerModal({ isOpen, onClose, onAddWorker }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [payType, setPayType] = useState("Monthly");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !salary) return;

    setLoading(true);

    const newWorker = {
      name: name.trim(),
      designation: designation.trim(),
      payType: payType === "Monthly" ? "MONTHLY" : "DAILY_WAGE",
      monthlySalary: payType === "Monthly" ? parseFloat(salary) : null,
      dailyWageRate: payType === "Daily Wage" ? parseFloat(salary) : null,
      joiningDate: new Date(joiningDate).toISOString(),
    };

    await onAddWorker(newWorker);

    setLoading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setDesignation("");
    setPayType("Monthly");
    setSalary("");
    setJoiningDate(new Date().toISOString().slice(0, 10));
    setIsActive(true);
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
            <h3 className={styles.title}>Add New Worker</h3>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className={styles.content} style={{ flex: 1 }}>

              {/* WORKER NAME */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Worker Name *</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter worker's full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <div className={styles.inputWrapper}>
                  <Phone size={18} className={styles.inputIcon} />
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* DESIGNATION */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Designation</label>
                <div className={styles.selectWrapper}>
                  <Briefcase size={18} className={styles.inputIcon} />
                  <select
                    className={styles.select}
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  >
                    <option value="">Select Designation</option>
                    <option value="Store Manager">Store Manager</option>
                    <option value="Delivery Executive">Delivery Executive</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Helper">Helper</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Sales Staff">Sales Staff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* PAY TYPE — SEGMENTED CONTROL */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Pay Type</label>
                <div className={styles.typeSelector}>
                  <div
                    className={styles.activeBackground}
                    style={{
                      transform: payType === "Monthly" ? "translateX(0)" : "translateX(100%)",
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${payType === "Monthly" ? styles.typeBtnActiveMonthly : ""}`}
                    onClick={() => setPayType("Monthly")}
                  >
                    Monthly Salary
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${payType === "Daily Wage" ? styles.typeBtnActiveDaily : ""}`}
                    onClick={() => setPayType("Daily Wage")}
                  >
                    Daily Wage
                  </button>
                </div>
              </div>

              {/* SALARY + JOINING DATE — TWO COLUMN */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {payType === "Monthly" ? "Monthly Salary *" : "Daily Rate *"}
                  </label>
                  <div className={styles.inputWrapper}>
                    <IndianRupee size={22} className={styles.inputIcon} />
                    <input
                      type="number"
                      className={`${styles.input} ${styles.amountInput}`}
                      placeholder="0"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Joining Date</label>
                  <div className={styles.inputWrapper}>
                    <Calendar size={18} className={styles.inputIcon} />
                    <input
                      type="date"
                      className={styles.input}
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* STATUS TOGGLE */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <div className={styles.statusToggle}>
                  <button
                    type="button"
                    className={`${styles.toggle} ${isActive ? styles.toggleActive : ""}`}
                    onClick={() => setIsActive(!isActive)}
                    aria-label="Toggle active status"
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                  <span className={styles.statusText}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <span className={styles.statusHint}>
                    {isActive ? "Currently working" : "Not working"}
                  </span>
                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className={styles.footer}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!name || !salary || loading}
              >
                {loading ? <div className={styles.spinner} /> : "Save Worker"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
