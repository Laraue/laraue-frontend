const YM_ID = 111013659

let loaded = false

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[]; l?: number }
  }
}

// Loads and initializes the Yandex Metrika counter. Only ever called after
// analytics consent has been granted (immediately for visitors outside
// consent-required jurisdictions, or after the cookie banner is accepted).
export function loadYandexMetrika() {
  if (loaded || import.meta.server || window.ym) return
  loaded = true

  window.ym = window.ym || function (...args: unknown[]) {
    (window.ym!.a = window.ym!.a || []).push(args)
  }
  window.ym.l = Date.now()

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://mc.yandex.ru/metrika/tag.js'
  document.head.appendChild(script)

  window.ym(YM_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
  })

  const router = useRouter()
  router.afterEach((to) => {
    window.ym?.(YM_ID, 'hit', to.fullPath)
  })
}
