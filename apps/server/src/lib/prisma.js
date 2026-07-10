// Re-export the shared Prisma client singleton from packages/database
// All repositories MUST import db from here — never instantiate PrismaClient directly

const { db } = require("@hisab-kitab/database");

module.exports = { db };
