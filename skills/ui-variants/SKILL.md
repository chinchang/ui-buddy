---
name: ui-variants
description: 'When the user wants to explore alternate UI designs for a specific section of a website by generating multiple variants and toggling between them live in the browser. Use when the user says "give me variants of this section," "show alternate designs for the hero," "try 3 versions of this pricing block," "redesign this with options," "A/B the header," "variant toggle," "compare UI options," "cycle through designs," or points to a section and asks for alternatives. Also handles the promote/teardown loop after exploration — "ship variant B", "promote the bento layout", "finalize this variant", "remove the variant exploration", "tear down variants", "revert the variant scaffolding". Generates 2–4 distinct redesigns plus keeps the original, injects a dev-only floating toggle chip, and makes switching realtime with no rebuild. For designing a single UI, use frontend-design. For marketing copy variations, use copywriting.'
---

# ui-variants

This skill takes any section of a website and delivers a live A/B/C/D comparison tool in the running page. It (1) generates alternate UI designs for the section with distinct aesthetic directions, (2) injects a dev-only floating toggle, and (3) wires the toggle so clicking or pressing `1`/`2`/`3`… swaps variants **in realtime in the browser** — no rebuild, no manual swap.

The toggle never reaches production: it is gated by `NODE_ENV` or a `?variants=1` query param, and production builds short-circuit to render only the original.

## Modes

This skill has three modes. Infer the mode from the user's arguments:

