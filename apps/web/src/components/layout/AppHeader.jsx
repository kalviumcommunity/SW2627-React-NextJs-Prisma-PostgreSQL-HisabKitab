"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import styles from "./AppHeader.module.css";

export default function AppHeader() {
  const { data: session } = useSession();
  const shopName = session?.user?.name ? `${session.user.name}'s Khata` : "Your Khata";

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>Dashboard</h1>
        <span className={styles.shopBadge}>{shopName}</span>
      </div>

      <div className={styles.right}>
        <div className={styles.profileSection}>
          <span className={styles.greeting}>
            Welcome,{" "}
            <strong className={styles.userName}>
              {session?.user?.name || session?.user?.email || "User"}
            </strong>
          </span>
          <Link href="/profile" className={styles.avatarLink} title="View Profile">
            <div className={styles.avatar}>
              {getInitials(session?.user?.name || session?.user?.email)}
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={styles.logoutBtn}
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
