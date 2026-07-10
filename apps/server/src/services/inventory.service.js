/**
 * Inventory Service — products, stock entries (approval workflow), losses.
 */

const inventoryRepo = require("../repositories/inventory.repository");
const notifRepo = require("../repositories/notification.repository");
const { db } = require("../lib/prisma");
const { z } = require("zod");

const productSchema = z.object({
  name: z.string().min(1),
  unit: z.string().optional(),
  purchasePrice: z.number().nonnegative().optional(),
  sellingPrice: z.number().nonnegative().optional(),
  lowStockThreshold: z.number().nonnegative().optional(),
});

const batchSchema = z.object({
  quantity: z.number().positive(),
  purchasePrice: z.number().nonnegative(),
  expiryDate: z.coerce.date().optional(),
  batchCode: z.string().optional(),
});

const stockEntrySchema = z.object({
  productId: z.string().cuid(),
  batchId: z.string().cuid().optional(),
  type: z.enum(["PURCHASE", "ADJUSTMENT", "LOSS"]),
  quantity: z.number(),
  note: z.string().optional(),
});

const lossSchema = z.object({
  productId: z.string().cuid(),
  batchId: z.string().cuid().optional(),
  quantity: z.number().positive(),
  reason: z.enum(["EXPIRED", "DAMAGED", "THEFT", "OTHER"]),
  lossValue: z.number().nonnegative(),
});

async function listProducts(shopId, query) {
  return inventoryRepo.findProducts(shopId, query);
}

async function getProduct(id, shopId) {
  const p = await inventoryRepo.findProductById(id, shopId);
  if (!p) throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  return p;
}

async function createProduct(shopId, body, userId) {
  const data = productSchema.parse(body);
  return inventoryRepo.createProduct(shopId, { ...data, createdBy: userId });
}

async function updateProduct(id, shopId, body) {
  await getProduct(id, shopId);
  const data = productSchema.partial().parse(body);
  return inventoryRepo.updateProduct(id, data);
}

async function deleteProduct(id, shopId, userId) {
  await getProduct(id, shopId);
  return inventoryRepo.softDeleteProduct(id, userId);
}

async function addBatch(productId, shopId, body) {
  await getProduct(productId, shopId);
  const data = batchSchema.parse(body);
  return inventoryRepo.createBatch(productId, { ...data, currentStock: data.quantity });
}

async function submitStockEntry(shopId, body, userId) {
  const data = stockEntrySchema.parse(body);

  // PURCHASE entries auto-approve; ADJUSTMENT/LOSS require owner approval
  const status = data.type === "PURCHASE" ? "APPROVED" : "PENDING";

  const entry = await inventoryRepo.createStockEntry({
    ...data,
    shopId,
    recordedBy: userId,
    status,
  });

  if (status === "APPROVED" && data.batchId) {
    await inventoryRepo.updateBatchStock(data.batchId, data.quantity);
  }

  // Notify owners if pending
  if (status === "PENDING") {
    const owners = await db.shopMember.findMany({
      where: { shopId, role: "OWNER" },
      select: { userId: true },
    });
    await Promise.all(owners.map((o) =>
      notifRepo.create({
        shopId,
        userId: o.userId,
        type: "STOCK_PENDING",
        title: "Stock Entry Needs Approval",
        body: `A ${data.type} stock entry has been submitted and requires your approval.`,
        entityType: "StockEntry",
        entityId: entry.id,
      })
    ));
  }

  return entry;
}

async function approveStockEntry(entryId, shopId, userId, approved, reviewNote) {
  const entry = await db.stockEntry.findFirst({
    where: { id: entryId, product: { shopId } },
  });
  if (!entry) throw Object.assign(new Error("Stock entry not found"), { statusCode: 404 });
  if (entry.status !== "PENDING") throw Object.assign(new Error("Already processed"), { statusCode: 409 });

  const newStatus = approved ? "APPROVED" : "REJECTED";
  const updated = await inventoryRepo.updateStockEntry(entryId, {
    status: newStatus,
    reviewedBy: userId,
    reviewedAt: new Date(),
    reviewNote,
  });

  if (approved && entry.batchId) {
    await inventoryRepo.updateBatchStock(entry.batchId, entry.quantity);
  }

  return updated;
}

async function recordLoss(shopId, body, userId) {
  const data = lossSchema.parse(body);
  await getProduct(data.productId, shopId);

  const loss = await inventoryRepo.createLoss({ ...data, shopId, recordedBy: userId });

  if (data.batchId) {
    await inventoryRepo.updateBatchStock(data.batchId, -data.quantity);
  }

  return loss;
}

async function getPendingEntries(shopId) {
  return inventoryRepo.findPendingStockEntries(shopId);
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addBatch,
  submitStockEntry,
  approveStockEntry,
  recordLoss,
  getPendingEntries,
};
