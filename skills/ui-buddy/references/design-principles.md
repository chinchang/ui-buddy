# Design Principles

This reference encodes the design guidelines every variant must follow — rules for hierarchy, color, typography, depth, and accessibility that push output toward polished, professional, and distinctly *non*-generic design.

**Load this file when you reach Step 2 of the skill workflow** (picking directions) and re-consult it in Step 3 (generating implementations). Every variant should pass the "Pre-ship checklist" at the bottom before Step 6 verification.

---

## The 10 iconic rules to apply on every variant

1. **Hierarchy by weight + color, not size.** Don't crank font-size to shout; bump weight to 600/700 and dial contrast up instead.
2. **Amplify by de-emphasizing.** To make the hero element stand out, make everything around it quieter — don't pile emphasis on the hero.
3. **Design in grayscale first, then add color.** Let structure, spacing, and weight carry hierarchy before any hue is introduced.
4. **Colored grays, not pure grays.** Never use `#888`/`#ccc`. Tint neutrals toward the brand hue (cool blue-gray or warm beige-gray).
5. **Dark-gray on off-white, not black on white.** Default body text: `#111` – `#1f1f1f` on `#fafafa` – `#f7f5f1`, not `#000` on `#fff`.
6. **Offset shadows, light from above.** Prefer `0 4px 6px -1px` over `0 0 20px`. Always pair an ambient shadow with a tight contact shadow for real elevation.
7. **Fewer borders.** Replace 1px gray borders with background-color change, shadow, or added whitespace. Borders should be rare and purposeful.
8. **Not every button needs a fill.** One primary (solid), one secondary (outline/ghost), optional tertiary (link). Don't make "Delete" the loudest just because it's destructive.
9. **Too much whitespace by default, then pull back.** Generous padding reads as considered; tight padding reads as dashboard-y or AI-generated.
10. **Hue-rotate to brighten, don't just lighten.** Nudge hue 20–30° toward yellow/cyan to make an accent pop instead of washing it out with lightness.

---

## Anti-AI-slop checklist (pin this)

Every variant MUST avoid these tells of generic AI-generated UI:

