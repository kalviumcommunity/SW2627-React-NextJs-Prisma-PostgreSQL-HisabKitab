import { Plus, ArrowUpRight } from "lucide-react";
import styles from "./ActionCards.module.css";
import StackedNotes from "./StackedNotes";

export default function ActionCards({ recentNotes = [] }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Add Personal Note */}
      <div className={`${styles.card} min-h-[260px] group`}>
        <div className="flex flex-col justify-center items-center gap-3 z-10 relative w-full pt-8">
          <button className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 active:scale-95 bg-white group-hover:shadow-sm ">
            <Plus size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
          </button>
          <h3 className="text-xl font-bold text-gray-900 leading-tight">Add Personal Note</h3>
        </div>

        {/* Decorative graphic at the bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-36 flex flex-col items-center justify-end z-0">
          <div className="w-28 h-4 bg-gray-200 rounded-t-xl opacity-60 translate-y-6"></div>
          <div className="w-40 h-6 bg-gray-800 rounded-t-xl z-10 translate-y-3"></div>
          <div className="w-52 h-28 bg-gray-50 rounded-t-3xl shadow-inner z-20 flex flex-col items-center pt-5 pb-2 px-5 border border-gray-200 border-b-0 relative">
            <div className="w-36 h-2 bg-white rounded-full mb-3"></div>
            <div className="w-28 h-2 bg-white rounded-full"></div>
            {/* Small mock icon on the mock card */}
            <div className="absolute top-5 right-5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
              <ArrowUpRight size={12} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="w-full flex justify-center mt-2">
        <StackedNotes notes={recentNotes} />
      </div>
    </div>
  );
}
