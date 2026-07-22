import { getDashboardData } from "./actions";
import DashboardView from "./DashboardView";

export default async function DashboardPage() {
  const result = await getDashboardData();
  const dashboardData = result.success ? result.data : null;

  return (
    <DashboardView dashboardData={dashboardData} />
  );
}