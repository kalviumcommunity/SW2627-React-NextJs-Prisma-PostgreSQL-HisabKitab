import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  const user = await db.user.findUnique({
    where: { email: 'jatinrao7458@gmail.com' },
    include: { shopMembers: true }
  });
  console.log(JSON.stringify(user?.shopMembers, null, 2));
  await db.$disconnect();
}
run();
