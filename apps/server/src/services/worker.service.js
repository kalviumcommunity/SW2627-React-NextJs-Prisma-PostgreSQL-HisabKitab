/**
 * Worker Service — worker management, attendance, salary.
 */

const workerRepo = require("../repositories/worker.repository");
const notifRepo = require("../repositories/notification.repository");
const { db } = require("../lib/prisma");
const { z } = require("zod");

const createWorkerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.string().optional(),
  salaryType: z.enum(["MONTHLY", "DAILY", "HOURLY"]).default("MONTHLY"),
  salaryAmount: z.number().positive(),
  joiningDate: z.coerce.date().optional(),
});

const attendanceSchema = z.object({
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "HOLIDAY"]),
  note: z.string().optional(),
});

const salarySchema = z.object({
  workerId: z.string().cuid(),
  amount: z.number().positive(),
  period: z.string(), // e.g. "2024-06"
  note: z.string().optional(),
});

async function listWorkers(shopId) {
  return workerRepo.findMany(shopId);
}

async function getWorker(id, shopId) {
  const worker = await workerRepo.findById(id, shopId);
  if (!worker) throw Object.assign(new Error("Worker not found"), { statusCode: 404 });
  return worker;
}

async function createWorker(shopId, body) {
  const data = createWorkerSchema.parse(body);
  return workerRepo.create(shopId, data);
}

async function updateWorker(id, shopId, body) {
  await getWorker(id, shopId);
  const data = createWorkerSchema.partial().parse(body);
  return workerRepo.update(id, data);
}

async function deleteWorker(id, shopId, userId) {
  await getWorker(id, shopId);
  return workerRepo.softDelete(id, userId);
}

async function markAttendance(workerId, shopId, body, userId) {
  await getWorker(workerId, shopId);
  const data = attendanceSchema.parse(body);
  return workerRepo.upsertAttendance(workerId, data.date, {
    status: data.status,
    note: data.note,
    markedBy: userId,
  });
}

async function recordSalaryPayment(shopId, body, userId) {
  const data = salarySchema.parse(body);
  await getWorker(data.workerId, shopId);

  const payment = await workerRepo.createSalaryPayment({
    workerId: data.workerId,
    amount: data.amount,
    period: data.period,
    note: data.note,
    paidBy: userId,
    status: "PENDING", // Requires Owner approval
  });

  // Notify all shop owners
  const owners = await db.shopMember.findMany({
    where: { shopId, role: "OWNER" },
    select: { userId: true },
  });

  await Promise.all(owners.map((o) =>
    notifRepo.create({
      shopId,
      userId: o.userId,
      type: "SALARY_SUBMITTED",
      title: "Salary Payment Submitted",
      body: `A salary payment of ₹${data.amount} for worker has been submitted for approval.`,
      entityType: "SalaryPayment",
      entityId: payment.id,
    })
  ));

  return payment;
}

async function approveSalaryPayment(paymentId, shopId, userId) {
  const payment = await db.salaryPayment.findFirst({
    where: { id: paymentId, worker: { shopId } },
  });
  if (!payment) throw Object.assign(new Error("Payment not found"), { statusCode: 404 });
  if (payment.status !== "PENDING") throw Object.assign(new Error("Payment already processed"), { statusCode: 409 });

  const approved = await workerRepo.updateSalaryPayment(paymentId, {
    status: "PAID",
    paidAt: new Date(),
  });

  await workerRepo.createSalaryAudit({
    salaryPaymentId: paymentId,
    action: "APPROVED",
    actorId: userId,
    note: "Approved by owner",
  });

  return approved;
}

module.exports = {
  listWorkers,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker,
  markAttendance,
  recordSalaryPayment,
  approveSalaryPayment,
};
