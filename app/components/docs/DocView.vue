<script setup lang="ts">

import ReadTime from "../../components/docs/ReadTime.vue";

defineProps({
  title: String,
  createdAt: String,
  updatedAt: String,
  content: String,
  innerLinks: Array<InnerLink>,
  tags: Array<string>,
})

</script>

<template>
  <article>
    <div class="main-content">
      <header class="article-header">
        <h1 class="article-title">{{ title }}</h1>
        <div class="article-meta">
          <span><read-time :content-length="content?.length"/></span>
          <span>Created: <strong>{{ createdAt }}</strong></span>
          <span>Updated: <strong>{{ updatedAt }}</strong></span>
        </div>

        <slot name="after-header"></slot>
      </header>

      <slot name="before-content"></slot>

      <div class="tags" v-if="tags">
        <h3>Tags</h3>
        <div class="tag-list">
          <span class="tag-item" v-for="tag in tags">
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="toc" v-if="innerLinks">
        <h3>Table of content</h3>
        <ul>
          <li v-for="link in innerLinks" :class="'toc-level-' + link.level">
            <a :href="link.link">{{ link.title }}</a>
          </li>
        </ul>
      </div>

      <div class="article-content" v-html="content"></div>
      <slot name="after-content"></slot>
    </div>
  </article>
</template>

<style scoped>

.article-title {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.article-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.article-title {
  font-size: 2em;
  margin-bottom: 10px;
  color: #2c3e50;
}

.article-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: #666;
  font-size: 0.9em;
}

.tags {
  margin: 20px 0;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 10px;
}

.tag-item {
  background-color: #e9f7fe;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85em;
}

.article-content {
  line-height: 1.6;
  color: #444;
  width: 100%;
}

.article-content :deep(h2) {
  margin: 30px 0 15px 0;
  color: #222;
}

.article-content :deep(p) {
  margin-bottom: 15px;
}

.article-content :deep(pre) {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  line-height: 1.4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* Inline code styling */
.article-content :deep(code) {
  background-color: #f1f3f5;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  padding: 2px 6px;
  color: #212529;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* Code block with language class */
.article-content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: #212529;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.article-content :deep(ul) {
  margin: 15px 0;
  padding-left: 30px;
  list-style: disc;
}

.article-content :deep(ol) {
  margin: 15px 0;
  padding-left: 30px;
  list-style: decimal;
}

.article-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 20px 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.article-content :deep(td) {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

.article-content :deep(tr:nth-child(even)) {
  background-color: #f9f9f9;
}
.article-content :deep(tr:last-child td) {
  border-bottom: none;
}

.article-content :deep(li) {
  margin-bottom: 8px;
}

.toc {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  margin: 20px 0;
  line-height: 1.3;
}

.toc h3 {
  margin-bottom: 15px;
}

.toc ul {
  list-style-type: none;
}

.toc .toc-level-2 {
  padding-left: 10px;
}

.toc .toc-level-3 {
  padding-left: 20px;
}

.toc .toc-level-4 {
  padding-left: 25px;
}

.toc li {
  margin: 8px 0;
}

.toc a {
  text-decoration: none;
  color: #007bff;
}

.toc a:hover {
  text-decoration: underline;
}

@media screen and (max-width: 1024px) {
  .article-meta{
    flex-flow: column;
    align-items: center;
    gap: 5px;
    margin-top: 25px;
  }
  .article-content :deep(h1),
  .article-content :deep(h2),
  .article-content :deep(h3),
  .article-content :deep(h4),
  .article-content :deep(h5),
  .article-content :deep(h6){
    text-align: center;
  }

  .article-title{
    text-align: center;
    margin-top: 20px;
  }

  .tags,
  .toc h3{
    text-align: center;
  }

  .tag-list{
    justify-content: center;
  }
}

</style>