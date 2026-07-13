export type NoteSection = {
  id: string;
  title: string;
  body: string;
  raw: string;
};

function titleFromContent(content: string) {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

export function parseNoteSections(content: string): NoteSection[] {
  const trimmed = content.trim();
  if (!trimmed) {
    return [
      {
        id: "section-0",
        title: "Empty note",
        body: "",
        raw: "",
      },
    ];
  }

  const chunks = trimmed.split(/^## /m);

  if (chunks.length === 1) {
    const title = titleFromContent(trimmed) ?? "Overview";
    return [
      {
        id: "section-0",
        title,
        body: trimmed,
        raw: trimmed,
      },
    ];
  }

  const sections: NoteSection[] = [];
  const intro = chunks[0]?.trim();

  if (intro) {
    sections.push({
      id: "section-intro",
      title: titleFromContent(intro) ?? "Introduction",
      body: intro,
      raw: intro,
    });
  }

  chunks.slice(1).forEach((chunk, index) => {
    const lines = chunk.split("\n");
    const title = lines[0]?.trim() || `Section ${index + 1}`;
    const body = lines.slice(1).join("\n").trim();
    const raw = `## ${chunk.trim()}`;

    sections.push({
      id: `section-${index + 1}`,
      title,
      body,
      raw,
    });
  });

  return sections;
}

export function assembleNoteSections(sections: NoteSection[]) {
  return sections
    .map((section) => section.raw.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function updateSectionRaw(
  sections: NoteSection[],
  sectionId: string,
  nextRaw: string,
) {
  return sections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          raw: nextRaw.trim(),
          title: sectionTitleFromRaw(nextRaw, section.title),
          body: sectionBodyFromRaw(nextRaw),
        }
      : section,
  );
}

function sectionTitleFromRaw(raw: string, fallback: string) {
  const h2 = raw.match(/^##\s+(.+)$/m);
  if (h2?.[1]) return h2[1].trim();
  const h1 = raw.match(/^#\s+(.+)$/m);
  if (h1?.[1]) return h1[1].trim();
  return fallback;
}

function sectionBodyFromRaw(raw: string) {
  const lines = raw.split("\n");
  if (lines[0]?.startsWith("#")) return lines.slice(1).join("\n").trim();
  return raw.trim();
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalItems: items.length,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };
}
