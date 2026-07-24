import { getContacts } from "@/actions/ledger";
import LedgerView from "./LedgerView";

export const dynamic = "force-dynamic";

export default async function LedgerPage({ searchParams }) {
  const range = searchParams?.range || "All Time";
  const contacts = await getContacts(range);

  return (
    <LedgerView initialContacts={contacts} />
  );
}
