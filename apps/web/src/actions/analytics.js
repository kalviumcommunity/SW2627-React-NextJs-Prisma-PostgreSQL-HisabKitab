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
    
    // Base where clause
    const whereClause = {
      shopId: user.activeShopId,
      isDeleted: false,
      contact: {
        isDeleted: false
      }
    };

    // If STAFF, only show APPROVED transactions, OR their own PENDING transactions
    if (user.shopRole === "STAFF") {
      whereClause.OR = [
        { status: "APPROVED" },
        { status: "PENDING_DELETION" },
        { status: "PENDING", createdBy: user.id }
      ];
    } else {
      // Owners see everything (APPROVED, PENDING, REJECTED)
      // We can omit status filter to let them see everything, or explicitly filter if needed.
    }

    const transactions = await db.transaction.findMany({
      where: whereClause,
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
      note: tx.note || "",
      status: tx.status,
      editedAt: tx.editedAt ? tx.editedAt.toISOString() : null,
      deletedAt: tx.deletedAt ? tx.deletedAt.toISOString() : null
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
      let contact = null;
      if (data.phone) {
        contact = await tx.contact.findFirst({
          where: { shopId: user.activeShopId, phone: data.phone, isDeleted: false }
        });
      }
      
      if (!contact) {
        contact = await tx.contact.findFirst({
          where: { shopId: user.activeShopId, name: { equals: data.partyName, mode: 'insensitive' }, isDeleted: false }
        });
      }
      
      if (!contact) {
        contact = await tx.contact.create({
          data: {
            shopId: user.activeShopId,
            name: data.partyName || "Unknown Party",
            phone: data.phone || null,
            balance: 0,
            createdBy: user.id
          }
        });
      } else if (data.phone && !contact.phone) {
        // If we found the contact by name but they didn't have a phone number yet, update it
        contact = await tx.contact.update({
          where: { id: contact.id },
          data: { phone: data.phone }
        });
      }

      // Determine status based on role
      const status = user.shopRole === "STAFF" ? "PENDING" : "APPROVED";

      // If we gave them money (YOU_GAVE), they owe us more (+amount)
      // If we got money from them (YOU_GOT), their balance decreases (-amount)
      const balanceAdjustment = txType === "YOU_GAVE" ? amountVal : -amountVal;
      
      let newBalance = Number(contact.balance || 0);

      // Only update contact balance if the transaction is APPROVED by an OWNER
      if (status === "APPROVED") {
        newBalance = newBalance + balanceAdjustment;
        await tx.contact.update({
          where: { id: contact.id },
          data: { balance: newBalance }
        });
      }

      // Create transaction
      await tx.transaction.create({
        data: {
          shopId: user.activeShopId,
          contactId: contact.id,
          amount: amountVal,
          type: txType,
          note: data.note || "",
          status: status,
          createdAt: data.date ? new Date(data.date) : new Date(),
          createdBy: user.id,
          balanceAfter: newBalance
        }
      });
    });

    revalidatePath("/analytics");
    revalidatePath("/ledger"); 
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    try { require('fs').appendFileSync('error_log.txt', String(error.message || error) + '\n'); } catch(e){}
    return { success: false, error: error.message || String(error) };
  }
}

