<script setup lang="ts">

import DocsView, {type Article} from "~/components/docs/DocsView.vue";
import {computed, ref} from "vue";

const articles = ref<ItemListItem[]>([])
const { getItems } = useBlogApi()

const { locale } = useI18n();

definePageMeta({
  layout: 'blog',
})

const path = ["blog", "articles"];

const loadPage = async () => {
  const result = await getItems(locale.value, path, ["article"], undefined, 0, 16);
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
const title = computed(() => t('all'))
const description = computed(() => t('seoDescription'))
const sub = computed(() => t('sub'))

useSeoMeta({
  title: title.value,
  ogTitle: title.value,
  description: description.value,
  ogDescription: description.value,
  ogType: "website",
})

</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "In-depth technical articles on C# and .NET — building web scrapers with PuppeteerSharp, integrating Ollama for local AI inference, real estate ranking systems, and more.",
    "all": "Technical Articles — C# .NET Architecture & AI Integration",
    "sub": "Architecture decisions, implementation deep-dives, and honest accounts of what went wrong. Written by engineers who shipped the code."
  },
  "ru": {
    "all": "Технические статьи — архитектура C# .NET и интеграция ИИ",
    "seoDescription": "Глубокие технические статьи о C# и .NET — парсинг сайтов через PuppeteerSharp, интеграция Ollama для локального ИИ-инференса, системы ранжирования недвижимости и не только.",
    "sub": "Архитектурные решения, разборы реализаций и честные истории о том, что пошло не так. Написано инженерами, которые сами создавали этот код."
  }
}
</i18n>

<template>
  <DocsView
    v-if="articles"
    :title="title"
    :subTitle="sub"
    :articles="computedArticles"/>
</template>

<style scoped>
</style>