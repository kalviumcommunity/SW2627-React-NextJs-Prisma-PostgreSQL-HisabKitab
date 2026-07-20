import { ArrowUpRight } from "lucide-react";
import styles from "./TopSpending.module.css";

export default function TopSpending({ topCreditors = [] }) {
  const topCreditor = topCreditors[0];
  const totalCreditorBalance = topCreditors.reduce((sum, c) => sum + Math.abs(c.balance), 0);
  const ratio = totalCreditorBalance > 0 && topCreditor ? (Math.abs(topCreditor.balance) / totalCreditorBalance) * 100 : 0;

  return (
    <div className={`${styles.card} group`}>
      <div className="flex flex-col justify-center items-center gap-4 mb-8 w-full">
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 active:scale-95 group-hover:shadow-sm">
          <ArrowUpRight size={18} className="text-gray-600" />
        </button>
        <h3 className="text-lg font-bold text-gray-900">Top Creditors</h3>
      </div>

      <div className="mt-auto w-full flex flex-col items-center">
        {topCreditors.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No creditors found.</p>
        ) : (
          <>
            {/* Progress Bar Graphic */}
            <div className="h-10 w-full rounded-full overflow-hidden flex bg-gray-100 mb-5 relative">
               <div className="h-full bg-gray-200 transition-all duration-1000" style={{ width: `${100 - ratio}%`, backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)" }}></div>
               <div className="h-full bg-blue-600 rounded-full relative z-10 shadow-sm border-2 border-white -ml-2 transition-all duration-1000" style={{ width: `${ratio}%` }}></div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-5 text-sm font-semibold w-full">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm"></div>
                <span className="text-gray-900 text-xs truncate max-w-[100px]">{topCreditor.name}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 shadow-sm"></div>
                <span className="text-gray-400 text-xs">Others</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
