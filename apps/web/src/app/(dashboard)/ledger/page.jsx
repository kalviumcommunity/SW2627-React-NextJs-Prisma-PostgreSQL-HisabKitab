import { getContacts } from "@/actions/ledger";
import LedgerView from "./LedgerView";

export default async function LedgerPage() {
  const contacts = await getContacts();

  return (
    <LedgerView initialContacts={contacts} />
  );
}
