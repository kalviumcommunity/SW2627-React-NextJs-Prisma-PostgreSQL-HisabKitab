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

    // Run all independent queries in parallel for ~4x faster response
    const [balanceAgg, gaveAgg, gotAgg, recentTransactionsWithNotes, topDebtors, topCreditors] = await Promise.all([
      // 1. Total balance + contact count in one aggregate
      db.contact.aggregate({
        where: { shopId, isDeleted: false },
        _sum: { balance: true },
        _count: true,
      }),
      // 2. Total Given (YOU_GAVE)
      db.transaction.aggregate({
        where: { shopId, type: "YOU_GAVE", isDeleted: false },
        _sum: { amount: true },
      }),
      // 3. Total Received (YOU_GOT)
      db.transaction.aggregate({
        where: { shopId, type: "YOU_GOT", isDeleted: false },
        _sum: { amount: true },
      }),
      // 4. Recent Notes
      db.transaction.findMany({
        where: { shopId, isDeleted: false, AND: [{ note: { not: null } }, { note: { not: "" } }] },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { contact: { select: { name: true } } },
      }),
      // 5. Top Debtors (people who owe you)
      db.contact.findMany({
        where: { shopId, isDeleted: false, balance: { gt: 0 } },
        orderBy: { balance: "desc" },
        take: 5,
        select: { id: true, name: true, phone: true, balance: true },
      }),
      // 6. Top Creditors (people you owe)
      db.contact.findMany({
        where: { shopId, isDeleted: false, balance: { lt: 0 } },
        orderBy: { balance: "asc" },
        take: 5,
        select: { id: true, name: true, phone: true, balance: true },
      }),
    ]);

    const totalBalance = Number(balanceAgg._sum.balance || 0);
    const totalContacts = balanceAgg._count;
    const totalGiven = Number(gaveAgg._sum.amount || 0);
    const totalReceived = Number(gotAgg._sum.amount || 0);

    const bgColors = ["bg-blue-50", "bg-rose-50", "bg-emerald-50", "bg-amber-50"];
    const dotColors = ["bg-blue-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500"];
    const recentNotes = recentTransactionsWithNotes.map((tx, i) => ({
      id: tx.id,
      title: tx.contact.name,
      time: tx.createdAt.toISOString(),
      body: tx.note,
      color: dotColors[i % dotColors.length],
      bgColor: bgColors[i % bgColors.length],
    }));

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
