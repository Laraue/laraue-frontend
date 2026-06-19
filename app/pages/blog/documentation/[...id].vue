<script setup lang="ts">
import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";
import DocsMobileToc from "~/components/docs/DocsMobileToc.vue";

const { getItemDetails } = useBlogApi();
const { locale } = useI18n();
const { getRouteSegments, getBlogOgImageUrl } = usePathUtil();
const { loadMenu, getItemMeta } = useBlogApi()
const route = useRoute();
const segments = route.params.id as string[]
const rootPath = ["blog", "documentation", segments[0]!]
const menuItems = await loadMenu(locale.value, rootPath);
const item = await getItemMeta(locale.value, rootPath);

const documentation = await getItemDetails(locale.value, getRouteSegments());
const { t } = useI18n();


useSeoMeta({
  title: documentation.title,
  ogTitle: documentation.title,
  description: documentation.description ?? t('seoDescription', { title: documentation.title }),
  ogDescription: documentation.description ?? t('seoDescription', { title: documentation.title }),
  ogType: "website",
  ogImageUrl: getBlogOgImageUrl(),
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: locale.value,
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
    <DocsMobileToc :rootPath="rootPath" :menuItems="menuItems" />
    <DocView :item="documentation" />
    <template #sidebar>
      <DocsSidebar :rootPath="rootPath" :menuItems="menuItems" :title="item.title" :icon="item.icon" />
    </template>
  </NuxtLayout>
</template>

<style scoped>

</style>