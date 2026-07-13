import { db } from "@/lib/db";
import type { CreateNoteInput, UpdateNoteInput } from "@/lib/validation/note.schema";

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

export async function updateNote(id: string, input: UpdateNoteInput) {
  const existing = await db.note.findUnique({ where: { id } });
  if (!existing) return null;

  return db.note.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.author !== undefined ? { author: input.author } : {}),
      ...(input.content !== undefined ? { content: input.content.trim() } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
    },
  });
}

export async function deleteNote(id: string) {
  const note = await db.note.findUnique({ where: { id } });
  if (!note) return null;
  await db.note.delete({ where: { id } });
  return note;
}
