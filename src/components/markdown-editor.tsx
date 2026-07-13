"use client";

import { Highlighter } from "lucide-react";
import { useCallback, useRef } from "react";

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

  const highlight = useCallback(() => {
    applyWrap(
      '<mark class="bg-yellow-400/35 text-yellow-100 px-0.5 rounded">',
      "</mark>",
      "highlighted text",
    );
  }, [applyWrap]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={highlight}
          className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-950/30 px-3 py-1.5 text-[10px] tracking-[0.2em] text-yellow-200 uppercase transition-colors hover:border-yellow-400/50"
          title="Wrap selection in a persistent highlight"
        >
          <Highlighter className="h-3.5 w-3.5" />
          Highlight
        </button>
        <span className="text-[10px] tracking-wider text-neutral-600">
          Saved in markdown when you Apply / Save
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={18}
        className={
          className ??
          "h-[60vh] w-full cursor-text resize-none rounded-xl border border-neutral-800 bg-[#060606] p-4 font-mono text-sm leading-relaxed text-neutral-100 outline-none focus:border-emerald-500/40"
        }
      />
    </div>
  );
}
