"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function DateRangePickerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "All Time";
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const ranges = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "This Month",
    "Last Month",
    "All Time"
  ];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 bg-white border rounded-[12px] px-6 py-3 text-sm font-medium transition-all shadow-sm group focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${isOpen
          ? "border-indigo-300 ring-4 ring-indigo-500/10 text-indigo-800 bg-indigo-50/30"
          : "border-gray-200/80 hover:border-indigo-200 text-gray-700 hover:bg-indigo-50/20 hover:text-indigo-700"
          }`}
      >
        <Calendar size={16} className={`transition-transform duration-300 ${isOpen ? "text-indigo-600 scale-110" : "text-indigo-400 group-hover:scale-110"}`} />
        <span className="min-w-[130px] text-left">{currentRange}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-600" : "text-gray-400 group-hover:text-indigo-400"}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.15)] rounded-[12px] overflow-hidden p-1.5"
          >
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2.5 pb-2">
              Select Date Range
            </div>
            <div className="flex flex-col gap-0.5">
              {ranges.map((range) => {
                const isSelected = currentRange === range;
                return (
                  <button
                    key={range}
                    onClick={() => {
                      setIsOpen(false);
                      const params = new URLSearchParams(searchParams.toString());
                      if (range === "All Time") {
                        params.delete("range");
                      } else {
                        params.set("range", range);
                      }
                      router.push(`?${params.toString()}`, { scroll: false });
                    }}
                    className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-[8px] text-sm transition-all duration-200 group ${isSelected
                        ? "bg-indigo-50/80 text-indigo-700 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                      }`}
                  >
                    <span className={isSelected ? "" : "group-hover:translate-x-0.5 transition-transform"}>
                      {range}
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        <Check size={16} className="text-indigo-600" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DateRangePicker() {
  return (
    <Suspense fallback={
      <div className="h-12 w-[210px] bg-gray-100 animate-pulse rounded-[12px] border border-gray-200"></div>
    }>
      <DateRangePickerInner />
    </Suspense>
  );
}
