import { Suspense } from "react";
import { LocalNoteReader } from "@/components/local-note-reader";

export const dynamic = "force-static";

export default function ReadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080808] text-neutral-500">
          Loading…
        </div>
      }
    >
      <LocalNoteReader />
    </Suspense>
  );
}
