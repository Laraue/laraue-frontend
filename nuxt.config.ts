// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@element-plus/nuxt', '@vesp/nuxt-fontawesome'],
  elementPlus: {
    // Disable automatic import of dayjs to avoid conflicts
    importStyle: 'css'
  },
  css: [
    '~/assets/css/reset.css',
    '~/assets/css/main.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  fontawesome: {
    icons: {
      solid: ['faBed', 'faMoneyBill', 'faLayerGroup', 'faRulerCombined', 'faHome', 'faSubway', 'faArrowDown', 'faUpload']
    }
  },
  routeRules: {
    '/': { prerender: true },
    '/crawled-apartments': { prerender: true },
    '/learn-language-bot': { prerender: true },
    '/blog/**': { ssr: true },
  },
  vite: {
    optimizeDeps: {
      include: ['monaco-editor']
    }
  },
  app: {
    head: {
      title: 'Laraue Blog and Apps',
      htmlAttrs: {
        lang: 'en',
      },
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      script: [
        {
          src: "https://www.googletagmanager.com/gtag/js?id=" + import.meta.env.VITE_GOOGLE_ANALYTICS_TAG,
          async: "true"
        }
      ],
    },
  },
  runtimeConfig: {
    public: {
      pdfExtractorBaseAddress: 'http://localhost:5192/api/v1',
      apartmentsBaseAddress: 'http://localhost:5127/api',
      blogBaseAddress: 'http://localhost:5289/api',
    },
  }
})