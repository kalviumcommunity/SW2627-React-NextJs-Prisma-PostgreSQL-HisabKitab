import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  const txs = await db.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(txs, null, 2));
  await db.$disconnect();
}
run();
