import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter } as any)
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
