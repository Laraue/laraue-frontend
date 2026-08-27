<script setup lang="ts">

import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";
import {defineArticle, defineBreadcrumb} from "@unhead/schema-org";
import {useSchemaOrg} from "@unhead/schema-org/vue";

definePageMeta({
  layout: 'blog',
})

const { getBlogOgImageUrl } = usePathUtil();

const { locale, t } = useI18n()
const localePath = useLocalePath();
const { getArticle } = useBlogApi();
const route = useRoute();
const article = await getArticle(locale.value, route.params.id as string);
const imageUrl = getBlogOgImageUrl();
const { author } = useConstants()

useSeoMeta({
  title: article.title,
  ogTitle: article.title,
  description: article.description,
  ogType: "article",
  articlePublishedTime: article.createdAtIso,
  articleModifiedTime: article.updatedAtIso,
  ogImage: imageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: "image/png",
  ogLocale: locale.value,
  twitterCard: "summary_large_image",
  twitterTitle: article.title,
  twitterImage: imageUrl,
  robots: 'index, follow, max-image-preview:large',
})

useSchemaOrg([
  defineArticle({
    headline: article.title,
    description: article.description,
    image: imageUrl,
    datePublished: article.createdAtIso,
    dateModified: article.updatedAtIso,
    inLanguage: locale.value,
    keywords: article.tags,
    author: author
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_blog'), item: localePath('/blog') },
      { name: t('bc_articles'), item: localePath('/blog/articles') },
      { name: article.title },
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
  <article>
    <DocView
      :item="article">
      </DocView>
  </article>
</template>

<style scoped>

</style>