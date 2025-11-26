<script setup lang="ts">

import ArticlesList, {type Article} from "../../components/docs/ArticlesList.vue";
import {computed, type Ref, ref} from "vue";
import LFiltersSection from "../../components/docs/LFiltersSection.vue";
import LSelectTag from "../../components/docs/LSelectTag.vue";
import LSelectContentType from "../../components/docs/LSelectContentType.vue";
import {useBlogApi} from "~/composables/blogApi";

definePageMeta({
  layout: 'blog',
})

const items = ref<DocumentationItem[]>([])

const route = useRoute();

const selectedProject = ref("")
const selectedTag = ref<string>(route.query.tag as string ?? "")
const selectedContentType = ref<string>("")

const { loadDocumentationItemsList } = useBlogApi();
const loadPage = async () => {
  const data = await loadDocumentationItemsList(
      0,
      16,
      selectedProject.value,
      selectedTag.value,
      selectedContentType.value)
  items.value = data.data
}

await loadPage();

const resetSelects = () => {
  selectedProject.value = "";
  selectedTag.value = "";
  selectedContentType.value = "";
}

const updateSelectValue = (valueRef: Ref<string, string>, value: string) => {
  resetSelects();
  valueRef.value = value;
  return loadPage();
}

const changeSelectedTag = (value: string) => updateSelectValue(selectedTag, value)
const changeSelectedContentType = (value: string) => updateSelectValue(selectedContentType, value)

const computedItems = computed<Article[]>(() => items.value
    .map((article) => {
      return {
        fileName: article.fileName,
        path: article.path,
        description: article.description,
        tags: [article.contentType],
        title: article.title,
        contentLength: article.length,
      }
    }))

useSeoMeta({
  title: 'Laraue Blog Items list',
  description: 'All blog posts of the Laraue organization',
})

</script>

<template>
  <l-filters-section>
    <l-select-content-type
        @update:modelValue="changeSelectedContentType"
        :value="selectedContentType"
    ></l-select-content-type>
    <l-select-tag
        @update:modelValue="changeSelectedTag"
        :value="selectedTag"
    ></l-select-tag>
  </l-filters-section>

  <articles-list
      v-if="items"
      title="All Content"
      :articles="computedItems"/>
</template>

<style scoped>
</style>