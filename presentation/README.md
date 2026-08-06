# Angular Presentation

The slide deck for the Research & Knowledge Sharing Week assignment — a single
self-contained HTML file, no build step, no dependencies.

## Open it

Double-click `index.html`, or open it in a browser (File → Open, or drag it
in). It also works fine served from anything static (VS Code Live Server,
`npx serve`, GitHub Pages, etc).

## Navigate

- **→ / Space** — next slide
- **←** — previous slide
- **Home / End** — jump to first / last slide
- **F** — fullscreen

## Editing

Everything is in `index.html` — one `<style>` block for design tokens/layout,
then one `<section class="slide">...</section>` per slide in presentation
order, then a small script at the bottom that handles navigation. To add a
slide, copy an existing `<section class="slide">` block with the layout you
want (see the panel/code/table/diagram examples already in the file) and
drop it in wherever it should appear — the nav automatically picks up any
`.slide` in the document, nothing else needs updating.

**Still needs:** real team member names on the title slide (currently
"add your names here").
