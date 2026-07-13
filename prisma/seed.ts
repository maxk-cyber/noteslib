import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

const DEMO_NOTES = [
  {
    title: "Welcome",
    author: "Noteslib",
    icon: "sparkles",
    content: `# Welcome to Noteslib

Write in **markdown**. Read in *preview*.

<span class="text-emerald-400">Green accents</span> · <span class="text-yellow-400">yellow highlights</span> · <span class="text-violet-400">purple notes</span>

## Mermaid example

\`\`\`mermaid
flowchart LR
  WRITE[Write markdown] --> PREVIEW[Preview mode]
  PREVIEW --> READ[Scroll to read]
\`\`\`

> Hover thumbnails on the home page. Click to open a note.`,
  },
];

async function main() {
  const existing = await db.note.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} note(s). Skipping seed.`);
    return;
  }

  for (const note of DEMO_NOTES) {
    await db.note.create({ data: note });
    console.log(`  + ${note.title}`);
  }

  console.log("Done — demo note added.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
