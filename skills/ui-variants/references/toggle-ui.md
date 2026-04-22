# Toggle UI Templates

Drop-in switcher + toggle chip implementations for each supported framework. Copy verbatim, rename the component, and wire in the variant components.

## Conventions (apply to all frameworks)

- **localStorage key**: `ui-variant:<section-id>` where `<section-id>` is a stable slug the skill picks (e.g., `hero`, `pricing`, `features`).
- **URL query param**: `?<section-id>=<key>` — same values as localStorage. **Takes precedence** over localStorage on boot, so reload-ready URLs like `example.com?hero=b&features=a&variants=1` reproduce a teammate's exact selection. Written via `history.replaceState` on every selection (no history pollution). `original` is never written to the URL (missing key = original).
- **Values**: `"original" | "a" | "b" | "c" | ...` — variants are opaque stable slugs. Default `"original"`. The number of variants is **variable** (2, 3, or more). Render only the segments whose templates/components actually exist.
- **sessionStorage key** (chip dismiss): `ui-variant-dismissed:<section-id>` → `"1"` when dismissed.
- **Dev-only gate**: switcher renders the chip + selector only when the gate passes; otherwise renders the original directly.
- **Stacking**: when multiple switchers live on one page, each chip reads its own position index and offsets by `16 + index * 48` px along its fixed axis (top or bottom).
- **Chip segment label**: `<number> <display-name>` — e.g., `1 Original`, `2 Bento Dispatch`, `3 Neon Dossier`. The number (1..N, where 1 is Original) doubles as the keyboard shortcut. The display name comes from the `names` map passed in by the skill.
- **Keyboard shortcuts (global, no modifiers, no input focused):**
  - `1..9` — apply the Nth option to the section currently in the viewport (scrollspy-active). `1` = Original, `2` = first variant, `3` = second, etc.
  - `V` — toggle all chips' visibility (for clean screenshots).
  - Inside a focused chip: `Arrow` keys cycle segments, `Enter` selects, `×` dismisses.
- **Scrollspy**: an `IntersectionObserver` tracks which `[data-uiv-section]` is most visible; that chip gets `.uiv-chip--active`. Clarifies which chip the number-key shortcuts will target.
- **Hover-to-scroll**: hovering (or tab-focusing) a chip segment `scrollIntoView`s the corresponding section, honoring `prefers-reduced-motion`.

## Shared CSS (framework-agnostic)

```css
/* ui-variants-chip.css — import once per page, or inline */
.uiv-chip {
  position: fixed;
  left: 50%;
  bottom: 16px; /* or: top: 16px; right: 16px; — pick one convention per project */
  transform: translateX(-50%);
  z-index: 2147483000;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: #fff;
  background: rgba(17, 17, 17, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  user-select: none;
  opacity: 0.55;
  transition: opacity 160ms ease, background 160ms ease,
              border-color 160ms ease, box-shadow 160ms ease;
}
.uiv-chip:hover { opacity: 1; }
/* Scrollspy: the chip whose section is most visible. */
.uiv-chip--active {
  opacity: 1;
  background: rgba(17, 17, 17, 0.92);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}
.uiv-chip__label {
  padding: 0 8px 0 10px;
  opacity: 0.55;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.uiv-chip__seg {
  appearance: none;
  background: transparent;
  border: 0;
  color: inherit;
  font: inherit;
  padding: 0 10px 0 6px;
  height: 26px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  transition: background 120ms ease, color 120ms ease;
}
.uiv-chip__seg:hover { background: rgba(255, 255, 255, 0.08); }
.uiv-chip__seg[aria-checked="true"] {
  background: #fff;
  color: #111;
  font-weight: 600;
}
/* Numeric prefix inside each segment — doubles as the keyboard shortcut. */
.uiv-chip__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 10px;
  font-weight: 600;
  opacity: 0.85;
}
.uiv-chip__seg[aria-checked="true"] .uiv-chip__num {
  background: rgba(17, 17, 17, 0.12);
  color: #111;
  opacity: 1;
}
.uiv-chip__badge {
  margin: 0 4px 0 6px;
  padding: 2px 6px;
  font-size: 9px;
  letter-spacing: 0.1em;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
}
.uiv-chip__close {
  appearance: none;
  background: transparent;
  border: 0;
  color: inherit;
  opacity: 0.5;
  cursor: pointer;
  width: 22px;
  height: 26px;
  font-size: 14px;
  line-height: 1;
}
.uiv-chip__close:hover { opacity: 1; }

/* Hover-to-scroll offset so the sticky nav (if any) doesn't overlap the section top. */
[data-uiv-section] { scroll-margin-top: 80px; }
```

