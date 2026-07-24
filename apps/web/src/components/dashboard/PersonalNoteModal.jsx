"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, FileText, Type } from "lucide-react";
import { createPersonalNote } from "@/app/(dashboard)/dashboard/actions";
import { useRouter } from "next/navigation";
import { overlayVariants, modalVariants } from "@/lib/animations";
import styles from "./PersonalNoteModal.module.css";

export default function PersonalNoteModal({ isOpen, onClose }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const colors = [
    { bg: "bg-blue-50", dot: "bg-blue-500", name: "Blue" },
    { bg: "bg-rose-50", dot: "bg-rose-500", name: "Rose" },
    { bg: "bg-emerald-50", dot: "bg-emerald-500", name: "Emerald" },
    { bg: "bg-amber-50", dot: "bg-amber-500", name: "Amber" },
    { bg: "bg-purple-50", dot: "bg-purple-500", name: "Purple" }
  ];
  
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Please fill out both the title and note content.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await createPersonalNote({
        title: title.trim(),
        body: body.trim(),
        color: selectedColor.dot,
        bgColor: selectedColor.bg
      });

      if (res.success) {
        setTitle("");
        setBody("");
        setSelectedColor(colors[0]);
        onClose();
        router.refresh();
      } else {
        setError(res.error || "Failed to save note");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
            <h3 className={styles.title}>Add Personal Note</h3>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className={styles.content} style={{ flex: 1 }}>
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}
              
              {/* NOTE TITLE */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Note Title</label>
                <div className={styles.inputWrapper}>
                  <Type size={18} className={styles.inputIcon} />
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.input}
                    placeholder="e.g. Buy groceries"
                    maxLength={40}
                    autoFocus
                  />
                </div>
              </div>

              {/* DETAILS */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Details</label>
                <div className={styles.inputWrapper}>
                  <FileText size={18} className={`${styles.inputIcon} ${styles.inputIconTop}`} />
                  <textarea 
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Write your note here..."
                    maxLength={150}
                  />
                </div>
                <div style={{ textAlign: "right", marginTop: "4px", fontSize: "0.75rem", color: "rgba(26, 26, 26, 0.4)" }}>
                  {body.length} / 150
                </div>
              </div>

              {/* NOTE COLOR */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Note Color</label>
                <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
                  {colors.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-10 h-10 rounded-full ${c.bg} border-2 flex items-center justify-center transition-all duration-200 ${selectedColor.bg === c.bg ? "border-gray-800 scale-110" : "border-transparent hover:scale-110"}`}
                    >
                      <div className={`w-4 h-4 rounded-full ${c.dot}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <button 
                type="submit" 
                disabled={isLoading} 
                className={styles.submitBtn}
              >
                {isLoading ? (
                  <div className={styles.spinner} />
                ) : (
                  <span>Save Note</span>
                )}
              </button>
            </div>
          </form>
          
          <div className={styles.noteInfo}>
            <p className={styles.noteInfoText}>
              Notes automatically delete after 24 hours.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
