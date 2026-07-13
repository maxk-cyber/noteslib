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
    };

const FENCE_RE = /```([^\n`]*)\r?\n([\s\S]*?)```/gi;
const HTML_IMG_RE =
  /<img\s[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
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
  });

  return visuals;
}

export function resolveScrollVisual(
  visuals: ScrollVisual[],
  visual: ScrollVisual,
): ScrollVisual {
  const byId = visuals.find((item) => item.id === visual.id);
  if (byId) return byId;

  if (visual.type === "mermaid") {
    return (
      visuals.find(
        (item): item is Extract<ScrollVisual, { type: "mermaid" }> =>
          item.type === "mermaid" && item.chart === visual.chart,
      ) ?? visual
    );
  }

  return (
    visuals.find(
      (item): item is Extract<ScrollVisual, { type: "image" }> =>
        item.type === "image" &&
        item.src === visual.src &&
        item.alt === visual.alt,
    ) ?? visual
  );
}
