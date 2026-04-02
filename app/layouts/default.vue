<script setup>
// This fetches the SEO metadata object
const head = useLocaleHead()

// You can combine it with other dynamic metadata
const route = useRoute()
const { t } = useI18n()
const pageTitle = computed(() => t(route.meta?.title ?? 'defaultTitle'))
</script>

<template>
  <!-- Apply the attributes and tags manually in your template -->
  <Html :lang="head.htmlAttrs?.lang" :dir="head.htmlAttrs?.dir">
  <Head>
    <Title>{{ pageTitle }}</Title>
    <!-- Loop through the generated links (hreflang, canonical) -->
    <template v-for="link in head.link" :key="link.key">
      <Link :id="link.key" :rel="link.rel" :href="link.href" :hreflang="link.hreflang" />
    </template>
    <!-- Loop through the generated meta tags (OpenGraph) -->
    <template v-for="meta in head.meta" :key="meta.key">
      <Meta :id="meta.key" :property="meta.property" :content="meta.content" />
    </template>
  </Head>
  <Body>
    <slot />
  </Body>
  </Html>
</template>