---

## Shared coordinator (imported by every framework switcher)

Scrollspy, number-key shortcuts, and URL-share are all page-global concerns, not per-instance. Instead of duplicating them across frameworks, drop this small module into your project once and let each `VariantSwitcher` instance register with it on mount.

```ts
// variant-switcher-shared.ts — framework-agnostic coordinator.
// Safe to import multiple times; initializes lazily on first call in the browser.

type Apply = (key: string) => void;
type SetActive = (isActive: boolean) => void;

export type SwitcherEntry = {
  id: string;            // stable section slug, matches data-uiv-section
  order: string[];       // e.g. ['original', 'a', 'b'] — index 0 is Original
  apply: Apply;          // the switcher's setState/variant setter
  element: Element;      // the section DOM node (for IntersectionObserver)
  setActive: SetActive;  // toggle .uiv-chip--active on this instance's chip
};

const registry = new Map<string, SwitcherEntry>();
const ratios = new Map<string, number>();
let activeId: string | null = null;
let observer: IntersectionObserver | null = null;
let initialized = false;

export function readURL(id: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(id);
}

export function writeURL(id: string, key: string) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (key === 'original') url.searchParams.delete(id);
  else url.searchParams.set(id, key);
  window.history.replaceState(null, '', url.toString());
}

export function scrollToSection(el: Element) {
  if (typeof window === 'undefined') return;
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto' : 'smooth';
  el.scrollIntoView({ behavior, block: 'start' });
}

export function devGateOn(): boolean {
  if (typeof window === 'undefined') return false;
  const flagged = new URLSearchParams(window.location.search).has('variants');
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    || window.location.protocol === 'file:';
  // @ts-expect-error: process is defined under webpack/next, optional elsewhere.
  const nodeEnv = typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined;
  // @ts-expect-error: Vite-style flag, optional.
  const viteDev = (import.meta as any)?.env?.DEV;
  return flagged || isLocal || nodeEnv !== 'production' || Boolean(viteDev);
}

function setActive(id: string | null) {
  if (id === activeId) return;
  activeId = id;
  registry.forEach((e, key) => e.setActive(key === id));
}

function init() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  observer = new IntersectionObserver(entries => {
    for (const e of entries) {
      const sid = (e.target as HTMLElement).dataset.uivSection;
      if (sid) ratios.set(sid, e.intersectionRatio);
    }
    let topId: string | null = null, topRatio = 0;
    ratios.forEach((r, sid) => { if (r > topRatio) { topRatio = r; topId = sid; } });
    if (topId) setActive(topId);
  }, { threshold: [0, 0.15, 0.35, 0.6, 0.85, 1] });

  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (t && t.isContentEditable) return;

    // V — toggle chip visibility for screenshots.
    if (e.key.toLowerCase() === 'v') {
      document.querySelectorAll<HTMLElement>('.uiv-chip').forEach(c => {
        c.style.display = c.style.display === 'none' ? '' : 'none';
      });
      return;
    }

    // 1..9 — apply the Nth option on the scrollspy-active section.
    // 1 = Original, 2 = first variant, 3 = second, etc.
    if (/^[1-9]$/.test(e.key)) {
      const id = activeId || [...registry.keys()][0];
      const ctx = id ? registry.get(id) : undefined;
      if (!ctx) return;
      const idx = parseInt(e.key, 10) - 1;
      if (idx < 0 || idx >= ctx.order.length) return;
      ctx.apply(ctx.order[idx]);
      e.preventDefault();
    }
  });
}

export function register(entry: SwitcherEntry) {
  init();
  registry.set(entry.id, entry);
  if (observer) observer.observe(entry.element);
  // Seed: first registered section is active until observer fires.
  if (!activeId) setActive(entry.id);
}

export function unregister(id: string) {
  const e = registry.get(id);
  if (e && observer) observer.unobserve(e.element);
  registry.delete(id);
  ratios.delete(id);
  if (activeId === id) {
    const next = [...registry.keys()][0] ?? null;
    setActive(next);
  }
}
```

