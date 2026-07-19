import { Plus, ArrowUpRight, FileText, ChevronRight, NotebookPen } from "lucide-react";
import styles from "./ActionCards.module.css";

export default function ActionCards() {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Add Personal Note */}
      <div className={`${styles.card} min-h-[260px] group`}>
        <div className="flex flex-col justify-center items-center gap-6 z-10 relative w-full pt-8">
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
      <div className={`${styles.card} flex-1 group`}>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText size={18} className="text-blue-600" />
            </div>
            Recent Notes
          </h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group/btn">
            View All <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar relative z-10">

          <div className="group/note flex items-start gap-4 p-4 -mx-4 rounded-3xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shadow-sm group-hover/note:scale-150 transition-transform"></div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-base font-bold text-gray-900">Buy groceries</h4>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">2h ago</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">Milk, eggs, bread, and some fresh vegetables for the week. Need to visit farmer's market.</p>
            </div>
          </div>

          <div className="w-full h-px bg-gray-50"></div>

          <div className="group/note flex items-start gap-4 p-4 -mx-4 rounded-3xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
            <div className="w-2 h-2 mt-2 rounded-full bg-gray-300 shadow-sm group-hover/note:bg-blue-500 group-hover/note:scale-150 transition-all"></div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-base font-bold text-gray-900">Trip to Paris</h4>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Yesterday</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">Book flight tickets and check for hotel reservations near Eiffel Tower. Budget max $2000.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
