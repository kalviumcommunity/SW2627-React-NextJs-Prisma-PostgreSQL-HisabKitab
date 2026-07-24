import { getTransactions } from "@/actions/analytics";
import AnalyticsView from "./AnalyticsView";

export const dynamic = "force-dynamic";

// Trigger recompile
export default async function AnalyticsPage({ searchParams }) {
  const range = searchParams?.range || "All Time";
  const transactions = await getTransactions(range);

  return (
    <AnalyticsView initialTransactions={transactions} />
  );
}
