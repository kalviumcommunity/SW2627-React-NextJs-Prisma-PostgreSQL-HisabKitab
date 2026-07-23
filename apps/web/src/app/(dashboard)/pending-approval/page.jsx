"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, LogOut } from "lucide-react";

export default function PendingApprovalPage() {
  const { data: session } = useSession();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', maxWidth: '450px', width: '100%', textAlign: 'center' }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', marginBottom: '1.5rem' }}>
          <Clock size={32} />
        </div>
        
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>Waiting for Approval</h1>
        
        <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: 1.5 }}>
          Your request to join the shop <strong>{session?.user?.activeShopId}</strong> is currently pending. The shop owner has been notified and needs to approve your access.
        </p>

        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Please contact the owner directly if this is urgent. You can refresh this page once approved.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1e293b'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0f172a'}
          >
            Refresh Status
          </button>
          
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
