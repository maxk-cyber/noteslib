import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import { NotePageActions } from "@/components/note-page-actions";
import { NoteViewer } from "@/components/note-viewer";
import { getNote, listNotes } from "@/lib/services/note.service";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const notes = await listNotes();
  return notes.map((note) => ({ id: note.id }));
}

export default async function NotePage({ params }: PageProps) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) notFound();

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xs tracking-[0.25em] text-neutral-500 uppercase transition-colors hover:text-white"
        >
          ← Notes
        </Link>
        {!process.env.NEXT_PUBLIC_GITHUB_PAGES && (
          <NotePageActions noteId={note.id} title={note.title} />
        )}
      </header>

      <NoteViewer
        noteId={note.id}
        title={note.title}
        author={note.author}
        content={note.content}
        fontClass={bebas.className}
        pagesMode={process.env.NEXT_PUBLIC_GITHUB_PAGES === "true"}
      />
    </div>
  );
}
