"use client";

import {
  DEFAULT_TITLE_COLOR,
  NOTE_TITLE_COLORS,
} from "@/lib/note-colors";

type NoteColorPickerProps = {
  name?: string;
  defaultValue?: string;
};

export function NoteColorPicker({
  name = "titleColor",
  defaultValue = DEFAULT_TITLE_COLOR,
}: NoteColorPickerProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs tracking-wider text-neutral-500 uppercase">
        Title colour
      </legend>
      <div className="flex flex-wrap gap-2">
        {NOTE_TITLE_COLORS.map((color) => (
          <label
            key={color.id}
            className="cursor-pointer"
            title={color.label}
          >
            <input
              type="radio"
              name={name}
              value={color.hex}
              defaultChecked={color.hex === defaultValue}
              className="peer sr-only"
            />
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-transparent transition-transform peer-checked:scale-110 peer-checked:border-white peer-focus-visible:ring-2 peer-focus-visible:ring-white/50"
              style={{ backgroundColor: color.hex }}
              aria-hidden
            />
            <span className="sr-only">{color.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
