/**
 * Notification Repository
 */

const { db } = require("../lib/prisma");

async function findMany(shopId, userId, { limit = 30, unreadOnly = false } = {}) {
  return db.notification.findMany({
    where: {
      shopId,
      userId,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

async function create(data) {
  return db.notification.create({ data });
}

async function markRead(id, userId) {
  return db.notification.updateMany({
    where: { id, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

async function markAllRead(shopId, userId) {
  return db.notification.updateMany({
    where: { shopId, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

async function countUnread(shopId, userId) {
  return db.notification.count({
    where: { shopId, userId, isRead: false },
  });
}

module.exports = { findMany, create, markRead, markAllRead, countUnread };
