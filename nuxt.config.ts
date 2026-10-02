import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
// Laraue brand icons live on the shared CDN, not in this repo.
const iconsBaseUrl = 'https://laraue.com/static/images/icons/laraue-'

export default defineNuxtConfig({
  compatibilityDate: '2026-06-21',
  devtools: { enabled: true },
  modules: ['nuxt-gtag', '@nuxtjs/i18n', '@nuxtjs/sitemap'],
  site: {
    url: 'https://laraue.com',
  },
  sitemap: {
    sitemapName: 'sitemap-main.xml',
    exclude: ['/blog/**', '/ru/blog/**'],
    autoI18n: false,
  },
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: 'G-RGM3JHLBGL',
    // The Google tag script is only added once analytics is allowed for the visitor (see
    // plugins/consent-init.client.ts and LCookieConsent) - never for visitors from countries
    // where Google Analytics can't be used (see utils/gdprCountries.ts).
    initMode: 'manual',
    initCommands: [
      ['consent', 'default', {
        analytics_storage: 'denied',
      }],
    ],
  },
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/main.css',
  ],
  nitro: {
    // The blog (`content/blog`) is bundled with the server and read by `server/utils/blogCatalog`.
    serverAssets: [
      { baseName: 'blog', dir: fileURLToPath(new URL('./content/blog', import.meta.url)) },
    ],
    // The preview images renderer (`server/utils/ogImage`): the wasm of the rasterizer is imported
    // as a module, and the wasm of the text shaper, which satori loads from its folder at run time,
    // is added to the traced files of the build.
    experimental: { wasm: true },
    externals: {
      traceInclude: [
        createRequire(createRequire(import.meta.url).resolve('satori')).resolve('harfbuzzjs/hb.wasm'),
      ],
    },
  },
  routeRules: {
    // Data for the blog pages, not pages themselves.
    '/blog-content/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/': { prerender: true },
    '/crawled-apartments': { prerender: true },
    '/learn-language-bot': { prerender: true },
    '/privacy': { prerender: true },
  },
  app: {
    head: {
      title: 'Laraue Blog and Apps',
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
      link: [
        // Browser tab icon follows the OS/browser theme: the transparent mark on dark tabs, the
        // standard dark-square one on light tabs. The light links come last on purpose - browsers
        // that ignore `media` fall back to the last declared icon, i.e. the standard one.
        { rel: 'icon', type: 'image/png', href: `${iconsBaseUrl}favicon-transparent.png`, media: '(prefers-color-scheme: dark)' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${iconsBaseUrl}favicon-32x32-transparent.png`, media: '(prefers-color-scheme: dark)' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${iconsBaseUrl}favicon-16x16-transparent.png`, media: '(prefers-color-scheme: dark)' },
        { rel: 'icon', type: 'image/png', href: `${iconsBaseUrl}favicon-black.png`, media: '(prefers-color-scheme: light)' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${iconsBaseUrl}favicon-32x32-black.png`, media: '(prefers-color-scheme: light)' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${iconsBaseUrl}favicon-16x16-black.png`, media: '(prefers-color-scheme: light)' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: `${iconsBaseUrl}apple-touch-icon-black.png` },
        { rel: 'manifest', href: '/site.webmanifest' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&subset=latin,cyrillic&display=swap'
        }
      ],
    },
  },
  i18n: {
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', name: 'English', language: 'en', file: "en.json" },
      { code: 'ru', name: 'Русский', language: 'ru', file: "ru.json" },
    ],
    defaultLocale: 'en',
    baseUrl: 'https://laraue.com',
    detectBrowserLanguage: false,
  },
  runtimeConfig: {
    // The key of the IndexNow file in `public/` (NUXT_INDEX_NOW_KEY): the blog addresses are sent
    // to the search engines after a start when it is set.
    indexNowKey: '',
    public: {
      // The public address of the site (NUXT_PUBLIC_SITE_URL): the addresses of the blog feed and
      // preview images are built from it.
      siteUrl: 'https://laraue.com',
      markdownBaseAddress: process.env.NUXT_PUBLIC_MARKDOWN_BASE_ADDRESS || 'https://laraue.com/api/markdown-transpiler',
      imagesBaseAddress: 'https://laraue.com/static/images/'
    },
  }
})