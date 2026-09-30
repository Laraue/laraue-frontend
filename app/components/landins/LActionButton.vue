<script setup lang="ts">
  defineProps<{
    link: string,
    title: string,
    type: 'site' | 'telegram' | 'github',
  }>()
</script>

<template>
  <a target="_blank" :href="link" class="btn" :class="type">{{ title }}
    <template v-if="type === 'site'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </template>
    <template v-if="type === 'telegram'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.54-.46.67-.93.42l-2.58-1.9-1.24 1.2c-.14.13-.26.25-.52.25l.18-2.6 4.74-4.28c.2-.18-.05-.28-.32-.1L7.36 14.5l-2.52-.79c-.55-.17-.56-.55.11-.81l9.86-3.8c.46-.17.86.11.83.7z">
        </path>
      </svg>
    </template>
  </a>
</template>

<style scoped>
.btn {
  color: #fff;
  padding: 12px 24px;
  border-radius: var(--radius-control);
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background .2s, transform .15s, box-shadow .2s;
}
.btn.site {
  background: var(--accent);
  box-shadow: none;
}
.btn.site:hover{
  background:var(--accent-mid);
  transform:translateY(-1px)
}
.btn.telegram {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.btn.telegram:hover{
  background:var(--color-hover);
  transform:translateY(-1px)
}
.btn.github {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.btn.github:hover {
  background: var(--color-hover);
  transform:translateY(-1px)
}
</style>