"use server";

import { db } from "@hisab-kitab/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getSessionContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.activeShopId) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function getProducts() {
  try {
    const user = await getSessionContext();
    const products = await db.product.findMany({
      where: { 
        shopId: user.activeShopId,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Serialize Decimals for Client Components
    return products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      sku: p.sku,
      currentStock: p.currentStock.toString(),
      unit: p.unit,
      purchasePrice: p.purchasePrice.toString(),
      sellingPrice: p.sellingPrice.toString(),
      // calculate status based on stock
      status: parseFloat(p.currentStock.toString()) === 0 ? "Out" : (parseFloat(p.currentStock.toString()) <= 10 ? "Low" : "Healthy")
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function createProduct(data) {
  try {
    const user = await getSessionContext();
    await db.product.create({
      data: {
        shopId: user.activeShopId,
        name: data.name,
        category: data.category,
        sku: data.sku,
        currentStock: parseFloat(data.currentStock) || 0,
        unit: data.unit,
        purchasePrice: parseFloat(data.purchasePrice) || 0,
        sellingPrice: parseFloat(data.sellingPrice) || 0,
      }
    });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}
