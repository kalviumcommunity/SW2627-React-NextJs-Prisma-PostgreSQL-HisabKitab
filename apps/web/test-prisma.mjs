import { db } from "@hisab-kitab/database";

async function main() {
  try {
    const count = await db.contact.count();
    console.log("Count:", count);
  } catch (e) {
    console.error("Prisma error:", e);
  }
}

main();
