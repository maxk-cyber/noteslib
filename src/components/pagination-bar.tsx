"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type PaginationBarProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  label,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex flex-col items-center gap-2">
        {label && (
          <span className="text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
            {label}
          </span>
        )}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            const active = pageNumber === page;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                className="relative flex h-2.5 w-2.5 items-center justify-center"
              >
                <motion.span
                  animate={{
                    scale: active ? 1.35 : 1,
                    opacity: active ? 1 : 0.35,
                  }}
                  className={`block h-2 w-2 rounded-full ${
                    active ? "bg-emerald-400" : "bg-neutral-600"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <span className="text-[10px] tracking-widest text-neutral-500">
          {page} / {totalPages}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
