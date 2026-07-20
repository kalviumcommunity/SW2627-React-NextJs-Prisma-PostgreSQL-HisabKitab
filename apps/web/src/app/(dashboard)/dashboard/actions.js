"use server";

import { db } from "@hisab-kitab/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const shopId = session.user.activeShopId;
    if (!shopId) {
      throw new Error("No active shop selected");
    }

    // 1. Total Balance
    const contacts = await db.contact.findMany({
      where: { shopId, isDeleted: false },
      select: { balance: true }
    });
    
    const totalBalance = contacts.reduce((sum, c) => sum + Number(c.balance || 0), 0);

    // 2. KPIs
    // Total Given (YOU_GAVE)
    const gaveAgg = await db.transaction.aggregate({
      where: { shopId, type: "YOU_GAVE", isDeleted: false },
      _sum: { amount: true }
    });
    const totalGiven = Number(gaveAgg._sum.amount || 0);

    // Total Received (YOU_GOT)
    const gotAgg = await db.transaction.aggregate({
      where: { shopId, type: "YOU_GOT", isDeleted: false },
      _sum: { amount: true }
    });
    const totalReceived = Number(gotAgg._sum.amount || 0);

    const totalContacts = await db.contact.count({
      where: { shopId, isDeleted: false }
    });

    // 3. Recent Notes
    const recentTransactionsWithNotes = await db.transaction.findMany({
      where: { shopId, isDeleted: false, note: { not: null, not: "" } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { contact: { select: { name: true } } }
    });

    const recentNotes = recentTransactionsWithNotes.map((tx, i) => {
      const bgColors = ["bg-blue-50", "bg-rose-50", "bg-emerald-50", "bg-amber-50"];
      const dotColors = ["bg-blue-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500"];
      return {
        id: tx.id,
        title: tx.contact.name,
        time: tx.createdAt.toISOString(),
        body: tx.note,
        color: dotColors[i % dotColors.length],
        bgColor: bgColors[i % bgColors.length]
      };
    });

    // 4. Top Debtors (people who owe you, so balance > 0)
    const topDebtors = await db.contact.findMany({
      where: { shopId, isDeleted: false, balance: { gt: 0 } },
      orderBy: { balance: "desc" },
      take: 5,
      select: { id: true, name: true, phone: true, balance: true }
    });

    // 5. Top Creditors (people you owe, so balance < 0)
    const topCreditors = await db.contact.findMany({
      where: { shopId, isDeleted: false, balance: { lt: 0 } },
      orderBy: { balance: "asc" }, // Most negative first
      take: 5,
      select: { id: true, name: true, phone: true, balance: true }
    });

    return {
      success: true,
      data: {
        totalBalance,
        totalGiven,
        totalReceived,
        totalContacts,
        recentNotes,
        topDebtors: topDebtors.map(d => ({ ...d, balance: Number(d.balance) })),
        topCreditors: topCreditors.map(c => ({ ...c, balance: Number(c.balance) }))
      }
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return { success: false, error: error.message };
  }
}
