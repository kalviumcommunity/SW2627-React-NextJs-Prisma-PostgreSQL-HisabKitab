import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { formatINR } from "@/lib/formatters";
import styles from "./CurrenciesMarket.module.css";

export default function CurrenciesMarket({ topDebtors = [], hideFinancials }) {

  return (
    <div className={`${styles.card} group`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-gray-900">Top Debtors</h3>
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 active:scale-95 group-hover:shadow-sm">
          <ArrowUpRight size={18} className="text-gray-600" />
        </button>
      </div>

      <div 
        className="flex flex-col gap-6 max-h-[120px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {topDebtors.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No debtors found.</p>
        ) : (
          topDebtors.map((contact, idx) => (
            <div 
              key={contact.id || idx} 
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 leading-tight">{contact.name}</span>
                  <span className="text-[11px] text-gray-400 font-medium">{contact.phone || "No phone"}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm font-medium">
                <div className="text-green-600 font-bold text-right tracking-tight">{hideFinancials ? "****" : formatINR(contact.balance)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
