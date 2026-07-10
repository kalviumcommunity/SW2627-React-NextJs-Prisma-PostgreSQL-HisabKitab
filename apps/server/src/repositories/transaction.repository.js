/**
 * Transaction Repository — all Prisma transaction queries.
 */

const { db } = require("../lib/prisma");

async function findMany(shopId, { cursor, limit = 20, contactId, type } = {}) {
  const where = {
    shopId,
    isDeleted: false,
    ...(contactId && { contactId }),
    ...(type && { type }),
  };

  const txns = await db.transaction.findMany({
    where,
    include: {
      contact: { select: { id: true, name: true, phone: true } },
      createdByUser: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  const hasNext = txns.length > limit;
  return {
    data: txns.slice(0, limit),
    nextCursor: hasNext ? txns[limit - 1].id : null,
  };
}

async function findById(id, shopId) {
  return db.transaction.findFirst({
    where: { id, shopId, isDeleted: false },
    include: {
      contact: { select: { id: true, name: true } },
      createdByUser: { select: { id: true, name: true } },
      audits: { orderBy: { changedAt: "desc" }, take: 10 },
    },
  });
}

async function create(shopId, data) {
  return db.transaction.create({
    data: { shopId, ...data },
    include: {
      contact: { select: { id: true, name: true } },
    },
  });
}

async function update(id, data) {
  return db.transaction.update({
    where: { id },
    data,
    include: {
      contact: { select: { id: true, name: true } },
    },
  });
}

async function softDelete(id, deletedBy) {
  return db.transaction.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy },
    select: { id: true },
  });
}

async function createAudit(data) {
  return db.transactionAudit.create({ data });
}

async function acquireLock(id, lockedBy) {
  return db.transaction.update({
    where: { id },
    data: { lockedBy, lockedAt: new Date() },
  });
}

async function releaseLock(id) {
  return db.transaction.update({
    where: { id },
    data: { lockedBy: null, lockedAt: null },
  });
}

module.exports = {
  findMany,
  findById,
  create,
  update,
  softDelete,
  createAudit,
  acquireLock,
  releaseLock,
};
