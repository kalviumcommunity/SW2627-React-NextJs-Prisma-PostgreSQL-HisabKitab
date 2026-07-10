/**
 * Dashboard Service — aggregated financial summary for the active shop.
 */

const { db } = require("../lib/prisma");

async function getSummary(shopId) {
  const [totalDues, totalPayable, totalSalaryPending, lossTotal] = await Promise.all([
    // Total receivable from customers (positive balance = they owe us)
    db.contact.aggregate({
      where: { shopId, isDeleted: false, contactType: { in: ["CUSTOMER", "BOTH"] }, balance: { gt: 0 } },
      _sum: { balance: true },
    }),
    // Total payable to vendors (negative balance = we owe them)
    db.contact.aggregate({
      where: { shopId, isDeleted: false, contactType: { in: ["VENDOR", "BOTH"] }, balance: { lt: 0 } },
      _sum: { balance: true },
    }),
    // Pending salary payments
    db.salaryPayment.aggregate({
      where: { worker: { shopId }, status: "PENDING" },
      _sum: { amount: true },
    }),
    // Loss this month
    db.loss.aggregate({
      where: {
        shopId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { lossValue: true },
    }),
  ]);

  return {
    totalDues: Number(totalDues._sum.balance ?? 0),
    totalPayable: Math.abs(Number(totalPayable._sum.balance ?? 0)),
    totalSalaryPending: Number(totalSalaryPending._sum.amount ?? 0),
    monthlyLoss: Number(lossTotal._sum.lossValue ?? 0),
  };
}

async function getEarningsRollup(shopId, period) {
  // Try cached rollup first
  const cached = await db.earningsRollup.findUnique({
    where: { shopId_period: { shopId, period } },
  });
  if (cached) return cached;

  // Compute on-the-fly
  const [start, end] = getPeriodBounds(period);

  const result = await db.transaction.aggregate({
    where: {
      shopId,
      isDeleted: false,
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });

  return {
    shopId,
    period,
    total: Number(result._sum.amount ?? 0),
    computedAt: new Date(),
  };
}

function getPeriodBounds(period) {
  // period format: "2024-06"
  const [year, month] = period.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return [start, end];
}

module.exports = { getSummary, getEarningsRollup };
