/**
 * Worker Repository — attendance, salary payments, salary audits.
 */

const { db } = require("../lib/prisma");

async function findMany(shopId, { includeDeleted = false } = {}) {
  return db.worker.findMany({
    where: { shopId, ...(!includeDeleted && { isDeleted: false }) },
    include: {
      attendances: {
        where: {
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

async function findById(id, shopId) {
  return db.worker.findFirst({
    where: { id, shopId, isDeleted: false },
    include: {
      attendances: { orderBy: { date: "desc" }, take: 31 },
      salaryPayments: { orderBy: { paidAt: "desc" }, take: 12 },
    },
  });
}

async function create(shopId, data) {
  return db.worker.create({ data: { shopId, ...data } });
}

async function update(id, data) {
  return db.worker.update({ where: { id }, data });
}

async function softDelete(id, deletedBy) {
  return db.worker.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy },
  });
}

async function upsertAttendance(workerId, date, data) {
  return db.attendance.upsert({
    where: { workerId_date: { workerId, date } },
    update: data,
    create: { workerId, date, ...data },
  });
}

async function createSalaryPayment(data) {
  return db.salaryPayment.create({ data });
}

async function updateSalaryPayment(id, data) {
  return db.salaryPayment.update({ where: { id }, data });
}

async function createSalaryAudit(data) {
  return db.salaryAudit.create({ data });
}

module.exports = {
  findMany,
  findById,
  create,
  update,
  softDelete,
  upsertAttendance,
  createSalaryPayment,
  updateSalaryPayment,
  createSalaryAudit,
};
