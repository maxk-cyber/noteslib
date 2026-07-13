"use client";

import { motion } from "framer-motion";

type SectionThumbProps = {
  index: number;
  title: string;
  preview: string;
  isActive: boolean;
  onSelect: () => void;
};

export function SectionThumb({
  index,
  title,
  preview,
  isActive,
  onSelect,
}: SectionThumbProps) {
  return (
    <motion.button
      type="button"
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onSelect}
      initial={{ width: 56, height: 56 }}
      animate={{ width: isActive ? 112 : 56, height: isActive ? 112 : 56 }}
      transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
      className="shrink-0 p-1 md:p-1.5"
    >
      <div
        className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border transition-colors ${
          isActive
            ? "border-emerald-400/60 bg-emerald-950/70"
            : "border-neutral-800 bg-neutral-950/80 hover:border-emerald-500/30"
        }`}
      >
        <span className="text-[10px] tracking-[0.3em] text-emerald-400/80 uppercase">
          {String(index + 1).padStart(2, "0")}
        </span>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 bottom-0 bg-emerald-950/85 p-2 text-center"
          >
            <p className="line-clamp-1 text-[8px] tracking-widest text-emerald-100 uppercase">
              {title}
            </p>
            {preview && (
              <p className="mt-1 line-clamp-2 text-[8px] leading-snug text-white/70">
                {preview}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
