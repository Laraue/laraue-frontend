<script setup lang="ts">
  defineProps<{
    preTitle: string;
    title: string;
    postTitle: string;
  }>()
</script>

<template>
  <!-- ══ CTA ══ -->
  <section class="cta-section">
    <div class="cta-inner">
      <div class="cta-label reveal">{{ preTitle }}</div>
      <h2 class="cta-title reveal">{{ title }}</h2>
      <p class="cta-sub reveal">{{ postTitle }}</p>
      <div class="cta-actions reveal">
        <slot></slot>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ══ CTA ══ */
.cta-section{padding:100px 60px;background:var(--color-workspace);border-top:1px solid var(--color-divider);position:relative;overflow:hidden;text-align:center}
.cta-section::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(53,104,212,.12) 0%,transparent 70%);pointer-events:none}
.cta-inner{position:relative;z-index:1;max-width:640px;margin:0 auto}
.cta-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent);margin-bottom:20px}
.cta-title{font-family:var(--serif);font-size:clamp(28px,4vw,48px);font-weight:800;color:var(--color-text);line-height:1.08;letter-spacing:-.5px;margin-bottom:16px}
.cta-sub{font-size:17px;color:var(--color-muted);font-weight:400;line-height:1.6;margin-bottom:40px}
.cta-actions{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}

.cta-label.reveal.is-visible{animation:fadeUp var(--anim-duration) 0s var(--anim-ease) both}
.cta-title.reveal.is-visible{animation:fadeUp var(--anim-duration) var(--anim-stagger-sm) var(--anim-ease) both}
.cta-sub.reveal.is-visible{animation:fadeUp var(--anim-duration) calc(var(--anim-stagger-sm) * 2) var(--anim-ease) both}
.cta-actions.reveal.is-visible{animation:fadeUp var(--anim-duration) calc(var(--anim-stagger-sm) * 3) var(--anim-ease) both}

@media(max-width:720px){
  .cta-section{padding:60px 22px}
}
</style>