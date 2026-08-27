<script setup lang="ts">
import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";
import {useSchemaOrg} from "@unhead/schema-org/vue";
import {defineArticle, defineBreadcrumb} from "@unhead/schema-org";

const { getRouteSegments, getBlogOgImageUrl } = usePathUtil();
const { getItemDetails } = useBlogApi();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const project = await getItemDetails(locale.value, getRouteSegments());
definePageMeta({
  layout: 'blog',
})

const imageUrl = getBlogOgImageUrl();
const { author } = useConstants()

useSeoMeta({
  title: project.title,
  ogTitle: project.title,
  description: project.description,
  ogType: "article",
  articlePublishedTime: project.createdAtIso,
  articleModifiedTime: project.updatedAtIso,
  ogImage: imageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: locale.value,
  ogImageType: "image/png",
  twitterCard: "summary_large_image",
  twitterTitle: project.title,
  twitterImage: imageUrl,
  robots: 'index, follow, max-image-preview:large',
})

useSchemaOrg([
  defineArticle({
    headline: project.title,
    description: project.description,
    image: imageUrl,
    dateModified: project.updatedAtIso,
    datePublished: project.createdAtIso,
    inLanguage: locale.value,
    keywords: project.tags,
    author: author
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_blog'), item: localePath('/blog') },
      { name: t('bc_projects'), item: localePath('/blog/projects') },
      { name: project.title },
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
  <DocView :item="project">
  </DocView>
</template>

<style scoped>
</style>