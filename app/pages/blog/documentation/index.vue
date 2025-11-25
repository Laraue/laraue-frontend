<script setup lang="ts">

import ArticlesList, {type Article} from "~/components/docs/ArticlesList.vue";
import {computed, type Ref, ref} from "vue";
import LFiltersSection from "~/components/docs/LFiltersSection.vue";
import LSelectProjectType from "~/components/docs/LSelectProjectType.vue";
import {useBlogApi} from "~/composables/blogApi";

const items = ref<DocumentationItem[]>([])
const selectedProject = ref("")

definePageMeta({
  layout: 'blog',
})

const { loadDocumentationItemsList } = useBlogApi()
const loadPage = async () => {
  const data = await loadDocumentationItemsList(
      0,
      16,
      selectedProject.value,
      null,
      "documentation")
  items.value = data.data;
}

await loadPage();
const resetSelects = () => {
  selectedProject.value = "";
}

const updateSelectValue = (valueRef: Ref<string, string>, value: string) => {
  resetSelects();
  valueRef.value = value;
  return loadPage();
}

const changeSelectedProject = (value: string) => updateSelectValue(selectedProject, value)

const computedItems = computed<Article[]>(() => items.value
  .map((article) => {
    return {
      fileName: article.fileName,
      description: article.description,
      tags: [article.contentType],
      title: article.title,
      contentLength: article.length,
      path: article.path,
    }
  }))

if (import.meta.server) {
  useSeoMeta({
    title: 'Laraue Documentation section',
    description: 'All documentation of the Laraue organization',
  })
}

</script>

<template>
  <l-filters-section>
    <l-select-project-type
      @update:modelValue="changeSelectedProject"
      :value="selectedProject"
    ></l-select-project-type>
  </l-filters-section>

  <articles-list
    v-if="items"
    title="All Documentation Items"
    :articles="computedItems"/>
</template>

<style scoped>
</style>