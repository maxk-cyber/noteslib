"use client";

type SectionNumberStripProps = {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function SectionNumberStrip({
  count,
  activeIndex,
  onSelect,
}: SectionNumberStripProps) {
  if (count <= 1) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 px-2">
      {Array.from({ length: count }, (_, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Section ${index + 1}`}
            aria-current={active ? "true" : undefined}
            className={`min-w-[2.25rem] rounded-md border px-2 py-1 text-[10px] tracking-[0.25em] uppercase transition-colors ${
              active
                ? "border-emerald-400/70 bg-emerald-950/60 text-emerald-200"
                : "border-neutral-800 bg-neutral-950/80 text-neutral-500 hover:border-emerald-500/40 hover:text-emerald-300"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        );
      })}
    </div>
  );
}
