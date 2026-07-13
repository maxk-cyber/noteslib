"use client";

import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import {
  extractScrollVisuals,
  resolveScrollVisual,
  type ScrollVisual,
} from "@/lib/scroll-visuals";

type ScrollVisualViewerContextValue = {
  openVisual: (visual: ScrollVisual) => void;
  isOpen: boolean;
};

const ScrollVisualViewerContext =
  createContext<ScrollVisualViewerContextValue | null>(null);

export function useScrollVisualViewer() {
  const context = useContext(ScrollVisualViewerContext);
  if (!context) {
    throw new Error("useScrollVisualViewer must be used within provider");
  }
  return context;
}

export function useScrollVisualViewerOptional() {
  return useContext(ScrollVisualViewerContext);
}

type ScrollVisualViewerProviderProps = {
  faces: string[];
  children: ReactNode;
};

const MIN_VISUAL_ZOOM = 0.55;
const MAX_VISUAL_ZOOM = 3.5;

export function ScrollVisualViewerProvider({
  faces,
  children,
}: ScrollVisualViewerProviderProps) {
  const visuals = useMemo(() => extractScrollVisuals(faces), [faces]);
  const [activeVisual, setActiveVisual] = useState<ScrollVisual | null>(null);

  const activeIndex = useMemo(() => {
    if (!activeVisual) return -1;
    return visuals.findIndex((visual) => visual.id === activeVisual.id);
  }, [activeVisual, visuals]);

  const openVisual = useCallback(
    (visual: ScrollVisual) => {
      setActiveVisual(resolveScrollVisual(visuals, visual));
    },
    [visuals],
  );

  const closeVisual = useCallback(() => {
    setActiveVisual(null);
  }, []);

  const showPrev = useCallback(() => {
    if (visuals.length <= 1 || activeIndex < 0) return;
    const nextIndex = (activeIndex - 1 + visuals.length) % visuals.length;
    setActiveVisual(visuals[nextIndex] ?? null);
  }, [activeIndex, visuals]);

  const showNext = useCallback(() => {
    if (visuals.length <= 1 || activeIndex < 0) return;
    const nextIndex = (activeIndex + 1) % visuals.length;
    setActiveVisual(visuals[nextIndex] ?? null);
  }, [activeIndex, visuals]);

  useEffect(() => {
    if (!activeVisual) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeVisual();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [activeVisual, closeVisual, showNext, showPrev]);

  return (
    <ScrollVisualViewerContext.Provider
      value={{ openVisual, isOpen: Boolean(activeVisual) }}
    >
      {children}
      {activeVisual ? (
        <ScrollVisualLightbox
          visual={activeVisual}
          index={activeIndex}
          total={visuals.length}
          onClose={closeVisual}
          onPrev={showPrev}
          onNext={showNext}
        />
      ) : null}
    </ScrollVisualViewerContext.Provider>
  );
}

type ScrollVisualLightboxProps = {
  visual: ScrollVisual;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function ScrollVisualLightbox({
  visual,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: ScrollVisualLightboxProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [visual.id]);

  const nudgeZoom = useCallback((delta: number) => {
    setZoom((value) =>
      Math.min(MAX_VISUAL_ZOOM, Math.max(MIN_VISUAL_ZOOM, value + delta)),
    );
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey) return;

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        event.stopPropagation();
        nudgeZoom(0.18);
        return;
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        event.stopPropagation();
        nudgeZoom(-0.18);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [nudgeZoom]);

  return (
    <div
      data-3d-overlay
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[min(92vh,960px)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-neutral-800 bg-[#0a0a0a] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-900 px-5 py-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-emerald-400/80 uppercase">
              Diagram viewer
            </p>
            <p className="text-sm text-neutral-300">
              {visual.type === "mermaid" ? "Mermaid diagram" : visual.alt || "Image"}{" "}
              · {index + 1} / {total}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nudgeZoom(-0.18)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:text-white"
              aria-label="Zoom out diagram"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-12 text-center text-[10px] tracking-widest text-neutral-500">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => nudgeZoom(0.18)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:text-white"
              aria-label="Zoom in diagram"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:text-white"
              aria-label="Reset diagram zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:text-white"
              aria-label="Close diagram viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          data-scroll-surface
          className="min-h-0 flex-1 overflow-auto px-5 py-5 md:px-8 md:py-8"
        >
          <motion.div
            animate={{ scale: zoom }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="origin-center"
          >
            {visual.type === "mermaid" ? (
              <MermaidDiagram chart={visual.chart} />
            ) : (
              <img
                src={visual.src}
                alt={visual.alt}
                className="mx-auto block max-h-[min(78vh,820px)] w-full max-w-full object-contain"
              />
            )}
          </motion.div>
        </div>

        {total > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-neutral-900 px-5 py-4">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-4 py-2 text-[10px] tracking-[0.25em] text-neutral-300 uppercase transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <p className="text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
              Shift +/- zoom · Arrows navigate · Esc closes
            </p>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-4 py-2 text-[10px] tracking-[0.25em] text-neutral-300 uppercase transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-t border-neutral-900 px-5 py-3 text-center text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
            Shift +/- zoom · Esc closes
          </div>
        )}
      </div>
    </div>
  );
}
