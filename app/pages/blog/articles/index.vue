<script setup lang="ts">

import DocsView, {type Article} from "~/components/docs/DocsView.vue";
import {computed, ref, watch} from "vue";
import {defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";

const PER_PAGE = 16;

const { getArticles } = useBlogContent()

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();

definePageMeta({
  layout: 'blog',
})

const page = computed(() => Math.max(1, Number(route.query.page) || 1));

const { data: result } = await useAsyncData(
  () => `blog-articles-${locale.value}-${page.value}`,
  () => getArticles(locale.value, undefined, page.value - 1, PER_PAGE),
  { watch: [locale, page] },
)

const articles = computed(() => result.value?.data ?? [])
const hasNextPage = computed(() => result.value?.hasNextPage ?? false)
const hasPreviousPage = computed(() => result.value?.hasPreviousPage ?? false)

const goToPage = (newPage: number) => {
  router.push({ query: { ...route.query, page: newPage === 1 ? undefined : String(newPage) } })
}

const computedArticles = computed<Article[]>(() => articles.value
    .map((article) => {
      return {
        fileName: article.fileName,
        description: article.description,
        tags: article.projects ?? undefined,
        title: article.title,
        contentLength: article.length,
        path: article.path,
        contentType: article.contentType
      }
    }))

const { t } = useI18n()
const { getSection } = useBlogContent()
const { data: section } = await useAsyncData(
  () => `blog-section-articles-${locale.value}`,
  () => getSection(locale.value, 'articles'),
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
      { name: t('bc_articles') },
    ]
  }),
])

</script>

<i18n lang="json">
{
  "en": {
    "bc_home": "Home",
    "bc_blog": "Blog",
    "bc_articles": "Articles"
  },
  "ru": {
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