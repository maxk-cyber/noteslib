"use client";

import { useCallback, useRef, useState } from "react";
import { CrowdBackdrop } from "@/components/crowd-backdrop";
import { DeleteButton } from "@/components/delete-button";
import { GraffitiCursor } from "@/components/graffiti-cursor";
import { GraffitiTitle } from "@/components/graffiti-title";
import { NoteHoverThumb } from "@/components/note-hover-thumb";
import { NoteUploadDialog } from "@/components/note-upload-dialog";
import { notePreview } from "@/lib/note-preview";

export type NoteItem = {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string | Date;
};

type NotesLibraryProps = {
  initialNotes: NoteItem[];
  fontClass: string;
};

export function NotesLibrary({ initialNotes, fontClass }: NotesLibraryProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const showcaseRef = useRef<HTMLElement>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/notes");
    if (!res.ok) return;
    const updated = await res.json();
    setNotes(updated);
  }, []);

  const activeNote = notes.find((note) => note.id === activeId) ?? null;
  const displayTitle = activeNote?.title.toUpperCase() ?? "NOTES";
  const isHovered = activeId !== null;

  const handleDelete = useCallback(async () => {
    if (!activeNote) return;

    const res = await fetch(`/api/notes/${activeNote.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to delete note");
    }

    setActiveId(null);
    await refresh();
  }, [activeNote, refresh]);

  const isPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

  return (
    <div className="flex h-screen flex-col bg-[#080808] text-white">
      <header className="relative z-30 flex shrink-0 items-center justify-between px-6 py-4">
        <span className="text-xs tracking-[0.25em] text-neutral-500 uppercase">
          Notes
        </span>
        {!isPages && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="text-xs tracking-[0.25em] text-neutral-500 uppercase transition-colors hover:text-emerald-400"
          >
            + Add Note
          </button>
        )}
      </header>

      <main
        ref={showcaseRef}
        className="relative flex flex-1 cursor-none flex-col items-center justify-center overflow-hidden"
      >
        <CrowdBackdrop />
        <GraffitiCursor active={isHovered} containerRef={showcaseRef} theme="green" />

        {notes.length === 0 ? (
          <div className="flex cursor-auto flex-col items-center gap-4 text-neutral-500">
            <span className="text-6xl">✎</span>
            <p className="text-lg">No notes yet</p>
            <p className="text-sm text-neutral-600">Add your first markdown note</p>
          </div>
        ) : (
          <>
            <div className="absolute top-[10%] z-20 flex h-[120px] w-full max-w-[90%] flex-wrap items-center justify-center md:max-w-none">
              {notes.map((note) => (
                <NoteHoverThumb
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  preview={notePreview(note.content)}
                  isActive={activeId === note.id}
                  onHover={() => setActiveId(note.id)}
                />
              ))}
            </div>

            <div
              className={`relative z-10 flex w-full max-w-full flex-col items-center gap-6 px-6 text-center ${fontClass}`}
            >
              <GraffitiTitle
                key={displayTitle}
                text={displayTitle}
                hovered={isHovered}
                theme="green"
              />
              {activeNote ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs tracking-[0.3em] text-neutral-500 uppercase">
                    {activeNote.author}
                  </p>
                  {!isPages && (
                    <DeleteButton
                      label="Delete note"
                      confirmMessage={`Delete "${activeNote.title}"? This cannot be undone.`}
                      onDelete={handleDelete}
                      accent="green"
                    />
                  )}
                </div>
              ) : (
                <p className="text-xs tracking-[0.3em] text-neutral-600 uppercase">
                  Hover a note · click to read
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {!isPages && (
        <NoteUploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