Each per-framework `VariantSwitcher` below imports from this module. The module is idempotent — safe to co-mount many switchers without duplicate listeners.

---

## Feature parity across frameworks

Every implementation below — React, Vue, Svelte, Vanilla — supports the full feature set: URL-share, scrollspy active-chip, numeric-prefix display-name labels, variable variant count (2, 3, or more), hover-to-scroll, number-key selection (`1..N`), and `V`-key visibility toggle.

The framework switchers all accept the same prop shape:

- `sectionId` (string) — stable slug, matches `data-uiv-section`.
- `variants` (array of `{ key: string; name: string; content: <renderable> }`) — ordered. Order defines the `2`, `3`, `4`… number-key bindings.
- `original` (renderable) — always shortcut `1`.
- `stackIndex` (number, default `0`) — position in the bottom-stacked chip column.

---

## React / Next.js

```tsx
// VariantSwitcher.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  register, unregister, readURL, writeURL, scrollToSection, devGateOn,
} from './variant-switcher-shared';

export type VariantEntry = {
  key: string;
  name: string;
  content: React.ReactNode;
};

type Props = {
  sectionId: string;
  original: React.ReactNode;
  variants: VariantEntry[];
  stackIndex?: number;
};

export function VariantSwitcher(p: Props) {
  const [mounted, setMounted] = useState(false);
  const [variant, setVariant] = useState<string>('original');
  const [dismissed, setDismissed] = useState(false);
  const [active, setActiveLocal] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const storageKey = `ui-variant:${p.sectionId}`;
  const dismissKey = `ui-variant-dismissed:${p.sectionId}`;

  const order = useMemo(
    () => ['original', ...p.variants.map(v => v.key)],
    [p.variants]
  );
  const segs = useMemo(
    () => [
      { key: 'original', name: 'Original' },
      ...p.variants.map(v => ({ key: v.key, name: v.name })),
    ],
    [p.variants]
  );

  // Resolve initial key (URL > localStorage > 'original') and register with
  // the shared coordinator so number-keys + scrollspy can reach this instance.
  useEffect(() => {
    setMounted(true);
    let initial: string | null = null;
    try {
      initial = readURL(p.sectionId) || localStorage.getItem(storageKey);
      if (sessionStorage.getItem(dismissKey) === '1') setDismissed(true);
    } catch {}
    if (initial && order.includes(initial)) setVariant(initial);

    const el = sectionRef.current;
    if (!el) return;
    register({
      id: p.sectionId,
      order,
      apply: key => setVariant(key),
      element: el,
      setActive: v => setActiveLocal(v),
    });
    return () => unregister(p.sectionId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.sectionId]);

  // Persist + URL-share on every change.
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(storageKey, variant); } catch {}
    writeURL(p.sectionId, variant);
  }, [variant, mounted, storageKey, p.sectionId]);

  const body = useMemo(() => {
    if (variant === 'original') return p.original;
    const match = p.variants.find(v => v.key === variant);
    return match ? match.content : p.original;
  }, [variant, p.original, p.variants]);

  if (!devGateOn() || !mounted) {
    return <div data-uiv-section={p.sectionId}>{p.original}</div>;
  }

  const bottom = 16 + (p.stackIndex ?? 0) * 48;

  return (
    <>
      <div
        ref={sectionRef}
        data-uiv-section={p.sectionId}
        data-variant={variant === 'original' ? undefined : variant}
      >
        {body}
      </div>
      {!dismissed && (
        <div
          className={`uiv-chip${active ? ' uiv-chip--active' : ''}`}
          data-uiv-chip-for={p.sectionId}
          style={{ bottom }}
          role="radiogroup"
          aria-label={`${p.sectionId} variant switcher`}
          onKeyDown={e => {
            const idx = order.indexOf(variant);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              setVariant(order[(idx + 1) % order.length]);
              e.preventDefault();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              setVariant(order[(idx - 1 + order.length) % order.length]);
              e.preventDefault();
            }
          }}
        >
          <span className="uiv-chip__label">{p.sectionId}</span>
          {segs.map((s, i) => (
            <button
              key={s.key}
              className="uiv-chip__seg"
              role="radio"
              aria-checked={variant === s.key}
              title={`${s.name} (press ${i + 1})`}
              onClick={() => setVariant(s.key)}
              onMouseEnter={() => sectionRef.current && scrollToSection(sectionRef.current)}
              onFocus={() => sectionRef.current && scrollToSection(sectionRef.current)}
            >
              <span className="uiv-chip__num">{i + 1}</span>
              <span className="uiv-chip__name">{s.name}</span>
            </button>
          ))}
          <span className="uiv-chip__badge">PREVIEW</span>
          <button
            className="uiv-chip__close"
            aria-label="Hide variant switcher for this session"
            onClick={() => {
              setDismissed(true);
              try { sessionStorage.setItem(dismissKey, '1'); } catch {}
            }}
          >×</button>
        </div>
      )}
    </>
  );
}
```

