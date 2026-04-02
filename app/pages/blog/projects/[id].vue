<script setup lang="ts">
import {computed} from "vue";
import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";

const route = useRoute();

const { getRouteSegments } = usePathUtil();
const routeSegments = computed(() => {
  return getRouteSegments(route.path)
})

const { getItemDetails } = useBlogApi();
const { locale } = useI18n();

const project = await getItemDetails(locale.value, routeSegments.value);
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