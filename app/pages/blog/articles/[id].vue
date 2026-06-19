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

useSeoMeta({
  title: () => article.title,
  ogTitle: () => article.title,
  description: () => article.description,
  ogType: "article",
  ogImageUrl: getBlogOgImageUrl(),
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: locale.value,
  ogImageType: "image/png",
  twitterCard: "summary_large_image"
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