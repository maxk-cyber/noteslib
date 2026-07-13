export const DEFAULT_TITLE_COLOR = "#34d399";

export const NOTE_TITLE_COLORS = [
  { id: "emerald", hex: "#34d399", label: "Green" },
  { id: "red", hex: "#ef4444", label: "Red" },
  { id: "violet", hex: "#a78bfa", label: "Purple" },
  { id: "yellow", hex: "#facc15", label: "Yellow" },
  { id: "cyan", hex: "#22d3ee", label: "Cyan" },
  { id: "orange", hex: "#fb923c", label: "Orange" },
  { id: "pink", hex: "#f472b6", label: "Pink" },
  { id: "white", hex: "#f5f5f5", label: "White" },
] as const;

export function resolveTitleColor(value?: string | null) {
  if (!value) return DEFAULT_TITLE_COLOR;
  const match = NOTE_TITLE_COLORS.find(
    (color) => color.hex.toLowerCase() === value.toLowerCase(),
  );
  if (match) return match.hex;
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return DEFAULT_TITLE_COLOR;
}
