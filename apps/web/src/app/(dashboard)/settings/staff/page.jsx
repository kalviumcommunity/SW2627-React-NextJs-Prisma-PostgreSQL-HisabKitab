import { getPendingApprovals, getActiveStaff } from "@/actions/workers";
import StaffView from "./StaffView";

export default async function StaffPage() {
  const pendingApprovals = await getPendingApprovals();
  const activeStaff = await getActiveStaff();

  return (
    <StaffView initialPending={pendingApprovals} initialStaff={activeStaff} />
  );
}
