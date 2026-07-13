"use client";

import { AnimatePresence, motion, useSpring } from "framer-motion";
import { Play, Plus } from "lucide-react";
import { useEffect, useState, type PointerEvent } from "react";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerTimeRange,
} from "@/components/video-player";
import { cn } from "@/lib/utils";

type NoteVideoEmbedProps = {
  src: string;
  title?: string;
  compact?: boolean;
  onExpand?: () => void;
};

export function NoteVideoEmbed({
  src,
  title = "Video",
  compact = false,
  onExpand,
}: NoteVideoEmbedProps) {
  const [showPopOver, setShowPopOver] = useState(false);

  const open = () => {
    if (onExpand) {
      onExpand();
      return;
    }
    setShowPopOver(true);
  };

  return (
    <>
      {!onExpand ? (
        <AnimatePresence>
          {showPopOver ? (
            <VideoPopOver
              src={src}
              title={title}
              onClose={() => setShowPopOver(false)}
            />
          ) : null}
        </AnimatePresence>
      ) : null}

      <VideoPreviewTile
        src={src}
        title={title}
        compact={compact}
        onOpen={open}
      />
    </>
  );
}

type VideoPreviewTileProps = {
  src: string;
  title: string;
  compact?: boolean;
  onOpen: () => void;
};

function VideoPreviewTile({
  src,
  title,
  compact = false,
  onOpen,
}: VideoPreviewTileProps) {
  const x = useSpring(0, { mass: 0.1 });
  const y = useSpring(0, { mass: 0.1 });
  const opacity = useSpring(0, { mass: 0.1 });

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    opacity.set(1);
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - bounds.left);
    y.set(event.clientY - bounds.top);
  };

  return (
    <button
      type="button"
      data-diagram-hit
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpen();
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => opacity.set(0)}
      className={cn(
        "group relative mx-auto my-4 block cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-black transition-colors hover:border-emerald-500/40",
        compact ? "max-h-56 w-full max-w-md" : "max-w-3xl",
      )}
      aria-label={`Play video: ${title}`}
    >
      <motion.div
        style={{ x, y, opacity }}
        className="pointer-events-none absolute z-20 flex w-fit select-none items-center justify-center gap-2 p-2 text-sm text-white mix-blend-exclusion"
      >
        <Play className="size-4 fill-white" />
        Play
      </motion.div>

      <video
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        className={cn(
          "w-full object-cover",
          compact ? "aspect-video max-h-56" : "aspect-video",
        )}
      >
        <source src={src} />
      </video>

      <span className="pointer-events-none absolute right-3 bottom-3 rounded-full border border-neutral-700 bg-black/70 px-2.5 py-1 text-[10px] tracking-[0.2em] text-neutral-300 uppercase opacity-90">
        Open
      </span>
    </button>
  );
}

type VideoPopOverProps = {
  src: string;
  title: string;
  onClose: () => void;
};

export function NoteVideoPlayer({
  src,
  title,
  className,
}: {
  src: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-video w-full bg-black", className)}>
      <VideoPlayer style={{ width: "100%", height: "100%" }}>
        <VideoPlayerContent
          src={src}
          autoPlay
          slot="media"
          className="h-full w-full object-cover"
          style={{ width: "100%", height: "100%" }}
        />

        <VideoPlayerControlBar className="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-center justify-center px-5 mix-blend-exclusion md:px-10 md:py-5">
          <VideoPlayerPlayButton className="h-4 bg-transparent" />
          <VideoPlayerTimeRange className="bg-transparent" />
          <VideoPlayerMuteButton className="size-4 bg-transparent" />
        </VideoPlayerControlBar>
      </VideoPlayer>

      {title ? (
        <p className="pointer-events-none absolute top-3 left-4 text-[10px] tracking-[0.25em] text-white/70 uppercase">
          {title}
        </p>
      ) : null}
    </div>
  );
}

export function VideoPopOver({ src, title, onClose }: VideoPopOverProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  return (
    <div
      data-3d-overlay
      className="fixed inset-0 z-[130] flex cursor-none items-center justify-center p-4 md:p-8"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-lg"
      >
        <button
          type="button"
          aria-label="Close video"
          className="absolute inset-0"
          onClick={onClose}
        />
      </motion.div>
      <motion.div
        initial={{ clipPath: "inset(43.5% 43.5% 33.5% 43.5%)", opacity: 0 }}
        animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
        exit={{
          clipPath: "inset(43.5% 43.5% 33.5% 43.5%)",
          opacity: 0,
          transition: {
            duration: 1,
            type: "spring",
            stiffness: 100,
            damping: 20,
            opacity: { duration: 0.2, delay: 0.8 },
          },
        }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        className="relative z-10 aspect-video w-full max-w-7xl"
        onClick={(event) => event.stopPropagation()}
      >
        <NoteVideoPlayer src={src} title={title} />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 cursor-pointer rounded-full p-1 transition-colors"
          aria-label="Close video"
        >
          <Plus className="size-5 rotate-45 text-white" />
        </button>
      </motion.div>
    </div>
  );
}
