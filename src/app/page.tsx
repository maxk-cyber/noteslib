import { Bebas_Neue } from "next/font/google";
import { NotesLibrary } from "@/components/notes-library";
import { listNotes } from "@/lib/services/note.service";

export const dynamic = "force-static";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

export default async function Home() {
  const notes = await listNotes();

  return <NotesLibrary initialNotes={notes} fontClass={bebas.className} />;
}
