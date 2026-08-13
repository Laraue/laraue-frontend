<script setup lang="ts">

import DocsView, {type Article} from "~/components/docs/DocsView.vue";
import {computed, ref, watch} from "vue";
import {useBlogApi} from "~/composables/blogApi";
import {defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";

definePageMeta({
  layout: 'blog',
})

const PER_PAGE = 16;

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const path = ["blog", "projects"];
const { getItems } = useBlogApi();

const page = computed(() => Math.max(1, Number(route.query.page) || 1));

const projects = ref<ItemListItem[]>([]);
const hasNextPage = ref(false)
const hasPreviousPage = ref(false)
const loadPage = async () => {
  const result = await getItems(locale.value, path, ["project"], undefined, page.value - 1, PER_PAGE);
  projects.value = result.data
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

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_blog'), item: localePath('/blog') },
      { name: t('bc_projects') },
    ]
  }),
])
</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "Open source C# and .NET projects — EF Core trigger library, Markdown CMS backend, Telegram bot framework, web scraping library, PdfQL interpreter, and AI apartment search.",
    "projects": "Open Source .NET Projects — Libraries, Bots & AI Tools",
    "sub": "Libraries we built because the existing options weren't good enough. All open source, all actively maintained.",
    "bc_home": "Home",
    "bc_blog": "Blog",
    "bc_projects": "Projects"
  },
  "ru": {
    "projects": "Open Source .NET проекты — библиотеки, боты и ИИ",
    "seoDescription": "Open source проекты на C# и .NET — библиотека триггеров EF Core, CMS-бэкенд для Markdown, Telegram-боты, библиотека парсинга, интерпретатор PdfQL и ИИ-поиск квартир.",
    "sub": "Libraries we built because the existing options weren't good enough. All open source, all actively maintained.",
    "bc_home": "Главная",
    "bc_blog": "Блог",
    "bc_projects": "Проекты"
  }
}
</i18n>

<template>
  <docs-view
    v-if="projects"
    :title=title
    :subTitle=sub
    :articles="computedItems"
    :page="page"
    :has-next-page="hasNextPage"
    :has-previous-page="hasPreviousPage"
    @update:page="goToPage"/>
</template>

<style scoped>
</style>