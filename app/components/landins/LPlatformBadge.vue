<script setup lang="ts">
  defineProps<{
    title: string,
    type: 'web' | 'tg'
  }>()
</script>

<template>
  <span class="platform-badge" :class="type">
    <svg v-if="type === 'tg'" viewBox="0 0 24 24" fill="currentColor" style="width:12px;height:12px">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.54-.46.67-.93.42l-2.58-1.9-1.24 1.2c-.14.13-.26.25-.52.25l.18-2.6 4.74-4.28c.2-.18-.05-.28-.32-.1L7.36 14.5l-2.52-.79c-.55-.17-.56-.55.11-.81l9.86-3.8c.46-.17.86.11.83.7z"></path>
    </svg>
    <svg v-if="type === 'web'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    {{ title }}
  </span>
</template>

<style scoped>
.platform-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.04em}
.platform-badge.web{background:rgba(45,125,210,.2);color:#6ab0f0;border:1px solid rgba(45,125,210,.3)}
.platform-badge.tg{background:rgba(34,158,217,.2);color:#7dd3f5;border:1px solid rgba(34,158,217,.3)}
.platform-badge svg{width:12px;height:12px;flex-shrink:0}
</style>