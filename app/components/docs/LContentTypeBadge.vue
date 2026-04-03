<script setup lang="ts">
  defineProps({
    contentType: String,
  })
</script>

<template>
  <span class="post-type-badge" :class="[contentType]" data-i18n="type_article">
    {{ contentType }}
  </span>
</template>

<style scoped>
.post-type-badge{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 7px;border-radius:4px}
.post-type-badge.article{background:#e8f0fb;color:#4a7fcc}
.post-type-badge.project{background:var(--accent-light);color:var(--accent)}
.post-type-badge.documentation{background:#e6f7ee;color:#2d8a55}
</style>