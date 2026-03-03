<script setup lang="ts">

import ArticlesList, {type Article} from "~/components/docs/ArticlesList.vue";
import {computed, type Ref, ref} from "vue";
import LFiltersSection from "~/components/docs/LFiltersSection.vue";
import LSelectProjectType from "~/components/docs/LSelectProjectType.vue";

const articles = ref<ArticleListRow[]>([])
import { useBlogApi } from "~/composables/blogApi";

const { loadArticlesList } = useBlogApi();
const { locale } = useI18n();

definePageMeta({
  layout: 'blog',
})

const selectedProject = ref("")

const loadPage = async () => {
  articles.value = await loadArticlesList(locale.value, 0, 8, selectedProject.value, undefined);
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

const { t } = useI18n()
const title = computed(() => {
  let result = t('all');
  if (selectedProject.value)
    result += " " + t('ofProject') + " '" + selectedProject.value + "'"

  return result
})

useSeoMeta({
  title: title.value,
  ogTitle: title.value,
  description: computed(() => t('seoDescription'))
})

</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "The whole articles list in the Blog. Use the filters to find only you interested in.",
    "all": "All articles",
    "ofProject": "related to project"
  },
  "ru": {
    "all": "Все статьи",
    "ofProject": "с проектом",
    "seoDescription": "Весь список статей в блоге. Испольуйте фильтры, чтобы найти интересующие материалы."
  }
}
</i18n>

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