/**
 * Shop Repository — shop settings, ShopMember management.
 */

const { db } = require("../lib/prisma");

async function findById(shopId) {
  return db.shop.findUnique({
    where: { id: shopId },
    include: {
      shopMembers: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
}

async function updateSettings(shopId, data) {
  return db.shop.update({ where: { id: shopId }, data });
}

async function findMembers(shopId) {
  return db.shopMember.findMany({
    where: { shopId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

async function addMember(shopId, userId, role = "STAFF") {
  return db.shopMember.create({ data: { shopId, userId, role } });
}

async function updateMemberRole(shopId, userId, role) {
  return db.shopMember.update({
    where: { shopId_userId: { shopId, userId } },
    data: { role },
  });
}

async function removeMember(shopId, userId) {
  return db.shopMember.delete({
    where: { shopId_userId: { shopId, userId } },
  });
}

async function countOwners(shopId) {
  return db.shopMember.count({ where: { shopId, role: "OWNER" } });
}

module.exports = {
  findById,
  updateSettings,
  findMembers,
  addMember,
  updateMemberRole,
  removeMember,
  countOwners,
};
