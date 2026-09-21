import { NextResponse } from 'next/server';
import { db } from '@hisab-kitab/database';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shopId, batchId, pageId, reviewedData, userId } = body;
    
    // In a real scenario, use session.user.id
    let actualUserId = userId || "placeholder_user_id";

    if (!shopId || !reviewedData || !reviewedData.contactName) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // This operation should be run in a transaction for safety
    const result = await db.$transaction(async (tx: any) => {
      // Validate user
      if (actualUserId === "placeholder_user_id") {
        const user = await tx.user.findFirst();
        if (!user) {
          const newUser = await tx.user.create({
            data: { email: "demo2@example.com", name: "Demo User 2", preferredLanguage: "en" }
          });
          actualUserId = newUser.id;
        } else {
          actualUserId = user.id;
        }
      }
      // Validate shop
      let shop = await tx.shop.findUnique({ where: { id: shopId } });
      if (!shop) {
        shop = await tx.shop.findFirst();
        if (!shop) {
          shop = await tx.shop.create({
            data: { name: "Demo Shop for Khata Import", createdBy: actualUserId }
          });
        }
        shopId = shop.id;
      }

      // 1. Check if contact exists (simple match by name for MVP, ideally by phone)
      let contact = await tx.contact.findFirst({
        where: { shopId, name: reviewedData.contactName }
      });

      if (!contact) {
        contact = await tx.contact.create({
          data: {
            shopId,
            name: reviewedData.contactName,
            createdBy: actualUserId,
            balance: 0,
            openingBalance: reviewedData.finalBalance || 0
          }
        });
      }

      // 2. Add Transactions
      const transactions = reviewedData.transactions || [];
      let currentBalance = Number(contact.balance);

      for (const t of transactions) {
        const amount = Number(t.amount) || 0;
        
        // You Gave (Debit) increases what they owe us
        // You Got (Credit) decreases what they owe us
        if (t.type === 'YOU_GAVE') {
          currentBalance += amount;
        } else if (t.type === 'YOU_GOT') {
          currentBalance -= amount;
        }

        await tx.transaction.create({
          data: {
            shopId,
            contactId: contact.id,
            type: t.type,
            amount,
            note: t.note || "Paper Khata Import",
            balanceAfter: currentBalance,
            createdBy: actualUserId
          }
        });
      }

      // 3. Update Contact Balance
      await tx.contact.update({
        where: { id: contact.id },
        data: { balance: currentBalance }
      });

      // 4. Update Batch and Page status
      if (pageId) {
        await tx.paperImportPage.update({
          where: { id: pageId },
          data: { 
            status: 'REVIEWED',
            resultingContactId: contact.id,
            reviewedBy: actualUserId,
            reviewedAt: new Date()
          }
        });
      }

      if (batchId) {
        await tx.paperImportBatch.update({
          where: { id: batchId },
          data: { status: 'COMMITTED' }
        });
      }

      return { contactId: contact.id, balance: currentBalance };
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Commit route error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
