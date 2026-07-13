"use client";

import { motion, useSpring } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type GraffitiCursorProps = {
  active: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  theme?: "red" | "purple" | "yellow" | "green";
  size?: "default" | "small" | "tiny";
};

const cursorSizes = {
  default: { box: 120, offset: 60, icon: "h-5 w-5" },
  small: { box: 36, offset: 18, icon: "h-3 w-3" },
  tiny: { box: 18, offset: 9, icon: "h-2 w-2" },
} as const;

const cursorColors = {
  red: "bg-red-500",
  purple: "bg-violet-500",
  yellow: "bg-yellow-400",
  green: "bg-emerald-400",
};

export function GraffitiCursor({
  active,
  containerRef,
  theme = "red",
  size = "default",
}: GraffitiCursorProps) {
  const dimensions = cursorSizes[size];
  const [visible, setVisible] = useState(false);
  const cursorX = useSpring(0, { stiffness: 500, damping: 40, mass: 0.6 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 40, mass: 0.6 });
  const scale = useSpring(0, { stiffness: 400, damping: 30 });

  const onMove = useCallback(
    (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      cursorX.set(e.clientX - rect.left - dimensions.offset);
      cursorY.set(e.clientY - rect.top - dimensions.offset);
    },
    [containerRef, cursorX, cursorY, dimensions.offset],
  );

  useEffect(() => {
    scale.set(visible ? (active ? 1 : 0.85) : 0);
  }, [active, visible, scale]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const enter = () => setVisible(true);
    const leave = () => setVisible(false);

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    window.addEventListener("mousemove", onMove);

    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      window.removeEventListener("mousemove", onMove);
    };
  }, [containerRef, onMove]);

  return (
    <motion.div
      className={`pointer-events-none absolute top-0 left-0 z-50 flex items-center justify-center rounded-full ${cursorColors[theme]}`}
      style={{
        x: cursorX,
        y: cursorY,
        scale,
        width: dimensions.box,
        height: dimensions.box,
        transformOrigin: "center center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={dimensions.icon}
        aria-hidden
      >
        <path
          d="M6.52182 2.75026L12.8858 9.11422L15.253 0.38299L6.52182 2.75026Z"
          fill="white"
        />
        <path
          d="M0.333095 12.3331L3.30294 15.3029L10.3402 6.56864L9.0674 5.29585L0.333095 12.3331Z"
          fill="white"
        />
      </svg>
    </motion.div>
  );
}
