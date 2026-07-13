import { db } from "@/lib/db";
import type { CreateNoteInput } from "@/lib/validation/note.schema";

export async function listNotes() {
  return db.note.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getNote(id: string) {
  return db.note.findUnique({ where: { id } });
}

export async function createNote(input: CreateNoteInput) {
  return db.note.create({
    data: {
      title: input.title,
      author: input.author,
      content: input.content.trim(),
      icon: input.icon,
    },
  });
}

export async function deleteNote(id: string) {
  const note = await db.note.findUnique({ where: { id } });
  if (!note) return null;
  await db.note.delete({ where: { id } });
  return note;
}
