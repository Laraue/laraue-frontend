<script setup lang="ts">

import DocsView, {type Article} from "../../components/docs/DocsView.vue";
import {computed, ref} from "vue";
import {useBlogApi} from "~/composables/blogApi";

definePageMeta({
  layout: 'blog',
})

const items = ref<ItemListItem[]>([])
const { locale } = useI18n();
const route = useRoute();

const path = ["blog"]
const { getItems } = useBlogApi();
const loadPage = async () => {
  const data = await getItems(locale.value, path, ["article", "project"], route.query.tag as string, 0, 20)
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
      tags: article.tags ?? article.projects ?? [],
      title: article.title,
      contentLength: article.length,
      contentType: article.contentType,
    }
  }))

const title = computed(() => t('all'))
const description = computed(() => t('seoDescription'))

useSeoMeta({
  title: title,
  ogTitle: title,
  ogDescription: description,
  description: description,
  ogType: "website",
})

watch(() => route.query.tag, async () => {
  await loadPage();
})

</script>

<i18n lang="json">
{
  "en": {
    "all": "Blog",
    "seoDescription": "Articles, project write-ups and technical documentation. C#, .NET, AI, Telegram and open source."
  },
  "ru": {
    "all": "Блог",
    "seoDescription": "Статьи, описание проектов и техническая документация. C#, .NET, AI, Telegram и open source разработка."
  }
}
</i18n>

<template>
  <DocsView
    v-if="items"
    :title="title"
    :subTitle="description"
    :articles="computedItems"/>
</template>

<style scoped>
</style>