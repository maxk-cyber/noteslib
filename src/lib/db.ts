import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { db: PrismaClient };

function createDb() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

function getDb() {
  const existing = globalForPrisma.db;

  // Recreate after schema changes — dev keeps a stale global Prisma client.
  if (existing?.note) {
    return existing;
  }

  const client = createDb();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.db = client;
  }
  return client;
}

export const db = getDb();
