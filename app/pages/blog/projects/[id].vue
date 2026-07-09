<script setup lang="ts">
import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";
import {useSchemaOrg} from "@unhead/schema-org/vue";
import {defineArticle} from "@unhead/schema-org";

const { getRouteSegments, getBlogOgImageUrl } = usePathUtil();
const { getItemDetails } = useBlogApi();
const { locale } = useI18n();

const project = await getItemDetails(locale.value, getRouteSegments());
definePageMeta({
  layout: 'blog',
})

const imageUrl = getBlogOgImageUrl();
const { author } = useConstants()

useSeoMeta({
  title: project.title,
  ogTitle: project.title,
  description: project.description,
  ogType: "article",
  ogImage: imageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: locale.value,
  ogImageType: "image/png",
  twitterCard: "summary_large_image",
  twitterTitle: project.title,
  twitterImage: imageUrl,
  robots: 'index, follow, max-image-preview:large',
})

useSchemaOrg([
  defineArticle({
    headline: project.title,
    description: project.description,
    image: imageUrl,
    dateModified: project.updatedAt,
    datePublished: project.createdAt,
    inLanguage: locale.value,
    keywords: project.tags,
    author: author
  })])

</script>

<template>
  <DocView :item="project">
  </DocView>
</template>

<style scoped>
</style>