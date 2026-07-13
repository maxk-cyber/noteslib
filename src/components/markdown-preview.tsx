"use client";

import { Children, isValidElement, useMemo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { MermaidDiagram } from "@/components/mermaid-diagram";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "mark"],
  protocols: {
    ...defaultSchema.protocols,
    href: [...(defaultSchema.protocols?.href ?? []), "data"],
    src: [...(defaultSchema.protocols?.src ?? []), "data"],
    longDesc: [...(defaultSchema.protocols?.longDesc ?? []), "data"],
  },
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
    mark: [...(defaultSchema.attributes?.mark ?? []), "class", "className", "style"],
  },
};

function getCodeText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(String).join("");
  return String(children);
}

function isMermaidChart(className?: string, text?: string) {
  if (className?.includes("language-mermaid")) return true;
  const chart = text?.trim() ?? "";
  return /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|timeline|gitGraph|C4Context)\b/.test(
    chart,
  );
}

function buildMarkdownComponents(variant: "default" | "face3d" = "default"): Components {
  const isFace = variant === "face3d";

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
    h3: ({ children }) => (
      <h3
        className={
          isFace
            ? "mt-0 mb-3 text-xl font-medium text-white md:text-2xl"
            : "mt-8 mb-4 text-2xl font-medium text-white md:text-3xl"
        }
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p
        className={
          isFace
            ? "mb-3 text-base leading-relaxed text-neutral-200 md:text-lg"
            : "mb-6 text-lg leading-[1.85] text-neutral-200 md:text-xl"
        }
      >
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="text-neutral-100 italic">{children}</em>
    ),
    mark: ({ children, className, style }) => (
      <mark
        className={className ?? "rounded bg-yellow-400/35 px-0.5 text-yellow-100"}
        style={style}
      >
        {children}
      </mark>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-emerald-400 underline decoration-emerald-400/40 underline-offset-4 transition-colors hover:text-emerald-300"
        target="_blank"
        rel="noreferrer"
        download={href?.startsWith("data:") ? true : undefined}
      >
        {children}
      </a>
    ),
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt ?? ""}
        className={
          isFace
            ? "mx-auto my-3 max-h-48 max-w-full rounded-lg border border-neutral-800 object-contain"
            : "my-6 max-w-full rounded-xl border border-neutral-800 object-contain"
        }
      />
    ),
    ul: ({ children }) => (
      <ul
        className={
          isFace
            ? "mb-4 list-disc space-y-2 pl-6 text-base text-neutral-200 md:text-lg"
            : "mb-8 list-disc space-y-3 pl-8 text-lg text-neutral-200 md:text-xl"
        }
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={
          isFace
            ? "mb-4 list-decimal space-y-2 pl-6 text-base text-neutral-200 md:text-lg"
            : "mb-8 list-decimal space-y-3 pl-8 text-lg text-neutral-200 md:text-xl"
        }
      >
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
        <pre
          className={
            isFace
              ? "my-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs leading-relaxed text-neutral-200"
              : "my-8 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 p-5 font-mono text-sm leading-relaxed text-neutral-200"
          }
        >
          {children}
        </pre>
      );
    },
    hr: () => <hr className="my-12 border-neutral-800" />,
    table: ({ children }) =>
      isFace ? (
        <table className="my-3 w-full border-separate border-spacing-y-2 text-left text-sm text-neutral-200">
          {children}
        </table>
      ) : (
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
      <th
        className={
          isFace
            ? "px-2 py-2 text-left text-xs font-semibold tracking-wide text-emerald-300 uppercase"
            : "min-w-[9rem] px-4 py-4 text-left text-sm font-semibold tracking-wide text-emerald-300 uppercase"
        }
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td
        className={
          isFace
            ? "px-2 py-2 align-top text-sm leading-relaxed text-neutral-200"
            : "px-4 py-5 align-top text-base leading-[1.75] text-neutral-200 md:text-lg"
        }
      >
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
  variant?: "default" | "face3d";
};

export function MarkdownPreview({
  content,
  className,
  variant = "default",
}: MarkdownPreviewProps) {
  const components = useMemo(() => buildMarkdownComponents(variant), [variant]);

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
