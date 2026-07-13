import { NextResponse } from "next/server";
import { createNote, listNotes } from "@/lib/services/note.service";
import { createNoteSchema } from "@/lib/validation/note.schema";

export async function GET() {
  const notes = await listNotes();
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const note = await createNote(parsed.data);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json(
      { error: "Failed to save note" },
      { status: 500 },
    );
  }
}
