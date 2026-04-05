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
  </a>
</template>

<style scoped>
.btn {
  color: #fff;
  padding: 14px 28px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background .2s, transform .15s, box-shadow .2s;
}
.btn.site {
  background: var(--accent);
  box-shadow: 0 2px 14px rgba(200, 75, 47, .3);
}
.btn.site:hover{
  background:#b03d24;
  transform:translateY(-2px);
  box-shadow:0 6px 24px rgba(200,75,47,.4)
}
.btn.telegram {
  background: #229ed9;
}
.btn.telegram:hover{
  background:#1a8abf;
  transform:translateY(-1px)
}
.btn.github {
  background: var(--ink);
  border: 1px solid rgba(255,255,255,.25);
}
.btn.github:hover {
  background: #1b1a15;
  transform:translateY(-1px)
}
</style>