**Usage:**

```tsx
import { VariantSwitcher } from './VariantSwitcher';
import { Hero } from './Hero';
import { HeroVariantA } from './HeroVariantA';
import { HeroVariantB } from './HeroVariantB';
import { HeroVariantC } from './HeroVariantC';

<VariantSwitcher
  sectionId="hero"
  original={<Hero {...heroProps} />}
  variants={[
    { key: 'a', name: 'Editorial Serif',    content: <HeroVariantA {...heroProps} /> },
    { key: 'b', name: 'Brutalist Grid',     content: <HeroVariantB {...heroProps} /> },
    { key: 'c', name: 'Neo-Retro Terminal', content: <HeroVariantC {...heroProps} /> },
  ]}
/>
```

Pass 2, 3, or more entries in `variants` — order determines the number-key bindings (1 = Original, 2 = first entry, etc.).

**Next.js app-router note:** this is a client component. Add `'use client';` at the top of both `VariantSwitcher.tsx` and `variant-switcher-shared.ts`.

---

## Vue 3

```vue
<!-- VariantSwitcher.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, useTemplateRef } from 'vue';
import {
  register, unregister, readURL, writeURL, scrollToSection, devGateOn,
} from './variant-switcher-shared';

type VariantMeta = { key: string; name: string };

const props = defineProps<{
  sectionId: string;
  variants: VariantMeta[];   // e.g. [{ key: 'a', name: 'Editorial Serif' }, ...]
  stackIndex?: number;
}>();

// Content comes via named slots matching each variant key ("original", "a", "b", …).

const variant = ref<string>('original');
const dismissed = ref(false);
const mounted = ref(false);
const active = ref(false);
const sectionEl = useTemplateRef<HTMLDivElement>('sectionEl');

const storageKey = `ui-variant:${props.sectionId}`;
const dismissKey = `ui-variant-dismissed:${props.sectionId}`;

const order = computed(() => ['original', ...props.variants.map(v => v.key)]);
const segs = computed(() => [
  { key: 'original', name: 'Original' },
  ...props.variants.map(v => ({ key: v.key, name: v.name })),
]);
const bottom = computed(() => 16 + ((props.stackIndex ?? 0) * 48));
const enabled = computed(() => devGateOn() && mounted.value);

onMounted(() => {
  mounted.value = true;
  let initial: string | null = null;
  try {
    initial = readURL(props.sectionId) || localStorage.getItem(storageKey);
    if (sessionStorage.getItem(dismissKey) === '1') dismissed.value = true;
  } catch {}
  if (initial && order.value.includes(initial)) variant.value = initial;

  if (sectionEl.value) {
    register({
      id: props.sectionId,
      order: order.value,
      apply: key => { variant.value = key; },
      element: sectionEl.value,
      setActive: v => { active.value = v; },
    });
  }
});
onBeforeUnmount(() => unregister(props.sectionId));

watch(variant, v => {
  try { localStorage.setItem(storageKey, v); } catch {}
  writeURL(props.sectionId, v);
});

const dismiss = () => {
  dismissed.value = true;
  try { sessionStorage.setItem(dismissKey, '1'); } catch {}
};

const onChipKeydown = (e: KeyboardEvent) => {
  const arr = order.value;
  const idx = arr.indexOf(variant.value);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    variant.value = arr[(idx + 1) % arr.length];
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    variant.value = arr[(idx - 1 + arr.length) % arr.length];
    e.preventDefault();
  }
};
</script>

<template>
  <div
    ref="sectionEl"
    :data-uiv-section="sectionId"
    :data-variant="variant === 'original' ? undefined : variant"
  >
    <template v-if="!enabled || variant === 'original'">
      <slot name="original" />
    </template>
    <template v-else>
      <slot :name="variant" />
    </template>
  </div>
  <div
    v-if="enabled && !dismissed"
    class="uiv-chip"
    :class="{ 'uiv-chip--active': active }"
    :data-uiv-chip-for="sectionId"
    :style="{ bottom: bottom + 'px' }"
    role="radiogroup"
    :aria-label="`${sectionId} variant switcher`"
    @keydown="onChipKeydown"
  >
    <span class="uiv-chip__label">{{ sectionId }}</span>
    <button
      v-for="(s, i) in segs"
      :key="s.key"
      class="uiv-chip__seg"
      role="radio"
      :aria-checked="variant === s.key"
      :title="`${s.name} (press ${i + 1})`"
      @click="variant = s.key"
      @mouseenter="sectionEl && scrollToSection(sectionEl)"
      @focus="sectionEl && scrollToSection(sectionEl)"
    >
      <span class="uiv-chip__num">{{ i + 1 }}</span>
      <span class="uiv-chip__name">{{ s.name }}</span>
    </button>
    <span class="uiv-chip__badge">PREVIEW</span>
    <button class="uiv-chip__close" aria-label="Hide variant switcher for this session" @click="dismiss">×</button>
  </div>
</template>
```

