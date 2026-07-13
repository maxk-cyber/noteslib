import type { NoteItem } from "@/components/notes-library";

const STORAGE_KEY = "noteslib-client-notes";

export const LOCAL_NOTE_PREFIX = "local-";

export function isLocalNoteId(id: string) {
  return id.startsWith(LOCAL_NOTE_PREFIX);
}

function readAll(): NoteItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NoteItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(notes: NoteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function loadClientNotes(): NoteItem[] {
  return readAll().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getClientNote(id: string): NoteItem | null {
  return readAll().find((note) => note.id === id) ?? null;
}

export function saveClientNote(data: {
  title: string;
  author: string;
  content: string;
}): NoteItem {
  const note: NoteItem = {
    id: `${LOCAL_NOTE_PREFIX}${crypto.randomUUID()}`,
    title: data.title,
    author: data.author,
    content: data.content,
    createdAt: new Date().toISOString(),
  };

  writeAll([note, ...readAll()]);
  return note;
}

export function deleteClientNote(id: string) {
  writeAll(readAll().filter((note) => note.id !== id));
}
