<script setup lang="ts">

import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";

definePageMeta({
  layout: 'blog',
})

const route = useRoute();
const { getRouteSegments } = usePathUtil();
const routeSegments = computed(() => {
  return getRouteSegments(route.path)
})

const { locale } = useI18n()
const { getItemDetails } = useBlogApi();
const article = await getItemDetails(locale.value, routeSegments.value);

useSeoMeta({
  title: () => article.title,
  ogTitle: () => article.title,
  description: () => article.description
})
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