/**
 * Contact Repository — only place Prisma contact queries live.
 * Services call these; nothing else imports db directly for contacts.
 */

const { db } = require("../lib/prisma");

const DEFAULT_SELECT = {
  id: true,
  shopId: true,
  name: true,
  phone: true,
  email: true,
  contactType: true,
  balance: true,
  openingBalance: true,
  openingBalanceAsOf: true,
  notes: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
};

async function findMany(shopId, { cursor, limit = 20, search, contactType } = {}) {
  const where = {
    shopId,
    isDeleted: false,
    ...(contactType && { contactType }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    }),
  };

  const contacts = await db.contact.findMany({
    where,
    select: DEFAULT_SELECT,
    orderBy: { name: "asc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  const hasNext = contacts.length > limit;
  return {
    data: contacts.slice(0, limit),
    nextCursor: hasNext ? contacts[limit - 1].id : null,
  };
}

async function findById(id, shopId) {
  return db.contact.findFirst({
    where: { id, shopId, isDeleted: false },
    select: DEFAULT_SELECT,
  });
}

async function create(shopId, data) {
  return db.contact.create({
    data: { shopId, ...data },
    select: DEFAULT_SELECT,
  });
}

async function update(id, shopId, data) {
  return db.contact.update({
    where: { id },
    data,
    select: DEFAULT_SELECT,
  });
}

async function softDelete(id, shopId, deletedBy) {
  return db.contact.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy },
    select: { id: true },
  });
}

async function restore(id, shopId) {
  return db.contact.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null, deletedBy: null },
    select: DEFAULT_SELECT,
  });
}

async function findTrashed(shopId) {
  return db.contact.findMany({
    where: { shopId, isDeleted: true },
    select: DEFAULT_SELECT,
    orderBy: { deletedAt: "desc" },
  });
}

module.exports = {
  findMany,
  findById,
  create,
  update,
  softDelete,
  restore,
  findTrashed,
};
