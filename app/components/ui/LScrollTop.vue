<script setup lang="ts">
const { t } = useI18n()

const visible = ref(false)

const update = () => {
  visible.value = window.scrollY > 600
}

onMounted(() => {
  update()
  window.addEventListener('scroll', update, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', update))

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<i18n lang="json">
{
  "en": { "toTop": "Back to top" },
  "ru": { "toTop": "Наверх" }
}
</i18n>

<template>
  <button
    type="button"
    class="scroll-top"
    :class="{ visible }"
    :aria-label="t('toTop')"
    :title="t('toTop')"
    :tabindex="visible ? 0 : -1"
    @click="scrollTop">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
  </button>
</template>

<style scoped>
.scroll-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 60;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-muted);
  box-shadow: 0 4px 16px rgba(16, 24, 40, .12);
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: opacity .2s, transform .2s, visibility .2s, color .15s, border-color .15s;
}
.scroll-top.visible {
  opacity: 1;
  visibility: visible;
  transform: none;
}
.scroll-top:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.scroll-top svg {
  width: 20px;
  height: 20px;
}
@media (max-width: 720px) {
  .scroll-top {
    right: 16px;
    bottom: 16px;
  }
}
</style>
