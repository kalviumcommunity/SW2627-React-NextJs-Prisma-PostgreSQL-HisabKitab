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

export async function getContacts() {
  try {
    const user = await getSessionContext();
    const contacts = await db.contact.findMany({
      where: { 
        shopId: user.activeShopId,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Serialize Decimals and Dates for Client Components
    return contacts.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      phone: c.phone || "No phone provided",
      balance: c.balance.toString(),
      // Add fake last transaction date for UI parity until we fetch real last transaction
      lastTransaction: c.createdAt.toISOString()
    }));
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return [];
  }
}

export async function createContact(data) {
  try {
    const user = await getSessionContext();
    await db.contact.create({
      data: {
        shopId: user.activeShopId,
        name: data.name,
        type: data.type === "Customer" ? "CUSTOMER" : "SUPPLIER",
        phone: data.phone,
        balance: data.balance ? parseFloat(data.balance) : 0,
        createdBy: user.id,
      }
    });
    revalidatePath("/ledger");
    return { success: true };
  } catch (error) {
    console.error("Failed to create contact:", error);
    return { success: false, error: "Failed to create contact" };
  }
}
