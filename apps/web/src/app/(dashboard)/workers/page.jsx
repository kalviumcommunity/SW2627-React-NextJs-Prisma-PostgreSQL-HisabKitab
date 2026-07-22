import { getWorkers } from "@/actions/workers";
import WorkersView from "./WorkersView";

export default async function WorkersPage() {
  const workers = await getWorkers();

  return (
    <WorkersView initialWorkers={workers} />
  );
}
