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

useSeoMeta({
  title: () => `Documentation: ${documentation.title}`,
  ogTitle: () => `Documentation: ${documentation.title}`,
})
</script>

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