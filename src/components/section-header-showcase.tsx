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
    <div className="relative mx-auto mt-4 w-full px-2">
      <SkiperHoverTitle text={text} active={stripHovered} />
    </div>
  );
}
