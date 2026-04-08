<script setup lang="ts">
defineProps<{
  preTitle?: string,
  title?: string,
  postTitle?: string,
  type: 'light' | 'cream' | 'dark',
}>()
</script>

<template>
  <section class="section" :class="type">
    <div class="section-inner">
      <div class="section-label reveal" v-if="preTitle">{{ preTitle }}</div>
      <h2 class="section-title reveal">{{ title }}</h2>
      <p class="section-sub reveal">{{ postTitle }}</p>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section{padding:80px 60px;border-bottom:1px solid var(--border)}
.section.cream { background:var(--cream); }
.section-inner{max-width:1060px;margin:0 auto}
.section-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-label::after{content:'';flex:1;max-width:40px;height:1px;opacity:.5}
.section-title{font-family:var(--serif);font-size:clamp(26px,3vw,42px);line-height:1.12;letter-spacing:-.3px;margin-bottom:16px}
.section-sub{font-size:17px;color:var(--muted);font-weight:300;line-height:1.7;max-width:560px}

.light .section-label, .cream .section-label{color:var(--accent);}
.light .section-label::after, .cream .section-label::after{background:var(--accent);}
.light .section-sub, .cream .section-sub{color:var(--muted);}

.dark .section-label{color:rgba(247,244,238,.4)}
.dark .section-label::after{background:rgba(247,244,238,.2)}
.dark .section-title{color:#fff}
.dark .section-sub{color:rgba(247,244,238,.5)}

@media(max-width:720px){
  .section{padding:60px 22px}
}
</style>