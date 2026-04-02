<script setup lang="ts">
  import {computed} from "vue";

  const props = defineProps({
    contentLength: Number
  })

  const readTime = computed(() => {
    return Math.ceil((props.contentLength ?? 0) / 1118);
  })

  const { t } = useI18n();
</script>

<i18n lang="json">
{
  "en": {
    "readTime": "{minutes} min read"
  },
  "ru": {
    "readTime": "{minutes} мин"
  }
}
</i18n>

<template>
  <span class="post-read-time">
    <span>{{ t('readTime', { minutes: readTime }) }}</span>
  </span>
</template>

<style scoped>
.post-read-time{font-size:11px;color:var(--muted)}
</style>