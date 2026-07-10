/**
 * Transaction Service — business logic for financial transactions.
 * Handles locking, audit trail, balance recalculation.
 */

const txnRepo = require("../repositories/transaction.repository");
const { recalculateBalance } = require("./contact.service");
const { db } = require("../lib/prisma");
const { z } = require("zod");

const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

const createSchema = z.object({
  contactId: z.string().cuid(),
  type: z.enum(["CREDIT", "DEBIT"]),
  amount: z.number().positive("Amount must be positive"),
  date: z.coerce.date(),
  note: z.string().optional(),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
});

const updateSchema = createSchema.partial().omit({ contactId: true });

async function listTransactions(shopId, query) {
  return txnRepo.findMany(shopId, query);
}

async function getTransaction(id, shopId) {
  const txn = await txnRepo.findById(id, shopId);
  if (!txn) throw Object.assign(new Error("Transaction not found"), { statusCode: 404 });
  return txn;
}

async function createTransaction(shopId, body, userId) {
  const data = createSchema.parse(body);

  // Verify contact belongs to shop
  const contact = await db.contact.findFirst({
    where: { id: data.contactId, shopId, isDeleted: false },
  });
  if (!contact) throw Object.assign(new Error("Contact not found"), { statusCode: 404 });

  const txn = await txnRepo.create(shopId, { ...data, createdBy: userId });
  await recalculateBalance(data.contactId, shopId);
  return txn;
}

async function acquireEditLock(id, shopId, userId) {
  const txn = await getTransaction(id, shopId);

  // Check if locked by someone else and TTL not expired
  if (txn.lockedBy && txn.lockedBy !== userId) {
    const lockedAt = new Date(txn.lockedAt).getTime();
    if (Date.now() - lockedAt < LOCK_TTL_MS) {
      throw Object.assign(
        new Error("Transaction is currently being edited by another user."),
        { statusCode: 409 }
      );
    }
  }

  await txnRepo.acquireLock(id, userId);
  return { locked: true, lockedBy: userId };
}

async function releaseEditLock(id, shopId, userId) {
  const txn = await getTransaction(id, shopId);
  if (txn.lockedBy && txn.lockedBy !== userId) {
    throw Object.assign(new Error("You do not hold the lock on this transaction."), { statusCode: 403 });
  }
  await txnRepo.releaseLock(id);
  return { locked: false };
}

async function updateTransaction(id, shopId, body, userId, shop) {
  const txn = await getTransaction(id, shopId);

  // Staff permission check (configurable)
  const isOwn = txn.createdBy === userId;
  if (shop.role !== "OWNER" && !shop.staffCanEditTransactions && !isOwn) {
    throw Object.assign(new Error("Staff cannot edit transactions in this shop."), { statusCode: 403 });
  }

  // Must hold the lock
  if (!txn.lockedBy || txn.lockedBy !== userId) {
    throw Object.assign(new Error("Acquire an edit lock before updating."), { statusCode: 409 });
  }

  const data = updateSchema.parse(body);
  const before = { amount: txn.amount, type: txn.type, note: txn.note, date: txn.date };

  const updated = await txnRepo.update(id, { ...data, lockedBy: null, lockedAt: null });

  // Write audit trail
  await txnRepo.createAudit({
    transactionId: id,
    changedBy: userId,
    before: JSON.stringify(before),
    after: JSON.stringify(data),
  });

  await recalculateBalance(txn.contactId, shopId);
  return updated;
}

async function deleteTransaction(id, shopId, userId, shop) {
  const txn = await getTransaction(id, shopId);

  const isOwn = txn.createdBy === userId;
  if (shop.role !== "OWNER" && !shop.staffCanDeleteTransactions && !isOwn) {
    throw Object.assign(new Error("Staff cannot delete transactions in this shop."), { statusCode: 403 });
  }

  await txnRepo.softDelete(id, userId);
  await recalculateBalance(txn.contactId, shopId);
  return { deleted: true };
}

module.exports = {
  listTransactions,
  getTransaction,
  createTransaction,
  acquireEditLock,
  releaseEditLock,
  updateTransaction,
  deleteTransaction,
};
