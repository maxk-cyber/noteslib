export type NoteSection = {
  id: string;
  title: string;
  body: string;
  raw: string;
};

export type NoteSubsection = {
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

/** Split a section body on `###` headings into subsections. */
export function parseNoteSubsections(sectionBody: string): NoteSubsection[] {
  const trimmed = sectionBody.trim();
  if (!trimmed) {
    return [
      {
        id: "sub-0",
        title: "Content",
        body: "",
        raw: "",
      },
    ];
  }

  const chunks = trimmed.split(/^### /m);
  if (chunks.length === 1) {
    return [
      {
        id: "sub-0",
        title: "Overview",
        body: trimmed,
        raw: trimmed,
      },
    ];
  }

  const subsections: NoteSubsection[] = [];
  const intro = chunks[0]?.trim();

  if (intro) {
    subsections.push({
      id: "sub-intro",
      title: "Overview",
      body: intro,
      raw: intro,
    });
  }

  chunks.slice(1).forEach((chunk, index) => {
    const lines = chunk.split("\n");
    const title = lines[0]?.trim() || `Part ${index + 1}`;
    const body = lines.slice(1).join("\n").trim();
    const raw = `### ${chunk.trim()}`;

    subsections.push({
      id: `sub-${index + 1}`,
      title,
      body,
      raw,
    });
  });

  return subsections;
}

function isTableLine(line: string) {
  const trimmed = line.trim();
  return trimmed.includes("|") || /^\|?[\s:|-]+\|?\s*$/.test(trimmed);
}

function isTableSeparator(line: string) {
  return /^\|?[\s:|-]+\|?\s*$/.test(line.trim());
}

function fenceMarker(line: string) {
  return line.trim().match(/^(`{3,}|~{3,})/)?.[1] ?? null;
}

function isFenceStart(line: string) {
  return Boolean(fenceMarker(line));
}

function isFenceEnd(line: string, opener: string) {
  const end = fenceMarker(line);
  const start = fenceMarker(opener);
  return Boolean(end && start && end[0] === start[0] && end.length >= 3);
}

function isFencedBlock(block: string) {
  return /^(`{3,}|~{3,})/m.test(block.trim());
}

function isMermaidBlock(block: string) {
  const trimmed = block.trim();
  return /^```mermaid\b/im.test(trimmed) || /^~~~mermaid\b/im.test(trimmed);
}

function isEmbeddedImageBlock(block: string) {
  return /<img\s[^>]*src=["'][^"']+["'][^>]*>/i.test(block);
}

function isEmbeddedVideoBlock(block: string) {
  return /<video[^>]*\ssrc=["'][^"']+["'][^>]*>/i.test(block);
}

function splitMarkdownBlocks(text: string): string[] {
  const blocks: string[] = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    if (!lines[i].trim()) {
      i++;
      continue;
    }

    if (isFenceStart(lines[i])) {
      const opener = fenceMarker(lines[i]) ?? "```";
      const fenceLines = [lines[i]];
      i++;
      while (i < lines.length) {
        fenceLines.push(lines[i]);
        if (fenceLines.length > 1 && isFenceEnd(lines[i], opener)) {
          i++;
          break;
        }
        i++;
      }
      blocks.push(fenceLines.join("\n"));
      continue;
    }

    if (isTableLine(lines[i])) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim() && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push(tableLines.join("\n"));
      continue;
    }

    const block: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      block.push(lines[i]);
      i++;
    }
    blocks.push(block.join("\n"));
  }

  return blocks.map((block) => block.trim()).filter(Boolean);
}

function tableToScrollFaces(tableBlock: string): string[] {
  const lines = tableBlock.split("\n").filter((line) => line.trim());
  const dataLines = lines.filter((line) => !isTableSeparator(line));
  if (dataLines.length <= 2) return [tableBlock];

  const header = dataLines[0];
  const separator =
    lines.find((line) => isTableSeparator(line)) ?? "| --- | --- | --- |";
  const rows = dataLines.slice(1);

  return rows.map((row) => [header, separator, row].join("\n"));
}

function isHeadingBlock(block: string) {
  const trimmed = block.trim();
  return /^#{1,6}\s+/.test(trimmed) && !trimmed.includes("\n");
}

function mergeHeadingBlocks(blocks: string[]): string[] {
  const merged: string[] = [];

  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    const next = blocks[index + 1];

    if (isHeadingBlock(block) && next && !isHeadingBlock(next)) {
      merged.push(`${block}\n\n${next}`);
      index++;
      continue;
    }

    merged.push(block);
  }

  return merged;
}

function facesFromBlocks(blocks: string[]): string[] {
  const mergedBlocks = mergeHeadingBlocks(blocks);
  if (mergedBlocks.length === 0) return [];

  const faces: string[] = [];
  let buffer = "";

  const flushBuffer = () => {
    if (!buffer.trim()) return;
    faces.push(buffer.trim());
    buffer = "";
  };

  for (const block of mergedBlocks) {
    const isTable = block.includes("|") && isTableLine(block.split("\n")[0] ?? "");
    const isDiagram =
      isMermaidBlock(block) ||
      isEmbeddedImageBlock(block) ||
      isEmbeddedVideoBlock(block) ||
      (isFencedBlock(block) && block.length > 120);

    if (isTable) {
      flushBuffer();
      faces.push(...tableToScrollFaces(block));
      continue;
    }

    if (isDiagram) {
      flushBuffer();
      faces.push(block);
      continue;
    }

    if (buffer.length + block.length > 520 && buffer) {
      flushBuffer();
      buffer = block;
      continue;
    }

    buffer = buffer ? `${buffer}\n\n${block}` : block;
  }

  flushBuffer();
  return faces;
}

type SectionScrollFacesOptions = {
  sectionTitle?: string;
};

function prependSectionTitle(faces: string[], sectionTitle?: string) {
  const title = sectionTitle?.trim();
  if (!title || faces.length === 0) return faces;

  const first = faces[0].trim();
  if (new RegExp(`^#{1,2}\\s+${escapeRegExp(title)}\\b`, "m").test(first)) {
    return faces;
  }

  return [`## ${title}\n\n${faces[0]}`.trim(), ...faces.slice(1)];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Markdown chunks for 3D scroll — each face is a rendered preview panel. */
export function sectionScrollFaces(
  body: string,
  options: SectionScrollFacesOptions = {},
): string[] {
  const trimmed = body.trim();
  if (!trimmed) return ["*Empty section*"];

  const subsections = parseNoteSubsections(trimmed);
  if (subsections.length > 1) {
    const faces = subsections.flatMap((subsection) => {
      const faces = facesFromBlocks(splitMarkdownBlocks(subsection.body));
      if (faces.length === 0) {
        const fallback = subsection.body.trim() || "*Empty subsection*";
        return subsection.title === "Overview"
          ? [fallback]
          : [`### ${subsection.title}\n\n${fallback}`.trim()];
      }

      if (subsection.title === "Overview") {
        return faces;
      }

      return faces.map((face) => `### ${subsection.title}\n\n${face}`.trim());
    });

    return prependSectionTitle(faces, options.sectionTitle);
  }

  const blocks = splitMarkdownBlocks(trimmed);
  if (blocks.length <= 1) {
    return prependSectionTitle([trimmed], options.sectionTitle);
  }

  const faces = facesFromBlocks(blocks);
  const result = faces.length > 0 ? faces : [trimmed];
  return prependSectionTitle(result, options.sectionTitle);
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
