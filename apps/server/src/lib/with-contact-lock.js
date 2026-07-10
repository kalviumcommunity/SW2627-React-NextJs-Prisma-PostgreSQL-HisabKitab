/**
 * Row-level locking utility for Contact operations.
 *
 * Wraps a callback in a Prisma $transaction that first does a
 * SELECT ... FOR UPDATE on the Contact row, preventing concurrent
 * writes (balance updates, transaction edits) from racing.
 *
 * Usage:
 *   const result = await withContactLock(contactId, async (tx) => {
 *     // all db operations inside use the same transaction
 *     return tx.contact.update({ ... });
 *   });
 */

const { db } = require("./prisma");

/**
 * @param {string} contactId
 * @param {(tx: import('@prisma/client').PrismaClient) => Promise<any>} callback
 */
async function withContactLock(contactId, callback) {
  return db.$transaction(async (tx) => {
    // Lock the contact row for the duration of this transaction
    await tx.$queryRaw`SELECT id FROM "Contact" WHERE id = ${contactId} FOR UPDATE`;
    return callback(tx);
  });
}

module.exports = { withContactLock };
