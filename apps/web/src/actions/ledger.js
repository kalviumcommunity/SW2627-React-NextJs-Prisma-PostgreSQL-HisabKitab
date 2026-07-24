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

export async function getContacts(range = "All Time") {
  try {
    const user = await getSessionContext();
    let contacts = await db.contact.findMany({
      where: { 
        shopId: user.activeShopId,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' }
    });

    let startDate = null;
    let endDate = null;
    const now = new Date();
    
    if (range === "Today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
    } else if (range === "Yesterday") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
    } else if (range === "Last 7 Days") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      endDate = now;
    } else if (range === "This Month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (range === "Last Month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    const txDateFilter = startDate && endDate ? { gte: startDate, lte: endDate } : undefined;

    if (txDateFilter) {
      const rangeTxs = await db.transaction.findMany({
        where: { shopId: user.activeShopId, isDeleted: false, status: 'APPROVED', createdAt: txDateFilter },
        select: { contactId: true, amount: true, type: true }
      });
      
      const balanceMap = {};
      for (const tx of rangeTxs) {
        if (!balanceMap[tx.contactId]) balanceMap[tx.contactId] = 0;
        if (tx.type === "YOU_GAVE") balanceMap[tx.contactId] += Number(tx.amount);
        if (tx.type === "YOU_GOT") balanceMap[tx.contactId] -= Number(tx.amount);
      }
      
      // Override the balances
      contacts = contacts.map(c => ({
        ...c,
        balance: balanceMap[c.id] || 0
      }));
    }
    
    // Serialize Decimals and Dates for Client Components
    return contacts.map(c => ({
      id: c.id,
      name: c.name,
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

export async function deleteContact(contactId) {
  try {
    const user = await getSessionContext();
    if (user.shopRole !== "OWNER") {
      throw new Error("Only owners can delete a party.");
    }

    await db.contact.update({
      where: { id: contactId, shopId: user.activeShopId },
      data: { isDeleted: true }
    });

    revalidatePath("/ledger");
    revalidatePath("/analytics");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete contact:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function getContactTransactions(contactId) {
  try {
    const user = await getSessionContext();
    const transactions = await db.transaction.findMany({
      where: {
        shopId: user.activeShopId,
        contactId,
        isDeleted: false,
        status: "APPROVED" // Usually ledger only shows approved transactions
      },
      orderBy: { createdAt: 'desc' }
    });

    return transactions.map(tx => {
      const dateObj = tx.createdAt;
      
      // Basic formatting to match what the UI expects (e.g., "18 Jul 2026")
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = dateObj.toLocaleString('en-GB', { month: 'short' });
      const year = dateObj.getFullYear();
      
      // For time: "10:30 AM"
      let hour = dateObj.getHours();
      const minute = dateObj.getMinutes().toString().padStart(2, '0');
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      hour = hour ? hour : 12; // the hour '0' should be '12'
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;

      return {
        id: tx.id,
        date: `${day} ${month} ${year}`,
        time: timeStr,
        type: tx.type,
        amount: Number(tx.amount),
        note: tx.note || ""
      };
    });
  } catch (error) {
    console.error("Failed to fetch contact transactions:", error);
    return [];
  }
}
