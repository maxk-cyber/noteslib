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

const MERMAID_RE = /```mermaid\n([\s\S]*?)```/gi;
const HTML_IMG_RE =
  /<img\s[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
const MD_IMG_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

export function extractScrollVisuals(faces: string[]): ScrollVisual[] {
  const visuals: ScrollVisual[] = [];

  faces.forEach((face, faceIndex) => {
    let mermaidIndex = 0;
    for (const match of face.matchAll(MERMAID_RE)) {
      visuals.push({
        id: `${faceIndex}-mermaid-${mermaidIndex}`,
        type: "mermaid",
        chart: match[1].trim(),
      });
      mermaidIndex++;
    }

    let imageIndex = 0;
    for (const match of face.matchAll(HTML_IMG_RE)) {
      visuals.push({
        id: `${faceIndex}-image-${imageIndex}`,
        type: "image",
        src: match[1],
        alt: match[2] ?? "",
      });
      imageIndex++;
    }

    for (const match of face.matchAll(MD_IMG_RE)) {
      visuals.push({
        id: `${faceIndex}-image-${imageIndex}`,
        type: "image",
        src: match[2],
        alt: match[1] ?? "",
      });
      imageIndex++;
    }
  });

  return visuals;
}
