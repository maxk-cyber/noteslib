import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().min(1, "Author is required").max(200),
  content: z.string().min(1, "Note content is required").max(50000),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
