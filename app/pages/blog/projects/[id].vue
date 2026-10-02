<script setup lang="ts">
import DocView from "~/components/docs/DocView.vue";
import {useBlogContent} from "~/composables/blogContent";
import {useSchemaOrg} from "@unhead/schema-org/vue";
import {defineArticle, defineBreadcrumb} from "@unhead/schema-org";

const { getBlogOgImageUrl } = usePathUtil();
const { getProject } = useBlogContent();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

const id = route.params.id as string;
const { data, error } = await useAsyncData(
  `blog-project-${locale.value}-${id}`,
  () => getProject(locale.value, id),
);
if (!data.value) {
  throw createError({ statusCode: error.value?.statusCode ?? 404, statusMessage: 'Project not found', fatal: true });
}
const project = data.value;
definePageMeta({
  layout: 'blog',
})

const imageUrl = getBlogOgImageUrl();
const { author, publisher } = useConstants()
const { mainEntityOfPage, pageUrl, toUtc } = useBlogSeo()

useSeoMeta({
  title: project.seoTitle,
  ogTitle: project.seoTitle,
  description: project.seoDescription,
  ogDescription: project.seoDescription,
  ogType: "article",
  articlePublishedTime: project.createdAtIso,
  articleModifiedTime: project.updatedAtIso,
  ogImage: imageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: locale.value,
  ogImageType: "image/png",
  twitterCard: "summary_large_image",
  twitterTitle: project.seoTitle,
  twitterImage: imageUrl,
  robots: 'index, follow, max-image-preview:large',
})

useSchemaOrg([
  defineArticle({
    headline: project.title,
    description: project.description,
    image: imageUrl,
    dateModified: toUtc(project.updatedAtIso),
    datePublished: toUtc(project.createdAtIso),
    inLanguage: locale.value,
    keywords: project.tags,
    author: author,
    publisher: publisher,
    mainEntityOfPage: mainEntityOfPage(),
  }),
  // The source code of the project, when it is open.
  ...(project.repository ? [{
    '@type': 'SoftwareSourceCode',
    '@id': `${pageUrl()}#source-code`,
    name: project.title,
    description: project.description,
    url: pageUrl(),
    codeRepository: project.repository,
    programmingLanguage: project.language,
    ...(project.license && { license: `https://spdx.org/licenses/${project.license}.html` }),
    inLanguage: locale.value,
    datePublished: toUtc(project.createdAtIso),
    dateModified: toUtc(project.updatedAtIso),
    author: { '@type': 'Person', ...author },
  }] : []),
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