"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Grid3x3,
  Maximize2,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GraffitiCursor } from "@/components/graffiti-cursor";
import { GraffitiTitle } from "@/components/graffiti-title";
import { MarkdownPreview } from "@/components/markdown-preview";
import { SectionHeaderShowcase } from "@/components/section-header-showcase";
import { PaginationBar } from "@/components/pagination-bar";
import { SectionThumb } from "@/components/section-thumb";
import { notePreview } from "@/lib/note-preview";
import {
  assembleNoteSections,
  paginate,
  parseNoteSections,
  updateSectionRaw,
  type NoteSection,
} from "@/lib/note-sections";

const SECTIONS_PER_PAGE = 6;
const STRIP_PAGE_SIZE = 8;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.25;

type WorkspaceMode = "overview" | "focus" | "edit";

type NoteWorkspaceProps = {
  noteId: string;
  title: string;
  author: string;
  content: string;
  fontClass?: string;
  editable?: boolean;
  onSave?: (content: string) => Promise<void>;
};

export function NoteWorkspace({
  noteId,
  title,
  author,
  content,
  fontClass,
  editable = false,
  onSave,
}: NoteWorkspaceProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<NoteSection[]>(() =>
    parseNoteSections(content),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [stripPage, setStripPage] = useState(1);
  const [mode, setMode] = useState<WorkspaceMode>("focus");
  const [zoom, setZoom] = useState(1);
  const [draftRaw, setDraftRaw] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cursorActive, setCursorActive] = useState(false);
  const [editHover, setEditHover] = useState(false);
  const [stripHovered, setStripHovered] = useState(false);
  const [sectionEngaged, setSectionEngaged] = useState(false);

  useEffect(() => {
    setSections(parseNoteSections(content));
    setActiveIndex(0);
    setPage(1);
    setStripPage(1);
    setSectionEngaged(false);
    setDirty(false);
  }, [content, noteId]);

  const activeSection = sections[activeIndex] ?? sections[0];
  const pagedSections = useMemo(
    () => paginate(sections, page, SECTIONS_PER_PAGE),
    [sections, page],
  );
  const pagedStrip = useMemo(
    () => paginate(sections, stripPage, STRIP_PAGE_SIZE),
    [sections, stripPage],
  );

  useEffect(() => {
    if (!activeSection) return;
    setDraftRaw(activeSection.raw);
  }, [activeSection?.id, activeSection?.raw]);

  useEffect(() => {
    const stripIndex = pagedStrip.items.findIndex(
      (section) => section.id === activeSection?.id,
    );
    if (stripIndex === -1 && activeIndex >= 0) {
      setStripPage(Math.floor(activeIndex / STRIP_PAGE_SIZE) + 1);
    }
  }, [activeIndex, activeSection?.id, pagedStrip.items]);

  const selectSection = useCallback((index: number) => {
    setActiveIndex(index);
    setSectionEngaged(true);
    setMode((current) => (current === "overview" ? "focus" : current));
    setZoom(1);
  }, []);

  const handleStripPageChange = useCallback(
    (nextPage: number) => {
      setStripPage(nextPage);
      const index = (nextPage - 1) * STRIP_PAGE_SIZE;
      if (sections[index]) selectSection(index);
    },
    [sections, selectSection],
  );

  const handleContentPageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      const index = (nextPage - 1) * SECTIONS_PER_PAGE;
      if (sections[index]) selectSection(index);
    },
    [sections, selectSection],
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (mode !== "focus") return;
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom((value) =>
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value - event.deltaY * 0.002)),
      );
    },
    [mode],
  );

  const applySectionDraft = useCallback(() => {
    if (!activeSection) return;
    const nextSections = updateSectionRaw(sections, activeSection.id, draftRaw);
    setSections(nextSections);
    setDirty(true);
    setMode("focus");
  }, [activeSection, draftRaw, sections]);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(assembleNoteSections(sections));
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [onSave, sections]);

  if (!activeSection) return null;

  return (
    <div
      ref={viewportRef}
      onMouseEnter={() => setCursorActive(true)}
      onMouseLeave={() => setCursorActive(false)}
      className="min-h-screen cursor-none bg-[#080808] pt-16 text-white"
    >
      <GraffitiCursor
        active={cursorActive && !(mode === "edit" && editHover)}
        containerRef={viewportRef}
        theme="green"
        size={mode === "edit" ? "tiny" : "small"}
      />

      <div className={`px-6 pt-8 pb-4 text-center ${fontClass ?? ""}`}>
        <GraffitiTitle
          text={title.toUpperCase()}
          hovered={cursorActive}
          variant="header"
          theme="green"
        />
        <p className="mt-3 text-xs tracking-[0.3em] text-neutral-500 uppercase">
          {author}
        </p>
      </div>

      <div className="px-4 pb-2 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div
            className="mb-3 flex min-h-[120px] items-center justify-center gap-1 overflow-x-auto"
            onMouseEnter={() => setStripHovered(true)}
            onMouseLeave={() => setStripHovered(false)}
          >
            {pagedStrip.items.map((section) => {
              const index = sections.findIndex((item) => item.id === section.id);
              return (
                <SectionThumb
                  key={section.id}
                  index={index}
                  title={section.title}
                  preview={notePreview(section.body)}
                  isActive={index === activeIndex}
                  onSelect={() => selectSection(index)}
                />
              );
            })}
          </div>
          {sections.length > STRIP_PAGE_SIZE && (
            <PaginationBar
              page={stripPage}
              totalPages={pagedStrip.totalPages}
              onPageChange={handleStripPageChange}
              label="Sections"
            />
          )}
        </div>

        <SectionHeaderShowcase
          defaultText={title}
          sectionText={activeSection.title}
          showSection={sectionEngaged || stripHovered}
          active={stripHovered}
        />
      </div>

      <div className="sticky top-16 z-40 border-b border-neutral-900/80 bg-[#080808]/95 px-4 py-3 backdrop-blur-sm md:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(
              [
                ["overview", Grid3x3, "Grid"],
                ["focus", Maximize2, "Focus"],
                ["edit", Pencil, "Edit"],
              ] as const
            ).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                disabled={value === "edit" && !editable}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase transition-colors ${
                  mode === value
                    ? "border-emerald-400/50 bg-emerald-950/40 text-emerald-300"
                    : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white"
                } disabled:opacity-30`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {mode === "focus" && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setZoom((value) => Math.max(MIN_ZOOM, value - 0.15))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:text-white"
                  aria-label="Zoom out"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-12 text-center text-[10px] tracking-widest text-neutral-500">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setZoom((value) => Math.min(MAX_ZOOM, value + 0.15))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:text-white"
                  aria-label="Zoom in"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:text-white"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </>
            )}

            {editable && onSave && (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!dirty || saving}
                className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-[10px] tracking-[0.2em] text-emerald-300 uppercase transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving…" : "Save"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 md:px-6">
        <AnimatePresence mode="wait">
          {mode === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pagedSections.items.map((section) => {
                  const index = sections.findIndex(
                    (item) => item.id === section.id,
                  );
                  return (
                    <motion.button
                      key={section.id}
                      type="button"
                      layout
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectSection(index)}
                      className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 text-left ring-1 ring-emerald-500/10 transition-shadow hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.45)]"
                    >
                      <p className="text-[10px] tracking-[0.3em] text-emerald-400/80 uppercase">
                        Section {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 text-lg font-medium text-white">
                        {section.title}
                      </h3>
                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-neutral-400">
                        {notePreview(section.body) || "Empty section"}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
              <PaginationBar
                page={pagedSections.page}
                totalPages={pagedSections.totalPages}
                onPageChange={handleContentPageChange}
                label="Pages"
              />
            </motion.div>
          )}

          {mode === "focus" && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onWheel={handleWheel}
              className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/50 p-4 md:p-8"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-emerald-400/80 uppercase">
                    Section {String(activeIndex + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-2xl font-medium text-white">
                    {activeSection.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((index) => Math.max(0, index - 1))
                    }
                    disabled={activeIndex <= 0}
                    className="rounded-full border border-neutral-800 px-3 py-1 text-[10px] tracking-widest text-neutral-400 uppercase disabled:opacity-30"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((index) =>
                        Math.min(sections.length - 1, index + 1),
                      )
                    }
                    disabled={activeIndex >= sections.length - 1}
                    className="rounded-full border border-neutral-800 px-3 py-1 text-[10px] tracking-widest text-neutral-400 uppercase disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>

              <motion.div
                animate={{ scale: zoom }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="origin-top"
              >
                <MarkdownPreview content={activeSection.raw} />
              </motion.div>
            </motion.div>
          )}

          {mode === "edit" && editable && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              onMouseEnter={() => setEditHover(true)}
              onMouseLeave={() => setEditHover(false)}
              className="grid cursor-auto gap-4 lg:grid-cols-2"
            >
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 cursor-auto">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase">
                    Edit section
                  </p>
                  <button
                    type="button"
                    onClick={applySectionDraft}
                    className="rounded-full border border-emerald-500/40 px-3 py-1 text-[10px] tracking-widest text-emerald-300 uppercase"
                  >
                    Apply
                  </button>
                </div>
                <textarea
                  value={draftRaw}
                  onChange={(event) => setDraftRaw(event.target.value)}
                  rows={18}
                  className="h-[60vh] w-full cursor-text resize-none rounded-xl border border-neutral-800 bg-[#060606] p-4 font-mono text-sm leading-relaxed text-neutral-100 outline-none focus:border-emerald-500/40"
                />
              </div>
              <div className="overflow-auto rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 cursor-auto">
                <p className="mb-3 text-[10px] tracking-[0.3em] text-neutral-500 uppercase">
                  Live preview
                </p>
                <MarkdownPreview content={draftRaw} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
