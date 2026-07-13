"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GraffitiTitle } from "@/components/graffiti-title";
import { assetPath } from "@/lib/asset-path";

type NoteHeaderVideoProps = {
  sectionTitle: string;
  hovered?: boolean;
};

export function NoteHeaderVideo({
  sectionTitle,
  hovered = false,
}: NoteHeaderVideoProps) {
  return (
    <div className="relative mx-auto mt-5 w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-500/10">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 mix-blend-screen saturate-125 hue-rotate-[95deg]"
        src={assetPath("/video/skiper6.mp4")}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-[#080808]/30 to-[#080808]/90" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#080808_85%)]" />

      <div className="relative z-10 flex min-h-24 items-center justify-center px-4 py-5 md:min-h-28 md:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <GraffitiTitle
              text={sectionTitle.toUpperCase()}
              hovered={hovered}
              variant="panel"
              theme="green"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
