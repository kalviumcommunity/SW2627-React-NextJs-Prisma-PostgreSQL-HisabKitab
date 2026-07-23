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

  const [role, setRole] = useState("OWNER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopId, setShopId] = useState("");

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
      "Shop ID not found",
      "A user with this email already exists.",
      "This email is already registered as an Owner.",
      "This email is already registered as a Worker.",
    ];
    // Only show the error if it's a known safe validation message
    const isSafe = safeMessages.some((msg) => rawError?.toLowerCase().includes(msg.toLowerCase()));
    return isSafe ? rawError : "Registration failed. Please check your details and try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (role === 'OWNER' && !shopName) {
      setError("Shop name is required.");
      return;
    }
    if (role === 'WORKER' && !shopId) {
      setError("Shop ID is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = { name, email, password, role };
      if (role === 'OWNER') payload.shopName = shopName;
      if (role === 'WORKER') payload.shopId = shopId;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
                  {/* Role Toggle */}
                  <div className={styles.roleToggleContainer} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button
                      type="button"
                      className={`${styles.roleBtn} ${role === 'OWNER' ? styles.roleBtnActive : ''}`}
                      onClick={() => setRole('OWNER')}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: role === 'OWNER' ? '#f1f5f9' : 'transparent', fontWeight: role === 'OWNER' ? 600 : 400, cursor: 'pointer' }}
                    >
                      Owner
                    </button>
                    <button
                      type="button"
                      className={`${styles.roleBtn} ${role === 'WORKER' ? styles.roleBtnActive : ''}`}
                      onClick={() => setRole('WORKER')}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: role === 'WORKER' ? '#f1f5f9' : 'transparent', fontWeight: role === 'WORKER' ? 600 : 400, cursor: 'pointer' }}
                    >
                      Worker
                    </button>
                  </div>

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
                    {role === 'OWNER' ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <label
                          htmlFor="shopId"
                          className={`${styles.label} ${focusedField === "shopId" ? styles.labelFocused : ""
                            }`}
                        >
                          Shop ID to Join
                        </label>
                        <div className={styles.inputWrapper}>
                          <Store
                            size={20}
                            className={`${styles.inputIcon} ${focusedField === "shopId" ? styles.inputIconFocused : ""
                              }`}
                          />
                          <input
                            id="shopId"
                            type="text"
                            required
                            value={shopId}
                            onChange={(e) => setShopId(e.target.value)}
                            onFocus={() => setFocusedField("shopId")}
                            onBlur={() => setFocusedField(null)}
                            placeholder="e.g. cm0abc123..."
                            className={styles.input}
                          />
                        </div>
                      </>
                    )}
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
