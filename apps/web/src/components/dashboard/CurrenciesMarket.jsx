import { ArrowUpRight, TrendingUp, TrendingDown, DollarSign, Euro } from "lucide-react";
import styles from "./CurrenciesMarket.module.css";

export default function CurrenciesMarket() {
  const currencies = [
    { code: "USD", name: "US Dollar", rate: "102.43", change: "+ 0.87", trend: "up", flagUrl: "https://flagcdn.com/w80/us.png" },
    { code: "EUR", name: "Euro", rate: "1.0627", change: "- 0.80", trend: "down", flagUrl: "https://flagcdn.com/w80/eu.png" },
  ];

  return (
    <div className={`${styles.card} group`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-gray-900">Currencies Market</h3>
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 active:scale-95 group-hover:shadow-sm">
          <ArrowUpRight size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {currencies.map((currency, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                <img src={currency.flagUrl} alt={currency.code} className="w-12 h-auto object-cover" />
              </div>
              <div>
                <span className="font-bold text-gray-900">{currency.code}</span>
                <span className="text-sm text-gray-400 font-medium ml-2">{currency.trend === 'up' ? '0.87' : '-0.0076'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-medium">
              <div className={`flex items-center gap-1 text-[11px] font-bold ${currency.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {currency.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {currency.change}
              </div>
              <div className="text-gray-900 font-bold w-14 text-right tracking-tight">{currency.rate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
