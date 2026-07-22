import { getTransactions } from "@/actions/analytics";
import AnalyticsView from "./AnalyticsView";

export default async function AnalyticsPage() {
  const transactions = await getTransactions();

  return (
    <AnalyticsView initialTransactions={transactions} />
  );
}
