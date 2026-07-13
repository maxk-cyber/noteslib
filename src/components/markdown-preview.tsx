"use client";

import { Children, isValidElement, useMemo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import type { NoteSubsection } from "@/lib/note-sections";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      "class",
      "className",
      "style",
    ],
    p: [...(defaultSchema.attributes?.p ?? []), "class", "className"],
    div: [...(defaultSchema.attributes?.div ?? []), "class", "className"],
  },
};

function getCodeText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(String).join("");
  return String(children);
}

function getTextContent(children: ReactNode): string {
  if (typeof children === "string") return children.trim();
  if (Array.isArray(children)) return children.map(getTextContent).join("").trim();
  if (isValidElement<{ children?: ReactNode }>(children)) {
    return getTextContent(children.props.children);
  }
  return String(children ?? "").trim();
}

function isMermaidChart(className?: string, text?: string) {
  if (className?.includes("language-mermaid")) return true;
  const chart = text?.trim() ?? "";
  return /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|timeline|gitGraph|C4Context)\b/.test(
    chart,
  );
}

function buildMarkdownComponents(
  subsections: NoteSubsection[],
  onSubsectionClick?: (index: number) => void,
): Components {
  const titleToIndex = new Map(
    subsections.map((subsection, index) => [subsection.title, index]),
  );

  return {
    h1: ({ children }) => (
      <h1 className="mt-12 mb-8 text-4xl font-semibold tracking-tight text-white first:mt-0 md:text-5xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-6 text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => {
      const title = getTextContent(children);
      const index = titleToIndex.get(title);
      const clickable =
        index !== undefined && onSubsectionClick && subsections.length > 1;

      if (clickable) {
        return (
          <button
            type="button"
            onClick={() => onSubsectionClick(index)}
            className="group mt-10 mb-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 px-5 py-4 text-left transition-colors hover:border-emerald-500/40 hover:bg-emerald-950/20"
          >
            <span className="text-2xl font-medium text-white md:text-3xl">
              {children}
            </span>
            <span className="shrink-0 text-[10px] tracking-[0.25em] text-emerald-400/80 uppercase opacity-0 transition-opacity group-hover:opacity-100">
              3D scroll →
            </span>
          </button>
        );
      }

      return (
        <h3 className="mt-8 mb-4 text-2xl font-medium text-white md:text-3xl">
          {children}
        </h3>
      );
    },
    p: ({ children }) => (
      <p className="mb-6 text-lg leading-[1.85] text-neutral-200 md:text-xl">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="text-neutral-100 italic">{children}</em>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-emerald-400 underline decoration-emerald-400/40 underline-offset-4 transition-colors hover:text-emerald-300"
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="mb-8 list-disc space-y-3 pl-8 text-lg text-neutral-200 md:text-xl">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-8 list-decimal space-y-3 pl-8 text-lg text-neutral-200 md:text-xl">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-[1.85]">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-4 border-emerald-500/60 py-1 pl-6 text-lg text-neutral-300 italic md:text-xl">
        {children}
      </blockquote>
    ),
    code: ({ className, children }) => {
      const text = getCodeText(children);

      if (isMermaidChart(className, text)) {
        return <MermaidDiagram chart={text} />;
      }

      if (!className) {
        return (
          <code className="rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-sm text-emerald-300">
            {children}
          </code>
        );
      }

      return (
        <code className="block font-mono text-sm leading-relaxed text-neutral-200">
          {children}
        </code>
      );
    },
    pre: ({ children }) => {
      const child = Children.toArray(children)[0];
      if (isValidElement(child) && child.type === MermaidDiagram) {
        return child;
      }

      return (
        <pre className="my-8 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 p-5 font-mono text-sm leading-relaxed text-neutral-200">
          {children}
        </pre>
      );
    },
    hr: () => <hr className="my-12 border-neutral-800" />,
    table: ({ children }) => (
      <div className="my-10 overflow-x-auto rounded-2xl border border-neutral-800/80 bg-neutral-950/40 p-2 md:p-4">
        <table className="w-full min-w-[720px] border-separate border-spacing-x-6 border-spacing-y-4">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-neutral-800">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="min-w-[9rem] px-4 py-4 text-left text-sm font-semibold tracking-wide text-emerald-300 uppercase">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-5 align-top text-base leading-[1.75] text-neutral-200 md:text-lg">
        {children}
      </td>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-neutral-900/80 last:border-0">{children}</tr>
    ),
  };
}

type MarkdownPreviewProps = {
  content: string;
  className?: string;
  subsections?: NoteSubsection[];
  onSubsectionClick?: (index: number) => void;
};

export function MarkdownPreview({
  content,
  className,
  subsections = [],
  onSubsectionClick,
}: MarkdownPreviewProps) {
  const components = useMemo(
    () => buildMarkdownComponents(subsections, onSubsectionClick),
    [subsections, onSubsectionClick],
  );

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
