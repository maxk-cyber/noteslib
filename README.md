# Noteslib

Standalone markdown notes app — extracted from [musiclib](../). Skiper6-style showcase, graffiti UI, crowd backdrop, mermaid diagrams, colored markdown preview.

## Features

- Hover thumbnail showcase with green graffiti title
- Write notes in markdown (+ HTML color spans)
- Read in preview mode with mermaid diagram support
- Add and delete notes
- SQLite + Prisma

## Setup

```bash
cd noteslib
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed:demo   # optional welcome note
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Description |
|------|-------------|
| `/` | Notes showcase |
| `/[id]` | Note reader (markdown preview) |
| `/api/notes` | List / create |
| `/api/notes/[id]` | Get / delete |

## Separate repo

This folder is its own project. To use it as a fully separate git repo:

```bash
cd noteslib
git init
git add .
git commit -m "Initial noteslib"
```

Move it anywhere outside musiclib if you prefer: `mv noteslib ~/noteslib`

## Markdown tips

Colored text:

```html
<span class="text-emerald-400">green</span>
```

Mermaid (use a fenced block):

````markdown
```mermaid
flowchart TB
  A --> B
```
````
