"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Pan = { x: number; y: number };

type ZoomPanViewportProps = {
  zoom: number;
  resetKey?: string | number;
  children: ReactNode;
  className?: string;
};

export function ZoomPanViewport({
  zoom,
  resetKey,
  children,
  className,
}: ZoomPanViewportProps) {
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const canPan = zoom > 1;

  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [resetKey]);

  useEffect(() => {
    if (zoom <= 1) setPan({ x: 0, y: 0 });
  }, [zoom]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!canPan || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      isDraggingRef.current = true;
      dragOrigin.current = {
        x: event.clientX,
        y: event.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [canPan, pan.x, pan.y],
  );

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: dragOrigin.current.panX + (event.clientX - dragOrigin.current.x),
      y: dragOrigin.current.panY + (event.clientY - dragOrigin.current.y),
    });
  }, []);

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  return (
    <motion.div
      animate={{ scale: zoom, x: pan.x, y: pan.y }}
      transition={
        isDragging
          ? { type: "tween", duration: 0 }
          : { type: "spring", stiffness: 260, damping: 28 }
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`origin-top ${canPan ? "touch-none select-none" : ""} ${className ?? ""}`}
      data-pan-active={canPan || undefined}
      data-pan-dragging={isDragging || undefined}
    >
      {children}
    </motion.div>
  );
}
