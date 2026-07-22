import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
import { Decimal } from '@prisma/client/runtime/library';
console.log(Number(new Decimal('100')));
