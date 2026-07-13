export type ScrollVisual =
  | {
      id: string;
      type: "mermaid";
      chart: string;
    }
  | {
      id: string;
      type: "image";
      src: string;
      alt: string;
    }
  | {
      id: string;
      type: "video";
      src: string;
      title: string;
    };

const FENCE_RE = /```([^\n`]*)\r?\n([\s\S]*?)```/gi;
const HTML_IMG_RE =
  /<img\s[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
const HTML_VIDEO_RE =
  /<video[^>]*\ssrc=["']([^"']+)["'][^>]*(?:\stitle=["']([^"']*)["'])?[^>]*>/gi;
const MD_IMG_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

export function isMermaidChartText(className: string | undefined, text: string) {
  if (className?.includes("language-mermaid")) return true;
  const chart = text.trim();
  return /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|timeline|gitGraph|C4Context)\b/.test(
    chart,
  );
}

export function mermaidVisualId(faceIndex: number, index: number) {
  return `${faceIndex}-mermaid-${index}`;
}

export function imageVisualId(faceIndex: number, index: number) {
  return `${faceIndex}-image-${index}`;
}

export function videoVisualId(faceIndex: number, index: number) {
  return `${faceIndex}-video-${index}`;
}

export function extractScrollVisuals(faces: string[]): ScrollVisual[] {
  const visuals: ScrollVisual[] = [];

  faces.forEach((face, faceIndex) => {
    let mermaidIndex = 0;
    for (const match of face.matchAll(FENCE_RE)) {
      const lang = match[1]?.trim() ?? "";
      const chart = match[2]?.trim() ?? "";
      if (!isMermaidChartText(lang ? `language-${lang}` : undefined, chart)) {
        continue;
      }

      visuals.push({
        id: mermaidVisualId(faceIndex, mermaidIndex),
        type: "mermaid",
        chart,
      });
      mermaidIndex++;
    }

    let imageIndex = 0;
    for (const match of face.matchAll(HTML_IMG_RE)) {
      visuals.push({
        id: imageVisualId(faceIndex, imageIndex),
        type: "image",
        src: match[1],
        alt: match[2] ?? "",
      });
      imageIndex++;
    }

    for (const match of face.matchAll(MD_IMG_RE)) {
      visuals.push({
        id: imageVisualId(faceIndex, imageIndex),
        type: "image",
        src: match[2],
        alt: match[1] ?? "",
      });
      imageIndex++;
    }

    let videoIndex = 0;
    for (const match of face.matchAll(HTML_VIDEO_RE)) {
      visuals.push({
        id: videoVisualId(faceIndex, videoIndex),
        type: "video",
        src: match[1],
        title: match[2] || "Video",
      });
      videoIndex++;
    }
  });

  return visuals;
}

export function resolveScrollVisual(
  visuals: ScrollVisual[],
  visual: ScrollVisual,
): ScrollVisual {
  const index = findVisualIndex(visuals, visual);
  if (index >= 0) return visuals[index]!;
  return visual;
}

export function findVisualIndex(
  visuals: ScrollVisual[],
  visual: ScrollVisual,
): number {
  const byId = visuals.findIndex((item) => item.id === visual.id);
  if (byId >= 0) return byId;

  if (visual.type === "mermaid") {
    return visuals.findIndex(
      (item): item is Extract<ScrollVisual, { type: "mermaid" }> =>
        item.type === "mermaid" && item.chart === visual.chart,
    );
  }

  if (visual.type === "video") {
    return visuals.findIndex(
      (item): item is Extract<ScrollVisual, { type: "video" }> =>
        item.type === "video" && item.src === visual.src,
    );
  }

  return visuals.findIndex(
    (item): item is Extract<ScrollVisual, { type: "image" }> =>
      item.type === "image" &&
      item.src === visual.src &&
      item.alt === visual.alt,
  );
}
