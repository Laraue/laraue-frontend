<script setup lang="ts">

import DocsView, {type Article} from "~/components/docs/DocsView.vue";
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
const { getProjects } = useBlogContent();

const page = computed(() => Math.max(1, Number(route.query.page) || 1));

const { data: result } = await useAsyncData(
  () => `blog-projects-${locale.value}-${page.value}`,
  () => getProjects(locale.value, page.value - 1, PER_PAGE),
  { watch: [locale, page] },
)

const projects = computed(() => result.value?.data ?? [])
const hasNextPage = computed(() => result.value?.hasNextPage ?? false)
const hasPreviousPage = computed(() => result.value?.hasPreviousPage ?? false)

const goToPage = (newPage: number) => {
  router.push({ query: { ...route.query, page: newPage === 1 ? undefined : String(newPage) } })
}

const computedItems = computed<Article[]>(() => (projects.value ?? [])
    .map((project) => {
      return {
        fileName: project.fileName,
        description: project.description,
        tags: project.tags ?? undefined,
        title: project.title,
        contentLength: project.length,
        path: project.path,
        contentType: project.contentType
      }
    }))

const { t } = useI18n()
const { getSection } = useBlogContent()
const { data: section } = await useAsyncData(
  () => `blog-section-projects-${locale.value}`,
  () => getSection(locale.value, 'projects'),
  { watch: [locale] },
)
const title = computed(() => section.value?.seoTitle)
const description = computed(() => section.value?.seoDescription)
const sub = computed(() => section.value?.subTitle)
const { getBlogOgImageUrl } = usePathUtil()
const imageUrl = getBlogOgImageUrl()

useSeoMeta({
  title: title,
  ogTitle: title,
  description: description,
  ogDescription: description,
  ogType: "website",
  ogImage: imageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: "image/png",
  ogLocale: locale,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterImage: imageUrl,
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
    "bc_home": "Home",
    "bc_blog": "Blog",
    "bc_projects": "Projects"
  },
  "ru": {
    "bc_home": "Главная",
    "bc_blog": "Блог",
    "bc_projects": "Проекты"
  }
}
</i18n>

<template>
  <docs-view
    v-if="projects"
    :title="title"
    :subTitle="sub"
    :articles="computedItems"
    :page="page"
    :has-next-page="hasNextPage"
    :has-previous-page="hasPreviousPage"
    @update:page="goToPage"/>
</template>

<style scoped>
</style>