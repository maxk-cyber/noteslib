"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { NoteIcon } from "@/components/note-icon";

type NoteHoverThumbProps = {
  href: string;
  icon?: string | null;
  title: string;
  preview: string;
  isActive: boolean;
  onHover: () => void;
};

export function NoteHoverThumb({
  href,
  icon,
  title,
  preview,
  isActive,
  onHover,
}: NoteHoverThumbProps) {
  return (
    <motion.div
      initial={{ width: 60, height: 60 }}
      animate={{ width: isActive ? 120 : 60, height: isActive ? 120 : 60 }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
      className="shrink-0 p-1 md:p-1.5"
    >
      <Link
        href={href}
        onMouseEnter={onHover}
        className="block h-full w-full"
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-950/80 to-neutral-950 ring-1 ring-emerald-500/25">
          <NoteIcon
            name={icon}
            className={`text-emerald-300/90 transition-transform ${
              isActive ? "h-10 w-10" : "h-6 w-6"
            }`}
          />
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-end bg-emerald-950/75 p-2 text-center"
            >
              <span className="text-[9px] tracking-widest text-emerald-100 uppercase">
                {title}
              </span>
              {preview && (
                <p className="mt-1 line-clamp-2 whitespace-pre-line text-[8px] leading-snug text-white/75">
                  {preview}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
