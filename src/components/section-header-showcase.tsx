"use client";

import { SkiperHoverTitle } from "@/components/skiper-hover-title";

type SectionHeaderShowcaseProps = {
  /** Shown at rest (like Skiper6 defaultName). */
  defaultText: string;
  /** Active section title. */
  sectionText: string;
  /** Show section title instead of note title. */
  showSection: boolean;
  /** Red hover style (thumb strip hovered). */
  active: boolean;
};

export function SectionHeaderShowcase({
  defaultText,
  sectionText,
  showSection,
  active,
}: SectionHeaderShowcaseProps) {
  const text = showSection ? sectionText : defaultText;

  return (
    <div className="relative left-1/2 mt-2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden">
      <SkiperHoverTitle text={text} active={active} />
    </div>
  );
}
