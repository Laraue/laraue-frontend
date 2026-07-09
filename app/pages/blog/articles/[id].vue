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
const { author } = useConstants()

useSeoMeta({
  title: article.title,
  ogTitle: article.title,
  description: article.description,
  ogType: "article",
  ogImage: imageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: "image/png",
  ogLocale: locale.value,
  twitterCard: "summary_large_image",
  twitterTitle: article.title,
  twitterImage: imageUrl,
  robots: 'index, follow, max-image-preview:large',
})

useSchemaOrg([
  defineArticle({
    headline: article.title,
    description: article.description,
    image: imageUrl,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    inLanguage: locale.value,
    keywords: article.tags,
    author: author
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