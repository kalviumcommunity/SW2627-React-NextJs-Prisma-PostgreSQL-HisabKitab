import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  const user = await db.user.findUnique({
    where: { email: 'jatinrao7458@gmail.com' }
  });
  if (!user) {
    console.log('User not found');
    return;
  }
  
  const txs = await db.transaction.findMany({
    where: { createdBy: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log('Recent transactions for user:');
  console.log(JSON.stringify(txs, null, 2));
  
  await db.$disconnect();
}
run();
