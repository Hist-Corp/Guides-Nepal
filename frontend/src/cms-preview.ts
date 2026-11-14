import DOMPurify from 'dompurify';

interface CmsSection {
  id: string;
  type?: string;
  content: Record<string, unknown>;
  style?: Record<string, unknown>;
  format?: Record<string, unknown>;
}

function renderSectionHTML(sec: CmsSection): string {
  const c = sec.content;
  const st = sec.style || {};
  const fmt = sec.format || {};
  const s: string[] = [];
  if (st.backgroundColor) s.push('background:' + st.backgroundColor);
  if (st.textColor) s.push('color:' + st.textColor);
  if (st.alignment) s.push('text-align:' + st.alignment);
  if (st.padding) s.push('padding:' + st.padding);
  if (fmt.fontWeight) s.push('font-weight:' + fmt.fontWeight);
  if (fmt.fontStyle) s.push('font-style:' + fmt.fontStyle);
  if (fmt.textDecoration) s.push('text-decoration:' + fmt.textDecoration);
  if (fmt.fontFamily) s.push('font-family:' + fmt.fontFamily);
  if (fmt.fontSize) s.push('font-size:' + fmt.fontSize);
  if (fmt.color) s.push('color:' + fmt.color);
  const ss = s.join(';');
  const a = (st.accentColor as string) || '#ffba0a';
  const wrap = (v: string, style: string, tag = 'div'): string =>
    v ? '<' + tag + ' style="' + style + '">' + v + '</' + tag + '>' : '';
  switch (sec.type) {
    case 'hero':
      return (
        '<div style="' +
        ss +
        '">' +
        wrap(
          c.tagline as string,
          'opacity:0.7;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em',
          'span'
        ) +
        wrap(
          c.heading as string,
          'font-size:2.5rem;font-weight:800;margin:0.5rem 0;line-height:1.1',
          'h1'
        ) +
        wrap(c.subtitle as string, 'font-size:1rem;opacity:0.85;max-width:32rem', 'p') +
        (c.buttonText
          ? '<button style="margin-top:1rem;padding:0.75rem 1.5rem;border-radius:9999px;border:none;background:' +
            a +
            ';color:#333;font-weight:700;cursor:pointer">' +
            c.buttonText +
            '</button>'
          : '') +
        '</div>'
      );
    case 'featured':
    case 'categories':
    case 'testimonials':
    case 'values':
      return (
        '<div style="' +
        ss +
        '">' +
        wrap(c.heading as string, 'font-size:1.5rem;font-weight:700', 'h2') +
        wrap(c.subtitle as string, 'font-size:0.875rem;opacity:0.7', 'p') +
        (c.buttonText
          ? '<button style="margin-top:0.75rem;padding:0.5rem 1rem;border-radius:0.375rem;border:none;background:' +
            a +
            ';color:#333;font-weight:700;font-size:0.75rem">' +
            c.buttonText +
            '</button>'
          : '') +
        '</div>'
      );
    case 'promo':
      return (
        '<div style="' +
        ss +
        '">' +
        wrap(
          c.tagline as string,
          'font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:' +
            a,
          'span'
        ) +
        wrap(c.heading as string, 'font-size:1.75rem;font-weight:700;margin:0.75rem 0', 'h2') +
        wrap(c.subtitle as string, 'font-size:0.875rem;opacity:0.8;max-width:28rem', 'p') +
        (c.buttonText
          ? '<button style="margin-top:1rem;padding:0.625rem 1.25rem;border-radius:0.5rem;border:none;background:#fff;color:' +
            (st.backgroundColor || '#213448') +
            ';font-weight:700">' +
            c.buttonText +
            '</button>'
          : '') +
        '</div>'
      );
    case 'text':
      return (
        '<div style="' +
        ss +
        '">' +
        wrap(c.heading as string, 'font-size:1.25rem;font-weight:700', 'h2') +
        wrap(c.subtitle as string, 'font-size:0.875rem;opacity:0.8', 'p') +
        wrap(c.body as string, 'font-size:0.875rem;opacity:0.7', 'p') +
        '</div>'
      );
    case 'footer':
      return (
        '<div style="' +
        ss +
        '">' +
        wrap(c.supportEmail as string, 'font-size:0.875rem;opacity:0.7', 'p') +
        wrap(c.copyright as string, 'font-size:0.75rem;opacity:0.5', 'p') +
        '</div>'
      );
    default:
      return (
        '<div style="' +
        ss +
        '">' +
        wrap(c.heading as string, 'font-size:1.25rem;font-weight:700', 'h2') +
        wrap(c.subtitle as string, 'font-size:0.875rem;opacity:0.8', 'p') +
        (c.buttonText
          ? '<button style="margin-top:0.5rem;padding:0.5rem 1rem;border-radius:0.375rem;border:none;background:' +
            a +
            ';color:#333;font-weight:700;font-size:0.75rem">' +
            c.buttonText +
            '</button>'
          : '') +
        '</div>'
      );
  }
}

function applyPreviewSections(sections: CmsSection[]): void {
  sections.forEach((sec) => {
    const el = document.querySelector('[data-cms-id="' + sec.id + '"]');
    if (el) {
      el.innerHTML = DOMPurify.sanitize(renderSectionHTML(sec));
    }
  });
}

function registerClickableSections(sel: string): void {
  document.querySelectorAll(sel).forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = el.getAttribute('data-cms-id');
      if (id) {
        window.parent?.postMessage({ type: 'cms-preview-click', id }, '*');
      }
    });
    (el as HTMLElement).style.cursor = 'pointer';
  });
}

const ALLOWED_CMS_ORIGIN = 'http://example.org';
window.addEventListener('message', (ev: MessageEvent) => {
  if (ev.origin !== ALLOWED_CMS_ORIGIN) {
    return;
  }
  const d = ev.data;
  if (!d || !d.type) return;
  if (d.type === 'cms-preview-update') {
    applyPreviewSections(d.sections || []);
  } else if (d.type === 'cms-preview-register') {
    registerClickableSections(d.selectors || '[data-cms-id]');
  } else if (d.type === 'cms-preview-highlight') {
    document.querySelectorAll('.cms-preview-highlight').forEach((el) => {
      el.classList.remove('cms-preview-highlight');
      (el as HTMLElement).style.outline = '';
    });
    const t = document.querySelector('[data-cms-id="' + d.id + '"]');
    if (t) {
      t.classList.add('cms-preview-highlight');
      (t as HTMLElement).style.outline = '3px solid #2563eb';
      (t as HTMLElement).style.outlineOffset = '2px';
      t.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

window.parent?.postMessage({ type: 'cms-preview-ready' }, '*');
window.addEventListener('load', () => {
  window.parent?.postMessage({ type: 'cms-preview-ready' }, '*');
});

export {};
