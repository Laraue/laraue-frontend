<script setup lang="ts">

import DocView from "~/components/docs/DocView.vue";
import {useBlogApi} from "~/composables/blogApi";

definePageMeta({
  layout: 'blog',
})

const route = useRoute();
const articleId = route.params.id as string;

const { loadArticle } = useBlogApi();
const article = await loadArticle(articleId);

useSeoMeta({
  title: () => `Laraue Article: ${article.title}`,
  ogTitle: () => `Laraue Article: ${article.title}`,
})
</script>

<template>
  <article>
    <doc-view
      :content="article?.content"
      :created-at="article?.createdAt"
      :updated-at="article?.updatedAt"
      :inner-links="article?.innerLinks"
      :tags="article?.projects"
      :title="article?.title">
        <template #before-content>
          <div class="related-projects" v-if="article?.projects">
            <h3>Related Projects</h3>
            <div class="project-list">
              <span class="project-item" v-for="project in article?.projects">
                <nuxt-link :to="`/blog/projects/${project}`">{{ project }}</nuxt-link>
              </span>
            </div>
          </div>
        </template>
      </doc-view>
  </article>
</template>

<style scoped>


.related-projects {
  margin: 20px 0;
}

.related-projects h3, .tags h3 {
  margin-bottom: 10px;
}

.project-list{
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.project-item {
  background-color: #e9f7fe;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85em;
}

@media screen and (max-width: 1024px) {
  .related-projects {
    text-align: center;
  }
  .project-list{
    justify-content: center;
  }
}

</style>