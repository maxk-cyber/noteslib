"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { MarkdownPreview } from "@/components/markdown-preview";

type RollingSectionScrollProps = {
  sectionTitle: string;
  faces: string[];
  onClose: () => void;
};

const RADIUS = 520;

export function RollingSectionScroll({
  sectionTitle,
  faces,
  onClose,
}: RollingSectionScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const count = Math.max(faces.length, 1);
  const step = count > 1 ? 180 / count : 0;
  const totalRotation = (count - 1) * step;

  const { scrollYProgress } = useScroll({
    target: contentRef,
    container: scrollRef,
    offset: ["start start", "end end"],
  });

  const rotation = useTransform(scrollYProgress, [0, 1], [0, totalRotation]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  const scrollHeight = useMemo(
    () => `${Math.max(faces.length * 100, 250)}vh`,
    [faces.length],
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
      <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain">
        <div ref={contentRef} style={{ height: scrollHeight }}>
          <div className="sticky top-0 flex h-screen flex-col">
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

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <motion.p
                style={{ opacity: hintOpacity }}
                className="pointer-events-none absolute top-4 left-0 right-0 z-10 text-center text-[10px] tracking-[0.3em] text-neutral-600 uppercase"
              >
                Scroll to roll through preview · Esc to exit
              </motion.p>

              <div className="flex h-full items-center justify-center px-4 py-6 md:px-10">
                <div
                  className="relative h-[min(72vh,760px)] w-full max-w-5xl"
                  style={{ perspective: 1200, perspectiveOrigin: "50% 42%" }}
                >
                  <motion.div
                    style={{
                      rotateX: rotation,
                      transformStyle: "preserve-3d",
                    }}
                    className="relative h-full w-full"
                  >
                    {faces.map((face, index) => (
                      <div
                        key={`face-${index}`}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          transform: `rotateX(${-index * step}deg) translateZ(${RADIUS}px)`,
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        <div className="h-full w-full overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-950/90 px-6 py-8 shadow-[0_0_80px_-20px_rgba(0,0,0,0.9)] md:px-10 md:py-10">
                          <div className="h-full overflow-y-auto pr-1">
                            <MarkdownPreview
                              content={face}
                              className="max-w-none [&_h3]:mt-0 [&_p]:mb-4 [&_p]:text-base [&_p]:leading-relaxed md:[&_p]:text-lg [&_table]:my-4 [&_td]:py-3 [&_td]:text-sm md:[&_td]:text-base [&_th]:py-3 [&_th]:text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>

            <p className="shrink-0 pb-5 text-center text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
              {faces.length} panels · Shift+number for another section
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
