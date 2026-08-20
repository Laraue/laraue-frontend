const STORAGE_KEY = 'cookie-consent'

export default defineNuxtPlugin(async () => {
  const consentRequired = useConsentRequired()
  const analyticsConsent = useAnalyticsConsent()
  const { gtag } = useGtag()

  // Most marketing pages are prerendered static HTML, so geo detection can't
  // happen server-side per request — resolve it client-side instead, via
  // Cloudflare's edge (see detectCountryCode), before the app mounts.
  const countryCode = await detectCountryCode()
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
  }

  // Yandex Metrika is gated on its own CIS allowlist, entirely independent of
  // the GDPR consent flow above — it never loads for EU/EEA/UK/CH visitors,
  // and it's not tied to whatever an EU visitor clicks on the banner.
  if (isCisCountry(countryCode)) {
    loadYandexMetrika()
  }
})
