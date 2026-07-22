import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  try {
    const member = await db.shopMember.findFirst();
    if (!member) throw new Error('No member');
    const user = { id: member.userId, activeShopId: member.shopId };
    
    const txType = 'YOU_GOT';
    const amountVal = 100;
    
    await db.$transaction(async (tx) => {
      let contact = await tx.contact.findFirst({
        where: { shopId: user.activeShopId, name: { equals: 'Test Party', mode: 'insensitive' }, isDeleted: false }
      });
      if (!contact) {
        contact = await tx.contact.create({
          data: { shopId: user.activeShopId, name: 'Test Party', balance: 0, createdBy: user.id }
        });
      }
      const balanceAdjustment = txType === 'YOU_GAVE' ? amountVal : -amountVal;
      await tx.contact.update({
        where: { id: contact.id },
        data: { balance: { increment: balanceAdjustment } }
      });
      await tx.transaction.create({
        data: {
          shopId: user.activeShopId, contactId: contact.id, amount: amountVal, type: txType, note: '',
          createdAt: new Date(), createdBy: user.id, balanceAfter: Number(contact.balance || 0) + balanceAdjustment
        }
      });
    });
    console.log('Success');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}
run();
