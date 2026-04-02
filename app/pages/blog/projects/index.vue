<script setup lang="ts">

import DocsView, {type Article} from "~/components/docs/DocsView.vue";
import {computed, ref} from "vue";
import {useBlogApi} from "~/composables/blogApi";

definePageMeta({
  layout: 'blog',
})

const { locale } = useI18n();
const selectedTag = ref("")
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
const title = computed(() => {
  let result = t('projects')
  if (selectedTag.value)
    result += " " + t('byTag') + " '" + selectedTag.value + "'"

  return result
})

useSeoMeta({
  title: title,
  ogTitle: title,
  description: 'All projects of the Laraue organization',
})
</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "The whole projects list in the Blog. Use the filters to find only you interested in.",
    "projects": "Projects",
    "byTag": "with tag"
  },
  "ru": {
    "projects": "Проекты",
    "byTag": "c тегом",
    "seoDescription": "Все описания проектов, доступные в блоге. Испольуйте фильтры, чтобы найти только интересующие элементы."
  }
}
</i18n>

<template>
  <docs-view
      v-if="projects"
      :title=title
      :articles="computedItems"/>
</template>

<style scoped>
</style>