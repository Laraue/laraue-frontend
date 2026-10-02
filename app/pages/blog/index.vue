<script setup lang="ts">

import DocsView, {type Article} from "../../components/docs/DocsView.vue";
import {computed, ref, watch} from "vue";
import {useBlogContent} from "~/composables/blogContent";
import {defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";

definePageMeta({
  layout: 'blog',
})

const PER_PAGE = 16;

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();

const { getFeed } = useBlogContent();

const page = computed(() => Math.max(1, Number(route.query.page) || 1));

const tag = computed(() => typeof route.query.tag === 'string' ? route.query.tag : undefined);

const { data: feed } = await useAsyncData(
  () => `blog-feed-${locale.value}-${tag.value ?? ''}-${page.value}`,
  () => getFeed(locale.value, tag.value, page.value - 1, PER_PAGE),
  { watch: [locale, tag, page] },
)

const items = computed(() => feed.value?.data ?? [])
const hasNextPage = computed(() => feed.value?.hasNextPage ?? false)
const hasPreviousPage = computed(() => feed.value?.hasPreviousPage ?? false)

const goToPage = (newPage: number) => {
  router.push({ query: { ...route.query, page: newPage === 1 ? undefined : String(newPage) } })
}

const { t } = useI18n()

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
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_blog') },
    ]
  }),
])

// A new filter starts from the first page.
watch(tag, async () => {
  if (route.query.page) {
    await router.replace({ query: { ...route.query, page: undefined } })
  }
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