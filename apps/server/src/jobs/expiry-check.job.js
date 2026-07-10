/**
 * Expiry Check Job
 *
 * Called daily by cron-job.org via POST /api/cron/expiry-check
 * with the CRON_SECRET header.
 *
 * For each shop with active products:
 *   1. Find all batches expiring within Shop.expiryAlertDays
 *   2. Create one notification per expiring batch (no duplicates)
 */

const inventoryRepo = require("../repositories/inventory.repository");
const notifRepo = require("../repositories/notification.repository");
const { db } = require("../lib/prisma");

async function handleExpiryCheck() {
  console.log("[Cron] Starting expiry check...");

  // Get all shops with their expiryAlertDays setting
  const shops = await db.shop.findMany({
    select: { id: true, expiryAlertDays: true },
  });

  let totalNotifications = 0;
  let totalBatches = 0;

  for (const shop of shops) {
    const alertDays = shop.expiryAlertDays ?? 3;
    const expiringBatches = await inventoryRepo.findExpiringBatches(shop.id, alertDays);
    totalBatches += expiringBatches.length;

    for (const batch of expiringBatches) {
      // Check if notification already created today for this batch
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const alreadyNotified = await db.notification.findFirst({
        where: {
          shopId: shop.id,
          entityType: "ProductBatch",
          entityId: batch.id,
          createdAt: { gte: today },
        },
      });

      if (alreadyNotified) continue; // No duplicate

      // Notify all owners of this shop
      const owners = await db.shopMember.findMany({
        where: { shopId: shop.id, role: "OWNER" },
        select: { userId: true },
      });

      const expiryStr = batch.expiryDate
        ? new Date(batch.expiryDate).toLocaleDateString("en-IN")
        : "Unknown";

      await Promise.all(owners.map((o) =>
        notifRepo.create({
          shopId: shop.id,
          userId: o.userId,
          type: "EXPIRY_ALERT",
          title: "Product Expiring Soon",
          body: `${batch.product.name} (${batch.currentStock} units) expires on ${expiryStr}.`,
          entityType: "ProductBatch",
          entityId: batch.id,
        })
      ));

      totalNotifications += owners.length;
    }
  }

  const summary = {
    shopsChecked: shops.length,
    batchesFound: totalBatches,
    notificationsSent: totalNotifications,
    checkedAt: new Date().toISOString(),
  };

  console.log("[Cron] Expiry check complete:", summary);
  return summary;
}

module.exports = { handleExpiryCheck };
