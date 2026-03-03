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
  <div class="read-time">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
    </svg>
    <span>{{ t('readTime', { minutes: readTime }) }}</span>
  </div>
</template>

<style scoped>
.read-time {
  display: flex;
  align-items: center;
  gap: 5px;
}
.read-time svg {
  width: 14px;
  height: 14px;
}
</style>