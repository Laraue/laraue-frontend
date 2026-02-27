<script setup lang="ts">

import ArticlesList, {type Article} from "~/components/docs/ArticlesList.vue";
import {computed, type Ref, ref} from "vue";
import LFiltersSection from "~/components/docs/LFiltersSection.vue";
import LSelectProjectType from "~/components/docs/LSelectProjectType.vue";

const articles = ref<ArticleListRow[]>([])
import { useBlogApi } from "~/composables/blogApi";

const { loadArticlesList } = useBlogApi();

definePageMeta({
  layout: 'blog',
})

const selectedProject = ref("")

const loadPage = async () => {
  articles.value = await loadArticlesList(0, 8, selectedProject.value, undefined);
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

const computedArticles = computed<Article[]>(() => articles.value
    .map((article) => {
      return {
        fileName: article.fileName,
        description: article.description,
        tags: article.projects,
        title: article.title,
        contentLength: article.length,
        path: article.path,
      }
    }))

const title = computed(() => {
  let result = "All content"
  if (selectedProject.value)
    result += " of project '" + selectedProject.value + "'"

  return result
})

useSeoMeta({
  title: title.value,
  description: 'The whole articles list in the Blog. Use the filters to find only you interested in.',
})

</script>

<template>
  <l-filters-section>
    <l-select-project-type
        @update:modelValue="changeSelectedProject"
        :value="selectedProject"
    ></l-select-project-type>
  </l-filters-section>

  <articles-list
      v-if="articles"
      :title="title"
      :articles="computedArticles"/>
</template>

<style scoped>
</style>