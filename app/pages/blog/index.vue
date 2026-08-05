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
  const data = await getItems(locale.value, path, ["article", "project"], route.query.tag as string, 0, 24)
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
const subText = computed(() => t('sub'))

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
    "all": "Laraue Software Blog — C# .NET Development & Open Source",
    "seoDescription": "Technical articles and open source project writeups from Laraue Software — covering C#, .NET, EF Core, web scraping, Telegram bots, local AI with Ollama, and more.",
    "sub": "Real code, real decisions, real tradeoffs. We write about what we build — .NET libraries, Telegram bots, AI integrations, and the architecture mistakes worth learning from."
  },
  "ru": {
    "all": "Блог Laraue Software — C# .NET open source разработка",
    "seoDescription": "Технические статьи и описания open source проектов от Laraue Software — C#, .NET, EF Core, парсинг сайтов, Telegram-боты, локальный ИИ с Ollama и многое другое.",
    "sub": "Реальный код, реальные решения, реальные компромиссы. Пишем о том, что строим — .NET библиотеки, Telegram-боты, интеграции с ИИ и архитектурные ошибки, на которых можно учиться."
  }
}
</i18n>

<template>
  <DocsView
    v-if="items"
    :title="title"
    :subTitle="subText"
    :articles="computedItems"/>
</template>

<style scoped>
</style>