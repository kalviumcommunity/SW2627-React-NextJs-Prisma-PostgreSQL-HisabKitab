"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, ShieldCheck, LockKeyhole, EyeOff } from "lucide-react";
import styles from "./Login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res?.error) {
        setError(res.error || "Invalid email or password.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
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

      {/* ═══════════════ RIGHT: LOGIN FORM ═══════════════ */}
      <section className={styles.rightPanel}>
        {/* Mobile Hero (only visible on small screens) */}
        <div className={styles.mobileHero}>
          <Image
            src="/ledger-hero.png"
            alt="Vintage ledger notebook"
            fill
            className="object-cover"
            priority
          />
        </div>

        <motion.div
          className={styles.formContainer}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Branding */}
          <div className={styles.branding}>
            <Link href="/" className={styles.brandingTitle}>
              Hisab <span className={styles.brandingHighlight}>Kitab</span>
            </Link>
          </div>

          {/* Login card */}
          <div className={styles.loginCard}>
            <div className={styles.cardAccent} />
            <h2 className={styles.cardTitle}>Welcome Back</h2>
            <p className={styles.cardSubtitle}>Access your secure digital ledger</p>

            {/* Error display */}
            {error && (
              <motion.div
                className={styles.errorBox}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={styles.errorText}>{error}</div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label
                  htmlFor="email"
                  className={`${styles.label} ${
                    focusedField === "email" ? styles.labelFocused : ""
                  }`}
                >
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail
                    size={20}
                    className={`${styles.inputIcon} ${
                      focusedField === "email" ? styles.inputIconFocused : ""
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
                    placeholder="you@example.com"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label
                  htmlFor="password"
                  className={`${styles.label} ${
                    focusedField === "password" ? styles.labelFocused : ""
                  }`}
                >
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <Lock
                    size={20}
                    className={`${styles.inputIcon} ${
                      focusedField === "password" ? styles.inputIconFocused : ""
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
                    placeholder="••••••••"
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? (
                  <>
                    <div className={styles.spinner} />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={styles.divider}>
              <p className={styles.footerText}>
                New to Hisab Kitab?
                <Link href="/register" className={styles.footerLink}>
                  Create a free account
                </Link>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className={styles.trustBadges}>
            <div className={styles.badge}>
              <ShieldCheck size={16} />
              <span>Encrypted</span>
            </div>
            <div className={styles.badgeSeparator} />
            <div className={styles.badge}>
              <LockKeyhole size={16} />
              <span>Secure</span>
            </div>
            <div className={styles.badgeSeparator} />
            <div className={styles.badge}>
              <EyeOff size={16} />
              <span>Private</span>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
