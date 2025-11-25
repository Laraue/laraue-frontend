<script setup lang="ts">

import ReadTime from "./ReadTime.vue";

defineProps({
  articles: Array<Article>,
  title: String,
})

export interface Article {
  fileName: string;
  title: string;
  description: string;
  tags: string[] | undefined;
  contentLength: number;
  path: string[] | undefined;
}

const makePath = (path: string[] | undefined, fileName: string) => {
  const result = []

  if (path)
    result.push(...path)

  if (!isIndexFile(fileName))
    result.push(fileName)

  return "/" + PathUtil.getPathString(result)
}

const isIndexFile = (fileName: string) => {
  return fileName === "index"
}

</script>

<template>
  <div class="articles-container">
    <h2>{{ title }}</h2>
    <nuxt-link
      v-for="article in articles"
      :to="makePath(article.path, article.fileName)">
      <div class="article-card" >
        <h3>{{ article.title }}</h3>
        <p>{{ article.description }}</p>
        <div class="article-meta">
          <read-time :content-length="article.contentLength" />
          <div class="tags">
            <span class="tag" v-for="tag in article.tags">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </nuxt-link>
  </div>
</template>

<style scoped>

.articles-container {
  display: grid;
  gap: 20px;
}

.article-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  color: #95a5a6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.article-card h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.article-card p {
  color: #7f8c8d;
  margin-bottom: 15px;
  line-height: 1.5;
}
</style>