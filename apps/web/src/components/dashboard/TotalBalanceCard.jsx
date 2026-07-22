import { Wallet, ChevronDown, ArrowUpRight, Plus } from "lucide-react";
import { formatINR } from "@/lib/formatters";
import styles from "./TotalBalanceCard.module.css";

export default function TotalBalanceCard({ balance = 0 }) {
  const formattedBalance = formatINR(balance);
  
  // Dynamically scale font size based on amount length
  const amountLength = formattedBalance.length;
  let dynamicFontSize = '3rem'; // Default 48px
  if (amountLength > 15) dynamicFontSize = '1.75rem';
  else if (amountLength > 12) dynamicFontSize = '2.25rem';
  else if (amountLength > 9) dynamicFontSize = '2.5rem';

  return (
    <div className={`${styles.premiumCard} ${styles.totalBalanceCard}`}>
      
      {/* Background soft glow decoration */}
      <div className={styles.glowBackground}></div>

      <div className={styles.contentWrapper}>
        
        {/* Top Header Badge */}
        <div className={styles.headerContainer}>
          <div className={styles.badge}>
            <div className={styles.iconCircle}>
              <Wallet size={12} className="text-blue-600" />
            </div>
            <span className={styles.badgeText}>Total Balance</span>
          </div>

          <div className={styles.currencySelector}>
            <span className={styles.flagIcon}>₹</span>
            INR
            <ChevronDown size={14} className="text-gray-400 ml-1" />
          </div>
        </div>

        {/* Amount Section */}
        <div className={styles.amountSection}>
          <h2 className={styles.amountTitle} style={{ fontSize: dynamicFontSize }}>
            {formattedBalance}
          </h2>
          <div className={styles.trendContainer}>
            <span className={styles.trendBadge}>+15.2%</span>
            <span className={styles.trendLabel}>vs Last Month</span>
          </div>
        </div>

      </div>

      <div className={styles.flexSpacer}></div>

      {/* Bottom Section */}
      <div className={styles.contentWrapper}>
        
        {/* Decorative divider */}
        <div className={styles.divider}></div>

        <div className={styles.actionRow}>
          <div className={styles.actionGroup}>
            <button className={`${styles.actionButton} ${styles.actionButtonBlue}`}>
              <ArrowUpRight size={22} />
            </button>
            <div>
              <h3 className={styles.actionTitle}>Transfer</h3>
              <p className={styles.actionSubtitle}>To external accounts</p>
            </div>
          </div>

          <div className={`${styles.actionGroup} ${styles.actionGroupRight}`}>
            <div>
              <h3 className={styles.actionTitle}>Request</h3>
              <p className={styles.actionSubtitle}>From contacts</p>
            </div>
            <button className={`${styles.actionButton} ${styles.actionButtonGreen}`}>
              <ChevronDown size={22} />
            </button>
          </div>
        </div>

        {/* Quick Send Avatars */}
        <div className={styles.quickSendBar}>
          <div className={styles.avatarStack}>
            <div className={styles.avatarImage}>
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="User 1" />
            </div>
            <div className={styles.avatarImage}>
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User 2" />
            </div>
            <div className={styles.avatarImage}>
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" alt="User 3" />
            </div>
            <div className={styles.avatarCount}>
              +3
            </div>
          </div>
          
          <button className={styles.quickSendButton}>
            <Plus size={18} />
            Quick Send
          </button>
        </div>
      </div>
    </div>
  );
}
