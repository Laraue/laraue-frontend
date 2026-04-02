<script setup lang="ts">
import {onMounted} from "vue";
import {useBlogApi} from "~/composables/blogApi";
import LMainContent from "~/components/ui/LMainContent.vue";
import {useBlogState} from "~/composables/blogState";
import type {LinksSection} from "~/components/ui/LSidebar.vue";

const { getCategories, getDocs } = useBlogApi();
const { locale } = useI18n()
const { setCategories, blogState, setDocumentationItems } = useBlogState()

watch(locale, () => {
  loadData();
})

onMounted(() => {
  loadData();
})

const loadData = async () => {
  const categories = await getCategories(locale.value);
  setCategories(categories);

  const docs = await getDocs(locale.value);
  setDocumentationItems(docs);
}

const linksSections = computed<LinksSection[]>(() => {
  return [
    { title: "Categories", links: blogState.value.otherItems },
    { title: "Documentation", links: blogState.value.documentationItems },
  ]
})

</script>

<i18n lang="json">
{
  "en": {
    "projects": "Projects",
    "articles": "Articles",
    "documentation": "Documentation",
    "allTags": "All Tags"
  },
  "ru": {
    "projects": "Проекты",
    "articles": "Статьи",
    "documentation": "Документация",
    "allTags": "Все теги"
  }
}
</i18n>

<template>
  <LMainContent :linksSections="linksSections">
     <slot />
  </LMainContent>
</template>

<style scoped>
</style>