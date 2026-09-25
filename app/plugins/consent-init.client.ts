const STORAGE_KEY = 'cookie-consent'

export default defineNuxtPlugin(async () => {
  const consentRequired = useConsentRequired()
  const analyticsConsent = useAnalyticsConsent()
  const { gtag, initialize } = useGtag()

  // Most marketing pages are prerendered static HTML, so geo detection can't
  // happen server-side per request — resolve it client-side instead, via
  // Cloudflare's edge (see detectCountryCode), before the app mounts.
  const countryCode = await detectCountryCode()

  // No analytics at all: the Google tag script is never added and no banner is shown.
  if (isAnalyticsBlockedCountry(countryCode)) {
    consentRequired.value = false
    analyticsConsent.value = 'denied'
    return
  }

  consentRequired.value = isConsentRequiredCountry(countryCode)

  if (!consentRequired.value) {
    analyticsConsent.value = 'granted'
  } else {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'granted' || stored === 'denied') {
      analyticsConsent.value = stored
    }
  }

  if (analyticsConsent.value === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted' })
    initialize()
  }
})
