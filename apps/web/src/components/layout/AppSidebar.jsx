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
import { useSession } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ledger", href: "/ledger", icon: BookOpen },
  { name: "Workers", href: "/workers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Inventory", href: "/inventory", icon: Package },
];

export default function AppSidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const permissions = session?.user?.shopPermissions || {};
  const isOwner = session?.user?.shopRole === "OWNER";

  const visibleNavItems = navItems.filter((item) => {
    if (isOwner) return true;
    
    // STAFF access logic based on permissions
    switch (item.name) {
      case "Ledger":
        return permissions.canAccessLedger !== false;
      case "Workers":
        return permissions.canAccessWorkers !== false;
      case "Inventory":
        return permissions.canAccessInventory !== false;
      case "Analytics":
      case "Dashboard":
        return permissions.canViewFinancials !== false;
      default:
        return true;
    }
  });

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
        {visibleNavItems.map((item) => {
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

        {isOwner && (
          <Link
            href="/settings/staff"
            className={`${styles.navItem} ${
              pathname.startsWith("/settings/staff") ? styles.navItemActive : ""
            }`}
          >
            <Users size={20} className={styles.navIcon} />
            <span className={styles.navText}>Staff Approvals</span>
          </Link>
        )}
      </nav>

      <div className={styles.footer}>
        {isOwner && (
          <Link
            href="/settings"
            className={`${styles.navItem} ${
              pathname.startsWith("/settings") ? styles.navItemActive : ""
            }`}
          >
            <Settings size={20} className={styles.navIcon} />
            <span className={styles.navText}>Settings</span>
          </Link>
        )}
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
