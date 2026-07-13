export const HIGHLIGHT_PRESETS = [
  { id: "yellow", hex: "#facc15", label: "Yellow" },
  { id: "emerald", hex: "#34d399", label: "Green" },
  { id: "cyan", hex: "#22d3ee", label: "Cyan" },
  { id: "violet", hex: "#a78bfa", label: "Purple" },
  { id: "pink", hex: "#f472b6", label: "Pink" },
  { id: "orange", hex: "#fb923c", label: "Orange" },
  { id: "red", hex: "#f87171", label: "Red" },
  { id: "sky", hex: "#38bdf8", label: "Sky" },
] as const;

export const DEFAULT_HIGHLIGHT_COLOR = HIGHLIGHT_PRESETS[0].hex;

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function highlightTextColor(hex: string) {
  return relativeLuminance(hex) > 0.55 ? "#171717" : "#fafafa";
}

export function highlightBackground(hex: string, alpha = 0.38) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildHighlightMarkOpen(hex: string) {
  const bg = highlightBackground(hex);
  const color = highlightTextColor(hex);
  return `<mark style="background-color:${bg};color:${color};padding:0 2px;border-radius:3px">`;
}

export function buildHighlightMarkClose() {
  return "</mark>";
}

export function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100;
  const light = l / 100;
  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - chroma / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [chroma, x, 0];
  else if (h < 120) [r, g, b] = [x, chroma, 0];
  else if (h < 180) [r, g, b] = [0, chroma, x];
  else if (h < 240) [r, g, b] = [0, x, chroma];
  else if (h < 300) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];

  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
