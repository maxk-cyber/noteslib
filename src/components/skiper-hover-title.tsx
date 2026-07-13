"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

type Layout = {
  scale: number;
  height: number;
};

type SkiperHoverTitleProps = {
  text: string;
  active: boolean;
};

const ZOOM_START = 1.5;

/**
 * Skiper6 Thunder lettering: zooms in during the letter-slide entrance, then
 * settles scaled so the full title is readable and fits the screen width.
 */
export function SkiperHoverTitle({ text, active }: SkiperHoverTitleProps) {
  const display = text.toUpperCase();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLHeadingElement>(null);
  const [layout, setLayout] = useState<Layout>({ scale: 1, height: 140 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const fit = () => {
      const width = container.clientWidth * 0.96;
      const needed = measure.scrollWidth;
      const naturalHeight = measure.offsetHeight;

      if (width <= 0 || needed <= 0 || naturalHeight <= 0) return;

      const widthScale = width / needed;
      const maxHeight = Math.min(window.innerHeight * 0.36, 360);
      const heightScale = maxHeight / naturalHeight;
      const scale = Math.min(widthScale, heightScale);

      setLayout({
        scale,
        height: Math.ceil(naturalHeight * scale) + 8,
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    observer.observe(measure);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [display]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: layout.height }}
    >
      <h1
        ref={measureRef}
        aria-hidden
        className="font-thunder pointer-events-none invisible absolute top-0 left-1/2 inline-block -translate-x-1/2 whitespace-nowrap text-[28vw] leading-none uppercase md:text-[32vw]"
      >
        {display}
      </h1>

      <div className="flex h-full items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.h1
            key={`${active}-${display}`}
            initial={{ scale: layout.scale * ZOOM_START }}
            animate={{ scale: layout.scale }}
            transition={{
              scale: {
                duration: 0.7,
                ease: [0.76, 0, 0.24, 1],
                delay: 0.06,
              },
            }}
            style={{ transformOrigin: "center center" }}
            className={`font-thunder inline-block select-none whitespace-nowrap text-[28vw] leading-none uppercase md:text-[32vw] ${
              active ? "text-red-500" : "text-white"
            }`}
            aria-live="polite"
          >
            {display.split("").map((char, index) => (
              <motion.span
                key={`${display}-${index}`}
                className="inline-block overflow-hidden align-bottom"
                style={{ height: "1em" }}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-110%" }}
                transition={{
                  duration: 0.5,
                  ease: [0.76, 0, 0.24, 1],
                  delay: index * 0.018,
                }}
              >
                <span className="inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              </motion.span>
            ))}
          </motion.h1>
        </AnimatePresence>
      </div>
    </div>
  );
}
