// EU member states + EEA (Iceland, Liechtenstein, Norway) + UK (UK GDPR) + Switzerland (FADP, GDPR-like)
const CONSENT_REQUIRED_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB',
  'CH',
])

// CIS + associate members. Yandex Metrika is only ever loaded for visitors
// resolved to one of these countries, independent of GDPR consent state, so
// EU/EEA/UK/CH visitor data never reaches Yandex regardless of what they
// click on the banner (or whether they see one at all).
const CIS_COUNTRIES = new Set([
  'RU', 'BY', 'KZ', 'KG', 'TJ', 'UZ', 'AM', 'AZ', 'MD', 'TM',
])

/**
 * Fails safe: an unresolved country (no cf-ipcountry header, e.g. local dev
 * or requests not proxied through Cloudflare) is treated as requiring consent.
 */
export function isConsentRequiredCountry(countryCode?: string | null): boolean {
  if (!countryCode) return true
  return CONSENT_REQUIRED_COUNTRIES.has(countryCode.toUpperCase())
}

/**
 * Fails closed: an unresolved country never counts as CIS, so Yandex Metrika
 * stays off whenever detection is uncertain (dev, blocked fetch, non-Cloudflare origin).
 */
export function isCisCountry(countryCode?: string | null): boolean {
  if (!countryCode) return false
  return CIS_COUNTRIES.has(countryCode.toUpperCase())
}

/**
 * Resolves the visitor's country client-side via Cloudflare's `/cdn-cgi/trace`
 * endpoint. This works even for statically prerendered pages (which never hit
 * an origin server per-request), as long as the domain is proxied through
 * Cloudflare — Cloudflare answers `/cdn-cgi/trace` at the edge itself.
 * Returns `null` when the country can't be resolved.
 */
export async function detectCountryCode(): Promise<string | null> {
  try {
    const res = await fetch('/cdn-cgi/trace', { cache: 'no-store' })
    if (!res.ok) return null
    const text = await res.text()
    return text.match(/^loc=([A-Z]{2})$/m)?.[1] ?? null
  } catch {
    return null
  }
}
