export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || ''
export const GTM_CONTAINER_ID = import.meta.env.VITE_GTM_ID || ''

type Consent = { necessary: true; analytics: boolean; marketing: boolean; updatedAt: string }
const CONSENT_KEY = 'gn-cookie-consent-v1'
export function getCookieConsent(): Consent | null {
  try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null') as Consent | null } catch { return null }
}
export function saveCookieConsent(value: Omit<Consent, 'necessary' | 'updatedAt'>) {
  const consent: Consent = { ...value, necessary: true, updatedAt: new Date().toISOString() }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: consent }))
}
export function trackEvent(name: string, properties: Record<string, unknown> = {}) {
  if (getCookieConsent()?.analytics && typeof window.gtag === 'function') window.gtag('event', name, properties)
}
