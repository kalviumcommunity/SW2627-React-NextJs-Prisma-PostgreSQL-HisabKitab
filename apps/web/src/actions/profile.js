"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@hisab-kitab/database";

export async function updateProfile(data) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Not authenticated" };
    }
    
    // In our system, the active shop is usually the first shop created by the user, or we can find it via ShopMember
    // Let's get the active shop for this user
    const shopMember = await db.shopMember.findFirst({
      where: { userId: session.user.id },
      include: { shop: true },
    });
    
    if (!shopMember) {
      return { success: false, error: "Shop not found" };
    }
    
    const shopId = shopMember.shopId;
    
    // Update User Name
    if (data.name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: data.name }
      });
    }
    
    // Update Shop Name
    if (data.shopName) {
      await db.shop.update({
        where: { id: shopId },
        data: { name: data.shopName }
      });
    }
    
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: error.message };
  }
}
