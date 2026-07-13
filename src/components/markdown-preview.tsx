"use client";

import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { MermaidDiagram } from "@/components/mermaid-diagram";

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

function isMermaidChart(className?: string, text?: string) {
  if (className?.includes("language-mermaid")) return true;
  const chart = text?.trim() ?? "";
  return /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|timeline|gitGraph|C4Context)\b/.test(
    chart,
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-6 text-4xl font-semibold tracking-tight text-white first:mt-0 md:text-5xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-3 text-2xl font-medium text-white md:text-3xl">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 text-lg leading-relaxed text-neutral-200 md:text-xl">
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
    <ul className="mb-5 list-disc space-y-2 pl-6 text-lg text-neutral-200 md:text-xl">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 list-decimal space-y-2 pl-6 text-lg text-neutral-200 md:text-xl">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-emerald-500/60 pl-5 text-lg text-neutral-300 italic md:text-xl">
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
      <pre className="my-6 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4 font-mono text-sm leading-relaxed text-neutral-200">
        {children}
      </pre>
    );
  },
  hr: () => <hr className="my-10 border-neutral-800" />,
};

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
