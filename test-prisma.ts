import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['warn'], engineType: 'library' } as any);
console.log("Prisma initialized");
