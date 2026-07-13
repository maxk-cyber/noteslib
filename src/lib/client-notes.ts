import type { NoteItem } from "@/components/notes-library";
import { DEFAULT_TITLE_COLOR, resolveTitleColor } from "@/lib/note-colors";
import { DEFAULT_NOTE_ICON, resolveNoteIconName } from "@/lib/note-icons";

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
    if (!Array.isArray(parsed)) return [];
    return parsed.map((note) => ({
      ...note,
      icon: resolveNoteIconName(note.icon),
      titleColor: resolveTitleColor(note.titleColor),
    }));
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
  icon?: string;
  titleColor?: string;
}): NoteItem {
  const note: NoteItem = {
    id: `${LOCAL_NOTE_PREFIX}${crypto.randomUUID()}`,
    title: data.title,
    author: data.author,
    content: data.content,
    icon: resolveNoteIconName(data.icon),
    titleColor: resolveTitleColor(data.titleColor),
    createdAt: new Date().toISOString(),
  };

  writeAll([note, ...readAll()]);
  return note;
}

export function deleteClientNote(id: string) {
  writeAll(readAll().filter((note) => note.id !== id));
}

export function updateClientNote(
  id: string,
  data: Partial<Pick<NoteItem, "title" | "author" | "content" | "icon" | "titleColor">>,
) {
  const notes = readAll();
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) return null;

  const updated: NoteItem = {
    ...notes[index],
    ...data,
    icon: data.icon ? resolveNoteIconName(data.icon) : notes[index].icon,
    titleColor: data.titleColor
      ? resolveTitleColor(data.titleColor)
      : notes[index].titleColor,
  };

  notes[index] = updated;
  writeAll(notes);
  return updated;
}
