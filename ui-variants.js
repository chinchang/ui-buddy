(() => {
  const gate =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:' ||
    location.search.includes('variants=1');
  if (!gate) return;

  const sections = document.querySelectorAll('[data-uiv-section]');
  if (!sections.length) return;

  sections.forEach((section, stackIndex) => {
    const id = section.dataset.uivSection;
    let names = { a: 'A', b: 'B', c: 'C' };
    try { names = Object.assign(names, JSON.parse(section.dataset.uivNames || '{}')); } catch {}

    const storageKey = `ui-variant:${id}`;
    const dismissKey = `ui-variant-dismissed:${id}`;

    const originalHTML = section.innerHTML;
    const variants = { original: { html: originalHTML, variant: null } };

    document.querySelectorAll(`template[data-uiv-for="${id}"]`).forEach(t => {
      const key = t.dataset.uivVariant;
      variants[key] = { html: t.innerHTML, variant: key };
    });

    const apply = key => {
      if (!variants[key]) key = 'original';
      section.innerHTML = variants[key].html;
      if (variants[key].variant) {
        section.dataset.variant = variants[key].variant;
      } else {
        delete section.dataset.variant;
      }
      try { localStorage.setItem(storageKey, key); } catch {}
      chip.querySelectorAll('[data-uiv-seg]').forEach(el => {
        el.setAttribute('aria-checked', el.dataset.uivSeg === key ? 'true' : 'false');
      });
    };

    const chip = document.createElement('div');
    chip.className = 'uiv-chip';
    chip.setAttribute('role', 'radiogroup');
    chip.setAttribute('aria-label', `${id} variant switcher`);
    chip.style.bottom = `${16 + stackIndex * 48}px`;
    chip.innerHTML = `
      <span class="uiv-chip__label">${id}</span>
      <button class="uiv-chip__seg" data-uiv-seg="original" role="radio" title="Original">O</button>
      <button class="uiv-chip__seg" data-uiv-seg="a" role="radio" title="${names.a}">A</button>
      <button class="uiv-chip__seg" data-uiv-seg="b" role="radio" title="${names.b}">B</button>
      <button class="uiv-chip__seg" data-uiv-seg="c" role="radio" title="${names.c}">C</button>
      <span class="uiv-chip__badge">PREVIEW</span>
      <button class="uiv-chip__close" aria-label="Hide">×</button>
    `;

    chip.querySelectorAll('[data-uiv-seg]').forEach(el => {
      el.addEventListener('click', () => apply(el.dataset.uivSeg));
    });
    chip.querySelector('.uiv-chip__close').addEventListener('click', () => {
      chip.remove();
      try { sessionStorage.setItem(dismissKey, '1'); } catch {}
    });

    chip.addEventListener('keydown', e => {
      const segs = ['original', 'a', 'b', 'c'];
      const current = [...chip.querySelectorAll('[data-uiv-seg]')]
        .find(el => el.getAttribute('aria-checked') === 'true');
      const idx = segs.indexOf(current ? current.dataset.uivSeg : 'original');
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        apply(segs[(idx + 1) % segs.length]);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        apply(segs[(idx - 1 + segs.length) % segs.length]);
        e.preventDefault();
      }
    });

    if (sessionStorage.getItem(dismissKey) !== '1') {
      document.body.appendChild(chip);
    }

    let saved = 'original';
    try { saved = localStorage.getItem(storageKey) || 'original'; } catch {}
    apply(saved);
  });

  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'v' || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    document.querySelectorAll('.uiv-chip').forEach(c => {
      c.style.display = c.style.display === 'none' ? '' : 'none';
    });
  });
})();