**Usage:** pass `variants` metadata plus a named slot per key (including `#original`):

```vue
<VariantSwitcher
  section-id="hero"
  :variants="[
    { key: 'a', name: 'Editorial Serif' },
    { key: 'b', name: 'Brutalist Grid' },
    { key: 'c', name: 'Neo-Retro Terminal' },
  ]"
>
  <template #original><Hero v-bind="heroProps" /></template>
  <template #a><HeroVariantA v-bind="heroProps" /></template>
  <template #b><HeroVariantB v-bind="heroProps" /></template>
  <template #c><HeroVariantC v-bind="heroProps" /></template>
</VariantSwitcher>
```

Pass 2, 3, or more entries — `variants` order determines the number-key bindings (1 = Original, 2 = first entry, …).

---

## Svelte 5

```svelte
<!-- VariantSwitcher.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import {
    register, unregister, readURL, writeURL, scrollToSection, devGateOn,
  } from './variant-switcher-shared';

  type VariantEntry = { key: string; name: string; content: Snippet };

  let { sectionId, original, variants, stackIndex = 0 } = $props<{
    sectionId: string;
    original: Snippet;
    variants: VariantEntry[];
    stackIndex?: number;
  }>();

  let variant = $state<string>('original');
  let dismissed = $state(false);
  let mounted = $state(false);
  let active = $state(false);
  let sectionEl: HTMLDivElement | undefined;

  const storageKey = `ui-variant:${sectionId}`;
  const dismissKey = `ui-variant-dismissed:${sectionId}`;

  const order = $derived(['original', ...variants.map(v => v.key)]);
  const segs = $derived([
    { key: 'original', name: 'Original' },
    ...variants.map(v => ({ key: v.key, name: v.name })),
  ]);
  const selected = $derived(variants.find(v => v.key === variant));

  onMount(() => {
    mounted = true;
    let initial: string | null = null;
    try {
      initial = readURL(sectionId) || localStorage.getItem(storageKey);
      if (sessionStorage.getItem(dismissKey) === '1') dismissed = true;
    } catch {}
    if (initial && order.includes(initial)) variant = initial;

    if (sectionEl) {
      register({
        id: sectionId,
        order,
        apply: key => { variant = key; },
        element: sectionEl,
        setActive: v => { active = v; },
      });
    }
    return () => unregister(sectionId);
  });

  $effect(() => {
    if (!mounted) return;
    try { localStorage.setItem(storageKey, variant); } catch {}
    writeURL(sectionId, variant);
  });

  const dismiss = () => {
    dismissed = true;
    try { sessionStorage.setItem(dismissKey, '1'); } catch {}
  };

  const onChipKeydown = (e: KeyboardEvent) => {
    const idx = order.indexOf(variant);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      variant = order[(idx + 1) % order.length]; e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      variant = order[(idx - 1 + order.length) % order.length]; e.preventDefault();
    }
  };

  const enabled = $derived(devGateOn() && mounted);
</script>

<div
  bind:this={sectionEl}
  data-uiv-section={sectionId}
  data-variant={variant === 'original' ? undefined : variant}
>
  {#if !enabled || variant === 'original'}
    {@render original()}
  {:else if selected}
    {@render selected.content()}
  {:else}
    {@render original()}
  {/if}
</div>

{#if enabled && !dismissed}
  <div
    class="uiv-chip"
    class:uiv-chip--active={active}
    data-uiv-chip-for={sectionId}
    style="bottom: {16 + stackIndex * 48}px"
    role="radiogroup"
    aria-label="{sectionId} variant switcher"
    onkeydown={onChipKeydown}
  >
    <span class="uiv-chip__label">{sectionId}</span>
    {#each segs as s, i}
      <button
        class="uiv-chip__seg"
        role="radio"
        aria-checked={variant === s.key}
        title="{s.name} (press {i + 1})"
        onclick={() => variant = s.key}
        onmouseenter={() => sectionEl && scrollToSection(sectionEl)}
        onfocus={() => sectionEl && scrollToSection(sectionEl)}
      >
        <span class="uiv-chip__num">{i + 1}</span>
        <span class="uiv-chip__name">{s.name}</span>
      </button>
    {/each}
    <span class="uiv-chip__badge">PREVIEW</span>
    <button class="uiv-chip__close" aria-label="Hide variant switcher for this session" onclick={dismiss}>×</button>
  </div>
{/if}
```

