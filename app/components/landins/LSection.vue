<script setup lang="ts">
defineProps<{
  preTitle?: string,
  title?: string,
  postTitle?: string,
  type: 'light' | 'cream' | 'dark',
  horizontal?: boolean
}>()
</script>

<template>
  <section class="section" :class="type">
    <div class="section-inner" :class="{ horizontal: horizontal }">
      <div>
        <div class="section-label" v-if="preTitle">{{ preTitle }}</div>
        <h2 class="section-title">{{ title }}</h2>
        <p class="section-sub">{{ postTitle }}</p>
      </div>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section{padding:88px 60px;border-bottom:1px solid var(--color-divider)}
.section.cream, .section.dark { background:var(--color-workspace); }
.section-inner{max-width:1060px;margin:0 auto}
.section-inner.horizontal { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.section-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-label::after{content:'';flex:1;max-width:40px;height:1px;opacity:.5}
.section-title{font-family:var(--serif);font-size:clamp(26px,3vw,40px);font-weight:800;line-height:1.15;letter-spacing:-.02em;margin-bottom:16px}
.section-sub{font-size:17px;color:var(--muted);line-height:1.7;max-width:560px}

.light .section-label, .cream .section-label, .dark .section-label{color:var(--accent);}
.light .section-label::after, .cream .section-label::after, .dark .section-label::after{background:var(--accent);}
.light .section-sub, .cream .section-sub, .dark .section-sub{color:var(--muted);}


@media (max-width: 900px) {
  .section-inner.horizontal  {
    grid-template-columns: 1fr;
    gap: 44px;
  }
}

@media(max-width:720px){
  .section{padding:60px 22px}
}
</style>