"use client";

import { GraffitiTitle } from "@/components/graffiti-title";

type SectionHeaderShowcaseProps = {
  sectionTitle: string;
  hovered?: boolean;
  fontClass?: string;
};

/**
 * Skiper6 center stage: the same graffiti letter animation as the preview
 * video, but driven by the active section title (no mp4 overlay).
 */
export function SectionHeaderShowcase({
  sectionTitle,
  hovered = false,
  fontClass,
}: SectionHeaderShowcaseProps) {
  return (
    <div
      className={`relative mx-auto mt-4 flex min-h-[20vh] w-full items-center justify-center px-2 md:min-h-[24vh] ${fontClass ?? ""}`}
    >
      <GraffitiTitle
        key={sectionTitle}
        text={sectionTitle.toUpperCase()}
        hovered={hovered}
        variant="header"
        theme="green"
      />
    </div>
  );
}
