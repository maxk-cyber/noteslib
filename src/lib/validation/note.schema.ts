import { z } from "zod";
import { isNoteIconName, DEFAULT_NOTE_ICON } from "@/lib/note-icons";

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().min(1, "Author is required").max(200),
  content: z.string().min(1, "Note content is required").max(50000),
  icon: z
    .string()
    .optional()
    .default(DEFAULT_NOTE_ICON)
    .refine(isNoteIconName, "Invalid icon"),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
