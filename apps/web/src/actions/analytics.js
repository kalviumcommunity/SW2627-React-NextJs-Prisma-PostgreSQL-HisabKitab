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

export async function getTransactions() {
  try {
    const user = await getSessionContext();
    const transactions = await db.transaction.findMany({
      where: { 
        shopId: user.activeShopId,
        isDeleted: false
      },
      include: { contact: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Serialize Decimals and Dates for Client Components
    return transactions.map(tx => ({
      id: tx.id,
      partyName: tx.contact ? tx.contact.name : "Unknown Party",
      type: tx.type, // YOU_GOT, YOU_GAVE, SALE, PURCHASE, EXPENSE
      amount: tx.amount.toString(),
      date: tx.createdAt.toISOString(),
      note: tx.note || ""
    }));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function createTransaction(data) {
  try {
    const user = await getSessionContext();
    const txType = data.type === "YOU_GOT" ? "YOU_GOT" : "YOU_GAVE";
    const amountVal = parseFloat(data.amount) || 0;

    await db.$transaction(async (tx) => {
      // Find or create contact
      let contact = await tx.contact.findFirst({
        where: { shopId: user.activeShopId, name: { equals: data.partyName, mode: 'insensitive' }, isDeleted: false }
      });
      
      if (!contact) {
        contact = await tx.contact.create({
          data: {
            shopId: user.activeShopId,
            name: data.partyName || "Unknown Party",
            balance: 0,
            createdBy: user.id
          }
        });
      }

      // Update Contact Balance (Positive means they owe us, Negative means we owe them)
      // If we gave them money (YOU_GAVE), they owe us more (+amount)
      // If we got money from them (YOU_GOT), their balance decreases (-amount)
      const balanceAdjustment = txType === "YOU_GAVE" ? amountVal : -amountVal;
      
      await tx.contact.update({
        where: { id: contact.id },
        data: { balance: { increment: balanceAdjustment } }
      });

      // Create transaction
      await tx.transaction.create({
        data: {
          shopId: user.activeShopId,
          contactId: contact.id,
          amount: amountVal,
          type: txType,
          note: data.note || "",
          createdAt: data.date ? new Date(data.date) : new Date(),
          createdBy: user.id,
          balanceAfter: Number(contact.balance || 0) + balanceAdjustment
        }
      });
    });

    revalidatePath("/analytics");
    revalidatePath("/ledger"); 
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    try { require('fs').appendFileSync('error_log.txt', String(error.message || error) + '\\n'); } catch(e){}
    return { success: false, error: error.message || String(error) };
  }
}
