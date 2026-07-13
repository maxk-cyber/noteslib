"use client";

import { Highlighter, Paperclip } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { HighlightColorWheel } from "@/components/highlight-color-wheel";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  buildHighlightMarkClose,
  buildHighlightMarkOpen,
} from "@/lib/highlight-colors";
import {
  extractEmbeddedImages,
  extractEmbeddedVideos,
  fileToAttachmentMarkdown,
  filesFromClipboard,
  filesFromInput,
  insertTextAtCursor,
} from "@/lib/note-attachments";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const next =
    textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end);
  const cursorStart = start + before.length;
  const cursorEnd = cursorStart + selected.length;
  return { next, cursorStart, cursorEnd };
}

export function MarkdownEditor({
  value,
  onChange,
  className,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [highlightColor, setHighlightColor] = useState<string>(
    DEFAULT_HIGHLIGHT_COLOR,
  );
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const embeddedImages = useMemo(() => extractEmbeddedImages(value), [value]);
  const embeddedVideos = useMemo(() => extractEmbeddedVideos(value), [value]);

  const applyWrap = useCallback(
    (before: string, after: string, placeholder: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { next, cursorStart, cursorEnd } = wrapSelection(
        textarea,
        before,
        after,
        placeholder,
      );
      onChange(next);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [onChange],
  );

  const attachFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const textarea = textareaRef.current;
      if (!textarea) return;

      setAttaching(true);
      setAttachmentError(null);

      try {
        let current = value;
        let start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        for (const file of files) {
          const markdown = await fileToAttachmentMarkdown(file);
          const result = insertTextAtCursor(current, markdown, start, end);
          current = result.next;
          start = result.cursorStart;
        }

        onChange(current);
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start);
        });
      } catch (error) {
        setAttachmentError(
          error instanceof Error ? error.message : "Could not attach file.",
        );
      } finally {
        setAttaching(false);
      }
    },
    [onChange, value],
  );

  const highlight = useCallback(() => {
    applyWrap(
      buildHighlightMarkOpen(highlightColor),
      buildHighlightMarkClose(),
      "highlighted text",
    );
  }, [applyWrap, highlightColor]);

  const onPaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = filesFromClipboard(event.clipboardData);
      if (files.length === 0) return;
      event.preventDefault();
      void attachFiles(files);
    },
    [attachFiles],
  );

  const onFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = filesFromInput(event.target.files);
      void attachFiles(files);
      event.target.value = "";
    },
    [attachFiles],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
        <p className="mb-3 text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
          Highlight colour
        </p>
        <HighlightColorWheel
          value={highlightColor}
          onChange={setHighlightColor}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={highlight}
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase transition-colors"
          style={{
            borderColor: `${highlightColor}66`,
            backgroundColor: `${highlightColor}22`,
            color: highlightColor,
          }}
          title="Wrap selection in a persistent highlight"
        >
          <Highlighter className="h-3.5 w-3.5" />
          Highlight
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={attaching}
          className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-[10px] tracking-[0.2em] text-neutral-300 uppercase transition-colors hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-40"
          title="Attach image, video, or file"
        >
          <Paperclip className="h-3.5 w-3.5" />
          {attaching ? "Attaching…" : "Attach"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,*/*"
          multiple
          className="hidden"
          onChange={onFileInputChange}
        />

        <span className="text-[10px] tracking-wider text-neutral-600">
          Paste or attach images & video · preview below & in live panel
        </span>
      </div>

      {embeddedVideos.length > 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
          <p className="mb-3 text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
            Embedded videos
          </p>
          <div className="flex flex-wrap gap-3">
            {embeddedVideos.map((video, index) => (
              <figure
                key={`${video.src.slice(0, 48)}-${index}`}
                className="overflow-hidden rounded-xl border border-neutral-800 bg-black/40"
              >
                <video
                  src={video.src}
                  muted
                  playsInline
                  loop
                  autoPlay
                  className="aspect-video max-h-40 w-64 object-cover"
                />
                <figcaption className="px-2 py-1 text-[10px] text-neutral-500">
                  {video.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {embeddedImages.length > 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
          <p className="mb-3 text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
            Embedded images
          </p>
          <div className="flex flex-wrap gap-3">
            {embeddedImages.map((image, index) => (
              <figure
                key={`${image.src.slice(0, 48)}-${index}`}
                className="overflow-hidden rounded-xl border border-neutral-800 bg-black/40"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="max-h-48 max-w-full object-contain"
                />
                <figcaption className="px-2 py-1 text-[10px] text-neutral-500">
                  {image.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {attachmentError && (
        <p className="text-xs text-red-400">{attachmentError}</p>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPaste={onPaste}
        rows={18}
        className={
          className ??
          "h-[60vh] w-full cursor-text resize-none rounded-xl border border-neutral-800 bg-[#060606] p-4 font-mono text-sm leading-relaxed text-neutral-100 outline-none focus:border-emerald-500/40"
        }
      />
    </div>
  );
}
