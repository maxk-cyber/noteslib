import { Bebas_Neue } from "next/font/google";
import { NotesLibrary } from "@/components/notes-library";
import { listNotes } from "@/lib/services/note.service";
import { resolveTitleColor } from "@/lib/note-colors";

export const dynamic = "force-static";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

export default async function Home() {
  const notes = (await listNotes())
    .filter((note) => note.title !== "Welcome")
    .map((note) => ({
      ...note,
      titleColor: resolveTitleColor(note.titleColor),
    }));

  return <NotesLibrary initialNotes={notes} fontClass={bebas.className} />;
}
