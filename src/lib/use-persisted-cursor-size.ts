"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "noteslib-cursor-size";
export const DEFAULT_CURSOR_SIZE = 22;
export const MIN_CURSOR_SIZE = 10;
export const MAX_CURSOR_SIZE = 72;

function clampCursorSize(value: number) {
  return Math.min(MAX_CURSOR_SIZE, Math.max(MIN_CURSOR_SIZE, value));
}

export function usePersistedCursorSize() {
  const [cursorSize, setCursorSizeState] = useState(DEFAULT_CURSOR_SIZE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) {
        setCursorSizeState(clampCursorSize(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  const setCursorSize = useCallback(
    (value: number | ((current: number) => number)) => {
      setCursorSizeState((current) => {
        const next =
          typeof value === "function" ? value(current) : value;
        const clamped = clampCursorSize(next);
        try {
          localStorage.setItem(STORAGE_KEY, String(clamped));
        } catch {
          // ignore
        }
        return clamped;
      });
    },
    [],
  );

  return { cursorSize, setCursorSize };
}
