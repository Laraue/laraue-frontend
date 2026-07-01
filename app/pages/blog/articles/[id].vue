<script setup lang="ts">

import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";
import {defineArticle} from "@unhead/schema-org";
import {useSchemaOrg} from "@unhead/schema-org/vue";

definePageMeta({
  layout: 'blog',
})

const { getRouteSegments, getBlogOgImageUrl } = usePathUtil();

const { locale } = useI18n()
const { getItemDetails } = useBlogApi();
const routeSegments = getRouteSegments();
const article = await getItemDetails(locale.value, routeSegments);
const imageUrl = getBlogOgImageUrl();

useSeoMeta({
  title: article.title,
  ogTitle: article.title,
  description: article.description,
  ogType: "article",
  ogImageUrl: imageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: locale.value,
  ogImageType: "image/png",
  twitterCard: "summary_large_image",
  twitterTitle: article.title,
  twitterImage: imageUrl,
  robots: 'index, follow, max-image-preview:large',
})

useSchemaOrg([
  defineArticle({
    title: article.title,
    description: article.description,
    dateModified: article.updatedAt,
    datePublished: article.createdAt,
    inLanguage: locale.value,
    keywords: article.tags,
  })])
</script>

<template>
  <article>
    <DocView
      :item="article">
      </DocView>
  </article>
</template>

<style scoped>

</style>