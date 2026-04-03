<script setup lang="ts">
import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";

const { getRouteSegments } = usePathUtil();
const { getItemDetails } = useBlogApi();
const { locale } = useI18n();

const project = await getItemDetails(locale.value, getRouteSegments());
definePageMeta({
  layout: 'blog',
})

useSeoMeta({
  title: () => project.title,
  ogTitle: () => project.title,
  description: () => project.description
})

</script>

<template>
  <DocView :item="project">
  </DocView>
</template>

<style scoped>
</style>