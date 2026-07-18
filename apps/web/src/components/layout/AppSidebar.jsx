"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowRightLeft,
  Package,
  Settings,
  ChevronLeft,
  PieChart,
  BookOpen
} from "lucide-react";
import styles from "./AppSidebar.module.css";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ledger", href: "/ledger", icon: BookOpen },
  { name: "Workers", href: "/workers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Inventory", href: "/inventory", icon: Package },
];

export default function AppSidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""}`}
    >
      <div className={styles.brand}>
        <span className={styles.brandText}>
          Hisab <span className={styles.brandHighlight}>Kitab</span>
        </span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <item.icon size={20} className={styles.navIcon} />
              <span className={styles.navText}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link
          href="/settings"
          className={`${styles.navItem} ${
            pathname.startsWith("/settings") ? styles.navItemActive : ""
          }`}
        >
          <Settings size={20} className={styles.navIcon} />
          <span className={styles.navText}>Settings</span>
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.collapseBtn}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={20} className={styles.collapseIcon} />
        </button>
      </div>
    </aside>
  );
}
