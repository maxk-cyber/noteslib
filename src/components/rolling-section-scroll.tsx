"use client";

import { motion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownPreview } from "@/components/markdown-preview";

type RollingSectionScrollProps = {
  sectionTitle: string;
  faces: string[];
  onClose: () => void;
};

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 2.75;

type Orbit = { x: number; y: number };
type Pan = { x: number; y: number };
type DragMode = "orbit" | "pan";

function cylinderStep(count: number) {
  if (count <= 1) return 0;
  return 360 / count;
}

function cylinderRadius(count: number) {
  if (count <= 1) return 420;
  const stepRad = (Math.PI * 2) / count;
  return Math.max(380, 220 / Math.tan(stepRad / 2));
}

function snapProgress(value: number, count: number) {
  if (count <= 1) return 0;
  if (value >= 0.985) return 1;
  if (value <= 0.015) return 0;
  const segments = count - 1;
  return Math.round(value * segments) / segments;
}

function panelRotationDeg(progress: number, count: number, step: number) {
  if (count <= 1) return 0;
  return progress * (count - 1) * step;
}

export function RollingSectionScroll({
  sectionTitle,
  faces,
  onClose,
}: RollingSectionScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef({
    x: 0,
    y: 0,
    orbitX: 0,
    orbitY: 0,
    panX: 0,
    panY: 0,
    mode: "orbit" as DragMode,
  });
  const isDraggingRef = useRef(false);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = Math.max(faces.length, 1);
  const step = cylinderStep(count);
  const radius = cylinderRadius(count);

  const [progress, setProgress] = useState(0);
  const panelRotateX = panelRotationDeg(progress, count, step);
  const hintOpacity = Math.max(0, 1 - progress / 0.12);
  const [zoom, setZoom] = useState(1);
  const [orbit, setOrbit] = useState<Orbit>({ x: 0, y: 0 });
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>("orbit");

  const setProgressSnapped = useCallback(
    (value: number | ((current: number) => number)) => {
      setProgress((current) => {
        const next = typeof value === "function" ? value(current) : value;
        return snapProgress(Math.min(1, Math.max(0, next)), count);
      });
    },
    [count],
  );

  const nudgeProgress = useCallback(
    (delta: number) => {
      setProgress((value) => {
        const raw = Math.min(1, Math.max(0, value + delta));
        return raw;
      });
    },
    [],
  );

  const scheduleSnap = useCallback(() => {
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => {
      setProgress((value) => snapProgress(value, count));
    }, 120);
  }, [count]);

  const nudgeZoom = useCallback((delta: number) => {
    setZoom((value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value + delta)));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setOrbit({ x: 0, y: 0 });
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.ctrlKey || event.metaKey) {
        nudgeZoom(-event.deltaY * 0.0025);
        return;
      }

      nudgeProgress(event.deltaY * 0.0022);
      scheduleSnap();
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      root.removeEventListener("wheel", onWheel);
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, [nudgeProgress, nudgeZoom, scheduleSnap]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        if (event.shiftKey) {
          setPan((value) => ({ ...value, y: value.y - 36 }));
        } else {
          setProgressSnapped((value) => Math.min(1, value + 1 / Math.max(count - 1, 1)));
        }
        return;
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        if (event.shiftKey) {
          setPan((value) => ({ ...value, y: value.y + 36 }));
        } else {
          setProgressSnapped((value) => Math.max(0, value - 1 / Math.max(count - 1, 1)));
        }
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        setProgress(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        setProgress(1);
        return;
      }
      if (event.key === "ArrowLeft" && event.shiftKey) {
        event.preventDefault();
        setPan((value) => ({ ...value, x: value.x + 36 }));
        return;
      }
      if (event.key === "ArrowRight" && event.shiftKey) {
        event.preventDefault();
        setPan((value) => ({ ...value, x: value.x - 36 }));
        return;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        nudgeZoom(0.12);
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        nudgeZoom(-0.12);
      }
      if (event.key === "0") {
        event.preventDefault();
        resetView();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, nudgeZoom, onClose, resetView, setProgressSnapped]);

  const onViewportPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const panDrag = event.shiftKey || event.button === 1;
      if (!panDrag && event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      isDraggingRef.current = true;
      setIsDragging(true);
      const mode: DragMode = panDrag ? "pan" : "orbit";
      setDragMode(mode);
      dragOrigin.current = {
        x: event.clientX,
        y: event.clientY,
        orbitX: orbit.x,
        orbitY: orbit.y,
        panX: pan.x,
        panY: pan.y,
        mode,
      };
    },
    [orbit.x, orbit.y, pan.x, pan.y],
  );

  const onViewportPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      const dx = event.clientX - dragOrigin.current.x;
      const dy = event.clientY - dragOrigin.current.y;

      if (dragOrigin.current.mode === "pan") {
        setPan({
          x: dragOrigin.current.panX + dx,
          y: dragOrigin.current.panY + dy,
        });
        return;
      }

      setOrbit({
        y: dragOrigin.current.orbitY + dx * 0.4,
        x: Math.min(62, Math.max(-62, dragOrigin.current.orbitX - dy * 0.28)),
      });
    },
    [],
  );

  const endViewportDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      isDraggingRef.current = false;
      setIsDragging(false);
    },
    [],
  );

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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nudgeZoom(-0.15)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:text-white"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-12 text-center text-[10px] tracking-widest text-neutral-500">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => nudgeZoom(0.15)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:text-white"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:text-white"
            aria-label="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-800 px-4 py-1.5 text-[10px] tracking-widest text-neutral-400 uppercase transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <p
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute top-4 right-0 left-0 z-10 text-center text-[10px] tracking-[0.3em] text-neutral-600 uppercase transition-opacity duration-200"
        >
          Drag twist · Shift+drag move · Scroll roll · End jumps to last panel
        </p>

        <div
          ref={viewportRef}
          className={`flex h-full items-center justify-center px-4 py-6 md:px-8 ${
            dragMode === "pan" ? "cursor-move" : "cursor-grab active:cursor-grabbing"
          }`}
          onPointerDown={onViewportPointerDown}
          onPointerMove={onViewportPointerMove}
          onPointerUp={endViewportDrag}
          onPointerCancel={endViewportDrag}
          onDoubleClick={resetView}
        >
          <div
            className="relative h-[min(70vh,720px)] w-full max-w-5xl"
            style={{
              perspective: 1200 / zoom,
              perspectiveOrigin: "50% 50%",
              WebkitPerspective: 1200 / zoom,
            }}
          >
            <motion.div
              animate={{ x: pan.x, y: pan.y }}
              transition={
                isDragging && dragMode === "pan"
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 140, damping: 24 }
              }
              className="relative h-full w-full"
            >
              <motion.div
                animate={{
                  scale: zoom,
                  rotateX: orbit.x,
                  rotateY: orbit.y,
                }}
                transition={
                  isDragging && dragMode === "orbit"
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 140, damping: 24 }
                }
                style={{
                  transformStyle: "preserve-3d",
                  WebkitTransformStyle: "preserve-3d",
                }}
                className="relative h-full w-full"
              >
              <motion.div
                animate={{ rotateX: panelRotateX }}
                transition={{ type: "spring", stiffness: 180, damping: 26 }}
                style={{
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
                      transform: `rotateX(${-index * step}deg) translateZ(${radius}px)`,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <div className="w-full max-w-4xl rounded-[2rem] bg-neutral-950/85 px-6 py-8 md:px-10 md:py-10">
                      <MarkdownPreview
                        variant="face3d"
                        content={face}
                        className="max-h-full w-full text-center"
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
              </motion.div>
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
          Panel {activeFace} / {faces.length} · Move {Math.round(pan.x)},{" "}
          {Math.round(pan.y)} · Tilt {Math.round(orbit.x)}° · Twist{" "}
          {Math.round(orbit.y)}° · 0 resets
        </p>
      </div>
    </div>
  );
}