**Usage:** pass `variants` as an array of `{ key, name, content }` snippets:

```svelte
<script lang="ts">
  import VariantSwitcher from './VariantSwitcher.svelte';
  import Hero from './Hero.svelte';
  import HeroVariantA from './HeroVariantA.svelte';
  import HeroVariantB from './HeroVariantB.svelte';
  import HeroVariantC from './HeroVariantC.svelte';
</script>

<VariantSwitcher
  sectionId="hero"
  variants={[
    { key: 'a', name: 'Editorial Serif',    content: heroA },
    { key: 'b', name: 'Brutalist Grid',     content: heroB },
    { key: 'c', name: 'Neo-Retro Terminal', content: heroC },
  ]}
>
  {#snippet original()}<Hero {...heroProps} />{/snippet}
</VariantSwitcher>

{#snippet heroA()}<HeroVariantA {...heroProps} />{/snippet}
{#snippet heroB()}<HeroVariantB {...heroProps} />{/snippet}
{#snippet heroC()}<HeroVariantC {...heroProps} />{/snippet}
```

---

## Vanilla HTML / CSS / JS (canonical)

Place variants as inert `<template>` siblings of the section. The script mounts the switcher and swaps the section's `innerHTML` on toggle. This implementation is the reference for all features in [Conventions](#conventions-apply-to-all-frameworks).

