"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type NoteHoverThumbProps = {
  href: string;
  noteId: string;
  title: string;
  preview: string;
  isActive: boolean;
  onHover: () => void;
};

export function NoteHoverThumb({
  href,
  noteId,
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
        <div className="relative h-full w-full overflow-hidden rounded-lg ring-1 ring-emerald-500/20">
          <Image
            src={`https://picsum.photos/seed/note-${noteId}/240/240`}
            alt={title}
            fill
            className="object-cover"
            sizes="120px"
            unoptimized
          />
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-end bg-emerald-950/65 p-2 text-center"
            >
              <span className="text-[9px] tracking-widest text-emerald-100 uppercase">
                {title}
              </span>
              {preview && (
                <p className="mt-1 line-clamp-2 text-[8px] leading-snug text-white/75">
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
