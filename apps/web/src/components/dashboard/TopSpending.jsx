import { ArrowUpRight } from "lucide-react";
import styles from "./TopSpending.module.css";

export default function TopSpending() {
  return (
    <div className={`${styles.card} group`}>
      <div className="flex flex-col justify-center items-center gap-4 mb-8 w-full">
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 active:scale-95 group-hover:shadow-sm">
          <ArrowUpRight size={18} className="text-gray-600" />
        </button>
        <h3 className="text-lg font-bold text-gray-900">Top Spending</h3>
      </div>

      <div className="mt-auto w-full flex flex-col items-center">
        {/* Progress Bar Graphic */}
        <div className="h-10 w-full rounded-full overflow-hidden flex bg-gray-100 mb-5 relative">
           {/* Simulate the striped/dotted visual of the bar more accurately */}
           <div className="h-full w-2/3 bg-gray-200" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)" }}></div>
           <div className="h-full w-1/3 bg-blue-600 rounded-full relative z-10 shadow-sm border-2 border-white -ml-2"></div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-5 text-sm font-semibold w-full">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm"></div>
            <span className="text-gray-900 text-xs">Apps Subscription</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300 shadow-sm"></div>
            <span className="text-gray-400 text-xs">Others</span>
          </div>
        </div>
      </div>
    </div>
  );
}
