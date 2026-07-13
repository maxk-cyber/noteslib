const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file: File): Promise<string> {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return readFileAsDataUrl(file);
  }

  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const max = MAX_IMAGE_DIMENSION;

  if (width > max || height > max) {
    if (width > height) {
      height = Math.round((height * max) / width);
      width = max;
    } else {
      width = Math.round((width * max) / height);
      height = max;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return readFileAsDataUrl(file);
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const quality = file.size > 500_000 ? 0.82 : 0.9;
  return canvas.toDataURL("image/jpeg", quality);
}

function sanitizeFilename(name: string) {
  return name.replace(/[\[\]()]/g, "").trim() || "attachment";
}

export async function fileToAttachmentMarkdown(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is too large (max ${MAX_FILE_BYTES / (1024 * 1024)}MB).`);
  }

  const label = sanitizeFilename(file.name || "attachment");

  if (file.type.startsWith("image/")) {
    const dataUrl = await compressImageFile(file);
    const alt = label.replace(/\.[^.]+$/, "") || "image";
    return `\n\n![${alt}](${dataUrl})\n\n`;
  }

  const dataUrl = await readFileAsDataUrl(file);
  return `\n\n[📎 ${label}](${dataUrl})\n\n`;
}

export function insertTextAtCursor(
  value: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number,
) {
  const next =
    value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
  const cursor = selectionStart + insertion.length;
  return { next, cursorStart: cursor, cursorEnd: cursor };
}

export function filesFromClipboard(
  clipboardData: DataTransfer,
): File[] {
  const files: File[] = [];
  for (const item of clipboardData.items) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (file) files.push(file);
  }
  return files;
}

export function filesFromInput(fileList: FileList | null): File[] {
  if (!fileList) return [];
  return Array.from(fileList);
}
