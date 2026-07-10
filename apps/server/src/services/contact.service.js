/**
 * Contact Service — business logic for contacts.
 * Calls contact.repository (and transaction.repository for balance rollups).
 */

const contactRepo = require("../repositories/contact.repository");
const { db } = require("../lib/prisma");
const { withContactLock } = require("../lib/with-contact-lock");
const { z } = require("zod");

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  contactType: z.enum(["CUSTOMER", "VENDOR", "BOTH"]).default("CUSTOMER"),
  openingBalance: z.number().default(0),
  openingBalanceAsOf: z.coerce.date().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

async function listContacts(shopId, query) {
  return contactRepo.findMany(shopId, query);
}

async function getContact(id, shopId) {
  const contact = await contactRepo.findById(id, shopId);
  if (!contact) throw Object.assign(new Error("Contact not found"), { statusCode: 404 });
  return contact;
}

async function createContact(shopId, body) {
  const data = createSchema.parse(body);

  // Check for duplicate phone in same shop
  if (data.phone) {
    const existing = await db.contact.findFirst({
      where: { shopId, phone: data.phone, isDeleted: false },
    });
    if (existing) throw Object.assign(new Error("A contact with this phone already exists"), { statusCode: 409 });
  }

  return contactRepo.create(shopId, {
    ...data,
    balance: data.openingBalance ?? 0,
  });
}

async function updateContact(id, shopId, body) {
  await getContact(id, shopId); // 404 guard
  const data = updateSchema.parse(body);
  return contactRepo.update(id, shopId, data);
}

async function deleteContact(id, shopId, userId) {
  await getContact(id, shopId);
  return contactRepo.softDelete(id, shopId, userId);
}

async function restoreContact(id, shopId) {
  const contact = await db.contact.findFirst({ where: { id, shopId, isDeleted: true } });
  if (!contact) throw Object.assign(new Error("Contact not found in trash"), { statusCode: 404 });
  return contactRepo.restore(id, shopId);
}

async function getTrashedContacts(shopId) {
  return contactRepo.findTrashed(shopId);
}

/**
 * Recalculate and update contact balance from all transactions.
 * Called after any transaction create/update/delete.
 */
async function recalculateBalance(contactId, shopId) {
  return withContactLock(contactId, async (tx) => {
    const result = await tx.transaction.aggregate({
      where: { contactId, shopId, isDeleted: false },
      _sum: { amount: true },
    });
    const contact = await tx.contact.findUnique({ where: { id: contactId } });
    const transactionSum = Number(result._sum.amount ?? 0);
    const newBalance = Number(contact.openingBalance ?? 0) + transactionSum;

    await tx.contact.update({
      where: { id: contactId },
      data: { balance: newBalance },
    });
    return newBalance;
  });
}

module.exports = {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  restoreContact,
  getTrashedContacts,
  recalculateBalance,
};
