// EU member states + EEA (Iceland, Liechtenstein, Norway) + UK (UK GDPR) + Switzerland (FADP, GDPR-like)
const CONSENT_REQUIRED_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB',
  'CH',
])

// Countries where Google Analytics must not be used at all, consent or not - e.g. Russia, where
// the law forbids using foreign analytics services on Russian users. Visitors from these
// countries never load the Google tag and never see the cookie banner.
const ANALYTICS_BLOCKED_COUNTRIES = new Set([
  'RU',
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
 * Resolves the visitor's country client-side via Cloudflare's `/cdn-cgi/trace`
 * endpoint. This works even for statically prerendered pages (which never hit
 * an origin server per-request), as long as the domain is proxied through
 * Cloudflare — Cloudflare answers `/cdn-cgi/trace` at the edge itself.
 * Returns `null` when the country can't be resolved.
 */
/**
 * An unresolved country is not treated as blocked - it falls back to the consent-required
 * path instead (see isConsentRequiredCountry), so analytics still only loads after the
 * visitor explicitly accepts it.
 */
export function isAnalyticsBlockedCountry(countryCode?: string | null): boolean {
  if (!countryCode) return false
  return ANALYTICS_BLOCKED_COUNTRIES.has(countryCode.toUpperCase())
}

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
