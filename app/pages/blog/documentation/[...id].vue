<script setup lang="ts">
import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";

const route = useRoute();
const { getRouteSegments } = usePathUtil();
const routeSegments = computed(() => {
  return getRouteSegments(route.path)
})

const { getItemDetails } = useBlogApi();
const { locale } = useI18n();

const documentation = await getItemDetails(locale.value, routeSegments.value);
const { t } = useI18n();

useSeoMeta({
  title: () => documentation.title,
  ogTitle: () => documentation.title,
  description: () => t('seoDescription', { title: documentation.title }),
})
</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "The full documentation about the element '{title}'"
  },
  "ru": {
    "seoDescription": "Подробная документация по элементу '{title}'"
  }
}
</i18n>

<template>
  <NuxtLayout name="blog">
    <NuxtLayout name="documentation">
      <DocView
          :inner-links="documentation.innerLinks"
          :content="documentation?.content"
          :created-at="documentation?.createdAt"
          :updated-at="documentation?.updatedAt"
          :title="documentation?.title">
      </DocView>
    </NuxtLayout>
  </NuxtLayout>
</template>

<style scoped>

</style>