"use client";

import { motion, useSpring } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type GraffitiCursorProps = {
  active: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  theme?: "red" | "purple" | "yellow" | "green";
  sizePx?: number;
};

const cursorColors = {
  red: "bg-red-500",
  purple: "bg-violet-500",
  yellow: "bg-yellow-400",
  green: "bg-emerald-400",
};

/** Arrow scales with circle — matches Skiper6 ~40% of cursor diameter. */
const ICON_RATIO = 0.4;

export function GraffitiCursor({
  active,
  containerRef,
  theme = "red",
  sizePx = 22,
}: GraffitiCursorProps) {
  const box = Math.max(8, Math.min(96, sizePx));
  const offset = box / 2;
  const iconSize = box * ICON_RATIO;

  const [visible, setVisible] = useState(false);
  const cursorX = useSpring(0, { stiffness: 500, damping: 40, mass: 0.6 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 40, mass: 0.6 });
  const scale = useSpring(0, { stiffness: 400, damping: 30 });

  const onMove = useCallback(
    (event: MouseEvent) => {
      cursorX.set(event.clientX - offset);
      cursorY.set(event.clientY - offset);
    },
    [cursorX, cursorY, offset],
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
      className={`pointer-events-none fixed top-0 left-0 z-[250] flex items-center justify-center rounded-full ${cursorColors[theme]}`}
      style={{
        x: cursorX,
        y: cursorY,
        scale,
        width: box,
        height: box,
        transformOrigin: "center center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        width={iconSize}
        height={iconSize}
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
