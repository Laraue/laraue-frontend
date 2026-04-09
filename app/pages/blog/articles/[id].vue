<script setup lang="ts">

import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";
import {defineArticle} from "@unhead/schema-org";
import {useSchemaOrg} from "@unhead/schema-org/vue";

definePageMeta({
  layout: 'blog',
})

const { getRouteSegments } = usePathUtil();

const { locale } = useI18n()
const { getItemDetails } = useBlogApi();
const article = await getItemDetails(locale.value, getRouteSegments());

useSeoMeta({
  title: () => article.title,
  ogTitle: () => article.title,
  description: () => article.description
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