- ❌ Pure `#000` on pure `#fff` (or `#ffffff` backgrounds at all)
- ❌ Un-tinted `#888` / `#ccc` / `#eee` grays
- ❌ Symmetric `box-shadow: 0 0 Xpx` glows instead of directional offset shadows
- ❌ Purple-to-pink gradients as the primary accent (the #1 AI fingerprint)
- ❌ Centered paragraphs longer than 2–3 lines
- ❌ Every card with the same drop shadow and border radius
- ❌ Linearly spaced 8/16/24/32 everywhere — use a non-linear scale instead
- ❌ Inter / Roboto / system-ui as the only type choice with no display font pairing
- ❌ Borders on every component
- ❌ Equal weight and size competing for attention in the same view
- ❌ Timid pastel-on-pastel palettes without a single saturated accent

If a variant exhibits 2 or more of these, rework it before finalizing.

---

## 1. Hierarchy

- **Weight + color do the work.** For body text, one weight (400) with 2–3 color tiers (primary, muted, subtle) creates more hierarchy than three font sizes.
- **Don't use light weights (<400) below ~24px.** They fall apart and hurt legibility.
- **Labels are a last resort.** "$49.99" and "Mar 3" communicate without "Price:" / "Date:". Combine when unavoidable ("12 left in stock").
- **Amplify by de-emphasizing.** Fade neighbors (lower contrast, less weight, more whitespace) to make the hero pop.
- **Button hierarchy by emphasis, not semantics.** Primary / secondary / tertiary — NOT "save green, delete red, cancel gray." A destructive action can be a quiet button with a loud confirmation step.

## 2. Color

- **Grayscale first.** Ship a variant that works entirely in grayscale before introducing color. If it works without color, color is the icing; if it doesn't, color won't save it.
- **Full palette, not one hex.** Each variant needs: ~8 gray shades, 1–2 accents with ~5 shades each, semantic colors (success/warning/danger/info) if needed.
- **HSL thinking.** Reason in hue/saturation/lightness when choosing shades. Don't lighten by pushing toward white — rotate hue 20–30° toward yellow/cyan to keep saturation alive.
- **Colored grays.** Tint grays toward brand temperature. Cool brands → blue-tinted grays (`hsl(220, 10%, 40%)`). Warm brands → beige/taupe grays (`hsl(30, 8%, 40%)`).
- **Saturation increases at extremes.** Very light and very dark shades need MORE saturation, not less, or they look chalky/muddy.
- **Never gray text on a colored background.** It reads as "disabled." On colored surfaces, hand-pick a hue-matched shade in the same family.
- **White-with-opacity on dark brand colors is a trap.** It looks dusty. Mix the color properly instead.

## 3. Typography

- **Type scale: hand-picked, limited.** Use `rem` or `px`, never `em`. A good scale: 12, 14, 16, 18, 20, 24, 30, 36, 48, 64. Don't use every step.
- **45–75 characters per line.** `max-width` paragraphs to ~65ch even when the container is wider.
- **Line-height inverse to size.** Body text ~1.5. Large headlines ~1.0–1.1. Wider paragraphs need more line-height; tight columns less.
- **Left-align text.** Reserve centering for 2–3-line headlines or short UI. Never center paragraphs.
- **Right-align numbers in tables** so digits line up.
- **Baseline-align mixed sizes**, not center-align.
- **Pair a distinctive display face with a refined body face.** One font is rarely enough to feel designed.

## 4. Spacing & whitespace

- **Start too airy, pull back.** If it feels "slightly too loose," it's probably right in context.
- **Non-linear spacing scale.** Each step ~25% larger than the last. Example: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Proximity = grouping.** More space *between* groups than *within* them. Label sits tight to its input; fields get bigger gaps between groups.
- **Not everything is full-width.** Just because space exists doesn't mean you should fill it.

## 5. Depth & polish

- **Offset shadows, not glows.** `0 4px 6px -1px rgba(0,0,0,0.1)` beats `0 0 20px rgba(0,0,0,0.1)` every time.
- **Two-layer shadows.** Ambient (large, soft, low-offset) + direct (tight, darker, small-offset). Example:
  ```css
  box-shadow:
    0 1px 2px rgba(17, 24, 39, 0.06),
    0 8px 24px -6px rgba(17, 24, 39, 0.12);
  ```
- **~5 shadow tiers as an elevation system** — don't invent a new shadow per component. Small (buttons), medium (cards/dropdowns), large (modals), etc.
- **Overlap elements for depth.** Push one element across the edge of another (an image bleeding into the next section, a card overlapping a colored band) — depth without shadows.
- **Thin accent strip (4–6px) at the top of a card or hero band.** A colored edge adds polish with almost zero effort.
- **Decorative geometric shapes, grain textures, and colored gradient meshes** feel richer than flat colors — used sparingly, not everywhere.

## 6. Buttons & forms

- **Three button tiers max** (primary solid / secondary outline / tertiary link). Don't give every button its own color.
- **Clickable things must look clickable.** Affordance via fill, border, cursor, hover state — not just a color change.
- **Branded form controls.** Replace default checkboxes/radios with styled versions when the choice is significant (plan selection, critical prefs).
- **Input labels inside inputs only for low-stakes UIs.** For forms that matter, persistent labels above inputs beat float labels.
- **Action labels state the outcome.** "Save changes" > "Save". "Delete 3 files" > "Delete."

## 7. Accessibility (non-negotiable)

- **WCAG contrast**: 4.5:1 for body text, 3:1 for large text (18pt+ or 14pt+ bold). Run every variant's primary text through a contrast check.
- **Never rely on color alone.** Semantic signals (error/success/warning) must also use icon, label, or pattern so colorblind users don't miss them.
- **Visible focus rings.** Never set `outline: none` without replacing it. A 2px ring of the accent (or a contrast-aware color) is the minimum.
- **Respect `prefers-reduced-motion`.** Wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)`.
- **Respect `prefers-color-scheme`** when a variant has a natural dark counterpart.
- **Semantic HTML.** `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<section>` — even inside variants, even when it'd be easier to use `<div>`.
- **Alt text on meaningful imagery, `aria-hidden` on decorative.**
- **Minimum hit target: 40×40px** for interactive elements on touch.

## 8. Variant-selection tactics (combine with `variant-playbook.md`)

When picking N directions (2, 3, or 4), deliberately vary on the **polish axes** too, not just the aesthetic ones. The three polish archetypes below are what to draw from — pick N of them, not the same one twice:

- **Depth-led** — layered shadows, overlapping elements, gradient meshes, z-axis stacking.
- **Typographic-restraint-led** — oversized type, generous whitespace, 1–2-color palette, ornament-through-type.
- **Color-committed** — saturated hero color, colored grays, strong accent, confident clashing.

For 2 variants, pick TWO of these three — and make sure the two you pick are as far apart as possible (depth-led + typographic-restraint-led is a stronger contrast than depth-led + color-committed, since the latter can both end up maximalist). For 3+ variants, use all three.

This ensures your variants demonstrate different *kinds* of design thinking, not just different moods.

---

## Pre-ship checklist — run before Step 6 verification

For each variant (A, B, C) confirm:

- [ ] No pure `#000` or pure `#fff` surfaces
- [ ] Grays are tinted (check any `color:` or `background:` value on muted text or subtle surfaces)
- [ ] Shadows are offset and multi-layered (if shadows are used at all)
- [ ] Body text passes 4.5:1 contrast
- [ ] No centered paragraph longer than 3 lines
- [ ] Primary CTA is visibly one step louder than secondary actions
- [ ] Spacing values come from a non-linear scale
- [ ] At least one font weight variation (not all 400, not all 700)
- [ ] Interactive elements have a visible focus state
- [ ] At least one "polish detail" present: accent strip, overlap, gradient, textured background, decorative shape, or asymmetric composition

If any box is unchecked, iterate before moving on.
