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

useSeoMeta({
  title: title,
  ogTitle: title,
  description: description,
})
</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "Project portfolio featuring custom C# crawlers, Telegram bot frameworks, PDF query languages, and AI-powered real estate analytics.",
    "projects": "Projects"
  },
  "ru": {
    "projects": "Проекты",
    "seoDescription": "Реализованные проекты, среди которых - бибилотека для краулинга, фреймворк для телеграмма, язык запросов к PDF и многое другое."
  }
}
</i18n>

<template>
  <docs-view
      v-if="projects"
      :title=title
      :subTitle=description
      :articles="computedItems"/>
</template>

<style scoped>
</style>