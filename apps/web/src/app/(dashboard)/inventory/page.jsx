"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plus, MoreVertical, Package, AlertTriangle, TrendingUp, RefreshCcw } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";
import styles from "./Inventory.module.css";

// Mock Data
const mockInventory = [
  {
    id: "p1",
    name: "Aashirvaad Atta 5kg",
    category: "Groceries",
    sku: "AAS-ATT-5KG",
    currentStock: 45,
    unit: "bags",
    purchasePrice: "185.00",
    sellingPrice: "210.00",
    status: "Healthy", // Healthy, Low, Out
  },
  {
    id: "p2",
    name: "Tata Salt 1kg",
    category: "Groceries",
    sku: "TAT-SLT-1KG",
    currentStock: 12,
    unit: "packets",
    purchasePrice: "20.00",
    sellingPrice: "25.00",
    status: "Low", 
  },
  {
    id: "p3",
    name: "Amul Butter 500g",
    category: "Dairy",
    sku: "AMU-BTR-500",
    currentStock: 0,
    unit: "packs",
    purchasePrice: "245.00",
    sellingPrice: "265.00",
    status: "Out", 
  },
  {
    id: "p4",
    name: "Maggi Noodles 140g",
    category: "Snacks",
    sku: "MAG-NDL-140",
    currentStock: 120,
    unit: "packs",
    purchasePrice: "22.00",
    sellingPrice: "25.00",
    status: "Healthy", 
  },
  {
    id: "p5",
    name: "Surf Excel 1kg",
    category: "Household",
    sku: "SRF-EXC-1KG",
    currentStock: 8,
    unit: "bags",
    purchasePrice: "110.00",
    sellingPrice: "125.00",
    status: "Low", 
  },
];

export default function InventoryPage() {
  const { status } = useSession();

  if (status === "loading") {
    return <div style={{ minHeight: "100vh", backgroundColor: "#f9f6ee" }} />;
  }

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* HEADER */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Inventory</h2>
          <p className={styles.subtitle}>Track products, stock levels, and pricing</p>
        </div>
        <motion.button
          className={styles.primaryBtn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          <span>Add Product</span>
        </motion.button>
      </motion.div>

      {/* PRODUCT GRID */}
      <motion.section className={styles.grid} variants={containerVariants}>
        {mockInventory.map((product) => {
          
          let statusColor = "#10B981"; // Healthy (Emerald)
          let StatusIcon = Package;
          let accentColor = "#10B981";

          if (product.status === "Low") {
            statusColor = "#F59E0B"; // Low (Amber)
            StatusIcon = TrendingUp;
            accentColor = "#F59E0B";
          } else if (product.status === "Out") {
            statusColor = "#EF4444"; // Out (Red)
            StatusIcon = AlertTriangle;
            accentColor = "#EF4444";
          }

          return (
            <motion.div
              key={product.id}
              className={styles.card}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className={styles.cardAccent} style={{ backgroundColor: accentColor }} />
              
              <div className={styles.cardHeader}>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.productMeta}>
                    <span className={styles.metaBadge}>{product.sku}</span>
                    <span>•</span>
                    <span>{product.category}</span>
                  </div>
                </div>
                <button className={styles.moreBtn} aria-label="More options">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className={styles.cardBody}>
                {/* Stock Indicator */}
                <div className={styles.stockContainer}>
                  <div className={styles.stockIcon} style={{ backgroundColor: `${statusColor}1A`, color: statusColor }}>
                    <StatusIcon size={20} />
                  </div>
                  <div className={styles.stockDetails}>
                    <span className={styles.stockLabel}>Current Stock</span>
                    <span className={styles.stockValue} style={{ color: statusColor }}>
                      {product.currentStock} {product.unit}
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className={styles.pricingGrid}>
                  <div className={styles.priceGroup}>
                    <span className={styles.priceLabel}>Selling Price</span>
                    <span className={styles.priceValue}>₹{product.sellingPrice}</span>
                  </div>
                  <div className={styles.priceGroup}>
                    <span className={styles.priceLabel}>Purchase Price</span>
                    <span className={styles.priceValue}>₹{product.purchasePrice}</span>
                  </div>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button className={styles.actionBtn}>
                  <RefreshCcw size={16} />
                  Update Stock
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.section>
    </motion.div>
  );
}
