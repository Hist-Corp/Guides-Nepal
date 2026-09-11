import { useEffect, useCallback } from 'react';

/**
 * Enables click-to-edit and live-update communication between the dashboard
 * Live Page Editor (parent) and the frontend page (iframe).
 *
 * Usage: mount once at the top of the App when ?cms-preview=1 is in the URL.
 */
export default function CmsPreviewBridge() {
  // Notify parent when a CMS section is clicked
  const handleSectionClick = useCallback((e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-cms-id]');
    if (!target) return;
    const sectionId = target.getAttribute('data-cms-id');
    if (!sectionId) return;
    e.stopPropagation();
    e.preventDefault();
    window.parent.postMessage({ type: 'cms-section-click', sectionId }, '*');
  }, []);

  // Notify parent when an image inside a CMS section is clicked
  const handleImageClick = useCallback((e: MouseEvent) => {
    const img = (e.target as HTMLElement).closest('img');
    if (!img) return;
    const sectionEl = img.closest('[data-cms-id]');
    if (!sectionEl) return;
    const sectionId = sectionEl.getAttribute('data-cms-id');
    if (!sectionId) return;
    e.stopPropagation();
    e.preventDefault();
    window.parent.postMessage({
      type: 'cms-image-click',
      sectionId,
      currentUrl: img.src || '',
      alt: img.alt || '',
    }, '*');
  }, []);

  // Listen for commands from the parent dashboard
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      const { type, sectionId, content, style } = e.data;

      if (type === 'cms-highlight-section' && sectionId) {
        // Remove previous highlights
        document.querySelectorAll('[data-cms-id].cms-highlighted').forEach(el => {
          el.classList.remove('cms-highlighted');
          (el as HTMLElement).style.outline = '';
          (el as HTMLElement).style.outlineOffset = '';
        });
        // Highlight target
        const el = document.querySelector(`[data-cms-id="${sectionId}"]`);
        if (el) {
          el.classList.add('cms-highlighted');
          (el as HTMLElement).style.outline = '3px solid #2563eb';
          (el as HTMLElement).style.outlineOffset = '2px';
          (el as HTMLElement).style.transition = 'outline 0.2s';
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      if (type === 'cms-update-section' && sectionId && content) {
        const el = document.querySelector(`[data-cms-id="${sectionId}"]`);
        if (!el) return;
        // Update text nodes
        if (content.heading !== undefined) {
          const heading = el.querySelector('h1, h2, h3');
          if (heading) heading.textContent = content.heading.replace(/\\n/g, ' ');
        }
        if (content.subtitle !== undefined) {
          const subtitle = el.querySelector('p');
          if (subtitle) subtitle.textContent = content.subtitle.replace(/\\n/g, ' ');
        }
        if (content.buttonText !== undefined) {
          const btn = el.querySelector('button');
          if (btn) btn.textContent = content.buttonText;
        }
        if (style?.backgroundColor !== undefined) {
          (el as HTMLElement).style.backgroundColor = style.backgroundColor;
        }
        if (style?.textColor !== undefined) {
          (el as HTMLElement).style.color = style.textColor;
        }
      }

      if (type === 'cms-update-image' && sectionId) {
        const { imageUrl, alt } = e.data;
        const el = document.querySelector(`[data-cms-id="${sectionId}"]`);
        if (!el) return;
        const img = el.querySelector('img');
        if (img) {
          if (imageUrl !== undefined) img.src = imageUrl;
          if (alt !== undefined) img.alt = alt;
        }
      }
    };

    window.addEventListener('message', handler);
    document.addEventListener('click', handleSectionClick, true);
    document.addEventListener('click', handleImageClick, true);
    // Add cursor pointer to images inside CMS sections to signal editability
    document.querySelectorAll('[data-cms-id] img').forEach(img => {
      (img as HTMLElement).style.cursor = 'pointer';
    });
    return () => {
      window.removeEventListener('message', handler);
      document.removeEventListener('click', handleSectionClick, true);
      document.removeEventListener('click', handleImageClick, true);
    };
  }, [handleSectionClick, handleImageClick]);

  return null;
}