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
      :content="article?.content"
      :created-at="article?.createdAt"
      :updated-at="article?.updatedAt"
      :inner-links="article?.innerLinks"
      :title="article?.title">
      </DocView>
  </article>
</template>

<style scoped>

.related-projects h3, .tags h3 {
  margin-bottom: 10px;
}

.project-list{
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.project-item {
  background-color: #e9f7fe;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85em;
}

@media screen and (max-width: 1024px) {
  .related-projects {
    text-align: center;
  }
  .project-list{
    justify-content: center;
  }
}

</style>