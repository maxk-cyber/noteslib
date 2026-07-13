"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownPreview } from "@/components/markdown-preview";

type RollingSectionScrollProps = {
  sectionTitle: string;
  faces: string[];
  onClose: () => void;
};

const RADIUS = 420;

export function RollingSectionScroll({
  sectionTitle,
  faces,
  onClose,
}: RollingSectionScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const count = Math.max(faces.length, 1);
  const step = 180 / count;
  const totalRotation = (count - 1) * step;
  const [progress, setProgress] = useState(0);

  const progressMV = useMotionValue(0);
  const smoothProgress = useSpring(progressMV, {
    stiffness: 110,
    damping: 24,
    mass: 0.35,
  });
  const rotation = useTransform(smoothProgress, [0, 1], [0, totalRotation]);
  const hintOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);

  useEffect(() => {
    progressMV.set(progress);
  }, [progress, progressMV]);

  const nudge = useCallback((delta: number) => {
    setProgress((value) => Math.min(1, Math.max(0, value + delta)));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      nudge(event.deltaY * 0.0018);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [nudge]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        nudge(0.08);
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        nudge(-0.08);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nudge, onClose]);

  const activeFace =
    count > 1 ? Math.round(progress * (count - 1)) + 1 : 1;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] flex touch-none flex-col bg-[#080808]"
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

      <div className="relative min-h-0 flex-1">
        <motion.p
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute top-4 right-0 left-0 z-10 text-center text-[10px] tracking-[0.3em] text-neutral-600 uppercase"
        >
          Scroll wheel to roll · ↑↓ arrows · Esc to exit
        </motion.p>

        <div className="flex h-full items-center justify-center px-4 py-6 md:px-8">
          <div
            className="relative h-[min(70vh,720px)] w-full max-w-5xl"
            style={{
              perspective: 1000,
              perspectiveOrigin: "50% 50%",
              WebkitPerspective: 1000,
            }}
          >
            <motion.div
              style={{
                rotateX: rotation,
                transformStyle: "preserve-3d",
                WebkitTransformStyle: "preserve-3d",
              }}
              className="relative h-full w-full"
            >
              {faces.map((face, index) => (
                <div
                  key={`face-${index}`}
                  className="absolute inset-0 flex items-center justify-center px-4 md:px-8"
                  style={{
                    transform: `rotateX(${-index * step}deg) translateZ(${RADIUS}px)`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <MarkdownPreview
                    variant="face3d"
                    content={face}
                    className="max-h-full w-full max-w-4xl text-center [transform-style:preserve-3d]"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="shrink-0 space-y-3 px-6 pb-6">
        <div className="mx-auto h-1 max-w-md overflow-hidden rounded-full bg-neutral-900">
          <div
            className="h-full rounded-full bg-emerald-500/80 transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-center text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Panel {activeFace} / {faces.length} · Shift+number for another section
        </p>
      </div>
    </div>
  );
}
