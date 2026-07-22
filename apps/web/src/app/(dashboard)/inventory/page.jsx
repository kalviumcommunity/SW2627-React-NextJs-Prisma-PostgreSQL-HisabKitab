import { getProducts } from "@/actions/inventory";
import InventoryView from "./InventoryView";

export default async function InventoryPage() {
  const products = await getProducts();

  return (
    <InventoryView initialInventory={products} />
  );
}
