"use client";

import { useState } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import styles from "./Layout.module.css";

export default function DashboardLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <div
        className={`${styles.mainWrapper} ${
          isSidebarCollapsed ? styles.mainWrapperCollapsed : ""
        }`}
      >
        <AppHeader />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
