<script setup lang="ts">

import DocsView, {type Article} from "../../components/docs/DocsView.vue";
import {computed, ref, watch} from "vue";
import {useBlogApi} from "~/composables/blogApi";
import {defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";

definePageMeta({
  layout: 'blog',
})

const PER_PAGE = 16;

const items = ref<ItemListItem[]>([])
const hasNextPage = ref(false)
const hasPreviousPage = ref(false)
const { locale } = useI18n();
const route = useRoute();
const router = useRouter();

const path = ["blog"]
const { getItems } = useBlogApi();

const page = computed(() => Math.max(1, Number(route.query.page) || 1));

const loadPage = async () => {
  const data = await getItems(locale.value, path, ["article", "project"], route.query.tag as string, page.value - 1, PER_PAGE)
  items.value = data.data
  hasNextPage.value = data.hasNextPage
  hasPreviousPage.value = data.hasPreviousPage
}

const goToPage = (newPage: number) => {
  router.push({ query: { ...route.query, page: newPage === 1 ? undefined : String(newPage) } })
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

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: '/' },
      { name: t('bc_blog') },
    ]
  }),
])

watch(() => route.query.tag, async () => {
  if (route.query.page) {
    await router.replace({ query: { ...route.query, page: undefined } })
    return
  }
  await loadPage();
})

watch(page, async () => {
  await loadPage();
})

</script>

<i18n lang="json">
{
  "en": {
    "all": "Laraue Software Blog — C# .NET Development & Open Source",
    "seoDescription": "Technical articles and open source project writeups from Laraue Software — covering C#, .NET, EF Core, web scraping, Telegram bots, local AI with Ollama, and more.",
    "sub": "Real code, real decisions, real tradeoffs. We write about what we build — .NET libraries, Telegram bots, AI integrations, and the architecture mistakes worth learning from.",
    "bc_home": "Home",
    "bc_blog": "Blog"
  },
  "ru": {
    "all": "Блог Laraue Software — C# .NET open source разработка",
    "seoDescription": "Технические статьи и описания open source проектов от Laraue Software — C#, .NET, EF Core, парсинг сайтов, Telegram-боты, локальный ИИ с Ollama и многое другое.",
    "sub": "Реальный код, реальные решения, реальные компромиссы. Пишем о том, что строим — .NET библиотеки, Telegram-боты, интеграции с ИИ и архитектурные ошибки, на которых можно учиться.",
    "bc_home": "Главная",
    "bc_blog": "Блог"
  }
}
</i18n>

<template>
  <DocsView
    v-if="items"
    :title="title"
    :subTitle="subText"
    :articles="computedItems"
    :page="page"
    :has-next-page="hasNextPage"
    :has-previous-page="hasPreviousPage"
    @update:page="goToPage"/>
</template>

<style scoped>
</style>