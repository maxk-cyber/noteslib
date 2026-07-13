"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

type RollingSectionScrollProps = {
  sectionTitle: string;
  lines: string[];
  onClose: () => void;
};

const RADIUS = 360;

export function RollingSectionScroll({
  sectionTitle,
  lines,
  onClose,
}: RollingSectionScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const count = Math.max(lines.length, 1);
  const step = 180 / count;
  const totalRotation = (count - 1) * step;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rotation = useTransform(scrollYProgress, [0, 1], [0, totalRotation]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  const scrollHeight = useMemo(
    () => `${Math.max(lines.length * 55, 200)}vh`,
    [lines.length],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] bg-[#080808]">
      <div ref={containerRef} className="h-full overflow-y-auto">
        <div style={{ height: scrollHeight }}>
          <div
            ref={viewportRef}
            className="sticky top-0 flex h-screen flex-col"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-900/80 px-6 py-4">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-emerald-400/80 uppercase">
                  3D scroll
                </p>
                <p className="text-lg font-medium text-white md:text-xl">
                  {sectionTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-neutral-800 px-4 py-1.5 text-[10px] tracking-widest text-neutral-400 uppercase transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
              >
                ← Back
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
              <motion.p
                style={{ opacity: hintOpacity }}
                className="absolute top-6 text-[10px] tracking-[0.3em] text-neutral-600 uppercase"
              >
                Scroll · Esc to exit
              </motion.p>

              <div
                className="relative h-[min(50vh,420px)] w-full max-w-5xl px-6"
                style={{ perspective: 1000, perspectiveOrigin: "50% 50%" }}
              >
                <motion.div
                  style={{
                    rotateX: rotation,
                    transformStyle: "preserve-3d",
                  }}
                  className="relative h-full w-full"
                >
                  {lines.map((line, index) => (
                    <div
                      key={`${line}-${index}`}
                      className="absolute inset-0 flex items-center justify-center px-4"
                      style={{
                        transform: `rotateX(${-index * step}deg) translateZ(${RADIUS}px)`,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      <p className="max-w-4xl text-center text-xl font-light tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                        {line}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            <p className="shrink-0 pb-6 text-center text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
              {lines.length} lines · Shift+number to open another section
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
