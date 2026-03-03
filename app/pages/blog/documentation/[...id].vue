<script setup lang="ts">
import DocView from "~/components/docs/DocView.vue";
import {computed} from "vue";
import NavigationMenu from "~/components/docs/NavigationMenu.vue";
import {useBlogApi} from "~/composables/blogApi";

definePageMeta({
  layout: 'blog',
})

const route = useRoute();
const itemId = route.params.id as string[];

const getCurrentDocumentationRoot = computed(() => {
  return itemId.slice(0, 1);
})

const { loadDocumentation, loadMenu } = useBlogApi();
const { locale } = useI18n();

const menuPath = getCurrentDocumentationRoot.value
    ? PathUtil.getPath(["documentation"].concat(getCurrentDocumentationRoot.value))
    : PathUtil.getPath("documentation");

const documentation = await loadDocumentation(locale.value, itemId);
const menuItems = await loadMenu(locale.value, menuPath, 5);
const { t } = useI18n();

useSeoMeta({
  title: () => documentation.title,
  ogTitle: () => documentation.title,
  description: () => t('seoDescription', { title: documentation.title }),
})
</script>

<i18n lang="json">
{
  "en": {
    "seoDescription": "The full documentation about the element '{title}'"
  },
  "ru": {
    "seoDescription": "Подробная документация по элементу '{title}'"
  }
}
</i18n>

<template>
  <doc-view
      :content="documentation?.content"
      :created-at="documentation?.createdAt"
      :updated-at="documentation?.updatedAt"
      :title="documentation?.title">
    <template #after-content>
      <div class="navigation-menu">
        <navigation-menu :menuItems="menuItems" :title=documentation.title />
      </div>
    </template>
  </doc-view>
</template>

<style scoped>

</style>