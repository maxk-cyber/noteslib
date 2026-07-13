"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { GraffitiCursor } from "@/components/graffiti-cursor";
import { GraffitiTitle } from "@/components/graffiti-title";
import { MarkdownPreview } from "@/components/markdown-preview";

const DEFAULT_CURSOR_SIZE = 22;
const MIN_CURSOR_SIZE = 10;
const MAX_CURSOR_SIZE = 72;

type NoteReaderProps = {
  title: string;
  author: string;
  content: string;
  fontClass?: string;
};

export function NoteReader({
  title,
  author,
  content,
  fontClass,
}: NoteReaderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [cursorActive, setCursorActive] = useState(false);
  const [cursorSize, setCursorSize] = useState(DEFAULT_CURSOR_SIZE);
  const { scrollY } = useScroll();
  const hintOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  const handleCursorWheel = useCallback((event: React.WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    setCursorSize((value) =>
      Math.min(
        MAX_CURSOR_SIZE,
        Math.max(MIN_CURSOR_SIZE, value - event.deltaY * 0.04),
      ),
    );
  }, []);

  return (
    <div
      ref={viewportRef}
      onMouseEnter={() => setCursorActive(true)}
      onMouseLeave={() => setCursorActive(false)}
      onWheel={handleCursorWheel}
      className="min-h-screen cursor-none bg-[#080808] pt-16"
    >
      <GraffitiCursor
        active={cursorActive}
        containerRef={viewportRef}
        theme="green"
        sizePx={cursorSize}
      />

      <div className={`px-6 pt-10 pb-8 text-center ${fontClass ?? ""}`}>
        <GraffitiTitle
          text={title.toUpperCase()}
          hovered={cursorActive}
          variant="header"
          theme="green"
        />
        <p className="mt-4 text-xs tracking-[0.3em] text-neutral-500 uppercase">
          {author}
        </p>
        <motion.p
          style={{ opacity: hintOpacity }}
          className="mt-8 text-xs tracking-[0.3em] text-neutral-600 uppercase"
        >
          Scroll down
        </motion.p>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pb-24">
        <MarkdownPreview content={content} />
      </div>
    </div>
  );
}
