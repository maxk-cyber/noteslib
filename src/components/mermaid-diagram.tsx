"use client";

import mermaid from "mermaid";
import { useEffect, useId, useState } from "react";

type MermaidDiagramProps = {
  chart: string;
  compact?: boolean;
  onExpand?: () => void;
};

let mermaidInitialized = false;

let mermaidId = 0;

export function MermaidDiagram({
  chart,
  compact = false,
  onExpand,
}: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const renderId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#10b981",
          primaryTextColor: "#f5f5f5",
          primaryBorderColor: "#34d399",
          lineColor: "#737373",
          secondaryColor: "#1c1917",
          tertiaryColor: "#0a0a0a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        },
      });
      mermaidInitialized = true;
    }

    let cancelled = false;

    mermaid
      .render(`mermaid-${renderId}-${mermaidId++}`, chart.trim())
      .then(({ svg: rendered }) => {
        if (!cancelled) setSvg(rendered);
      })
      .catch(() => {
        if (!cancelled) {
          setSvg(
            `<pre class="text-red-400">Failed to render diagram</pre>`,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, renderId]);

  const shellClass = compact
    ? "my-2 max-h-56 overflow-auto rounded-lg border border-neutral-800 bg-neutral-950 p-3 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-h-48 [&_svg]:max-w-full"
    : "my-8 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950 p-6";

  if (!svg) {
    return (
      <div
        className={
          compact
            ? "my-2 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 p-3"
            : "my-8 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950 p-6"
        }
      >
        <p className="text-sm text-neutral-500">Rendering diagram…</p>
      </div>
    );
  }

  if (compact && onExpand) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onExpand();
        }}
        onPointerDown={(event) => event.stopPropagation()}
        className={`${shellClass} group relative w-full cursor-zoom-in text-left transition-colors hover:border-emerald-500/40`}
        aria-label="Open diagram"
      >
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <span className="pointer-events-none absolute right-3 bottom-3 rounded-full border border-neutral-700 bg-black/70 px-2.5 py-1 text-[10px] tracking-[0.2em] text-neutral-300 uppercase opacity-90 transition-opacity group-hover:text-emerald-300">
          Open
        </span>
      </button>
    );
  }

  return (
    <div
      className={shellClass}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
