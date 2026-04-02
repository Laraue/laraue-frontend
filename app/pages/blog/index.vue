<script setup lang="ts">

import DocsView, {type Article} from "../../components/docs/DocsView.vue";
import {computed, ref} from "vue";
import {useBlogApi} from "~/composables/blogApi";

definePageMeta({
  layout: 'blog',
})

const items = ref<DocumentationItem[]>([])
const { locale } = useI18n();

const { loadDocumentationItemsList } = useBlogApi();
const loadPage = async () => {
  const data = await loadDocumentationItemsList(
      locale.value,
      0,
      16,
      null,
      null,
      null)
  items.value = data.data
}

const { t } = useI18n()

await loadPage();
const computedItems = computed<Article[]>(() => items.value
  .map((article) => {
    return {
      fileName: article.fileName,
      path: article.path,
      description: article.description,
      tags: [article.contentType],
      title: article.title,
      contentLength: article.length,
      contentType: article.contentType,
    }
  }))

useSeoMeta({
  title: t('all'),
  ogTitle: t('all'),
  description: t('seoDescription'),
})

</script>

<i18n lang="json">
{
  "en": {
    "all": "All content",
    "byTag": "with tag",
    "ofType": "with type",
    "seoDescription": "All blog posts of the Blog. Use the filters by tags or projects to find exact you need."
  },
  "ru": {
    "all": "Весь контент",
    "byTag": "c тегом",
    "ofType": "с типом",
    "seoDescription": "Все публикации блога. Используйте фильтры по тегами или проектам, чтобы найти что-то конкретное."
  }
}
</i18n>

<template>
  <DocsView
    v-if="items"
    :articles="computedItems"/>
</template>

<style scoped>
</style>