```html
<!-- Original section — the number of variants is variable; only render templates that exist. -->
<section id="hero" data-uiv-section="hero" data-uiv-names='{"a":"Editorial Serif","b":"Brutalist Grid","c":"Neo-Retro Terminal"}'>
  <!-- original markup here -->
</section>

<!-- Variants (inert until mounted). Add or omit any of a/b/c — the chip sizes to what's present. -->
<template data-uiv-for="hero" data-uiv-variant="a"><!-- variant A markup --></template>
<template data-uiv-for="hero" data-uiv-variant="b"><!-- variant B markup --></template>
<template data-uiv-for="hero" data-uiv-variant="c"><!-- variant C markup --></template>

<script>
(() => {
  const gate = location.hostname === 'localhost'
    || location.hostname === '127.0.0.1'
    || location.protocol === 'file:'
    || location.search.includes('variants=1');
  if (!gate) return;

  const sections = document.querySelectorAll('[data-uiv-section]');
  if (!sections.length) return;

  // URL helpers — each section's selection round-trips via ?<section-id>=<key>.
  const readFromURL = id => new URLSearchParams(location.search).get(id);
  const writeToURL = (id, key) => {
    const url = new URL(location.href);
    if (key === 'original') url.searchParams.delete(id);
    else url.searchParams.set(id, key);
    history.replaceState(null, '', url.toString());
  };

  // Shared registry so global key handlers can address any section by id.
  const ctxById = {};
  let activeId = null;

  sections.forEach((section, stackIndex) => {
    const id = section.dataset.uivSection;
    let names = {};
    try { names = JSON.parse(section.dataset.uivNames || '{}'); } catch {}

    const storageKey = `ui-variant:${id}`;
    const dismissKey = `ui-variant-dismissed:${id}`;

    const originalHTML = section.innerHTML;
    const variants = { original: { html: originalHTML, variant: null } };
    const order = ['original'];

    document.querySelectorAll(`template[data-uiv-for="${id}"]`).forEach(t => {
      const key = t.dataset.uivVariant;
      variants[key] = { html: t.innerHTML, variant: key };
      if (!order.includes(key)) order.push(key);
    });

    const apply = key => {
      if (!variants[key]) key = 'original';
      section.innerHTML = variants[key].html;
      if (variants[key].variant) section.dataset.variant = variants[key].variant;
      else delete section.dataset.variant;
      try { localStorage.setItem(storageKey, key); } catch {}
      writeToURL(id, key);
      chip.querySelectorAll('[data-uiv-seg]').forEach(el => {
        el.setAttribute('aria-checked', el.dataset.uivSeg === key ? 'true' : 'false');
      });
      ctx.currentKey = key;
    };

    const chip = document.createElement('div');
    chip.className = 'uiv-chip';
    chip.dataset.uivChipFor = id;
    chip.setAttribute('role', 'radiogroup');
    chip.setAttribute('aria-label', `${id} variant switcher`);
    chip.style.bottom = `${16 + stackIndex * 48}px`;

    // Segment label: `<number> <display-name>` — the number doubles as the keyboard shortcut.
    const segButton = (key, index) => {
      const name = key === 'original' ? 'Original' : (names[key] || key.toUpperCase());
      const num = index + 1;
      return `<button class="uiv-chip__seg" data-uiv-seg="${key}" role="radio" title="${name} (press ${num})">` +
             `<span class="uiv-chip__num">${num}</span>` +
             `<span class="uiv-chip__name">${name}</span>` +
             `</button>`;
    };
    chip.innerHTML = `
      <span class="uiv-chip__label">${id}</span>
      ${order.map(segButton).join('')}
      <span class="uiv-chip__badge">PREVIEW</span>
      <button class="uiv-chip__close" aria-label="Hide">×</button>
    `;

    // Hover-to-scroll (respects prefers-reduced-motion).
    const scrollToSection = () => {
      const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      section.scrollIntoView({ behavior, block: 'start' });
    };
    chip.querySelectorAll('[data-uiv-seg]').forEach(el => {
      el.addEventListener('click', () => apply(el.dataset.uivSeg));
      el.addEventListener('mouseenter', scrollToSection);
      el.addEventListener('focus', scrollToSection);
    });
    chip.querySelector('.uiv-chip__close').addEventListener('click', () => {
      chip.remove();
      try { sessionStorage.setItem(dismissKey, '1'); } catch {}
    });

    // Arrow-key cycle within a focused chip.
    chip.addEventListener('keydown', e => {
      const current = [...chip.querySelectorAll('[data-uiv-seg]')]
        .find(el => el.getAttribute('aria-checked') === 'true');
      const idx = order.indexOf(current ? current.dataset.uivSeg : 'original');
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        apply(order[(idx + 1) % order.length]); e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        apply(order[(idx - 1 + order.length) % order.length]); e.preventDefault();
      }
    });

    if (sessionStorage.getItem(dismissKey) !== '1') document.body.appendChild(chip);

    const ctx = { id, section, chip, order, apply, currentKey: 'original' };
    ctxById[id] = ctx;

    // Boot-time resolution: URL > localStorage > 'original'.
    let initial = readFromURL(id);
    if (!initial) {
      try { initial = localStorage.getItem(storageKey) || 'original'; } catch { initial = 'original'; }
    }
    apply(initial);
  });

  // Scrollspy — chip for the most-visible section gets `.uiv-chip--active`.
  if ('IntersectionObserver' in window) {
    const ratios = new Map();
    const setActive = id => {
      if (id === activeId) return;
      activeId = id;
      document.querySelectorAll('.uiv-chip').forEach(c => {
        c.classList.toggle('uiv-chip--active', c.dataset.uivChipFor === id);
      });
    };
    const observer = new IntersectionObserver(entries => {
      for (const e of entries) ratios.set(e.target.dataset.uivSection, e.intersectionRatio);
      let topId = null, topRatio = 0;
      ratios.forEach((r, id) => { if (r > topRatio) { topRatio = r; topId = id; } });
      if (topId) setActive(topId);
    }, { threshold: [0, 0.15, 0.35, 0.6, 0.85, 1] });
    sections.forEach(s => observer.observe(s));
    setActive(sections[0].dataset.uivSection); // seed before first intersection fires
  }

  // Global shortcuts.
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (t && t.isContentEditable) return;

    // V — toggle chip visibility for screenshots.
    if (e.key.toLowerCase() === 'v') {
      document.querySelectorAll('.uiv-chip').forEach(c => {
        c.style.display = c.style.display === 'none' ? '' : 'none';
      });
      return;
    }

    // 1..9 — apply the Nth option to the scrollspy-active section.
    // 1 = Original, 2 = first variant, 3 = second, etc. A/B compare is `1 3 1 3`.
    if (/^[1-9]$/.test(e.key)) {
      const ctx = ctxById[activeId] || ctxById[sections[0].dataset.uivSection];
      if (!ctx) return;
      const idx = parseInt(e.key, 10) - 1;
      if (idx < 0 || idx >= ctx.order.length) return;
      ctx.apply(ctx.order[idx]);
      e.preventDefault();
    }
  });
})();
</script>
```

