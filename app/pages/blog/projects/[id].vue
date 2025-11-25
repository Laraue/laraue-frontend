<script setup lang="ts">
import {computed} from "vue";
import DocView from "~/components/docs/DocView.vue";
import ArticlesList, {type Article} from "~/components/docs/ArticlesList.vue";
import {useBlogApi} from "~/composables/blogApi";

const route = useRoute();
const projectId = route.params.id as string;

const { loadProject, loadArticlesList } = useBlogApi();
const project = await loadProject(projectId);
const relatedArticles = await loadArticlesList(0, 5, projectId, undefined);

const computedItems = computed<Article[]>(() => relatedArticles
  .map((article) => {
    return {
      fileName: article.fileName,
      description: article.description,
      tags: [],
      title: article.title,
      contentLength: article.length,
      path: article.path,
    }
  }))

definePageMeta({
  layout: 'blog',
})

if (import.meta.server) {
  useSeoMeta({
    title: () => `Laraue Project: ${project.title}`,
    ogTitle: () => `Laraue Project: ${project.title}`,
    description: () => project.description,
  })
}

</script>

<template>
  <doc-view
      :content="project?.content"
      :created-at="project?.createdAt"
      :updated-at="project?.updatedAt"
      :tags="project?.tags"
      :title="project?.title"
      :inner-links="project?.innerLinks">
    <template #after-header>
      <p class="project-description">
        {{ project?.description }}
      </p>
    </template>
    <template #after-content>
      <div class="related-articles" v-if="relatedArticles.length > 0">
        <articles-list
            title="Related Articles"
            :articles="computedItems">
        </articles-list>
      </div>
    </template>
  </doc-view>
</template>

<style scoped>
.related-articles{
  padding-top: 25px;
  margin-top: 75px;
  margin-bottom: 100px;
  border-top: 1px solid #eee;
}
.project-description{
  font-size: 1.1rem;
  line-height: 1.6;
  color: #444;
  margin: 1.5rem 0;
  padding: 0.5rem 1.5rem;
  border-left: 3px solid #888;
  font-style: italic;
  background-color: #f8f8f8;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.03);
}
</style>