| Mode | Trigger | What it does |
|---|---|---|
| **generate** (default) | Any free-form request like "give me 3 variants of the hero" | Full generate workflow below (Inputs → Workflow → Handoff). This is how the skill is normally invoked for the first time on a section. |
| **promote** | Args start with `promote <section> [variant]` (or natural-language equivalents like "ship variant B", "finalize the bento layout") | Replace the original with the chosen variant, delete losing variants, tear down the switcher scaffolding for that section. See [Promote workflow](#promote-workflow). |
| **reject** | Args start with `reject <section>` (or "tear down variants", "revert the exploration") | Delete all variant scaffolding for the section; the original section file is byte-identical so nothing to restore there. See [Reject workflow](#reject-workflow). |

Both **promote** and **reject** are destructive. Always discover → plan → **ask the user to confirm** → then edit. Never skip the confirmation step.

## Inputs to gather

If any are missing, ask the user:

1. **Target section.** Accept any of:
   - Explicit file path + CSS selector or component name (e.g., `src/components/Hero.tsx`, or `index.html` with selector `.hero`)
   - Natural-language description (e.g., "the hero on the homepage") — resolve by searching the codebase with Glob/Grep
   - Screenshot + rough pointer — resolve by reading likely files

   If you resolved the target (not given explicitly), **confirm it with the user** before generating variants.

2. **Tech stack.** Infer from `package.json` and file extensions; confirm if ambiguous. Supported: plain HTML/CSS/JS, React, Next.js, Vue, Svelte/SvelteKit, Astro.

3. **Scope — ask every invocation:**
   - *Visual-only* (recommended): same DOM structure, same handlers, only typography/layout/color/motion/spacing change. Produces a fair realistic comparison.
   - *Allowed to restructure*: variants may reorganize CTAs, change form flow, reorder content. Richer exploration but variants no longer behave identically.

4. **Aesthetic guardrails.** Any brand constraints (required fonts, colors, tone) or total freedom?

Use `AskUserQuestion` to collect these concisely when multiple are missing.

## Workflow

### Step 1 — Analyze the target

- Read the file containing the section.
- Identify semantic content: headings, body copy, CTAs, media, interactive elements, data bindings.
- Identify the section's **role** (hero, features grid, pricing, testimonial, nav, footer, CTA band, logo wall, FAQ, etc.) — this informs variant direction.
- Detect framework and styling approach: Tailwind, CSS Modules, styled-components, plain CSS, CSS-in-JS, etc.
- List every prop, state value, handler, and external data dependency the section touches. Variants must preserve all of these unless the user chose "restructure."

### Step 2 — Pick 3 distinct aesthetic directions

**Load all three references before choosing:**
- `references/variant-playbook.md` — aesthetic archetypes and role-specific starting points
- `references/design-principles.md` — baseline polish + accessibility rules; the **anti-AI-slop checklist**
- `references/signature-moves.md` — **the Boldness Quota.** Concrete award-site-level signature moves, required per variant, plus a curated font library and set-level diversity requirements

The goal is output that looks like a professional, daring designer made it — the kind of work that wins at design awards shows. Polished-but-safe is the failure mode. Commit to unusual moves.

Core rules:

- The three directions must be **meaningfully different from each other AND from the original**, not three flavors of the same idea.
- **Every variant must clear the Boldness Quota from `signature-moves.md`** (≥3 signature moves per variant, drawn from different categories, with at least one composition move and one typography move).
- **The set of three collectively must include**: one dark variant, one typography-led variant, one motion-heavy variant, at least one saturated/acid accent, and three different font pairings. See the set-level checklist in `signature-moves.md`.
- Vary on **polish axes** too: one variant leads with depth (layered shadows, overlap), one with typographic restraint, one with color commitment.
- Pick **characterful fonts** from the curated list in `signature-moves.md`. Inter / Roboto / system-ui as the only font is forbidden — it's the #1 AI tell.
- Apply the core design rules: colored grays (never pure `#888`), dark-gray on off-white (never `#000` on `#fff`), offset multi-layer shadows (never symmetric glows), hierarchy through weight + color (not just size), hue-rotate-to-brighten, non-linear spacing scales.
- **Name each direction explicitly** with words that convey the boldness (e.g., "Acid Editorial", "Kinetic Marquee", "Midnight Lookbook"). Avoid generic names like "Modern Clean" or "Variant A".

### Step 3 — Generate the 3 variant implementations

Create each variant as a sibling file next to the original. Naming convention:

- React/Next: `HeroVariantA.tsx`, `HeroVariantB.tsx`, `HeroVariantC.tsx` (original stays `Hero.tsx`)
- Vue: `HeroVariantA.vue`, etc.
- Svelte: `HeroVariantA.svelte`, etc.
- Vanilla HTML: `hero-variant-a.html` partials OR `<template id="hero-variant-a">` tags next to the original markup

Each variant must:

- Preserve all content, links, form `action`s, button handlers, and interactive behavior of the original (unless restructure was opted into)
- Match the project's framework and styling conventions
- Be self-contained: styles scoped, no global side effects, safe to mount/unmount repeatedly
- **Hit the Boldness Quota** from `references/signature-moves.md` — ≥3 signature moves per variant, including ≥1 composition move and ≥1 typography move. Use a characterful font (not Inter/Roboto/system-ui alone). Commit to the unusual moves; don't dilute them.
- **Obey `references/design-principles.md`.** As you write the CSS, run the anti-AI-slop checklist: tint grays toward brand temperature, offset multi-layer shadows (no symmetric glows), no `#000`-on-`#fff`, left-align paragraphs, non-linear spacing scale, hierarchy by weight + color rather than just size.
- Meet **WCAG contrast** (4.5:1 body, 3:1 large text), preserve visible focus rings, use semantic HTML, and respect `prefers-reduced-motion` for any added animation. Boldness does not override accessibility — motion-heavy variants MUST have a reduced-motion fallback that still looks intentional.
- Load any external fonts via `@import` or `<link>` at the top of the variant's CSS/JSX. Prefer Google Fonts for commercial-safe drop-ins; note the license if using a premium foundry.

**Do not modify the original** — it must remain byte-identical so "Original" in the toggle really is the original.

### Step 4 — Inject the variant switcher (dev-only)

Wrap the section's render site with a `VariantSwitcher` that:

- **Gates rendering on dev-only flags:**
  - Frameworks with bundlers: `process.env.NODE_ENV !== 'production' || new URLSearchParams(location.search).has('variants')`
  - Vanilla HTML: `location.hostname === 'localhost' || location.search.includes('variants=1')`
  - When the gate is false, render the original directly with zero runtime cost.
- Reads current variant from `localStorage` (key: `ui-variant:<section-id>`), defaults to `original`.
- Renders the floating toggle chip (Step 5).
- Renders the selected variant in place.
- On click: updates state and `localStorage` → realtime re-render.

Drop-in implementations per framework live in `references/toggle-ui.md`. Load it when you start writing the switcher.

### Step 5 — The toggle UI

Floating corner chip, `position: fixed`, top-right of viewport, 16px offset. Key behaviors:

- Four compact segments: `O · A · B · C` (single-letter) with the direction name as tooltip on hover.
- Active segment visually distinct (filled background, inverted text).
- Neutral monochrome styling with subtle `backdrop-filter: blur(8px)` — must not compete with any variant's aesthetic.
- Small **PREVIEW** badge on the chip so it can't be mistaken for production UI.
- Keyboard: arrow keys cycle segments, Enter selects, `V` key toggles chip visibility.
- Small `×` dismisses the chip for the session (`sessionStorage`) — useful for screenshotting.
- Multiple sections on the same page: chips stack vertically with a label prefix (e.g., "Hero", "Pricing"), each scoped by section id.
- ARIA: `role="radiogroup"`, each segment `role="radio"` with `aria-checked`.

Pull the exact CSS/JS from `references/toggle-ui.md`.

### Step 6 — Verify live

Before opening the browser, run **both** pre-flight checklists against every variant and iterate on anything that fails:

- **Boldness checklist** from `references/signature-moves.md` — count signature moves per variant, verify set-level diversity (dark / typography-led / motion-heavy / acid accent / three font pairings).
- **Pre-ship checklist** from `references/design-principles.md` — polish + accessibility.

If a variant passes polish but fails boldness, it's a "safe" variant — rework it with a stronger signature move from category 1, 2, or 3.

Then verify live:

1. Start the dev server (or open the static file in a browser).
2. Navigate to the page containing the section.
3. Confirm the toggle chip appears.
4. Click each of the 4 options — each must swap the section **instantly** with no page reload.
5. Reload the page — the last selected variant must persist.
6. Confirm the rest of the page is unaffected.
7. Confirm interactive behavior (forms submit, links navigate, buttons fire their handlers) inside every variant.
8. Tab through each variant — focus rings must be visible on every interactive element.
9. Build for production (or visit without `?variants=1`) and confirm the toggle does **not** appear and the original renders.

If you have access to Chrome DevTools MCP tools, use them to take screenshots of all 4 variants for the user.

### Step 7 — Handoff notes

Tell the user:

- **To promote a variant**: run `/ui-variants promote <section> <variant>` — the skill replaces the original with the chosen variant, cleans up losing variants and switcher scaffolding, and shows a per-file plan before editing. See [Promote workflow](#promote-workflow).
- **To remove entirely**: run `/ui-variants reject <section>` — restores pre-skill state. The original section file was never modified, so it's already correct. See [Reject workflow](#reject-workflow).
- **To add more variants later**: re-invoke this skill on the same section; it will append `VariantD` (and so on) alongside the existing ones.
- **Keyboard shortcuts for review**: `1..N` applies option N to the section currently in the viewport (1 = Original, 2 = first variant, 3 = second, …). `V` hides/shows all chips for screenshotting. Selections round-trip via `?<section-id>=<key>` so URLs are shareable.

## Framework matrix

| Framework | Variant files | Switcher | State |
|---|---|---|---|
| React / Next.js | Sibling `.tsx` files | `<VariantSwitcher>` with `useState` + `useEffect` | `localStorage` + URL |
| Vue 3 | Sibling `.vue` files | `<VariantSwitcher>` using `ref` + `watchEffect` | `localStorage` + URL |
| Svelte / SvelteKit | Sibling `.svelte` files | `{#if}` block in wrapper | `$state` rune + `localStorage` + URL |
| Vanilla HTML/CSS/JS | `<template>` tags or HTML partials | `<script>` swapping `innerHTML` | `localStorage` + URL |
| Astro | Client island (`client:load`) around section | React/Vue/Svelte island | `localStorage` + URL |

## Promote workflow

Invoked as `/ui-variants promote <section> [variant]`, or via natural-language equivalents ("ship variant B", "finalize the bento layout for features"). The user has picked a winner; finalize it by replacing the original with the variant's contents, deleting losing variants, and tearing down the switcher scaffolding **for that section only**.

### Step P1 — Parse the command

- `<section>` — match against `data-uiv-section` (Vanilla) or the `sectionId` prop (framework). Slug the user's input if needed.
- `<variant>` — accept either (a) the variant key (`a`, `b`, `c`, …) or (b) the direction name slugified (e.g., `bento-dispatch` matches `data-uiv-names: {"a":"Bento Dispatch"}`). Case-insensitive.
- If `<variant>` is missing or ambiguous, list the candidates and ask with `AskUserQuestion`. Don't guess.

### Step P2 — Discovery (read-only, before any edit)

Read, in this order:

1. The HTML or component file holding the target section — note markup, the `data-uiv-section` / `data-uiv-names` attrs, and any inline `<script>` tags that exist only because of specific variants (e.g., a live clock driving a variant-only element).
2. **Vanilla**: each `<template data-uiv-for="<section>" ...>` sibling — one is the winner, the rest are losers. **Framework**: each variant component file (`*VariantA.tsx`, …) and the switcher wrapper at the call site.
3. The CSS file with variant-scoped blocks (`ui-variants.css` or equivalent):
   - Blocks scoped to the winner: `.<section>[data-variant="<winner-key>"] ...`
   - Blocks scoped to losers.
   - Shared chip styles (`.uiv-chip*`) — always preserved.
   - Font `@import` URLs at the top — for each font, grep the file to see which scoped blocks use it. A font used only by losers is orphaned and removable; one also used by the winner or elsewhere is kept.
4. The switcher source + any `<script src="...">` / `<link rel="stylesheet" href="...">` tags — note whether **any other section** still has `data-uiv-section` or still registers with the switcher. Use `grep -r 'data-uiv-section'` across the codebase to be sure.

### Step P3 — Plan (print before editing)

Output a concrete per-file plan. Example:

```
Promoting `features` → Bento Dispatch (key: a).

HTML (demo.html):
  - Replace .features inner markup with Variant A template contents.
  - Remove data-uiv-section / data-uiv-names attrs from .features.
  - Remove <template data-uiv-for="features" data-uiv-variant="b">.
  - Remove inline <script> for [data-fvb-clock] (used only by variant B).

CSS (ui-variants.css):
  - Rewrite 10 selectors: `.features[data-variant="a"] .fva__*` → `.features .fva__*`.
  - Delete .features[data-variant="b"] .fvb__* block (~180 lines).
  - Keep Google Fonts @import for Fraunces + JetBrains Mono (winner uses them).
  - Remove Unbounded + IBM Plex Mono from @import (only variant B used them).

JS (ui-variants.js):
  - Unchanged. Other sections (hero, testimonial) still use the switcher.

Other script/link tags:
  - Unchanged (other sections still need `ui-variants.js` + `ui-variants.css`).
```

### Step P4 — Confirm

**Always stop and ask the user to confirm before editing.** If they say no, abort. If they push back on a specific line (e.g., "keep variant B's CSS, I'm using it elsewhere"), incorporate and re-print the plan. Don't proceed until you have an explicit yes.

### Step P5 — Execute

After explicit confirmation:

- Apply HTML edits via `Edit`. Replace the section's inner markup wholesale. Preserve surrounding whitespace/indentation.
- Apply CSS edits:
  - **Selector rewrite rule**: drop the `[data-variant="<winner-key>"]` attribute selector. Keep everything else in the selector intact.
    - `.features[data-variant="a"] .fva__tile { ... }` → `.features .fva__tile { ... }`
    - `.features[data-variant="a"] .fva__tile:hover` → `.features .fva__tile:hover`
    - `.features[data-variant="a"] { padding: 96px 40px; }` (standalone) → `.features { padding: 96px 40px; }`
  - Delete loser blocks entirely.
  - Remove orphaned `@import` URLs from the top of the file.
- For framework: replace the `<VariantSwitcher ...>` at the call site with a plain mount of the winner component; delete losing variant files. Optionally rename the winning file to the original's name — **confirm with user before renaming**, some teams want to keep the "Variant" suffix as a changelog marker.
- Tear down the switcher infra **only if** no other section still uses it. If `grep -r 'data-uiv-section'` returns zero hits after your HTML edits, then:
  - Remove the `<script src="ui-variants.js">` and `<link rel="stylesheet" href="ui-variants.css">`.
  - Delete `ui-variants.js`, `ui-variants.css`, `variant-switcher-shared.ts`, `VariantSwitcher.*`.

### Step P6 — Post-execution report

Summarize:

- Files changed + approximate line delta per file.
- Chips still active elsewhere on the page, if any.
- Conservative choices you made (e.g., "kept font Unbounded because it's also referenced in `styles.css` line 47").
- Suggest the user reload the page to confirm the promoted section renders cleanly without the chip.

## Reject workflow

Invoked as `/ui-variants reject <section>`, or via natural-language equivalents ("tear down variants on features", "revert the variant exploration"). The user is abandoning this exploration; restore byte-identical pre-skill state.

### Step R1 — Parse and warn

If the user didn't name a section, list sections currently under variant exploration (grep for `data-uiv-section`) and ask which one. Before executing, remind them the variant work is about to be deleted — ask for confirmation unless they already said "force" / "no prompt" / similar.

### Step R2 — Discovery

Same reads as Promote Step P2. You need to identify everything that was added **for this section**.

### Step R3 — Plan + confirm

Print a per-file deletion plan. The **section itself is preserved** — the skill never modified the original, so nothing to restore there.

### Step R4 — Execute

After confirmation:

- Delete all `<template data-uiv-for="<section>" ...>` blocks (Vanilla).
- Delete all variant component files for the section (framework): `<Section>VariantA.tsx`, `<Section>VariantB.tsx`, etc. Use the naming pattern established in Step 3 of the generate workflow.
- Delete `.<section>[data-variant="..."] ...` CSS blocks (all of them — no winner).
- Delete `data-uiv-section` and `data-uiv-names` attrs from the section element.
- Delete inline `<script>` tags added only for variant-specific features.
- Delete font `@import`s used only by the deleted blocks.
- Revert the switcher wrapper at the component call site (framework).
- If no other sections use the switcher anywhere in the codebase (grep to verify), tear down the shared infra: delete `ui-variants.js`, `ui-variants.css`, `variant-switcher-shared.ts`, `VariantSwitcher.*`, and remove their `<script>` / `<link>` tags.

### Step R5 — Post-execution

Confirm the original section file was not touched. Report files deleted and any shared resources kept (with their reasons). Suggest a page reload.

## Rules

- **Never modify the original section's file.** Original must stay byte-identical.
- **Never ship the switcher to production users.** The dev gate is mandatory, not optional.
- **Variants must not break page layout around them.** Test scroll, sticky siblings, and responsive breakpoints after injection.
- **Do not invent new content.** Keep headings, copy, and CTAs intact unless the user opted into restructure.
- **Design bar is non-negotiable.** Every variant must clear (a) the Boldness Quota in `references/signature-moves.md` AND (b) the anti-AI-slop + pre-ship checklists in `references/design-principles.md`. Variants that look like generic AI output (pure black/white, untinted grays, symmetric glow shadows, purple-pink gradients, centered paragraphs) are failures. Variants that are polished-but-safe (technically correct, zero signature moves, convergent defaults) are ALSO failures. The skill exists to produce award-quality design exploration, not more safe variants.
- **Accessibility is non-negotiable.** WCAG contrast, visible focus rings, semantic HTML, `prefers-reduced-motion` — apply on every variant.
- **Prefer the references.** Don't reinvent the toggle — pull from `references/toggle-ui.md` verbatim and adjust only the integration glue.
- **Diff-and-confirm before destructive ops.** The `promote` and `reject` sub-commands delete files and rewrite CSS — they are irreversible without git. Always run discovery → print the per-file plan → wait for explicit user confirmation → then edit. Never skip the confirmation step to "move faster."
- **When in doubt, keep.** For orphan detection during promote/reject (fonts, CSS rules, shared scripts) — if there's any ambiguity about whether a resource is still used, keep it and note the conservative choice in the post-execution report. It's cheap for the user to clean up later; it's expensive to recover a deleted file from before the promote.
- **Watch for user edits to the generated variants.** Between generate and promote, the user may have tweaked a variant's CSS or markup by hand. During promote discovery, if you see a variant that diverges from what the skill would have generated, preserve those tweaks in the promotion and flag them in the plan so the user knows their edits are being kept.
