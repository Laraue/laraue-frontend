<script setup lang="ts">
  defineProps({
    contentType: String,
  })

  const { t } = useI18n()
</script>

<i18n lang="json">
{
  "en": {
    "article": "Article",
    "project": "Project"
  },
  "ru": {
    "article": "Статья",
    "project": "Проект"
  }
}
</i18n>

<template>
  <span class="post-type-badge" :class="[contentType]" data-i18n="type_article">
    {{ contentType === 'article' || contentType === 'project' ? t(contentType) : contentType }}
  </span>
</template>

<style scoped>
.post-type-badge{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 7px;border-radius:4px}
.post-type-badge.article{background:var(--color-accent-soft);color:var(--color-accent)}
.post-type-badge.project{background:var(--accent-light);color:var(--accent)}
</style>