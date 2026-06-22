<script setup>
// This fetches the SEO metadata object
const head = useLocaleHead()

// You can combine it with other dynamic metadata
const route = useRoute()
const { t } = useI18n()
const pageTitle = computed(() => t(route.meta?.title ?? 'defaultTitle'))

const config = useRuntimeConfig()
const rssUrl = new URL(config.public.blogBaseAddress + "/rss");

useHead({
  link: [
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'Laraue Blog (EN)',
      href: `${rssUrl}?languageCode=en`
    },
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'Laraue Blog (RU)',
      href: `${rssUrl}?languageCode=ru`
    }
  ]
})

</script>

<template>
  <Html :lang="head.htmlAttrs?.lang" :dir="head.htmlAttrs?.dir">
  <Head>
    <Title>{{ pageTitle }}</Title>
    <template v-for="link in head.link" :key="link.key">
      <Link :id="link.key" :rel="link.rel" :href="link.href" :hreflang="link.hreflang" />
    </template>
    <template v-for="meta in head.meta" :key="meta.key">
      <Meta :id="meta.key" :property="meta.property" :content="meta.content" />
    </template>
  </Head>
  <Body>
    <slot />
  </Body>
  </Html>
</template>