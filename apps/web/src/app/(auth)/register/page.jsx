"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Store, ArrowRight, ArrowLeft } from "lucide-react";
import styles from "./Register.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");

  const handleNext = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStep(2);
  };

  // Map raw API errors to user-friendly messages
  const sanitizeError = (rawError) => {
    const safeMessages = [
      "Name must be at least 2 characters",
      "Please enter a valid email address",
      "Password must be at least 6 characters",
      "Shop name must be at least 2 characters",
      "A user with this email already exists.",
    ];
    // Only show the error if it's a known safe validation message
    const isSafe = safeMessages.some((msg) => rawError?.toLowerCase().includes(msg.toLowerCase()));
    return isSafe ? rawError : "Registration failed. Please check your details and try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!shopName) {
      setError("Shop name is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, shopName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(sanitizeError(data.error));
        setLoading(false);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      {/* ═══════════════ LEFT: HERO ILLUSTRATION ═══════════════ */}
      <section className={styles.leftPanel}>
        <div className={styles.textureOverlay} />
        <div className={styles.ambientGlow} />

        <div className={styles.heroContent}>
          <div className={styles.heroImageContainer}>
            <Image
              src="/ledger-hero.png"
              alt="Vintage ledger notebook"
              fill
              className="object-cover"
              priority
            />
            <div className={styles.heroImageOverlay} />
          </div>

          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className={styles.heroTagline}>
              हर <span className={styles.heroTaglineHighlight1}>हिसाब</span>, हर{" "}
              <span className={styles.heroTaglineHighlight2}>किताब</span>
            </p>
            <p className={styles.heroSubtext}>Your digital khata, modernized</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ RIGHT: REGISTER FORM ═══════════════ */}
      <section className={styles.rightPanel}>
        <div className={styles.mobileHero}>
          <Image
            src="/ledger-hero.png"
            alt="Vintage ledger notebook"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className={styles.formContainer}>
          {/* Back to Home Link */}
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          {/* Branding */}
          <div className={styles.branding}>
            <Link href="/" className={styles.brandingTitle}>
              Hisab <span className={styles.brandingHighlight}>Kitab</span>
            </Link>
          </div>

          {/* Register card */}
          <div className={styles.registerCard}>
            <div className={styles.cardAccent} />
            <h2 className={styles.cardTitle}>Create Account & Shop</h2>
            <p className={styles.cardSubtitle}>Register and setup your first shop</p>

            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className={styles.errorBox}
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: "2rem" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                >
                  <div className={styles.errorText}>{error}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  onSubmit={handleNext}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className={styles.stepIndicator}>
                    <span className={styles.stepBadge}>Step 1</span>
                    <span className={styles.stepTitle}>Account Details</span>
                    <div className={styles.stepLine} />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label
                        htmlFor="name"
                        className={`${styles.label} ${focusedField === "name" ? styles.labelFocused : ""
                          }`}
                      >
                        Full Name
                      </label>
                      <div className={styles.inputWrapper}>
                        <User
                          size={20}
                          className={`${styles.inputIcon} ${focusedField === "name" ? styles.inputIconFocused : ""
                            }`}
                        />
                        <input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Rajesh Sharma"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label
                        htmlFor="email"
                        className={`${styles.label} ${focusedField === "email" ? styles.labelFocused : ""
                          }`}
                      >
                        Email
                      </label>
                      <div className={styles.inputWrapper}>
                        <Mail
                          size={20}
                          className={`${styles.inputIcon} ${focusedField === "email" ? styles.inputIconFocused : ""
                            }`}
                        />
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="rajesh@example.com"
                          className={styles.input}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label
                      htmlFor="password"
                      className={`${styles.label} ${focusedField === "password" ? styles.labelFocused : ""
                        }`}
                    >
                      Password
                    </label>
                    <div className={styles.inputWrapper}>
                      <Lock
                        size={20}
                        className={`${styles.inputIcon} ${focusedField === "password" ? styles.inputIconFocused : ""
                          }`}
                      />
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Minimum 6 characters"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    <span>Continue</span>
                    <ArrowRight size={18} />
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className={styles.stepIndicator}>
                    <span className={styles.stepBadge}>Step 2</span>
                    <span className={styles.stepTitle}>Shop Details</span>
                    <div className={styles.stepLine} />
                  </div>

                  <div className={styles.formGroup}>
                    <label
                      htmlFor="shopName"
                      className={`${styles.label} ${focusedField === "shopName" ? styles.labelFocused : ""
                        }`}
                    >
                      Shop / Business Name
                    </label>
                    <div className={styles.inputWrapper}>
                      <Store
                        size={20}
                        className={`${styles.inputIcon} ${focusedField === "shopName" ? styles.inputIconFocused : ""
                          }`}
                      />
                      <input
                        id="shopName"
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        onFocus={() => setFocusedField("shopName")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Sharma Kirana Store"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className={styles.submitBtn}
                      style={{ flex: "0 0 auto", width: "auto", backgroundColor: "transparent", color: "#1a1a1a", border: "1px solid rgba(26,26,26,0.2)", boxShadow: "none" }}
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <button type="submit" disabled={loading} className={styles.submitBtn} style={{ flex: 1 }}>
                      {loading ? (
                        <>
                          <div className={styles.spinner} />
                          <span>Setting up...</span>
                        </>
                      ) : (
                        <span>Register & Setup Shop</span>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className={styles.divider}>
              <p className={styles.footerText}>
                Already have an account?
                <Link href="/login" className={styles.footerLink}>
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
