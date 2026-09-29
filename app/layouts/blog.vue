<script setup lang="ts">
import {onMounted} from "vue";
import {useBlogApi} from "~/composables/blogApi";
import LMainContent from "~/components/ui/LMainContent.vue";
import {useBlogState} from "~/composables/blogState";
import type {LinksSection} from "~/components/ui/LSidebar.vue";

const { getCategories } = useBlogApi();
const { locale, t } = useI18n()
const { setCategories, blogState } = useBlogState()

watch(locale, () => {
  loadData();
})

onMounted(() => {
  loadData();
})

const loadData = async () => {
  const categories = await getCategories(locale.value);
  setCategories(categories);
}

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