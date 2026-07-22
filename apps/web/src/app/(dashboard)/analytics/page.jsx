import { getTransactions } from "@/actions/analytics";
import AnalyticsView from "./AnalyticsView";

// Trigger recompile
export default async function AnalyticsPage() {
  const transactions = await getTransactions();

  return (
    <AnalyticsView initialTransactions={transactions} />
  );
}
