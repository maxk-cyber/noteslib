"use client";

import { NoteWorkspace } from "@/components/note-workspace";
import {
  isLocalNoteId,
  updateClientNote,
} from "@/lib/client-notes";

type NoteViewerProps = {
  noteId: string;
  title: string;
  author: string;
  content: string;
  titleColor?: string;
  fontClass?: string;
  pagesMode?: boolean;
};

export function NoteViewer({
  noteId,
  title,
  author,
  content,
  titleColor,
  fontClass,
  pagesMode = false,
}: NoteViewerProps) {
  const editable =
    !pagesMode || (pagesMode && isLocalNoteId(noteId));

  const handleSave = async (nextContent: string) => {
    if (pagesMode && isLocalNoteId(noteId)) {
      updateClientNote(noteId, { content: nextContent });
      return;
    }

    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: nextContent }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to save note");
    }
  };

  return (
    <NoteWorkspace
      noteId={noteId}
      title={title}
      author={author}
      content={content}
      titleColor={titleColor}
      fontClass={fontClass}
      editable={editable}
      onSave={editable ? handleSave : undefined}
    />
  );
}
