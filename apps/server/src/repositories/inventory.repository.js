/**
 * Inventory Repository — products, batches, stock entries, losses.
 */

const { db } = require("../lib/prisma");

async function findProducts(shopId, { search, cursor, limit = 20 } = {}) {
  const where = {
    shopId,
    isDeleted: false,
    ...(search && { name: { contains: search, mode: "insensitive" } }),
  };

  const products = await db.product.findMany({
    where,
    include: {
      batches: {
        where: { currentStock: { gt: 0 } },
        orderBy: { expiryDate: "asc" },
      },
    },
    orderBy: { name: "asc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  const hasNext = products.length > limit;
  return {
    data: products.slice(0, limit),
    nextCursor: hasNext ? products[limit - 1].id : null,
  };
}

async function findProductById(id, shopId) {
  return db.product.findFirst({
    where: { id, shopId, isDeleted: false },
    include: {
      batches: { orderBy: { expiryDate: "asc" } },
      stockEntries: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { recordedByUser: { select: { id: true, name: true } } },
      },
      losses: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

async function createProduct(shopId, data) {
  return db.product.create({ data: { shopId, ...data } });
}

async function updateProduct(id, data) {
  return db.product.update({ where: { id }, data });
}

async function softDeleteProduct(id, deletedBy) {
  return db.product.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy },
  });
}

async function createBatch(productId, data) {
  return db.productBatch.create({ data: { productId, ...data } });
}

async function updateBatchStock(batchId, delta) {
  return db.productBatch.update({
    where: { id: batchId },
    data: { currentStock: { increment: delta } },
  });
}

async function createStockEntry(data) {
  return db.stockEntry.create({ data });
}

async function updateStockEntry(id, data) {
  return db.stockEntry.update({ where: { id }, data });
}

async function findPendingStockEntries(shopId) {
  return db.stockEntry.findMany({
    where: { product: { shopId }, status: "PENDING" },
    include: {
      product: { select: { id: true, name: true } },
      recordedByUser: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function createLoss(data) {
  return db.loss.create({ data });
}

async function findExpiringBatches(shopId, withinDays) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + withinDays);

  return db.productBatch.findMany({
    where: {
      product: { shopId, isDeleted: false },
      expiryDate: { lte: threshold, gte: new Date() },
      currentStock: { gt: 0 },
    },
    include: { product: { select: { id: true, name: true, shopId: true } } },
  });
}

module.exports = {
  findProducts,
  findProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  createBatch,
  updateBatchStock,
  createStockEntry,
  updateStockEntry,
  findPendingStockEntries,
  createLoss,
  findExpiringBatches,
};
