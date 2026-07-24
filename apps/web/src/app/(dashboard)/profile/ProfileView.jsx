"use client";

import React, { useState } from "react";
import { Copy, Check, Save, User, Store, Mail, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { updateProfile } from "@/actions/profile";
import styles from "./Profile.module.css";

export default function ProfileView({ user, shop, stats }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    shopName: shop.name || "",
  });

  const handleCopyShopId = () => {
    navigator.clipboard.writeText(shop.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsLoading(true);
    const res = await updateProfile({
      name: formData.name,
      shopName: formData.shopName,
    });
    
    if (res.success) {
      setIsEditing(false);
    } else {
      alert("Failed to update profile: " + res.error);
    }
    setIsLoading(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.headerCard}
      >
        <div className={styles.headerBg}></div>
        <div className={styles.headerContent}>
          <div className={styles.avatarLarge}>
            {getInitials(user.name || user.email)}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.userName}>{user.name || "User"}</h1>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
          <button 
            className={styles.editBtn} 
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : isEditing ? <><Save size={16} /> Save Changes</> : "Edit Profile"}
          </button>
        </div>
      </motion.div>

      <div className={styles.grid}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <Store size={20} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Shop Details</h2>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Shop Name</label>
            <input 
              type="text" 
              className={styles.input} 
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Shop ID <span className={styles.labelNote}>(For Workers to Join)</span></label>
            <div className={styles.copyContainer}>
              <code className={styles.shopIdCode}>{shop.id}</code>
              <button onClick={handleCopyShopId} className={styles.copyBtn}>
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <User size={20} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Personal Details</h2>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <input 
              type="text" 
              className={styles.input} 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input 
                type="email" 
                className={`${styles.input} ${styles.inputWithIcon} ${styles.inputDisabled}`} 
                value={user.email}
                disabled
                readOnly
              />
            </div>
            <p className={styles.helpText}>Email cannot be changed.</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${styles.card} ${styles.fullWidth}`}
        >
          <div className={styles.cardHeader}>
            <Activity size={20} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Monthly Overview</h2>
          </div>
          
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <p className={styles.statLabel}>Transactions</p>
              <p className={styles.statValue}>{stats.transactionsThisMonth}</p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statLabel}>Active Workers</p>
              <p className={styles.statValue}>{stats.activeWorkers}</p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statLabel}>Earnings</p>
              <p className={`${styles.statValue} ${styles.positive}`}>
                ₹{stats.totalEarnedThisMonth.toLocaleString("en-IN")}
              </p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statLabel}>Losses</p>
              <p className={`${styles.statValue} ${styles.negative}`}>
                ₹{stats.totalLossThisMonth.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
