// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-12-05',
  devtools: { enabled: true },
  modules: ['nuxt-gtag', '@nuxtjs/i18n'],
  elementPlus: {
    // Disable automatic import of dayjs to avoid conflicts
    importStyle: 'css'
  },
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: 'G-RGM3JHLBGL'
  },
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
  css: [
    '~/assets/css/main.css',
  ],
  routeRules: {
    '/': { prerender: true },
    '/crawled-apartments': { prerender: true },
    '/learn-language-bot': { prerender: true },
    '/boards': { prerender: true },
  },
  app: {
    head: {
      title: 'Laraue Blog and Apps',
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;1,300&family=JetBrains+Mono:wght@400;500&subset=latin,cyrillic&display=swap'
        }
      ],
    },
  },
  i18n: {
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', name: 'English', language: 'en-US', file: "en.json" },
      { code: 'ru', name: 'Русский', language: 'ru-RU', file: "ru.json" },
    ],
    defaultLocale: 'en',
    baseUrl: 'https://laraue.com',
    detectBrowserLanguage: false,
  },
  runtimeConfig: {
    public: {
      pdfExtractorBaseAddress: process.env.NUXT_PUBLIC_PDF_EXTRACTOR_BASE_ADDRESS || 'https://laraue.com/api/pdfql/v1',
      blogBaseAddress: process.env.NUXT_PUBLIC_BLOG_BASE_ADDRESS || 'https://laraue.com/api/blog',
      markdownBaseAddress: process.env.NUXT_PUBLIC_MARKDOWN_BASE_ADDRESS || 'https://laraue.com/api/markdown-transpiler',
      imagesBaseAddress: 'https://laraue.com/static/images/'
    },
  }
})