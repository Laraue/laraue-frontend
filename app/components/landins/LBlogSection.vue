<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { localePathFromSegments } = usePathUtil()
const { getFeatured } = useBlogContent()

// The pages of the blog that tell about us the best (`featured: true` in their files).
const { data: pages } = await useAsyncData(
  () => `home-featured-${locale.value}`,
  () => getFeatured(locale.value),
  { watch: [locale] },
)
</script>

<i18n lang="json">
{
  "en": {
    "label": "From the blog",
    "title": "How we build it",
    "all": "All articles and projects"
  },
  "ru": {
    "label": "Из блога",
    "title": "Как мы это делаем",
    "all": "Все статьи и проекты"
  }
}
</i18n>

<template>
  <section v-if="pages?.length" class="blog-section" aria-labelledby="home-blog-heading">
    <div class="section-label">{{ t('label') }}</div>
    <h2 id="home-blog-heading" class="section-title">{{ t('title') }}</h2>
    <div class="blog-grid">
      <nuxt-link v-for="page in pages" :key="page.fileName" :to="localePathFromSegments(page.path)" class="blog-card">
        <h3>{{ page.title }}</h3>
        <p>{{ page.description }}</p>
      </nuxt-link>
    </div>
    <nuxt-link :to="localePath('/blog')" class="blog-all">{{ t('all') }} &#8594;</nuxt-link>
  </section>
</template>

<style scoped>
.blog-section{padding:100px 48px;max-width:1160px;margin:0 auto}
.section-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-label::after{content:'';flex:1;max-width:40px;height:1px;background:var(--accent);opacity:.5}
.section-title{font-family:var(--serif);font-size:clamp(28px,3.5vw,44px);line-height:1.12;letter-spacing:-.3px;margin-bottom:20px}
.blog-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:48px}
.blog-card{border:1px solid var(--border);border-radius:14px;padding:24px 28px;background:var(--color-surface);text-decoration:none;color:inherit;display:block;transition:box-shadow .2s,transform .2s,border-color .2s}
.blog-card:hover{box-shadow:0 8px 32px rgba(16,24,40,.1);transform:translateY(-3px);border-color:var(--ink)}
.blog-card h3{font-size:16px;font-weight:700;line-height:1.35;margin:0 0 8px;color:var(--ink)}
.blog-card p{margin:0;font-size:13px;line-height:1.55;color:var(--muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.blog-all{display:inline-block;margin-top:28px;font-size:14px;font-weight:600;color:var(--accent);text-decoration:none}
.blog-all:hover{text-decoration:underline}
@media(max-width:860px){.blog-section{padding:64px 22px}.blog-grid{grid-template-columns:1fr}}
</style>
