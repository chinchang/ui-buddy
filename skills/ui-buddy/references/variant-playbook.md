# Variant Playbook

How to pick N aesthetic directions (typically 2–4) that are genuinely different from each other **and** from the original — not N flavors of the same idea. The same differentiation rules apply whether the user asked for 2 or 4; the set-level diversity requirements in `signature-moves.md` graduate with count.

---

## Start from the content, not from a style menu

A master designer doesn't walk into a brief with a pre-selected palette of "I'll do an editorial variant and a brutalist variant." They **read the content first** and let the directions emerge from it. Do the same, in this order:

1. **Read the actual content** of the section. What's the copy saying? Is it confessional, technical, authoritative, playful, spare, dense? Whose voice is it in? Who is it for?
2. **Read the surrounding brand.** What does the rest of the page establish — palette, tone, trust cues? Variants are a stretch away from the original, but they should still be plausibly on the same brand's other pages.
3. **Read the moment.** What feels contemporary in design right now? What feels played-out? (Purple-pink SaaS gradients were fresh in 2018 and are cliché in 2026. Glassmorphism peaked in 2022. Brutalist revival peaked 2021. Editorial serif is always quietly in. Mono-heavy is always quietly in for technical products.)
4. **Then, and only then**, consult the decomposition references below. Use them to expand the range of what you consider — NOT as a menu to pick from. If the content + brand + moment suggests a direction that has no name, invent it.

The signature of a convergent AI result is picking a named style from a list ("I'll do an editorial one, a brutalist one, and a y2k one"). The signature of a designed result is a direction that doesn't fit any single archetype.

## Differentiation across axes

Every variant should differ from the others (and from the original) on at least two of these axes:

| Axis | Poles |
|---|---|
| **Typography** | display serif ↔ geometric sans ↔ mono ↔ humanist ↔ novelty/display |
| **Color mood** | bright/saturated ↔ muted/dusty ↔ monochrome ↔ dark/neon ↔ earth/natural |
| **Density** | generous negative space ↔ balanced ↔ packed/maximalist |
| **Layout logic** | centered/symmetrical ↔ asymmetric/off-grid ↔ grid-broken/overlapping |
| **Motion** | static ↔ subtle micro-interactions ↔ ambient loops ↔ scroll-driven ↔ interactive/physics |
| **Surface** | flat ↔ layered/glass ↔ textured/grainy ↔ dimensional/3D |

If two variants share four or more poles, they are too similar. Change one before implementing.

## Anti-patterns (reject on sight)

- All-dark-mode set. At most one dark variant in the set.
- All-serif-body set. Vary the type pairing across variants.
- "Rounded corners" vs "sharper rounded corners" vs "slightly rounded corners" — these are not distinct directions.
- Every variant using gradient purple-to-pink. That is the generic AI aesthetic, not a direction.
- Swapping the accent color as the only change. Color alone isn't a direction.
- **Two-variant sets where both variants are bold but live in the same aesthetic neighbourhood** (e.g. two different editorial serifs, or two dark-neon dashboards). If the user asked for 2, they should still see two genuinely different worlds — not a "light vs dark" or "more type vs more motion" of one idea.
- **Reusing an archetype across sections of the same project.** If the hero already has a terminal/mono variant, the testimonial's variants should not also include a terminal/mono one. Each section of the project should get fresh directions; variety across the project matters as much as variety within each set.
- **Naming a variant after an archetype.** "Editorial Serif", "Brutalist Grid", "Neo-Retro Terminal" are failures — they admit the variant is a trope. Name the variant after what makes THIS execution distinctive for THIS content.

---

## Decomposition references

The lists below are **patterns to cannibalize**, not recipes. Good use: "Editorial/Magazine has rule lines and oversized folio marks — I'll borrow the rule lines and the folio marks but pair them with something the archetype never does, like a kinetic scroll ticker." Bad use: "I'll do an Editorial variant."

### Movements / aesthetic families

- **Editorial / Magazine** — large serif display type, generous margins, restrained palette, rule lines as dividers, folio marks, pull quotes. (*New Yorker, Monocle, Kinfolk* as distant cousins.)
- **Brutalist / Raw** — unstyled-looking but deliberate, harsh grid, high-contrast, visible structure (borders, grids, debug aesthetic), monospaced accents.
- **Neo-Retro Terminal** — monospace throughout, phosphor green / amber accents, scanline or CRT texture, block cursors, ASCII embellishments.
- **Maximalist / Y2K** — bold typography stacks, chromatic gradients, grain, sticker elements, rotated components, marquee scrolls, sound-on-hover.
- **Soft / Organic** — rounded geometry, warm neutrals with one muted accent, blob shapes, hand-drawn arrows or annotations, gentle eased motion.
- **Industrial / Utilitarian** — tight letter-spacing on condensed sans, coordinate-style annotations, numeric grids, engineering-blue or safety-orange accents, blueprint feel.
- **Luxury / Refined** — minimal type, wide letter-spacing on small caps, plenty of negative space, single hero image, tasteful parallax, no more than two colors.
- **Playful / Toy** — saturated primaries, thick borders, offset drop shadows, oversized clickable elements, springy animations, illustrative icons.
- **Art Deco / Geometric** — symmetric layouts, metallic accents, stepped type, ornamental rules, tall thin proportions.
- **Editorial-Tech Hybrid** — mono for metadata and serif for body. High trust for SaaS and docs.
- **Glassmorphic / Frosted** — layered translucent panels, blurred backdrops, gradient globes behind the glass. Trending generic; use sparingly.
- **Swiss / International** — Helvetica-adjacent sans, rigid grids, red accent on white, numbered sections. Restrained, functional, dateless.
- **Fashion lookbook / editorial portrait** — dense full-bleed imagery, tiny captions, vertical labels, duotone, scroll-pin storytelling.
- **Live data / dashboard** — tabular numerics as decoration, ticker bands, coordinate/timestamp ornament, live-clock elements.
- **Festival / event poster** — dense layered type, rotated labels, date/location coordinates, loud saturated palette.
- **Manifesto / essay longform** — massive type, minimal chrome, scroll-driven pacing, drop caps, pull quotes at large scale.

