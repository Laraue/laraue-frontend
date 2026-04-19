<script setup lang="ts">
import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";

const { getItemDetails } = useBlogApi();
const { locale } = useI18n();
const { getRouteSegments } = usePathUtil();

const documentation = await getItemDetails(locale.value, getRouteSegments());
const { t } = useI18n();

useSeoMeta({
  title: () => documentation.title,
  ogTitle: () => documentation.title,
  description: () => t('seoDescription', { title: documentation.title }),
  ogDescription: () => t('seoDescription', { title: documentation.title }),
  ogType: "website",
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
      <DocView :item="documentation">
      </DocView>
    </NuxtLayout>
  </NuxtLayout>
</template>

<style scoped>

</style>