**Caveat for vanilla HTML:** swapping `innerHTML` re-parses the section, which resets any per-element state (input values, animation progress). For sections with significant state, prefer reusing the same root and updating specific children, or move to a framework.

---

## Astro

Astro is MPA by default, so wrap the section in a framework island. The React switcher above works inside Astro as a `client:load` island — the shared coordinator is plain ES, no extra setup:

```astro
---
// HeroWithVariants.astro
import { VariantSwitcher } from './VariantSwitcher';
import Hero from './Hero.astro';
import HeroVariantA from './HeroVariantA.astro';
import HeroVariantB from './HeroVariantB.astro';
import HeroVariantC from './HeroVariantC.astro';
---

<VariantSwitcher
  client:load
  sectionId="hero"
  original={<Hero />}
  variants={[
    { key: 'a', name: 'Editorial Serif',    content: <HeroVariantA /> },
    { key: 'b', name: 'Brutalist Grid',     content: <HeroVariantB /> },
    { key: 'c', name: 'Neo-Retro Terminal', content: <HeroVariantC /> },
  ]}
/>
```

If multiple islands coexist on the page (one per section), each registers separately with the shared coordinator — scrollspy + number-keys work across all of them. The coordinator initializes lazily on first `register()` call, so no extra global script tag is needed.

---

## Checklist when wiring up

- [ ] Original component file is unchanged (byte-identical)
- [ ] Variant files created as siblings (2, 3, or more — whatever the skill produced)
- [ ] CSS for `.uiv-chip*` imported once per page (includes `.uiv-chip--active` and `.uiv-chip__num`)
- [ ] Switcher wraps the render site, not the component definition
- [ ] Dev gate verified (production build / no `?variants=1` → toggle hidden)
- [ ] `sectionId` unique across the page
- [ ] Chip segment labels show `<number> <display-name>` (not just a letter) and tooltips include the shortcut hint
- [ ] Active segment has `aria-checked="true"`
- [ ] Keyboard: arrows cycle inside a focused chip; `1..N` applies option N to the scrollspy-active section; `V` hides; `×` dismisses for session
- [ ] URL-share round-trips: select variants, reload with the URL, state is preserved; paste URL in new tab, same state shown
- [ ] Scrollspy: scrolling up/down emphasizes the chip for the section currently in the viewport (`.uiv-chip--active` applied)
- [ ] Hover-to-scroll: hovering a segment smoothly scrolls to the section (respects `prefers-reduced-motion`)
- [ ] Form submissions / link navigation still work inside each variant
