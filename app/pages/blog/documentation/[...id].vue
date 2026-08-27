<script setup lang="ts">
import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";
import DocsMobileToc from "~/components/docs/DocsMobileToc.vue";
import {defineArticle, defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";

const { getDocumentation, getDocumentationSection, loadMenu } = useBlogApi();
const { locale } = useI18n();
const localePath = useLocalePath();
const { getBlogOgImageUrl } = usePathUtil();
const { author } = useConstants()
const route = useRoute();
const segments = route.params.id as string[]
const rootPath = ["blog", "documentation", segments[0]!]
const menuItems = await loadMenu(locale.value, rootPath);
const item = await getDocumentationSection(locale.value, [segments[0]!]);

const documentation = await getDocumentation(locale.value, segments);
const { t } = useI18n();
const imageUrl = getBlogOgImageUrl();
const isContentPage = documentation.contentType === 'documentation'

useSeoMeta({
  title: documentation.title,
  ogTitle: documentation.title,
  description: documentation.description ?? t('seoDescription', { title: documentation.title }),
  ogDescription: documentation.description ?? t('seoDescription', { title: documentation.title }),
  ogType: isContentPage ? "article" : "website",
  articlePublishedTime: isContentPage ? documentation.createdAtIso : undefined,
  articleModifiedTime: isContentPage ? documentation.updatedAtIso : undefined,
  ogImageUrl: imageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: locale.value,
  ogImageType: "image/png",
  twitterCard: "summary_large_image",
  twitterTitle: documentation.title,
  twitterImage: imageUrl,
  robots: 'index, follow, max-image-preview:large',
})

const rootDocPath = '/' + rootPath.join('/')
const isRootDocPage = segments.length <= 1
const breadcrumbItems = [
  { name: t('bc_home'), item: localePath('/') },
  { name: t('bc_blog'), item: localePath('/blog') },
  isRootDocPage ? { name: item.title } : { name: item.title, item: localePath(rootDocPath) },
]
if (!isRootDocPage) {
  breadcrumbItems.push({ name: documentation.title })
}

useSchemaOrg([
  ...(isContentPage ? [defineArticle({
    headline: documentation.title,
    description: documentation.description,
    image: imageUrl,
    datePublished: documentation.createdAtIso,
    dateModified: documentation.updatedAtIso,
    inLanguage: locale.value,
    keywords: documentation.keywords,
    author,
  })] : []),
  defineBreadcrumb({
    itemListElement: breadcrumbItems
  }),
])
</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "The full documentation about the element '{title}'",
    "bc_home": "Home",
    "bc_blog": "Blog"
  },
  "ru": {
    "seoDescription": "Подробная документация по элементу '{title}'",
    "bc_home": "Главная",
    "bc_blog": "Блог"
  }
}
</i18n>

<template>
  <NuxtLayout name="blog">
    <DocsMobileToc :rootPath="rootPath" :menuItems="menuItems" />
    <DocView :item="documentation" />
    <template #sidebar>
      <DocsSidebar :rootPath="rootPath" :menuItems="menuItems" :title="item.title" :icon="item.icon" />
    </template>
  </NuxtLayout>
</template>

<style scoped>

</style>