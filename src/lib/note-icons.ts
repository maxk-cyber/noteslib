import {
  BookOpen,
  Bookmark,
  Brain,
  Code,
  Compass,
  FileText,
  FlaskConical,
  GitBranch,
  Highlighter,
  Layers,
  Lightbulb,
  ListChecks,
  Music,
  NotebookPen,
  PenLine,
  Pencil,
  Puzzle,
  Rocket,
  ScrollText,
  Sparkles,
  Star,
  StickyNote,
  Terminal,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export const NOTE_ICONS = [
  "file-text",
  "book-open",
  "notebook-pen",
  "sticky-note",
  "scroll-text",
  "bookmark",
  "lightbulb",
  "brain",
  "code",
  "terminal",
  "git-branch",
  "workflow",
  "layers",
  "puzzle",
  "sparkles",
  "star",
  "pen-line",
  "pencil",
  "highlighter",
  "list-checks",
  "compass",
  "rocket",
  "flask-conical",
  "music",
] as const;

export type NoteIconName = (typeof NOTE_ICONS)[number];

export const DEFAULT_NOTE_ICON: NoteIconName = "file-text";

const ICON_MAP: Record<NoteIconName, LucideIcon> = {
  "file-text": FileText,
  "book-open": BookOpen,
  "notebook-pen": NotebookPen,
  "sticky-note": StickyNote,
  "scroll-text": ScrollText,
  bookmark: Bookmark,
  lightbulb: Lightbulb,
  brain: Brain,
  code: Code,
  terminal: Terminal,
  "git-branch": GitBranch,
  workflow: Workflow,
  layers: Layers,
  puzzle: Puzzle,
  sparkles: Sparkles,
  star: Star,
  "pen-line": PenLine,
  pencil: Pencil,
  highlighter: Highlighter,
  "list-checks": ListChecks,
  compass: Compass,
  rocket: Rocket,
  "flask-conical": FlaskConical,
  music: Music,
};

export function isNoteIconName(value: string): value is NoteIconName {
  return value in ICON_MAP;
}

export function resolveNoteIconName(value?: string | null): NoteIconName {
  if (value && isNoteIconName(value)) return value;
  return DEFAULT_NOTE_ICON;
}

export function getNoteIconComponent(name?: string | null): LucideIcon {
  return ICON_MAP[resolveNoteIconName(name)];
}
