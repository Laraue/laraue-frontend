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

const { data: feed, error } = await useAsyncData(
  () => `blog-feed-${locale.value}-${tag.value ?? ''}-${page.value}`,
  () => getFeed(locale.value, tag.value, page.value - 1, PER_PAGE),
  { watch: [locale, tag, page] },
)

if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 500, statusMessage: error.value.statusMessage, fatal: true })
}

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

const { getSection } = useBlogContent()
const { data: section } = await useAsyncData(
  () => `blog-section-blog-${locale.value}`,
  () => getSection(locale.value, 'blog'),
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

const { itemList } = useBlogSeo()
useListIndexing(page, tag)

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_blog') },
    ]
  }),
  itemList(computedItems.value, page.value, PER_PAGE),
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
    "bc_home": "Home",
    "bc_blog": "Blog"
  },
  "ru": {
    "bc_home": "Главная",
    "bc_blog": "Блог"
  }
}
</i18n>

<template>
  <DocsView
    v-if="items"
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