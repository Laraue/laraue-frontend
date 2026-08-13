<script setup lang="ts">

import DocsView, {type Article} from "~/components/docs/DocsView.vue";
import {computed, ref, watch} from "vue";
import {defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";

const PER_PAGE = 16;

const articles = ref<ItemListItem[]>([])
const hasNextPage = ref(false)
const hasPreviousPage = ref(false)
const { getItems } = useBlogApi()

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();

definePageMeta({
  layout: 'blog',
})

const path = ["blog", "articles"];

const page = computed(() => Math.max(1, Number(route.query.page) || 1));

const loadPage = async () => {
  const result = await getItems(locale.value, path, ["article"], undefined, page.value - 1, PER_PAGE);
  articles.value = result.data
  hasNextPage.value = result.hasNextPage
  hasPreviousPage.value = result.hasPreviousPage
}

const goToPage = (newPage: number) => {
  router.push({ query: { ...route.query, page: newPage === 1 ? undefined : String(newPage) } })
}

watch(page, async () => {
  await loadPage();
})

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

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: '/' },
      { name: t('bc_blog'), item: '/blog' },
      { name: t('bc_articles') },
    ]
  }),
])

</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "In-depth technical articles on C# and .NET — building web scrapers with PuppeteerSharp, integrating Ollama for local AI inference, real estate ranking systems, and more.",
    "all": "Technical Articles — C# .NET Architecture & AI Integration",
    "sub": "Architecture decisions, implementation deep-dives, and honest accounts of what went wrong. Written by engineers who shipped the code.",
    "bc_home": "Home",
    "bc_blog": "Blog",
    "bc_articles": "Articles"
  },
  "ru": {
    "all": "Технические статьи — архитектура C# .NET и интеграция ИИ",
    "seoDescription": "Глубокие технические статьи о C# и .NET — парсинг сайтов через PuppeteerSharp, интеграция Ollama для локального ИИ-инференса, системы ранжирования недвижимости и не только.",
    "sub": "Архитектурные решения, разборы реализаций и честные истории о том, что пошло не так. Написано инженерами, которые сами создавали этот код.",
    "bc_home": "Главная",
    "bc_blog": "Блог",
    "bc_articles": "Статьи"
  }
}
</i18n>

<template>
  <DocsView
    v-if="articles"
    :title="title"
    :subTitle="sub"
    :articles="computedArticles"
    :page="page"
    :has-next-page="hasNextPage"
    :has-previous-page="hasPreviousPage"
    @update:page="goToPage"/>
</template>

<style scoped>
</style>