export async function approveTransaction(transactionId) {
  try {
    const user = await getSessionContext();
    if (user.shopRole !== "OWNER") {
      throw new Error("Only owners can approve transactions.");
    }

    await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId, shopId: user.activeShopId }
      });

      if (!transaction || transaction.status !== "PENDING") {
        throw new Error("Invalid transaction or already processed.");
      }

      const balanceAdjustment = transaction.type === "YOU_GAVE" ? Number(transaction.amount) : -Number(transaction.amount);

      // Update contact balance
      const updatedContact = await tx.contact.update({
        where: { id: transaction.contactId },
        data: { balance: { increment: balanceAdjustment } }
      });

      // Update transaction status
      await tx.transaction.update({
        where: { id: transactionId },
        data: { 
          status: "APPROVED",
          balanceAfter: Number(updatedContact.balance)
        }
      });
    });

    revalidatePath("/analytics");
    revalidatePath("/ledger"); 
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve transaction:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function rejectTransaction(transactionId) {
  try {
    const user = await getSessionContext();
    if (user.shopRole !== "OWNER") {
      throw new Error("Only owners can reject transactions.");
    }

    await db.transaction.update({
      where: { id: transactionId, shopId: user.activeShopId },
      data: { status: "REJECTED" }
    });

    revalidatePath("/analytics");
    revalidatePath("/ledger"); 
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject transaction:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function editTransaction(txId, data) {
  try {
    const user = await getSessionContext();
    const amountVal = parseFloat(data.amount) || 0;
    const txType = data.type === "YOU_GOT" ? "YOU_GOT" : "YOU_GAVE";
    
    await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: txId, shopId: user.activeShopId }
      });
      if (!transaction) throw new Error("Transaction not found");
      
      const isOwner = user.shopRole === "OWNER";
      const newStatus = isOwner ? "APPROVED" : "PENDING";
      
      // Revert the old effect on the balance if it was APPROVED
      if (transaction.status === "APPROVED" || transaction.status === "PENDING_DELETION") {
        const oldBalanceAdjustment = transaction.type === "YOU_GAVE" ? -Number(transaction.amount) : Number(transaction.amount);
        
        await tx.contact.update({
          where: { id: transaction.contactId },
          data: { balance: { increment: oldBalanceAdjustment } }
        });
      }
      
      let newBalanceAfter = transaction.balanceAfter;
      
      // If the new status is APPROVED (Owner), apply the new effect immediately
      if (newStatus === "APPROVED") {
        const newBalanceAdjustment = txType === "YOU_GAVE" ? amountVal : -amountVal;
        const updatedContact = await tx.contact.update({
          where: { id: transaction.contactId },
          data: { balance: { increment: newBalanceAdjustment } }
        });
        newBalanceAfter = updatedContact.balance;
      }
      
      await tx.transaction.update({
        where: { id: txId },
        data: {
          amount: amountVal,
          type: txType,
          note: data.note || "",
          status: newStatus,
          editedAt: new Date(),
          editedBy: user.id,
          balanceAfter: newBalanceAfter
        }
      });
    });

    revalidatePath("/analytics");
    revalidatePath("/ledger"); 
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to edit transaction:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function deleteTransaction(txId) {
  try {
    const user = await getSessionContext();
    const isOwner = user.shopRole === "OWNER";
    
    await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: txId, shopId: user.activeShopId }
      });
      if (!transaction) throw new Error("Transaction not found");

      if (isOwner) {
        if (transaction.status === "APPROVED" || transaction.status === "PENDING_DELETION") {
          const oldBalanceAdjustment = transaction.type === "YOU_GAVE" ? -Number(transaction.amount) : Number(transaction.amount);
          await tx.contact.update({
            where: { id: transaction.contactId },
            data: { balance: { increment: oldBalanceAdjustment } }
          });
        }
        await tx.transaction.update({
          where: { id: txId },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: user.id
          }
        });
      } else {
        // Staff requests deletion
        if (transaction.status === "PENDING") {
          // If it was already pending (never applied), staff can just delete their own
          await tx.transaction.update({
            where: { id: txId },
            data: {
              isDeleted: true,
              deletedAt: new Date(),
              deletedBy: user.id
            }
          });
        } else {
          await tx.transaction.update({
            where: { id: txId },
            data: { status: "PENDING_DELETION" }
          });
        }
      }
    });

    revalidatePath("/analytics");
    revalidatePath("/ledger"); 
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function approveDeletion(txId) {
  try {
    const user = await getSessionContext();
    if (user.shopRole !== "OWNER") throw new Error("Only owners can approve deletion.");

    await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: txId, shopId: user.activeShopId }
      });
      if (!transaction || transaction.status !== "PENDING_DELETION") {
        throw new Error("Invalid transaction or not pending deletion.");
      }

      // Revert the balance effect
      const balanceAdjustment = transaction.type === "YOU_GAVE" ? -Number(transaction.amount) : Number(transaction.amount);
      await tx.contact.update({
        where: { id: transaction.contactId },
        data: { balance: { increment: balanceAdjustment } }
      });

      // Mark as deleted
      await tx.transaction.update({
        where: { id: txId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: user.id
        }
      });
    });

    revalidatePath("/analytics");
    revalidatePath("/ledger"); 
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve deletion:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function rejectDeletion(txId) {
  try {
    const user = await getSessionContext();
    if (user.shopRole !== "OWNER") throw new Error("Only owners can reject deletion.");

    await db.transaction.update({
      where: { id: txId, shopId: user.activeShopId },
      data: { status: "APPROVED" } // Return it to normal
    });

    revalidatePath("/analytics");
    revalidatePath("/ledger"); 
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject deletion:", error);
    return { success: false, error: error.message || String(error) };
  }
}
