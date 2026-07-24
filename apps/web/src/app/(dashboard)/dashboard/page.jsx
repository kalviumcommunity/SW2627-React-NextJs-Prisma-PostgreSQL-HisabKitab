import { getDashboardData } from "./actions";
import DashboardView from "./DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }) {
  const range = searchParams?.range || "All Time";
  const result = await getDashboardData(range);
  const dashboardData = result.success ? result.data : null;

  return (
    <DashboardView dashboardData={dashboardData} />
  );
}