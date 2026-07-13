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

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  author: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
  icon: z.string().optional().refine((value) => !value || isNoteIconName(value), "Invalid icon"),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
