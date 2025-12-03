// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-12-04',
  devtools: { enabled: true },
  modules: ['@element-plus/nuxt', '@vesp/nuxt-fontawesome', 'nuxt-gtag'],
  elementPlus: {
    // Disable automatic import of dayjs to avoid conflicts
    importStyle: 'css'
  },
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: 'G-RGM3JHLBGL'
  },
  css: [
    '~/assets/css/reset.css',
    '~/assets/css/main.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  fontawesome: {
    icons: {
      solid: [
        'faBed',
        'faMoneyBill',
        'faLayerGroup',
        'faRulerCombined',
        'faHome',
        'faSubway',
        'faArrowDown',
        'faUpload',
        'faLocationDot'
      ]
    }
  },
  routeRules: {
    '/': { prerender: true },
    '/crawled-apartments': { ssr: true },
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
      ]
    },
  },
  runtimeConfig: {
    public: {
      pdfExtractorBaseAddress: process.env.NUXT_PUBLIC_PDF_EXTRACTOR_BASE_ADDRESS || 'https://laraue.com/api/pdfql/v1',
      apartmentsBaseAddress: process.env.NUXT_PUBLIC_APARTMENTS_BASE_ADDRESS || 'https://laraue.com/api/real_estate',
      blogBaseAddress: process.env.NUXT_PUBLIC_BLOG_BASE_ADDRESS || 'https://laraue.com/api/blog',
    },
  }
})