"use client";

import { AnimatePresence, motion } from "framer-motion";
import { assetPath } from "@/lib/asset-path";

type NoteHeaderVideoProps = {
  sectionTitle: string;
  sectionPreview?: string;
};

export function NoteHeaderVideo({
  sectionTitle,
  sectionPreview,
}: NoteHeaderVideoProps) {
  const displayTitle = sectionTitle.toUpperCase();

  return (
    <motion.div
      layout
      className="relative mx-auto mt-5 h-24 w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-500/10 md:h-28"
      aria-hidden
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="h-full w-full scale-110 object-cover opacity-55 mix-blend-screen saturate-125 hue-rotate-[95deg]"
        src={assetPath("/video/skiper6.mp4")}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080808] via-[#080808]/20 to-[#080808]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#080808_88%)]" />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionTitle}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-[10px] tracking-[0.4em] text-emerald-300/90 uppercase md:text-xs">
              {displayTitle}
            </span>
            {sectionPreview && (
              <span className="line-clamp-2 max-w-md text-[8px] leading-snug tracking-[0.15em] text-emerald-100/45 uppercase">
                {sectionPreview}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
