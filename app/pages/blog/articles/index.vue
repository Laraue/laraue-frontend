<script setup lang="ts">

import DocsView, {type Article} from "~/components/docs/DocsView.vue";
import {computed, ref} from "vue";

const articles = ref<ItemListItem[]>([])
const { getItems, getTags } = useBlogApi()

const { locale } = useI18n();

definePageMeta({
  layout: 'blog',
})

const path = ["blog", "articles"];
const selectedProject = ref("")

const loadPage = async () => {
  const result = await getItems(locale.value, path, ["article"], undefined, 0, 8);
  articles.value = result.data
}
await loadPage();

const computedArticles = computed<Article[]>(() => articles.value
    .map((article) => {
      return {
        fileName: article.fileName,
        description: article.description,
        tags: article.projects,
        title: article.title,
        contentLength: article.length,
        path: article.path,
        contentType: article.contentType
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
  <DocsView
    v-if="articles"
    :title="title"
    :articles="computedArticles"/>
</template>

<style scoped>
</style>