"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import type { NoteSubsection } from "@/lib/note-sections";
import { notePreview } from "@/lib/note-preview";

type RollingSubsectionStackProps = {
  subsections: NoteSubsection[];
  sectionTitle: string;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onClose: () => void;
};

const RADIUS = 320;

export function RollingSubsectionStack({
  subsections,
  sectionTitle,
  initialIndex = 0,
  onIndexChange,
  onClose,
}: RollingSubsectionStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const count = Math.max(subsections.length, 1);
  const step = 180 / count;
  const totalRotation = (count - 1) * step;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rotation = useTransform(scrollYProgress, [0, 1], [0, totalRotation]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  const scrollHeight = useMemo(
    () => `${Math.max(count * 55, 180)}vh`,
    [count],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || count <= 1) return;
    const progress = initialIndex / (count - 1);
    const maxScroll = el.scrollHeight - window.innerHeight;
    el.scrollTop = progress * maxScroll;
  }, [initialIndex, count]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!onIndexChange || count <= 1) return;
    const index = Math.round(progress * (count - 1));
    onIndexChange(index);
  });

  return (
    <div ref={containerRef} className="relative -mx-2 max-h-[70vh] overflow-y-auto md:-mx-4">
      <div style={{ height: scrollHeight }}>
        <div className="sticky top-0 flex min-h-[52vh] flex-col bg-neutral-950/80">
          <div className="flex items-center justify-between gap-3 px-2 py-3 md:px-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-emerald-400/80 uppercase">
                {sectionTitle}
              </p>
              <p className="text-xs tracking-widest text-neutral-500 uppercase">
                3D scroll · {subsections.length} parts
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-800 px-3 py-1 text-[10px] tracking-widest text-neutral-400 uppercase transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
            >
              ← Back
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden py-6">
            <motion.p
              style={{ opacity: hintOpacity }}
              className="absolute top-2 text-[10px] tracking-[0.3em] text-neutral-600 uppercase"
            >
              Scroll to move through parts
            </motion.p>

            <div
              className="relative h-56 w-full max-w-4xl px-4 md:h-64"
              style={{ perspective: 900, perspectiveOrigin: "50% 50%" }}
            >
              <motion.div
                style={{
                  rotateX: rotation,
                  transformStyle: "preserve-3d",
                }}
                className="relative h-full w-full"
              >
                {subsections.map((subsection, index) => (
                  <div
                    key={subsection.id}
                    className="absolute inset-0 flex items-center justify-center px-4"
                    style={{
                      transform: `rotateX(${-index * step}deg) translateZ(${RADIUS}px)`,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <div className="max-w-2xl text-center">
                      <p className="text-2xl font-medium tracking-tight text-white sm:text-4xl md:text-5xl">
                        {subsection.title}
                      </p>
                      <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-neutral-400 sm:text-base">
                        {notePreview(subsection.body) || "…"}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
