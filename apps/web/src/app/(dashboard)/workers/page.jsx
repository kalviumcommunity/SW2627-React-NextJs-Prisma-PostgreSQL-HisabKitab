"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { UserPlus, MoreVertical, Briefcase, Calendar, CheckCircle2, Wallet, Clock } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";
import styles from "./Workers.module.css";

// Mock Data
const mockWorkers = [
  {
    id: "w1",
    name: "Ramesh Kumar",
    designation: "Delivery Executive",
    payType: "Monthly",
    salary: "15,000",
    joiningDate: "12 May, 2023",
    status: "Active",
    color: "#10B981", // Emerald
  },
  {
    id: "w2",
    name: "Suresh Singh",
    designation: "Store Manager",
    payType: "Monthly",
    salary: "25,000",
    joiningDate: "01 Jan, 2022",
    status: "Active",
    color: "#3B82F6", // Blue
  },
  {
    id: "w3",
    name: "Amit Patel",
    designation: "Helper",
    payType: "Daily Wage",
    salary: "500/day",
    joiningDate: "15 Aug, 2023",
    status: "Active",
    color: "#F59E0B", // Amber
  },
  {
    id: "w4",
    name: "Vikram Sharma",
    designation: "Accountant",
    payType: "Monthly",
    salary: "30,000",
    joiningDate: "10 Oct, 2021",
    status: "Inactive",
    color: "#EF4444", // Red
  },
];

export default function WorkersPage() {
  const { status } = useSession();

  if (status === "loading") {
    // Relying on the global loader for now, but returning a blank skeleton avoids flashes
    return <div style={{ minHeight: "100vh", backgroundColor: "#f9f6ee" }} />;
  }

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="show"
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
        >
          <UserPlus size={18} />
          <span>Add Worker</span>
        </motion.button>
      </motion.div>

      <motion.section className={styles.grid} variants={containerVariants}>
        {mockWorkers.map((worker) => {
          // Compute initials
          const initials = worker.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);

          return (
            <motion.div
              key={worker.id}
              className={styles.card}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className={styles.cardAccent} style={{ backgroundColor: worker.color }} />
              
              <div className={styles.cardHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{initials}</div>
                  <div className={styles.nameGroup}>
                    <span className={styles.workerName}>{worker.name}</span>
                    <span className={styles.workerRole}>
                      <Briefcase size={14} />
                      {worker.designation}
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
                    {worker.payType === "Monthly" ? <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> : <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/>}
                    {worker.payType}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Salary / Rate</span>
                  <span className={styles.detailValue}>₹{worker.salary}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Joining Date</span>
                  <span className={styles.detailValue}>{worker.joiningDate}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span
                    className={`${styles.badge} ${
                      worker.status === "Active" ? styles.badgeActive : styles.badgeInactive
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    {worker.status}
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
  );
}
