"use client";

import { motion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

type GraffitiTitleProps = {
  text: string;
  hovered: boolean;
  className?: string;
  variant?: "hero" | "header" | "panel";
  theme?: "red" | "purple" | "yellow" | "green";
};

const titleThemes = {
  red: { active: "text-red-500", glitch: "bg-red-500" },
  purple: { active: "text-violet-400", glitch: "bg-violet-500" },
  yellow: { active: "text-yellow-400", glitch: "bg-yellow-400" },
  green: { active: "text-emerald-400", glitch: "bg-emerald-400" },
};

function glitchIndices(text: string): Set<number> {
  const indices = new Set<number>();
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") continue;
    const hash = (text.charCodeAt(i) * (i + 7) + text.length) % 5;
    if (hash === 0) indices.add(i);
  }
  return indices;
}

export function GraffitiTitle({
  text,
  hovered,
  className,
  variant = "hero",
  theme = "red",
}: GraffitiTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [fitScale, setFitScale] = useState(1);

  const glitched = useMemo(() => glitchIndices(text), [text]);
  const colors = titleThemes[theme];
  const sizeClass =
    variant === "header"
      ? "text-[10vw] md:text-[14vw]"
      : variant === "panel"
        ? "text-2xl sm:text-3xl md:text-5xl"
        : "text-[22vw] md:text-[28vw]";

  useLayoutEffect(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    if (!container || !title) return;

    const fit = () => {
      title.style.transform = "scale(1)";

      const available = container.clientWidth;
      const needed = title.scrollWidth;

      if (available <= 0 || needed <= 0) {
        setFitScale(1);
        return;
      }

      setFitScale((prev) => {
        const next = Math.min(1, available / needed);
        return Math.abs(prev - next) < 0.001 ? prev : next;
      });
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(container);
    observer.observe(title);

    return () => observer.disconnect();
  }, [text, variant, hovered]);

  return (
    <div
      ref={containerRef}
      className="flex w-full max-w-[92vw] justify-center overflow-hidden"
    >
      <div
        style={{
          transform: `scale(${fitScale})`,
          transformOrigin: "center center",
        }}
      >
        <h1
          ref={titleRef}
          className={`select-none whitespace-nowrap uppercase leading-none ${sizeClass} ${className ?? ""} ${
            hovered ? colors.active : "text-white"
          }`}
        >
          {text.split("").map((char, index) => (
            <motion.span
              key={`${text}-${index}`}
              className="relative inline-block overflow-hidden"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              transition={{
                delay: index * 0.025,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {hovered && glitched.has(index) && (
                <span
                  className={`absolute top-[28%] right-0 left-0 h-[38%] ${colors.glitch}`}
                  aria-hidden
                />
              )}
              <span className="relative">{char === " " ? "\u00A0" : char}</span>
            </motion.span>
          ))}
        </h1>
      </div>
    </div>
  );
}
