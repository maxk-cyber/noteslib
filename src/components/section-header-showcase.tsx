"use client";

import { SkiperHoverTitle } from "@/components/skiper-hover-title";

type SectionHeaderShowcaseProps = {
  /** Shown at rest (like Skiper6 defaultName). */
  defaultText: string;
  /** Shown when hovering section thumbs. */
  hoverText: string;
  stripHovered: boolean;
};

export function SectionHeaderShowcase({
  defaultText,
  hoverText,
  stripHovered,
}: SectionHeaderShowcaseProps) {
  const text = stripHovered ? hoverText : defaultText;

  return (
    <div className="relative left-1/2 mt-2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden">
      <SkiperHoverTitle text={text} active={stripHovered} />
    </div>
  );
}
