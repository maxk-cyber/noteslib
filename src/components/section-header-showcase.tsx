"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { assetPath } from "@/lib/asset-path";

type SectionHeaderShowcaseProps = {
  sectionTitle: string;
  hovered?: boolean;
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

/**
 * Skiper-style panel: the mp4 plays behind a black mask;
 * section title letters punch through so the video shows inside the lettering.
 */
export function SectionHeaderShowcase({
  sectionTitle,
  hovered = false,
}: SectionHeaderShowcaseProps) {
  const text = sectionTitle.toUpperCase();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const glitched = useMemo(() => glitchIndices(text), [text]);

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
      setFitScale(Math.min(1, available / needed));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    observer.observe(title);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto mt-5 h-28 w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-500/15 md:h-32"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full scale-110 object-cover saturate-125 hue-rotate-[95deg]"
        src={assetPath("/video/skiper6.mp4")}
        aria-hidden
      />

      <div className="absolute inset-0 bg-[#080808]" />

      <div className="absolute inset-0 flex items-center justify-center px-4 [isolation:isolate]">
        <AnimatePresence mode="wait">
          <motion.div
            key={text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex w-full justify-center"
            style={{
              transform: `scale(${fitScale})`,
              transformOrigin: "center center",
            }}
          >
            <h1
              ref={titleRef}
              className="flex whitespace-nowrap uppercase leading-none mix-blend-destination-out select-none text-2xl sm:text-3xl md:text-5xl"
            >
              {text.split("").map((char, index) => (
                <motion.span
                  key={`${text}-${index}`}
                  className="relative inline-block overflow-hidden text-white"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    delay: index * 0.025,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {hovered && glitched.has(index) && (
                    <span
                      className="absolute top-[28%] right-0 left-0 h-[38%] bg-emerald-400 mix-blend-destination-out"
                      aria-hidden
                    />
                  )}
                  <span className="relative">
                    {char === " " ? "\u00A0" : char}
                  </span>
                </motion.span>
              ))}
            </h1>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
