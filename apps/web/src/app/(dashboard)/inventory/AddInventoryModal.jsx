import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Tag, Hash, Box, IndianRupee } from "lucide-react";
import { overlayVariants, modalVariants } from "@/lib/animations";
import styles from "./AddInventoryModal.module.css";

export default function AddInventoryModal({ isOpen, onClose, onAddProduct }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("bags");
  const [currentStock, setCurrentStock] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !currentStock || !purchasePrice || !sellingPrice) return;

    setLoading(true);

    const stockNum = parseInt(currentStock) || 0;
    
    // Create product payload matching what the server action expects
    const newProduct = {
      name: name.trim(),
      category,
      sku: sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      currentStock: stockNum,
      unit,
      purchasePrice: parseFloat(purchasePrice).toFixed(2),
      sellingPrice: parseFloat(sellingPrice).toFixed(2),
    };

    await onAddProduct(newProduct);
    
    setLoading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setCategory("Groceries");
    setSku("");
    setUnit("bags");
    setCurrentStock("");
    setPurchasePrice("");
    setSellingPrice("");
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
            <h3 className={styles.title}>Add New Product</h3>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.content}>
              
              {/* NAME */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Product Name *</label>
                <div className={styles.inputWrapper}>
                  <Package size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter product name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* CATEGORY & SKU (Two column) */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <div className={styles.selectWrapper}>
                    <Tag size={18} className={styles.inputIcon} />
                    <select
                      className={styles.select}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Groceries">Groceries</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Household">Household</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>SKU / Barcode</label>
                  <div className={styles.inputWrapper}>
                    <Hash size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Optional"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* STOCK & UNIT (Two column) */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Current Stock *</label>
                  <div className={styles.inputWrapper}>
                    <Box size={18} className={styles.inputIcon} />
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="0"
                      value={currentStock}
                      onChange={(e) => setCurrentStock(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Unit</label>
                  <div className={styles.selectWrapper}>
                    <Box size={18} className={styles.inputIcon} />
                    <select
                      className={styles.select}
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      <option value="bags">bags</option>
                      <option value="packets">packets</option>
                      <option value="packs">packs</option>
                      <option value="kg">kg</option>
                      <option value="liters">liters</option>
                      <option value="pieces">pieces</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PRICING (Two column) */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Purchase Price *</label>
                  <div className={styles.inputWrapper}>
                    <IndianRupee size={18} className={styles.inputIcon} />
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="0.00"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Selling Price *</label>
                  <div className={styles.inputWrapper}>
                    <IndianRupee size={18} className={styles.inputIcon} />
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="0.00"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className={styles.footer}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!name || !currentStock || !purchasePrice || !sellingPrice || loading}
              >
                {loading ? <div className={styles.spinner} /> : "Save Product"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
