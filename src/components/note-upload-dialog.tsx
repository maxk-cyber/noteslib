"use client";

import { useCallback, useState, type FormEvent } from "react";

type NoteUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function NoteUploadDialog({
  open,
  onClose,
  onSaved,
}: NoteUploadDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setSaving(true);

      try {
        const form = e.currentTarget;
        const formData = new FormData(form);

        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.get("title"),
            author: formData.get("author"),
            content: formData.get("content"),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to save note");

        form.reset();
        onSaved();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save note");
      } finally {
        setSaving(false);
      }
    },
    [onClose, onSaved],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Add Note</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs tracking-wider text-neutral-500 uppercase">
              Title
            </span>
            <input
              name="title"
              required
              className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-neutral-600"
              placeholder="Note title"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs tracking-wider text-neutral-500 uppercase">
              Author
            </span>
            <input
              name="author"
              required
              className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-neutral-600"
              placeholder="Your name"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs tracking-wider text-neutral-500 uppercase">
              Markdown
            </span>
            <textarea
              name="content"
              required
              rows={14}
              className="resize-y rounded border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm leading-relaxed text-white outline-none focus:border-neutral-600"
              placeholder={`# Heading\n\nThis is **bold** and *italic*.\n\n<span class="text-emerald-400">Colored text</span>\n<span class="text-yellow-400">Yellow highlight</span>\n<span class="text-violet-400">Purple accent</span>`}
            />
          </label>

          <p className="text-xs leading-relaxed text-neutral-600">
            Supports markdown, colored HTML spans, and mermaid diagrams inside{" "}
            <code className="text-neutral-500">```mermaid</code> fences. Notes
            open in preview mode when you read them.
          </p>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded bg-white px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Note"}
          </button>
        </form>
      </div>
    </div>
  );
}
