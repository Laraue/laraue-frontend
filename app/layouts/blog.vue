<script setup lang="ts">
import {useBlogContent} from "~/composables/blogContent";
import LMainContent from "~/components/ui/LMainContent.vue";
import {useBlogState} from "~/composables/blogState";
import type {LinksSection} from "~/components/ui/LSidebar.vue";

const { getCategories } = useBlogContent();
const { locale, t } = useI18n()
const { setCategories, blogState } = useBlogState()

const { data: categories } = await useAsyncData(
  () => `blog-categories-${locale.value}`,
  () => getCategories(locale.value),
  { watch: [locale] },
)

watchEffect(() => {
  setCategories(categories.value ?? []);
})

const linksSections = computed<LinksSection[]>(() => {
  return [
    { title: t("categories"), links: blogState.value.otherItems },
  ]
})

</script>

<i18n lang="json">
{
  "en": {
    "categories": "Categories"
  },
  "ru": {
    "categories": "Категории"
  }
}
</i18n>

<template>
  <NuxtLayout name="default">
    <LMainContent :linksSections="linksSections">
      <slot></slot>
      <template #sidebar>
        <slot name="sidebar"></slot>
      </template>
    </LMainContent>
  </NuxtLayout>
</template>

<style scoped>
</style>