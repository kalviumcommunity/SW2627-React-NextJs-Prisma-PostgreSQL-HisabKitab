import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./TopSpending.module.css";
import { formatINR } from "@/lib/formatters";

export default function TopSpending({ topCreditors = [], hideFinancials }) {
  return (
    <div className={`${styles.card} group`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-gray-900">Top Creditors</h3>
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 active:scale-95 group-hover:shadow-sm">
          <ArrowUpRight size={18} className="text-gray-600" />
        </button>
      </div>

      <div 
        className="flex flex-col gap-6 max-h-[120px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {topCreditors.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No creditors found.</p>
        ) : (
          topCreditors.map((contact, idx) => (
            <div 
              key={contact.id || idx} 
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold shadow-sm">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 leading-tight">{contact.name}</span>
                  <span className="text-[11px] text-gray-400 font-medium">{contact.phone || "No phone"}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm font-medium">
                <div className="text-red-500 font-bold text-right tracking-tight">{hideFinancials ? "****" : formatINR(Math.abs(contact.balance))}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
