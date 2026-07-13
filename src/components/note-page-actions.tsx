"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { DeleteButton } from "@/components/delete-button";

type NotePageActionsProps = {
  noteId: string;
  title: string;
};

export function NotePageActions({ noteId, title }: NotePageActionsProps) {
  const router = useRouter();

  const handleDelete = useCallback(async () => {
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to delete note");
    }
    router.push("/");
    router.refresh();
  }, [noteId, router]);

  return (
    <DeleteButton
      label="Delete note"
      confirmMessage={`Delete "${title}"? This cannot be undone.`}
      onDelete={handleDelete}
      accent="green"
    />
  );
}