### Role-informed patterns (reference only — don't treat as recipes)

When generating variants for a **hero**, a **features grid**, a **pricing table**, a **testimonial**, etc., there are patterns that have historically worked for each role. Below is a non-exhaustive inventory. **Do not treat this as a recipe** — the right answer for THIS hero might not be on the list, and the right answer might be a hybrid of two things from different roles.

- **Hero** — typographic (headline IS the art), media-forward (full-bleed), interactive (spline/WebGL/cursor-reactive), scroll-pinned reveal, oversized wordmark, kinetic ticker, manifesto essay, festival poster.
- **Features grid** — bento with a hero tile, sequential numbered storytelling, dense scan-table with icons, full-bleed alternating rows, vertical stack with extreme numerals, dashboard-grid with live data decoration.
- **Pricing** — comparison table with highlighted column, single-focus (one plan front and center), calculator/slider, tiered card grid, "choose your own" configurator, manifesto-style price-as-statement.
- **Testimonial / social proof** — quote-forward pull quote, logo wall + stat band, video-thumbnail carousel, portrait card layout, dev-log / terminal transcript, magazine-style spread with kicker.
- **Navigation** — bold-type horizontal, vertical sidebar magazine, mega-menu / command-menu hybrid, oversized wordmark with hidden links, fly-out transition sheet.
- **Footer** — sitemap-column, oversized wordmark, newsletter-first, live-status strip, manifesto reprint.
- **FAQ** — accordion (typographically elevated), two-column with search, conversational chat-style, numbered index with anchor links.
- **CTA band** — quiet typographic (headline + link), loud bordered banner, inline form, progress-bar-hint, kinetic marquee with CTA.

Again: these are decomposition primers, not mandates. Your variants for a features grid do not need to include "bento". If the content calls for it, great. If not, invent or hybridize.

---

## Hybridization is the point

The best variants are usually **hybrids** that draw moves from multiple archetypes in unexpected combinations:

- Editorial column rules + terminal scanlines + a single hot acid accent.
- Fashion-lookbook full-bleed imagery + Swiss numbered sections + variable-font weight animation.
- Brutalist raw grid + soft hand-drawn annotations + live-data telemetry.

If two variants in your set each draw cleanly from one archetype, you are probably producing pastiche. If each variant combines moves from three or four sources in a combination that doesn't have a name, you are probably producing design.

## Naming the variants

The chip shows the full direction name, and the user sees the name in handoff notes. Good names:

- **Derive from what's distinctive about THIS execution**, not from the archetype it borrowed from.
- Two or three words, evocative.
- Avoid naming after archetypes: ❌ "Editorial Serif", ❌ "Brutalist Grid", ❌ "Neo-Retro Terminal" — these mean "I picked a style off the shelf."
- Good naming examples: ✅ "Acid Dispatch" (content = newsletter-ish, acid accent = unexpected pairing). ✅ "Kinetic Broadsheet" (scroll-driven ticker + serif). ✅ "Midnight Marginalia" (dark mode + hand-drawn annotation in the margins).
- Project-specific is even better: ✅ "Runway Hi-Viz" for a logistics brand, ✅ "Drift Fieldnotes" for a focus app.

## Sanity check before implementing

Before writing variant code, answer these out loud:

1. **Did each direction emerge from the content / brand / moment, or from picking an archetype off the menu?** If the latter, re-pick.
2. If I described the N variants to a designer over the phone, would they draw N clearly different things?
3. Does the spread feel like N real options a product team would argue about — or N minor permutations?
4. Does each variant have a reason to exist beyond "it's different"?
5. If I cut one variant from the set, would the remaining set still feel like a real design exploration, or would it collapse into "one safe choice and one wild choice"?
6. **If this project has other sections already under variant exploration, have I avoided reusing an archetype from those sections?**
7. **Could I describe any variant in the set WITHOUT naming a single archetype?** If I can only describe them as "the editorial one" and "the brutalist one", they are pastiche.

If any answer is no, re-pick.
