# ui-buddy

A skill that takes **any section of a website** and, in one shot, generates **a set of alternate UI designs** for it (typically 2–4), injects a **dev-only floating toggle**, and wires it up so you can cycle `Original → Variant A → Variant B → …` **live in the browser** — no rebuild, no manual swap.

Built to help you A/B/C-compare real designs side-by-side before committing to one, and then automatically finalize the winner with a single `/ui-buddy promote` invocation.

![chip](./hero-b.png)

---

## Install

Using the [`skills` CLI](https://www.npmjs.com/package/skills):

```bash
# Global (available in every project)
npx skills add chinchang/ui-buddy -g

# Or just this project
npx skills add chinchang/ui-buddy
```

To install from a local clone:

```bash
npx skills add ./path/to/ui-buddy -g
```

The `skills` CLI installs into the agent-specific skills directory (for example `~/.claude/skills/ui-buddy/`, `~/.cursor/skills/ui-buddy/`, etc., or the project-scoped equivalent). Use `-a <agent>` to target a specific agent and `-g` for global scope.

---

## Usage

The skill has three modes. Invoke by name or slash command (syntax varies by agent):

### Generate (default)

```
/ui-buddy try 3 versions of the hero section
/ui-buddy 2 variants for the features grid
```

Or in plain language:

> give me 3 UI variants of the testimonial
> A/B the pricing block
> try alternate designs for the features grid

The skill will:

1. **Resolve the target** — accepts a file path + selector, a natural-language description, or a screenshot + rough pointer.
2. **Ask about scope** — visual-only (safer) or allow-restructure (richer exploration).
3. **Pick distinct aesthetic directions** using a built-in design-principles reference (see `skills/ui-buddy/references/design-principles.md`), varying on both aesthetic axes (editorial / depth-forward / unexpected) AND polish axes (typographic restraint / layered depth / color commitment).
4. **Generate variant implementations** as sibling files alongside the original — preserving content, links, handlers, and interactive behavior by default.
5. **Inject a dev-only `VariantSwitcher`** around the section's render site. Gated on `NODE_ENV !== 'production'` or `?variants=1`. Production builds short-circuit to the original with zero runtime cost.
6. **Render a floating toggle chip** (bottom-center by default) showing each variant with its direction name and a numeric shortcut prefix — e.g., `[1] Original · [2] Bento Dispatch · [3] Neon Dossier`. Clicking or pressing the number swaps the section in realtime.
7. **Verify live** — runs an anti-AI-slop pre-ship checklist against every variant, then browser-tests swapping, reload persistence, and focus-ring visibility.

### Promote

Once you've picked a winner:

```
/ui-buddy promote features bento-dispatch
/ui-buddy promote hero a
```

The skill replaces the original's markup with the chosen variant, deletes losing variants + their scoped CSS + orphaned font imports, strips `data-uib-section` attrs, and tears down the shared switcher infra when no other section still needs it. It **always prints a per-file plan and waits for your confirmation** before touching anything.

### Reject

```
/ui-buddy reject features
```

Deletes all variant scaffolding for a section and restores pre-skill state. The original section file was never modified, so nothing to restore there.

---

## Live chip controls

The chip surfaces every review interaction you need without mouse hunting:

- **Number keys `1`–`9`** — apply the Nth option to the section currently in the viewport (`1` = Original, `2` = first variant, `3` = second, …). Compare A/B instantly by pressing `1` `3` `1` `3`. Adjacency-friendly: no `0` reach.
- **`V`** — hide/show all chips for clean screenshots.
- **Hover a segment** — smooth-scrolls the page to that section (respects `prefers-reduced-motion`).
- **Scrollspy** — as you scroll, the chip for the section currently in view brightens; others dim, making it obvious which chip the number keys will target.
- **URL-share** — every selection round-trips via `?<section-id>=<key>` (written with `history.replaceState`, no history pollution). Paste the URL to a teammate and they land on your exact combination.
- **Arrow keys** — cycle segments within a focused chip (`Arrow Left/Right`, `Arrow Up/Down`).
- **`×`** — dismiss a chip for the session (stored in `sessionStorage`).

---

## What makes the variants non-generic

The skill is opinionated about producing **award-site-level work** — the kind of output you'd see on design-awards sites, not yet-another-SaaS-landing. Two layers of guardrails keep variants out of the "polished but safe" zone:

### Layer 1 — Boldness Quota (the "crazy" requirement)

Every variant MUST include **≥3 signature moves** drawn from different categories (composition, typography, motion, texture, interaction). See `skills/ui-buddy/references/signature-moves.md` for the full catalog. Examples:

- Extreme scale contrast (240px headline next to 11px tabular labels)
- Breaking the grid — diagonal composition, radical asymmetry, content rotated
- Oversized ornament — giant numerals, single punctuation mark at 40vw
- Novelty display fonts — Honk, Fraunces, Unbounded, Bungee, Climate Crisis
- Text scramble / magnetic cursor / scroll-pinned reveal
- Acid accent color — saturated lime, electric blue, hot magenta
- Ticker marquees, coordinate displays, duotone imagery, custom cursors

**And across the set**, the variants MUST collectively include: at least one dark variant, one typography-led variant, one motion-heavy variant, a saturated accent, and distinct font pairings per variant.

### Layer 2 — Anti-AI-slop checklist (the "don't be generic" floor)

Every variant must also clear this polish + accessibility checklist (from `references/design-principles.md`):

- ❌ No pure `#000` on pure `#fff`
- ❌ No untinted `#888` / `#ccc` grays — colored grays only
- ❌ No symmetric `0 0 Xpx` glow shadows — offset + multi-layer only
- ❌ No purple-to-pink gradient as a primary accent
- ❌ No centered paragraphs longer than 3 lines
- ❌ No identical drop-shadow across every card
- ❌ No linearly-spaced 8/16/24/32 — non-linear scale required
- ❌ No hierarchy by size alone — weight + color carry the load
- ❌ No Inter / Roboto / system-ui as the sole font

10 iconic rules are baked into the workflow:

1. Hierarchy by weight + color, not size
2. Amplify by de-emphasizing
3. Design in grayscale first
4. Colored grays, not pure grays
5. Dark-gray on off-white, not black on white
6. Offset shadows (two-layer: ambient + direct)
7. Fewer borders
8. Not every button needs a fill
9. Too much whitespace by default, pull back
10. Hue-rotate to brighten, don't just lighten

Accessibility is non-negotiable: WCAG 4.5:1 body / 3:1 large text, visible focus rings, semantic HTML, `prefers-reduced-motion` respect.

---

## Supported frameworks

| Framework | Variant files | Switcher | State |
|---|---|---|---|
| React / Next.js | Sibling `.tsx` | `<VariantSwitcher>` + `useState`/`useEffect` | `localStorage` + URL |
| Vue 3 | Sibling `.vue` | `<VariantSwitcher>` + `ref`/`watchEffect` | `localStorage` + URL |
| Svelte / SvelteKit | Sibling `.svelte` | `{#if}` wrapper + `$state` rune | `localStorage` + URL |
| Vanilla HTML/CSS/JS | `<template>` tags | `<script>` swapping `innerHTML` | `localStorage` + URL |
| Astro | Client island | React/Vue/Svelte island | `localStorage` + URL |

All framework implementations share a tiny `variant-switcher-shared.ts` coordinator module that owns the `IntersectionObserver` (scrollspy), global number-key handler, URL read/write helpers, and the dev gate. Drop-in templates live in `skills/ui-buddy/references/toggle-ui.md`.

---

## Repo layout

```
.
├── README.md
├── PLAN.md                               # roadmap / what shipped across sessions
├── LICENSE
├── skills/
│   └── ui-buddy/
│       ├── SKILL.md                      # the skill entrypoint (generate / promote / reject)
│       └── references/
│           ├── design-principles.md      # polish + accessibility baseline
│           ├── signature-moves.md        # Boldness Quota + curated font library
│           ├── toggle-ui.md              # per-framework switcher templates + shared coordinator
│           └── variant-playbook.md       # aesthetic archetypes + role-specific starts
├── demo.html                             # demo site (vanilla HTML) you can try the skill on
├── styles.css
├── ui-buddy.css                       # the switcher's CSS + generated variant styles
├── ui-buddy.js                        # the vanilla-HTML switcher script
└── *.png                                 # reference screenshots of generated variants
```

---

## Try it on the included demo

The root contains a tiny landing page (`demo.html`) for a fictional focus-timer app called **Drift**, pre-seeded with variants for three sections so you can see what the skill produces without running it.

Open it:

```bash
open demo.html
```

A floating chip appears bottom-center for each variant-enabled section — `[1] Original · [2] <name> · [3] <name> …`. Click a segment, press its number while scrolled to that section, or cycle them with arrow keys. Scroll the page and the chip for whatever section is in view brightens; the others dim.

Try the URL-share: pick a combo, copy the URL, open in a new tab — your teammate sees your exact selection. The URL looks like `demo.html?hero=b&features=a&testimonial=c`.

Pre-seeded sections and direction names:

- **Hero** — `hero-original.png`, `hero-a.png` (Swiss Broadsheet), `hero-b.png` (Ambient Depth), `hero-c.png` (Midnight Terminal)
- **Features** — two variants: Bento Dispatch, Neon Dossier (screenshots TBD)
- **Testimonial** — `variant-original.png`, `variant-a.png` (Pull-Quote Brutalist), `variant-b.png` (Editorial Portrait), `variant-c.png` (Dev Log Terminal)

---

## Credits

Skill distribution format compatible with the [`skills` CLI by vercel-labs](https://github.com/vercel-labs/skills).

## License

MIT — see [LICENSE](./LICENSE).
