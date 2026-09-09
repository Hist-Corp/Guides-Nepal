import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { clearCmsSectionsCache, getPageSections } from '../../services/cms'

/**
 * Live-preview bridge for the content writer dashboard.
 *
 * When a page is opened with ?cms_edit=1 (inside the dashboard iframe):
 *  1. Every top-level <section>/<footer>/<header> is tagged as a selectable
 *     section (explicit data-cms-id wins; others get `<slug>-auto-<n>`).
 *  2. EVERY content element inside them - headings, paragraphs, images,
 *     buttons, links, list items, quotes - is individually tagged with a
 *     kind (`<slug>-el-<n>`), so no part of the page is locked.
 *  3. Clicks are posted to the parent dashboard, which opens a kind-specific
 *     editor (and adopts unknown blocks automatically).
 *  4. CMS-managed content and styles are applied back onto the real page so
 *     dashboard edits are reflected live.
 */

const ELEMENT_SELECTOR =
  'h1, h2, h3, h4, h5, h6, p, img, button, a, li, blockquote, figcaption'

function kindOf(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  if (tag === 'img') return 'image'
  if (/^h[1-6]$/.test(tag)) return 'heading'
  if (tag === 'p') return 'paragraph'
  if (tag === 'li') return 'listitem'
  if (tag === 'blockquote' || tag === 'figcaption') return 'quote'
  if (tag === 'a' && !el.querySelector('img')) return 'link'
  return 'button'
}

function tagSectionsAndElements(slug: string) {
  // 1. Sections: outermost section/footer/header wrappers only.
  const wrappers = Array.from(
    document.querySelectorAll('section, footer, header')
  ) as HTMLElement[]
  let sectionIndex = 0
  wrappers
    .filter((el) => !el.parentElement?.closest('section, header'))
    .forEach((el) => {
      if (el.getAttribute('data-cms-id')) {
        sectionIndex += 1
        return
      }
      const id = `${slug}-auto-${sectionIndex}`
      sectionIndex += 1
      const heading = el.querySelector('h1, h2, h3')
      const label =
        (heading?.textContent || '').trim().slice(0, 40) || `Section ${sectionIndex}`
      el.setAttribute('data-cms-id', id)
      el.setAttribute('data-cms-label', label)
    })

  // 2. Granular content elements - everything not already tagged.
  const elements = Array.from(document.querySelectorAll(ELEMENT_SELECTOR)) as HTMLElement[]
  let elIndex = 0
  elements.forEach((el) => {
    if (el.closest('[data-cms-kind]')) return // inside an already-tagged element
    const kind = kindOf(el)
    const id = `${slug}-el-${elIndex}`
    elIndex += 1
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ')
    const label =
      kind === 'image'
        ? el.getAttribute('alt') || 'Image'
        : text.slice(0, 40) || kind
    el.setAttribute('data-cms-id', id)
    el.setAttribute('data-cms-label', label)
    el.setAttribute('data-cms-kind', kind)
  })
}

/** Apply CMS content + style overrides onto the real page DOM. */
async function applyCmsOverrides(slug: string) {
  if (!slug) return
  let sections: any[] = []
  try {
    sections = await getPageSections(slug)
  } catch {
    return
  }
  const ELEMENT_TYPES = ['heading', 'paragraph', 'listitem', 'quote', 'image', 'button', 'link']

  sections.forEach((section) => {
    const el = document.querySelector(`[data-cms-id="${section.id}"]`) as HTMLElement | null
    if (!el) return
    const c = section.content || {}
    const st = section.style || {}
    const type = section.type || ''

    if (ELEMENT_TYPES.includes(type)) {
      // --- Granular element sections: apply directly to the element ---
      if (type === 'image') {
        const img = (el.matches('img') ? el : el.querySelector('img')) as HTMLImageElement | null
        if (img) {
          if (c.image) img.src = c.image
          if (c.alt) img.alt = c.alt
        }
      } else if (type === 'button' || type === 'link') {
        if (c.buttonText) el.textContent = c.buttonText
        if (c.link) {
          const anchor = (el.matches('a') ? el : el.querySelector('a')) as HTMLAnchorElement | null
          if (anchor) anchor.setAttribute('href', c.link)
        }
      } else {
        const text = c.heading || c.body || c.subtitle
        if (text) el.textContent = text
      }
      if (st.fontSize) el.style.fontSize = st.fontSize
      if (st.fontWeight) el.style.fontWeight = st.fontWeight
      if (st.textColor) el.style.color = st.textColor
      if (st.backgroundColor && type !== 'heading') el.style.backgroundColor = st.backgroundColor
      if (st.alignment) el.style.textAlign = st.alignment
      return
    }

    // --- Page-level sections ---
    if (c.heading) {
      const heading = (el.matches('h1, h2, h3')
        ? el
        : el.querySelector('h1, h2, h3')) as HTMLElement | null
      if (heading) heading.textContent = c.heading
    }
    if (c.subtitle) {
      const heading = el.querySelector('h1, h2, h3')
      const p = (heading?.nextElementSibling as HTMLElement | null) || el.querySelector('p')
      if (p && p.tagName === 'P') p.textContent = c.subtitle
    }
    if (c.body) {
      const p = el.querySelector('p')
      if (p) p.textContent = c.body
    }

    if (st.backgroundColor) el.style.backgroundColor = st.backgroundColor
    if (st.textColor) el.style.color = st.textColor
    if (st.padding) el.style.padding = st.padding
    if (st.alignment) el.style.textAlign = st.alignment
    if (st.headingSize) {
      const heading = el.querySelector('h1, h2, h3') as HTMLElement | null
      if (heading) heading.style.fontSize = st.headingSize
    }
  })
}

