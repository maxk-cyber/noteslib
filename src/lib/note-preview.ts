type NotePreviewOptions = {
  maxChars?: number;
  maxLines?: number;
};

const LIST_ITEM_RE = /^(\s*)([-*+]|\d+\.)\s+/;

function stripMarkdownInline(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isTableLine(line: string) {
  const trimmed = line.trim();
  return trimmed.includes("|") || /^\|?[\s:|-]+\|?\s*$/.test(trimmed);
}

function isTableSeparator(line: string) {
  return /^\|?[\s:|-]+\|?\s*$/.test(line.trim());
}

function parseTableCells(row: string) {
  return row
    .split("|")
    .map((cell) => stripMarkdownInline(cell))
    .filter(Boolean);
}

function tableToUnits(tableLines: string[]): string[] {
  const rows = tableLines.filter((line) => line.trim() && !isTableSeparator(line));
  if (rows.length === 0) return [];

  const header = parseTableCells(rows[0]);
  const units: string[] = [];

  for (let index = 1; index < rows.length; index++) {
    const cells = parseTableCells(rows[index]);
    if (cells.length === 0) continue;

    if (header.length >= 2 && cells.length >= 2) {
      units.push(`${cells[0]} — ${cells[1]}`);
      continue;
    }

    units.push(cells.join(" · "));
  }

  if (units.length === 0 && rows[0]) {
    units.push(parseTableCells(rows[0]).join(" · "));
  }

  return units;
}

function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  return matches?.map((part) => part.trim()).filter(Boolean) ?? [];
}

function completeSentencesWithin(text: string, maxChars: number): string[] {
  const sentences = splitSentences(text);
  const lines: string[] = [];
  let length = 0;

  for (const sentence of sentences) {
    const nextLength = length + (lines.length ? 1 : 0) + sentence.length;
    if (lines.length > 0 && nextLength > maxChars) break;
    if (lines.length === 0 && sentence.length > maxChars) break;
    lines.push(sentence);
    length = nextLength;
  }

  return lines;
}

function extractPreviewUnits(content: string): string[] {
  const units: string[] = [];
  const lines = content.split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index++;
      continue;
    }

    if (isTableLine(line)) {
      const tableLines: string[] = [];
      while (
        index < lines.length &&
        lines[index].trim() &&
        isTableLine(lines[index])
      ) {
        tableLines.push(lines[index]);
        index++;
      }
      units.push(...tableToUnits(tableLines));
      continue;
    }

    if (LIST_ITEM_RE.test(line)) {
      const itemLines = [line];
      index++;
      while (index < lines.length) {
        const next = lines[index];
        if (!next.trim()) break;
        if (LIST_ITEM_RE.test(next) || next.startsWith("#") || isTableLine(next)) {
          break;
        }
        itemLines.push(next);
        index++;
      }
      units.push(stripMarkdownInline(itemLines.join(" ")));
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() !== "") {
      paragraph.push(lines[index]);
      index++;
    }
    units.push(...completeSentencesWithin(stripMarkdownInline(paragraph.join(" ")), 500));
  }

  return units.filter(Boolean);
}

export function notePreview(
  content: string,
  options: NotePreviewOptions = {},
): string {
  const maxChars = options.maxChars ?? 280;
  const maxLines = options.maxLines ?? 4;
  const units = extractPreviewUnits(content);

  if (units.length === 0) return "";

  const lines: string[] = [];
  let charCount = 0;

  for (const unit of units) {
    if (lines.length >= maxLines) break;

    const nextCount = charCount + (lines.length ? 1 : 0) + unit.length;
    if (lines.length > 0 && nextCount > maxChars) break;

    if (lines.length === 0 && unit.length > maxChars) {
      const sentences = completeSentencesWithin(unit, maxChars);
      return sentences.slice(0, maxLines).join("\n");
    }

    lines.push(unit);
    charCount = nextCount;
  }

  return lines.join("\n");
}
