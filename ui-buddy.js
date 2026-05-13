(() => {
  const gate =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:' ||
    location.search.includes('variants=1');
  if (!gate) return;

  const sections = document.querySelectorAll('[data-uib-section]');
  if (!sections.length) return;

  // URL helpers. Each section's selection is stored as ?<section-id>=<key>.
  // history.replaceState avoids polluting history on every click.
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

    const storageKey = `ui-buddy:${id}`;
    const dismissKey = `ui-buddy-dismissed:${id}`;

    const originalHTML = section.innerHTML;
    const variants = { original: { html: originalHTML, variant: null } };
    const order = ['original'];

    document.querySelectorAll(`template[data-uib-for="${id}"]`).forEach(t => {
      const key = t.dataset.uivVariant;
      variants[key] = { html: t.innerHTML, variant: key };
      if (!order.includes(key)) order.push(key);
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
      writeToURL(id, key);
      chip.querySelectorAll('[data-uib-seg]').forEach(el => {
        el.setAttribute('aria-checked', el.dataset.uivSeg === key ? 'true' : 'false');
      });
      ctx.currentKey = key;
    };

    const chip = document.createElement('div');
    chip.className = 'uib-chip';
    chip.dataset.uibChipFor = id;
    chip.setAttribute('role', 'radiogroup');
    chip.setAttribute('aria-label', `${id} variant switcher`);
    chip.style.bottom = `${16 + stackIndex * 48}px`;

    const segButton = (key, index) => {
      const name = key === 'original' ? 'Original' : (names[key] || key.toUpperCase());
      const num = index + 1;
      const title = `${name} (press ${num})`;
      return `<button class="uib-chip__seg" data-uib-seg="${key}" role="radio" title="${title}">` +
             `<span class="uib-chip__num">${num}</span>` +
             `<span class="uib-chip__name">${name}</span>` +
             `</button>`;
    };
    chip.innerHTML = `
      <span class="uib-chip__label">${id}</span>
      ${order.map(segButton).join('')}
      <span class="uib-chip__badge">PREVIEW</span>
      <button class="uib-chip__close" aria-label="Hide">×</button>
    `;

    const scrollToSection = () => {
      const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      section.scrollIntoView({ behavior, block: 'start' });
    };
    chip.querySelectorAll('[data-uib-seg]').forEach(el => {
      el.addEventListener('click', () => apply(el.dataset.uivSeg));
      el.addEventListener('mouseenter', scrollToSection);
      el.addEventListener('focus', scrollToSection);
    });
    chip.querySelector('.uib-chip__close').addEventListener('click', () => {
      chip.remove();
      try { sessionStorage.setItem(dismissKey, '1'); } catch {}
    });

    chip.addEventListener('keydown', e => {
      const current = [...chip.querySelectorAll('[data-uib-seg]')]
        .find(el => el.getAttribute('aria-checked') === 'true');
      const idx = order.indexOf(current ? current.dataset.uivSeg : 'original');
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        apply(order[(idx + 1) % order.length]);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        apply(order[(idx - 1 + order.length) % order.length]);
        e.preventDefault();
      }
    });

    if (sessionStorage.getItem(dismissKey) !== '1') {
      document.body.appendChild(chip);
    }

    const ctx = { id, section, chip, order, apply, currentKey: 'original' };
    ctxById[id] = ctx;

    // Resolve initial key: URL > localStorage > 'original'.
    let initial = readFromURL(id);
    if (!initial) {
      try { initial = localStorage.getItem(storageKey) || 'original'; } catch { initial = 'original'; }
    }
    apply(initial);
  });

  // Scrollspy: mark the chip whose section is most visible as active.
  // Falls back to first section when nothing intersects (e.g. very tall viewport above all sections).
  if ('IntersectionObserver' in window) {
    const ratios = new Map();
    const setActive = id => {
      if (id === activeId) return;
      activeId = id;
      document.querySelectorAll('.uib-chip').forEach(c => {
        c.classList.toggle('uib-chip--active', c.dataset.uibChipFor === id);
      });
    };
    const observer = new IntersectionObserver(entries => {
      for (const e of entries) ratios.set(e.target.dataset.uivSection, e.intersectionRatio);
      let topId = null, topRatio = 0;
      ratios.forEach((r, id) => { if (r > topRatio) { topRatio = r; topId = id; } });
      if (topId) setActive(topId);
    }, { threshold: [0, 0.15, 0.35, 0.6, 0.85, 1] });
    sections.forEach(s => observer.observe(s));
    // Seed first section as active until the observer fires.
    setActive(sections[0].dataset.uivSection);
  }

  // Global shortcuts.
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (t && t.isContentEditable) return;

    // V: toggle chip visibility for screenshots.
    if (e.key.toLowerCase() === 'v') {
      document.querySelectorAll('.uib-chip').forEach(c => {
        c.style.display = c.style.display === 'none' ? '' : 'none';
      });
      return;
    }

    // 1-9: select the Nth option on the scrollspy-active section.
    // 1 = Original, 2 = first variant, 3 = second, etc.
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
