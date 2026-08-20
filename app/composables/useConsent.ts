// Whether the visitor's jurisdiction legally requires a cookie/consent banner.
// Populated client-side (see plugins/consent-init.client.ts) and defaults to
// `true` (safe default) until then.
export const useConsentRequired = () => useState<boolean>('consent-required', () => true)

// The visitor's stored analytics consent choice. `null` means "not decided yet".
export const useAnalyticsConsent = () => useState<'granted' | 'denied' | null>('analytics-consent', () => null)