const CmsEditMode: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('cms_edit') !== '1') return

    const slug = params.get('cms_slug') || ''
    const style = document.createElement('style')
    style.textContent = `
      [data-cms-id] { position: relative; cursor: pointer !important; }
      [data-cms-id]:not([data-cms-kind])::after {
        content: attr(data-cms-label);
        position: absolute; top: 8px; left: 8px; z-index: 60;
        background: #F4B400; color: #213448; font-size: 11px; font-weight: 700;
        padding: 2px 8px; border-radius: 999px; pointer-events: none;
      }
      [data-cms-id]:not([data-cms-kind]):hover { outline: 2px dashed #F4B400; outline-offset: -2px; }
      [data-cms-kind] { transition: outline-color 0.15s; }
      [data-cms-kind]:hover {
        outline: 2px dashed #213448; outline-offset: 2px; border-radius: 2px;
      }
      .cms-selected {
        outline: 3px solid #9A2143 !important;
        outline: 3px solid #9A2144 !important;
        outline-offset: 2px;
      }
      [data-cms-kind]:hover::before {
        content: attr(data-cms-kind);
        position: absolute; top: -10px; left: 0; z-index: 61;
        background: #213448; color: #F4B400; font-size: 9px; font-weight: 700;
        padding: 1px 6px; border-radius: 4px; pointer-events: none;
        text-transform: uppercase; letter-spacing: 0.03em;
      }
    `
    document.head.appendChild(style)

    // Wait a tick for the page to render, then tag + apply CMS content.
    const tagTimer = setTimeout(() => {
      tagSectionsAndElements(slug)
      applyCmsOverrides(slug)
    }, 300)

    // Re-tag continuously: React re-renders can replace DOM nodes (losing
    // the data-cms-* attributes) and async content may load late. The
    // observer keeps every element selectable at all times.
    const observer = new MutationObserver(() => tagSectionsAndElements(slug))
    observer.observe(document.body, { childList: true, subtree: true })

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-cms-id]') as HTMLElement | null
      if (!target) return
      e.preventDefault()
      e.stopPropagation()
      // Visual confirmation that the click was registered.
      document.querySelectorAll('.cms-selected').forEach((n) => n.classList.remove('cms-selected'))
      target.classList.add('cms-selected')
      const kind = target.getAttribute('data-cms-kind') || undefined
      const sectionEl = target.closest('[data-cms-id]:not([data-cms-kind])') as HTMLElement | null
      window.parent.postMessage(
        {
          type: 'cms-section-click',
          slug,
          id: target.getAttribute('data-cms-id'),
          label: target.getAttribute('data-cms-label') || undefined,
          kind,
          sectionId: sectionEl?.getAttribute('data-cms-id') || undefined,
        },
        '*'
      )
    }
    document.addEventListener('click', onClick, true)

    const onMessage = (e: MessageEvent) => {
      const data = e.data || {}
      if (data.type === 'cms-refresh') {
        clearCmsSectionsCache(data.slug)
        window.location.reload()
      }
    }
    window.addEventListener('message', onMessage)

    window.parent.postMessage({ type: 'cms-page-loaded', slug, path: location.pathname }, '*')

    return () => {
      clearTimeout(tagTimer)
      observer.disconnect()
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('message', onMessage)
      style.remove()
    }
  }, [location.pathname])

  return null
}

export default CmsEditMode
