"use client";

import { motion } from "framer-motion";
import { assetPath } from "@/lib/asset-path";

type NoteHeaderVideoProps = {
  title: string;
};

export function NoteHeaderVideo({ title }: NoteHeaderVideoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
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
      <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center">
        <span className="text-[9px] tracking-[0.35em] text-emerald-300/50 uppercase">
          {title}
        </span>
      </div>
    </motion.div>
  );
}
