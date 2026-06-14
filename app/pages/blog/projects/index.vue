<script setup lang="ts">

import DocsView, {type Article} from "~/components/docs/DocsView.vue";
import {computed, ref} from "vue";
import {useBlogApi} from "~/composables/blogApi";

definePageMeta({
  layout: 'blog',
})

const { locale } = useI18n();
const path = ["blog", "projects"];
const { getItems } = useBlogApi();

const projects = ref<ItemListItem[]>([]);
const loadPage = async () => {
  const result = await getItems(locale.value, path, ["project"], undefined, 0, 8);
  projects.value = result.data
}
await loadPage();

const computedItems = computed<Article[]>(() => (projects.value ?? [])
    .map((project) => {
      return {
        fileName: project.fileName,
        description: project.description,
        tags: project.tags,
        title: project.title,
        contentLength: project.length,
        path: project.path,
        contentType: project.contentType
      }
    }))

const { t } = useI18n()
const title = computed(() => t('projects'))
const description = computed(() => t('seoDescription'))
const sub = computed(() => t('sub'))

useSeoMeta({
  title: title,
  ogTitle: title,
  description: description,
  ogDescription: description,
  ogType: "website",
})
</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "Open source C# and .NET projects — EF Core trigger library, Markdown CMS backend, Telegram bot framework, web scraping library, PdfQL interpreter, and AI apartment search.",
    "projects": "Open Source .NET Projects — Libraries, Bots & AI Tools",
    "sub": "Libraries we built because the existing options weren't good enough. All open source, all actively maintained."
  },
  "ru": {
    "projects": "Open Source .NET проекты — библиотеки, боты и ИИ",
    "seoDescription": "Open source проекты на C# и .NET — библиотека триггеров EF Core, CMS-бэкенд для Markdown, Telegram-боты, библиотека парсинга, интерпретатор PdfQL и ИИ-поиск квартир.",
    "sub": "Libraries we built because the existing options weren't good enough. All open source, all actively maintained."
  }
}
</i18n>

<template>
  <docs-view
    v-if="projects"
    :title=title
    :subTitle=sub
    :articles="computedItems"/>
</template>

<style scoped>
</style>