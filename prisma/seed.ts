import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

async function main() {
  const removed = await db.note.deleteMany({
    where: { title: "Welcome" },
  });

  if (removed.count > 0) {
    console.log(`Removed ${removed.count} Welcome note(s).`);
  } else {
    console.log("No Welcome note to remove.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
