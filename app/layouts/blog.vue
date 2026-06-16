<script setup lang="ts">
import {onMounted} from "vue";
import {useBlogApi} from "~/composables/blogApi";
import LMainContent from "~/components/ui/LMainContent.vue";
import {useBlogState} from "~/composables/blogState";
import type {LinksSection} from "~/components/ui/LSidebar.vue";

const { getCategories, getDocs } = useBlogApi();
const { locale, t } = useI18n()
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
    { title: t("categories"), links: blogState.value.otherItems },
    { title: t("documentation"), links: blogState.value.documentationItems },
  ]
})

</script>

<i18n lang="json">
{
  "en": {
    "categories": "Categories",
    "documentation": "Documentation"
  },
  "ru": {
    "categories": "Категории",
    "documentation": "Документация"
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