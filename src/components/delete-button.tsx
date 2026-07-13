"use client";

import { useCallback, useState } from "react";

type DeleteButtonProps = {
  label: string;
  confirmMessage: string;
  onDelete: () => Promise<void>;
  className?: string;
  accent?: "red" | "yellow" | "neutral" | "green";
};

const accentClasses = {
  red: "text-neutral-500 hover:text-red-500",
  yellow: "text-neutral-500 hover:text-yellow-400",
  neutral: "text-neutral-500 hover:text-white",
  green: "text-neutral-500 hover:text-emerald-400",
};

export function DeleteButton({
  label,
  confirmMessage,
  onDelete,
  className,
  accent = "neutral",
}: DeleteButtonProps) {
  const [deleting, setDeleting] = useState(false);

  const handleClick = useCallback(async () => {
    if (!window.confirm(confirmMessage)) return;

    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }, [confirmMessage, onDelete]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={deleting}
      className={`text-xs tracking-[0.25em] uppercase transition-colors disabled:opacity-50 ${accentClasses[accent]} ${className ?? ""}`}
    >
      {deleting ? "Deleting…" : label}
    </button>
  );
}
