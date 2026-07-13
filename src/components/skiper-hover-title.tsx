"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

type SkiperHoverTitleProps = {
  text: string;
  active: boolean;
};

/**
 * Skiper6 HoverMember lettering: Thunder typeface, 28vw glyphs clipped in a
 * 22vw window so characters slide through a horizontal band on change.
 */
export function SkiperHoverTitle({ text, active }: SkiperHoverTitleProps) {
  const display = text.toUpperCase();
  const measureRef = useRef<HTMLHeadingElement>(null);
  const [fitScale, setFitScale] = useState(1);

  useLayoutEffect(() => {
    const title = measureRef.current;
    if (!title) return;

    const fit = () => {
      title.style.transform = "scale(1)";
      const parent = title.parentElement;
      if (!parent) return;
      const available = parent.clientWidth;
      const needed = title.scrollWidth;
      if (available <= 0 || needed <= 0) {
        setFitScale(1);
        return;
      }
      setFitScale(Math.min(1, available / needed));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(title);
    if (title.parentElement) observer.observe(title.parentElement);
    return () => observer.disconnect();
  }, [display, active]);

  return (
    <div className="relative h-[22vw] w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center px-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.h1
            key={`${active}-${display}`}
            ref={measureRef}
            style={{ transform: `scale(${fitScale})`, transformOrigin: "center center" }}
            className={`font-thunder inline-block select-none whitespace-nowrap text-[28vw] leading-none uppercase ${
              active ? "text-red-500" : "text-white"
            }`}
            aria-live="polite"
          >
            {display.split("").map((char, index) => (
              <motion.span
                key={`${display}-${index}`}
                className="inline-block"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{
                  duration: 0.55,
                  ease: [0.76, 0, 0.24, 1],
                  delay: index * 0.02,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>
        </AnimatePresence>
      </div>
    </div>
  );
}
