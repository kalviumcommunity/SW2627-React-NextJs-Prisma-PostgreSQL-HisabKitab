import { Wallet, ArrowDownCircle, ArrowUpCircle, Banknote, PiggyBank } from "lucide-react";

export default function KpiGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10">
      {/* Income Card */}
      <div className="bg-white hover:bg-blue-600 h-45 rounded-[32px] p-6 border border-gray-100 hover:border-blue-600 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/30 cursor-pointer group min-h-[160px] gap-2">
        <div className="flex flex-row items-center justify-center gap-3 p-20">
          <div className="w-11 h-11 rounded-full bg-gray-50 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
            <Wallet size={22} className="text-gray-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-white transition-colors duration-300 text-[19px]">Income</span>
        </div>
        <div>
          <h3 className="text-[42px] leading-none font-bold text-gray-900 group-hover:text-white mb-3.5 tracking-tight transition-colors duration-300">$24,300</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="bg-green-100 text-green-700 group-hover:bg-white/20 group-hover:text-white text-[10px] font-bold px-2.5 py-[3px] rounded-full transition-colors duration-300">+6.1%</span>
            <span className="text-[11px] text-gray-400 group-hover:text-blue-100 font-medium transition-colors duration-300">Last Period</span>
          </div>
        </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-white h-45 hover:bg-blue-600 rounded-[32px] p-6 border border-gray-100 hover:border-blue-600 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/30 cursor-pointer group min-h-[160px] gap-2">
        <div className="flex flex-row items-center justify-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-gray-50 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
            <Banknote size={22} className="text-gray-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-white transition-colors duration-300 text-[19px]">Expenses</span>
        </div>
        <div>
          <h3 className="text-[42px] leading-none font-bold text-gray-900 group-hover:text-white mb-3.5 tracking-tight transition-colors duration-300">$18,750</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="bg-green-100 text-green-700 group-hover:bg-white/20 group-hover:text-white text-[10px] font-bold px-2.5 py-[3px] rounded-full transition-colors duration-300">-2.4%</span>
            <span className="text-[11px] text-gray-400 group-hover:text-blue-100 font-medium transition-colors duration-300">Last Period</span>
          </div>
        </div>
      </div>

      {/* Net Card */}
      <div className="bg-white h-45 hover:bg-blue-600 rounded-[32px] p-6 border border-gray-100 hover:border-blue-600 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/30 cursor-pointer group min-h-[160px] gap-2">
        <div className="flex flex-row items-center justify-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-gray-50 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
            <ArrowUpCircle size={22} className="text-gray-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-white transition-colors duration-300 text-[19px]">Net</span>
        </div>
        <div>
          <h3 className="text-[42px] leading-none font-bold text-gray-900 group-hover:text-white mb-2.5 tracking-tight transition-colors duration-300">+$5,550</h3>
          <p className="text-[13px] text-gray-400 group-hover:text-blue-100 font-medium mt-1 transition-colors duration-300">Net income after expenses</p>
        </div>
      </div>

      {/* Savings Card */}
      <div className="bg-white h-45 hover:bg-blue-600 rounded-[32px] p-6 border border-gray-100 hover:border-blue-600 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/30 cursor-pointer group min-h-[160px] gap-2">
        <div className="flex flex-row items-center justify-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-gray-50 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
            <PiggyBank size={22} className="text-gray-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-white transition-colors duration-300 text-[19px]">Savings</span>
        </div>
        <div>
          <h3 className="text-[42px] leading-none font-bold text-gray-900 group-hover:text-white mb-2.5 tracking-tight transition-colors duration-300">22.8%</h3>
          <p className="text-[13px] text-gray-400 group-hover:text-blue-100 font-medium mt-1 transition-colors duration-300">Portion of income retained</p>
        </div>
      </div>
    </div>
  );
}
