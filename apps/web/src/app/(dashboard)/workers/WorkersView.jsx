"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, MoreVertical, Briefcase, Calendar, CheckCircle2, Wallet, Clock } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";
import styles from "./Workers.module.css";
import AddWorkerModal from "./AddWorkerModal";
import { createWorker } from "@/actions/workers";

const colors = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];

export default function WorkersView({ initialWorkers }) {
  const [workers, setWorkers] = useState(initialWorkers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddWorker = async (newWorker) => {
    // Optimistic Update
    const optimisticWorker = { ...newWorker, id: `temp-${Date.now()}` };
    setWorkers([optimisticWorker, ...workers]);
    
    // Server Action
    const result = await createWorker(newWorker);
    if (!result.success) {
      setWorkers(workers); // Revert on failure
      console.error(result.error);
    }
  };

  return (
    <>
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ 
          filter: isAddModalOpen ? "blur(8px)" : "none", 
          transition: "filter 0.3s ease",
          pointerEvents: isAddModalOpen ? "none" : "auto"
        }}
      >
        <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Workers</h2>
          <p className={styles.subtitle}>Manage your shop staff, attendance, and salaries</p>
        </div>
        <motion.button
          className={styles.primaryBtn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>Add Worker</span>
        </motion.button>
      </motion.div>

      <motion.section className={styles.grid} variants={containerVariants}>
        {workers.map((worker) => {
          // Compute initials
          const initials = worker.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);

          const color = colors[worker.name.length % colors.length];

          // Format Salary String based on PayType
          let salaryDisplay = "0";
          if (worker.payType === "MONTHLY" || worker.payType === "Monthly") {
            salaryDisplay = worker.monthlySalary ? worker.monthlySalary : "0";
          } else {
            salaryDisplay = worker.dailyWageRate ? `${worker.dailyWageRate}/day` : "0/day";
          }

          // Format Joining Date
          const joinedStr = new Date(worker.joiningDate).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
          });

          return (
            <motion.div
              key={worker.id}
              className={styles.card}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className={styles.cardAccent} style={{ backgroundColor: color }} />
              
              <div className={styles.cardHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar} style={{ color: color, backgroundColor: `${color}1A` }}>{initials}</div>
                  <div className={styles.nameGroup}>
                    <span className={styles.workerName}>{worker.name}</span>
                    <span className={styles.workerRole}>
                      <Briefcase size={14} />
                      {worker.designation || "Worker"}
                    </span>
                  </div>
                </div>
                <button className={styles.moreBtn} aria-label="More options">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Pay Type</span>
                  <span className={styles.detailValue}>
                    {worker.payType.includes("Month") ? <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> : <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/>}
                    {worker.payType.includes("Month") ? "Monthly" : "Daily Wage"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Salary / Rate</span>
                  <span className={styles.detailValue}>₹{salaryDisplay}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Joining Date</span>
                  <span className={styles.detailValue}>{joinedStr}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span
                    className={`${styles.badge} ${
                      worker.active ? styles.badgeActive : styles.badgeInactive
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    {worker.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button className={styles.actionBtn}>
                  <Calendar size={16} />
                  Attendance
                </button>
                <button className={styles.actionBtn}>
                  <Wallet size={16} />
                  Pay Salary
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.section>

      </motion.div>

      <AddWorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWorker={handleAddWorker}
      />
    </>
  );
}
