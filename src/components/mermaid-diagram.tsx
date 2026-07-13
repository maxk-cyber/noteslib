"use client";

import mermaid from "mermaid";
import { useEffect, useId, useState } from "react";

type MermaidDiagramProps = {
  chart: string;
};

let mermaidInitialized = false;

let mermaidId = 0;

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
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

  if (!svg) {
    return (
      <div className="my-8 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950 p-6">
        <p className="text-sm text-neutral-500">Rendering diagram…</p>
      </div>
    );
  }

  return (
    <div
      className="my-8 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950 p-6"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
