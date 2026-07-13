import { getNoteIconComponent } from "@/lib/note-icons";

type NoteIconProps = {
  name?: string | null;
  className?: string;
  strokeWidth?: number;
};

export function NoteIcon({ name, className, strokeWidth = 1.75 }: NoteIconProps) {
  const Icon = getNoteIconComponent(name);
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
