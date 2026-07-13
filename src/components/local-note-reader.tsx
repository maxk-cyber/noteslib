"use client";

import { Bebas_Neue } from "next/font/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DeleteButton } from "@/components/delete-button";
import { NoteViewer } from "@/components/note-viewer";
import {
  deleteClientNote,
  getClientNote,
  isLocalNoteId,
} from "@/lib/client-notes";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

export function LocalNoteReader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [note, setNote] = useState(() =>
    id && isLocalNoteId(id) ? getClientNote(id) : null,
  );

  useEffect(() => {
    if (!id || !isLocalNoteId(id)) {
      setNote(null);
      return;
    }
    setNote(getClientNote(id));
  }, [id]);

  const handleDelete = useCallback(async () => {
    if (!note) return;
    deleteClientNote(note.id);
    router.push("/");
  }, [note, router]);

  if (!id || !isLocalNoteId(id)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080808] text-white">
        <p className="text-neutral-500">Note not found.</p>
        <Link href="/" className="text-xs tracking-[0.25em] text-emerald-400 uppercase">
          ← Notes
        </Link>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080808] text-white">
        <p className="text-neutral-500">This note is not in this browser.</p>
        <Link href="/" className="text-xs tracking-[0.25em] text-emerald-400 uppercase">
          ← Notes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xs tracking-[0.25em] text-neutral-500 uppercase transition-colors hover:text-white"
        >
          ← Notes
        </Link>
        <DeleteButton
          label="Delete note"
          confirmMessage={`Delete "${note.title}"? This cannot be undone.`}
          onDelete={handleDelete}
          accent="green"
        />
      </header>

      <NoteViewer
        noteId={note.id}
        title={note.title}
        author={note.author}
        content={note.content}
        fontClass={bebas.className}
        pagesMode
      />
    </div>
  );
}
