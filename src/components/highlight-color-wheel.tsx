"use client";

import { useCallback, useRef, useState } from "react";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  HIGHLIGHT_PRESETS,
  hexToHsl,
  hslToHex,
} from "@/lib/highlight-colors";

type HighlightColorWheelProps = {
  value: string;
  onChange: (hex: string) => void;
};

function pickHueFromWheel(
  element: HTMLDivElement,
  clientX: number,
  clientY: number,
) {
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const radius = rect.width / 2;
  const distance = Math.hypot(dx, dy);
  if (distance < radius * 0.18 || distance > radius) return null;

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  return angle < 0 ? angle + 360 : angle;
}

export function HighlightColorWheel({
  value,
  onChange,
}: HighlightColorWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const initial = hexToHsl(value || DEFAULT_HIGHLIGHT_COLOR);
  const [hue, setHue] = useState(initial.h);
  const [lightness, setLightness] = useState(initial.l);

  const applyHue = useCallback(
    (nextHue: number) => {
      setHue(nextHue);
      onChange(hslToHex(nextHue, 88, lightness));
    },
    [lightness, onChange],
  );

  const applyLightness = useCallback(
    (nextLightness: number) => {
      setLightness(nextLightness);
      onChange(hslToHex(hue, 88, nextLightness));
    },
    [hue, onChange],
  );

  const handleWheelPick = useCallback(
    (clientX: number, clientY: number) => {
      const wheel = wheelRef.current;
      if (!wheel) return;
      const nextHue = pickHueFromWheel(wheel, clientX, clientY);
      if (nextHue === null) return;
      applyHue(nextHue);
    },
    [applyHue],
  );

  const indicatorRadius = 38;

  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="flex flex-col items-center gap-2">
        <div
          ref={wheelRef}
          className="relative h-28 w-28 cursor-crosshair rounded-full shadow-inner"
          style={{
            background:
              "conic-gradient(from 0deg, #ef4444, #facc15, #4ade80, #22d3ee, #3b82f6, #a78bfa, #f472b6, #ef4444)",
          }}
          onPointerDown={(event) => {
            dragging.current = true;
            wheelRef.current?.setPointerCapture(event.pointerId);
            handleWheelPick(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (!dragging.current) return;
            handleWheelPick(event.clientX, event.clientY);
          }}
          onPointerUp={(event) => {
            dragging.current = false;
            wheelRef.current?.releasePointerCapture(event.pointerId);
          }}
          onPointerLeave={() => {
            dragging.current = false;
          }}
          role="application"
          aria-label="Highlight colour wheel"
        >
          <div className="absolute inset-[18%] rounded-full bg-[#080808] ring-1 ring-neutral-800" />
          <span
            className="pointer-events-none absolute top-1/2 left-1/2 block h-3.5 w-3.5 rounded-full border-2 border-white shadow-md"
            style={{
              backgroundColor: value,
              transform: `translate(-50%, -50%) rotate(${hue}deg) translateY(-${indicatorRadius}px)`,
            }}
          />
        </div>
        <label className="flex w-28 flex-col gap-1 text-[10px] tracking-wider text-neutral-500 uppercase">
          Lightness
          <input
            type="range"
            min={35}
            max={78}
            value={lightness}
            onChange={(event) => applyLightness(Number(event.target.value))}
            className="accent-emerald-400"
          />
        </label>
      </div>

      <div className="flex min-w-[10rem] flex-col gap-2">
        <p className="text-[10px] tracking-wider text-neutral-500 uppercase">
          Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              title={preset.label}
              onClick={() => {
                const hsl = hexToHsl(preset.hex);
                setHue(hsl.h);
                setLightness(hsl.l);
                onChange(preset.hex);
              }}
              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${
                value.toLowerCase() === preset.hex.toLowerCase()
                  ? "border-white scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: preset.hex }}
            />
          ))}
        </div>
        <label className="flex items-center gap-2 text-[10px] tracking-wider text-neutral-500 uppercase">
          Custom
          <input
            type="color"
            value={value}
            onChange={(event) => {
              const hsl = hexToHsl(event.target.value);
              setHue(hsl.h);
              setLightness(hsl.l);
              onChange(event.target.value);
            }}
            className="h-8 w-10 cursor-pointer rounded border border-neutral-700 bg-transparent"
          />
        </label>
      </div>
    </div>
  );
}
