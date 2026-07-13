"use client";

import { useState } from "react";
import { NoteIcon } from "@/components/note-icon";
import {
  DEFAULT_NOTE_ICON,
  NOTE_ICONS,
  type NoteIconName,
} from "@/lib/note-icons";

type IconPickerProps = {
  name?: string;
  defaultValue?: NoteIconName;
};

export function IconPicker({
  name = "icon",
  defaultValue = DEFAULT_NOTE_ICON,
}: IconPickerProps) {
  const [selected, setSelected] = useState<NoteIconName>(defaultValue);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs tracking-wider text-neutral-500 uppercase">
        Icon
      </span>
      <input type="hidden" name={name} value={selected} />
      <div className="grid grid-cols-8 gap-2">
        {NOTE_ICONS.map((icon) => {
          const isSelected = selected === icon;
          return (
            <button
              key={icon}
              type="button"
              title={icon}
              onClick={() => setSelected(icon)}
              className={`flex aspect-square items-center justify-center rounded-md border transition-colors ${
                isSelected
                  ? "border-emerald-400 bg-emerald-950/50 text-emerald-300"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600 hover:text-white"
              }`}
            >
              <NoteIcon name={icon} className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
