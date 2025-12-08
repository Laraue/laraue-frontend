<script setup lang="ts">

import ArticlesList, {type Article} from "~/components/docs/ArticlesList.vue";
import {computed, type Ref, ref} from "vue";
import LSelectTag from "~/components/docs/LSelectTag.vue";
import LFiltersSection from "~/components/docs/LFiltersSection.vue";
import {useBlogApi} from "~/composables/blogApi";

definePageMeta({
  layout: 'blog',
})

const selectedTag = ref("")
const { loadProjects } = useBlogApi();
const projects = ref<ProjectListRow[]>([]);
const loadPage = async () => {
  projects.value = await loadProjects(0, 8, selectedTag.value);
}

await loadPage();

const resetSelects = () => {
  selectedTag.value = "";
}

const updateSelectValue = (valueRef: Ref<string, string>, value: string) => {
  resetSelects();
  valueRef.value = value;
  return loadPage();
}

const changeSelectedTag = (value: string) => updateSelectValue(selectedTag, value)

const computedItems = computed<Article[]>(() => (projects.value ?? [])
    .map((project) => {
      return {
        fileName: project.fileName,
        description: project.description,
        tags: project.tags,
        title: project.title,
        contentLength: project.length,
        path: project.path,
      }
    }))

const title = computed(() => {
  let result = "Laraue Projects"
  if (selectedTag.value)
    result += " with tag '" + selectedTag.value + "'"

  return result
})

useSeoMeta({
  title: title,
  description: 'All projects of the Laraue organization',
})
</script>

<template>
  <l-filters-section>
    <l-select-tag
        :from-path="['blog', 'projects']"
        @update:modelValue="changeSelectedTag"
        :value="selectedTag"
    ></l-select-tag>
  </l-filters-section>

  <articles-list
      v-if="projects"
      :title=title
      :articles="computedItems"/>
</template>

<style scoped>
</style>