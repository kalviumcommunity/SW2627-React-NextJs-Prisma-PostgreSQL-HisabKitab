"use server";

import { db } from "@hisab-kitab/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardData(range = "All Time") {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const shopId = session.user.activeShopId;
    if (!shopId) {
      throw new Error("No active shop selected");
    }

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
    
    // We only filter transaction-based aggregates by date. Overall contact count and balance stays absolute.
    const [balanceAgg, gaveAgg, gotAgg] = await Promise.all([
      // 1. Total balance + contact count (All Time)
      db.contact.aggregate({
        where: { shopId, isDeleted: false },
        _sum: { balance: true },
        _count: true,
      }),
      // 2. Total Given (YOU_GAVE)
      db.transaction.aggregate({
        where: { shopId, type: "YOU_GAVE", isDeleted: false, ...(txDateFilter && { createdAt: txDateFilter }) },
        _sum: { amount: true },
      }),
      // 3. Total Received (YOU_GOT)
      db.transaction.aggregate({
        where: { shopId, type: "YOU_GOT", isDeleted: false, ...(txDateFilter && { createdAt: txDateFilter }) },
        _sum: { amount: true },
      }),
    ]);

    // 4. Cleanup old personal notes and fetch recent ones
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Auto-delete notes older than 24 hours
    await db.personalNote.deleteMany({
      where: {
        shopId,
        createdAt: { lt: twentyFourHoursAgo }
      }
    });

    // Fetch the remaining notes (which are naturally < 24h old)
    const recentNotesData = await db.personalNote.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Map to the format StackedNotes expects
    const recentNotes = recentNotesData.map(note => {
      // Calculate how long ago
      const diffMs = Date.now() - new Date(note.createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      let timeStr = 'Just now';
      if (diffHours > 0) timeStr = `${diffHours}h ago`;
      else if (diffMins > 0) timeStr = `${diffMins}m ago`;

      return {
        id: note.id,
        title: note.title,
        time: timeStr,
        body: note.body,
        color: note.color,
        bgColor: note.bgColor
      };
    });

    let topDebtors = [];
    let topCreditors = [];

    if (!txDateFilter) {
      // 5. Top Debtors (All Time)
      topDebtors = await db.contact.findMany({
        where: { shopId, isDeleted: false, balance: { gt: 0 } },
        orderBy: { balance: "desc" },
        take: 5,
        select: { id: true, name: true, phone: true, balance: true },
      });
      // 6. Top Creditors (All Time)
      topCreditors = await db.contact.findMany({
        where: { shopId, isDeleted: false, balance: { lt: 0 } },
        orderBy: { balance: "asc" },
        take: 5,
        select: { id: true, name: true, phone: true, balance: true },
      });
    } else {
      // Dynamic Top Debtors/Creditors for the date range
      const rangeTxs = await db.transaction.findMany({
        where: { shopId, isDeleted: false, status: 'APPROVED', createdAt: txDateFilter },
        select: { contactId: true, amount: true, type: true, contact: { select: { id: true, name: true, phone: true } } }
      });
      
      const contactDiffs = {};
      for (const tx of rangeTxs) {
        if (!contactDiffs[tx.contactId]) {
          contactDiffs[tx.contactId] = { id: tx.contactId, name: tx.contact?.name, phone: tx.contact?.phone, balance: 0 };
        }
        if (tx.type === "YOU_GAVE") {
          contactDiffs[tx.contactId].balance += Number(tx.amount);
        } else if (tx.type === "YOU_GOT") {
          contactDiffs[tx.contactId].balance -= Number(tx.amount);
        }
      }
      
      const diffList = Object.values(contactDiffs);
      
      topDebtors = diffList
        .filter(c => c.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);
        
      topCreditors = diffList
        .filter(c => c.balance < 0)
        .sort((a, b) => a.balance - b.balance)
        .slice(0, 5);
    }

    const totalBalance = Number(balanceAgg._sum.balance || 0);
    const totalContacts = balanceAgg._count;
    const totalGiven = Number(gaveAgg._sum.amount || 0);
    const totalReceived = Number(gotAgg._sum.amount || 0);

    return {
      success: true,
      data: {
        totalBalance,
        totalGiven,
        totalReceived,
        totalContacts,
        recentNotes,
        topDebtors: topDebtors.map(d => ({ ...d, balance: Number(d.balance) })),
        topCreditors: topCreditors.map(c => ({ ...c, balance: Number(c.balance) })),
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return { success: false, error: "Failed to load dashboard data. Please refresh and try again." };
  }
}

export async function createPersonalNote({ title, body, color, bgColor }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const shopId = session.user.activeShopId;
    if (!shopId) {
      throw new Error("No active shop selected");
    }

    await db.personalNote.create({
      data: {
        shopId,
        title,
        body,
        color: color || "bg-blue-500",
        bgColor: bgColor || "bg-blue-50"
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create personal note:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePersonalNote(id) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const shopId = session.user.activeShopId;
    
    // Security check: ensure note belongs to this shop before deleting
    await db.personalNote.delete({
      where: {
        id,
        shopId
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete personal note:", error);
    return { success: false, error: error.message };
  }
}
