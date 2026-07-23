"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Settings } from "lucide-react";
import { approveWorker, rejectWorker, updateWorkerPermissions } from "@/actions/workers";
import styles from "./Staff.module.css";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function StaffView({ initialPending, initialStaff }) {
  const [pending, setPending] = useState(initialPending);
  const [staffList, setStaffList] = useState(initialStaff || []);
  const [loadingId, setLoadingId] = useState(null);

  const handleApprove = async (id) => {
    setLoadingId(id);
    const res = await approveWorker(id);
    if (res.success) {
      setPending(pending.filter(p => p.id !== id));
    } else {
      alert(res.error || "Failed to approve");
    }
    setLoadingId(null);
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    setLoadingId(id);
    const res = await rejectWorker(id);
    if (res.success) {
      setPending(pending.filter(p => p.id !== id));
    } else {
      alert(res.error || "Failed to reject");
    }
    setLoadingId(null);
  };

  const handleTogglePermission = async (memberId, permissionKey) => {
    const member = staffList.find(s => s.id === memberId);
    if (!member) return;
    
    const newPermissions = { ...member.permissions, [permissionKey]: !member.permissions[permissionKey] };
    
    // Optimistic UI update
    setStaffList(prev => prev.map(s => s.id === memberId ? { ...s, permissions: newPermissions } : s));

    const res = await updateWorkerPermissions(memberId, newPermissions);
    if (!res.success) {
      alert(res.error || "Failed to update permissions");
      // Revert on failure
      setStaffList(prev => prev.map(s => s.id === memberId ? { ...s, permissions: member.permissions } : s));
    }
  };

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div className={styles.header} variants={itemVariants}>
        <h2 className={styles.title}>Staff Approvals</h2>
        <p className={styles.subtitle}>Review and manage requests from workers to join your shop</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        {pending.length === 0 ? (
          <div className={styles.emptyState}>
            No pending join requests at the moment.
          </div>
        ) : (
          <AnimatePresence>
            {pending.map((p) => (
              <motion.div
                key={p.id}
                className={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.userDetails}>
                    <span className={styles.userName}>{p.name}</span>
                    <span className={styles.userEmail}>{p.email}</span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button 
                    className={styles.rejectBtn}
                    onClick={() => handleReject(p.id)}
                    disabled={loadingId === p.id}
                  >
                    <X size={16} />
                    Reject
                  </button>
                  <button 
                    className={styles.approveBtn}
                    onClick={() => handleApprove(p.id)}
                    disabled={loadingId === p.id}
                  >
                    <Check size={16} />
                    Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      <motion.div className={styles.header} variants={itemVariants} style={{ marginTop: '2rem' }}>
        <h2 className={styles.title}>Active Staff & Permissions</h2>
        <p className={styles.subtitle}>Configure which pages your staff members can access</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        {staffList.length === 0 ? (
          <div className={styles.emptyState}>
            No active staff members.
          </div>
        ) : (
          <div className={styles.staffGrid}>
            {staffList.map((s) => (
              <div key={s.id} className={styles.staffCard}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.userDetails}>
                    <span className={styles.userName}>{s.name}</span>
                    <span className={styles.userEmail}>{s.email}</span>
                  </div>
                </div>
                
                <div className={styles.permissionsList}>
                  <label className={styles.permissionToggle}>
                    <input type="checkbox" checked={s.permissions.canViewFinancials !== false} onChange={() => handleTogglePermission(s.id, 'canViewFinancials')} />
                    <span>View Financial Totals</span>
                  </label>
                  <label className={styles.permissionToggle}>
                    <input type="checkbox" checked={s.permissions.canAccessLedger !== false} onChange={() => handleTogglePermission(s.id, 'canAccessLedger')} />
                    <span>Access Ledger (Add Transactions)</span>
                  </label>
                  <label className={styles.permissionToggle}>
                    <input type="checkbox" checked={s.permissions.canAccessInventory !== false} onChange={() => handleTogglePermission(s.id, 'canAccessInventory')} />
                    <span>Access Inventory</span>
                  </label>
                  <label className={styles.permissionToggle}>
                    <input type="checkbox" checked={s.permissions.canAccessWorkers !== false} onChange={() => handleTogglePermission(s.id, 'canAccessWorkers')} />
                    <span>Access Workers (Offline)</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
