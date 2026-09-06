import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { clearCmsSectionsCache } from '../../services/cms'

/**
 * Live-preview bridge for the content writer dashboard.
 *
 * When a page is opened with ?cms_edit=1 (inside the dashboard iframe),
 * every section marked with data-cms-id gets an editable outline and
 * becomes click-to-edit: clicks are posted to the parent dashboard so it
 * can open the field editor for that exact section of the real page.
 */
const CmsEditMode: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('cms_edit') !== '1') return

    const slug = params.get('cms_slug') || ''
    const style = document.createElement('style')
    style.textContent = `
      [data-cms-id] { position: relative; cursor: pointer !important; }
      [data-cms-id]::after {
        content: attr(data-cms-label);
        position: absolute; top: 8px; left: 8px; z-index: 60;
        background: #F4B400; color: #213448; font-size: 11px; font-weight: 700;
        padding: 2px 8px; border-radius: 999px; pointer-events: none;
      }
      [data-cms-id]:hover { outline: 2px dashed #F4B400; outline-offset: -2px; }
    `
    document.head.appendChild(style)

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-cms-id]') as HTMLElement | null
      if (!target) return
      e.preventDefault()
      e.stopPropagation()
      window.parent.postMessage(
        { type: 'cms-section-click', slug, id: target.getAttribute('data-cms-id'), label: target.getAttribute('data-cms-label') || undefined },
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
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('message', onMessage)
      style.remove()
    }
  }, [location.pathname])

  return null
}

export default CmsEditMode