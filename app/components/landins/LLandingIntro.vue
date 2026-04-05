<script setup lang="ts">

export interface Statistics {
  num: string | number,
  label: string,
}

defineProps({
  preTitle: String,
  title: String,
  postTitle: String,
  statistics: Array<Statistics>,
})
</script>

<template>
  <!-- ══ HERO ══ -->
  <section class="hero" aria-labelledby="hero-heading">
    <div class="hero-inner">
      <div>
        <div class="platform-badges">
          <slot name="badges" />
        </div>
        <div class="hero-eyebrow">{{ preTitle }}</div>
        <h1 class="hero-title" id="hero-heading">{{ title }}</h1>
        <p class="hero-sub">{{ postTitle }}</p>
        <div class="hero-actions">
          <slot name="actions" />
        </div>
        <div class="hero-stats">
          <div v-for="statistic in statistics">
            <div class="hero-stat-num">{{ statistic.num }}</div>
            <div class="hero-stat-label">{{ statistic.label }}</div>
          </div>
        </div>
      </div>

      <!-- Kanban mockup -->
      <div class="hero-visual">
        <slot name="visual" />
      </div>
    </div>
  </section>
</template>

<style scoped>

/* ══ HERO ══ */
.hero{
  min-height:100vh;display:flex;align-items:center;
  padding:100px 60px 80px;position:relative;overflow:hidden;
  background:var(--ink);
}
/* grid overlay */
.hero::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:52px 52px}
/* radial glow */
.hero::after{content:'';position:absolute;top:-20%;right:-10%;width:600px;height:600px;background:radial-gradient(circle,rgba(45,125,210,.25) 0%,transparent 70%);pointer-events:none}

.hero-inner{position:relative;z-index:1;max-width:1060px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}

/* platform badges */
.platform-badges{display:flex;align-items:center;gap:10px;margin-bottom:28px;flex-wrap:wrap}

.hero-eyebrow{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(247,244,238,.4);margin-bottom:16px}

.hero-title{
  font-family:var(--serif);
  font-size:clamp(32px,4vw,56px);
  line-height:1.05;letter-spacing:-.5px;
  color:#fff;margin-bottom:12px;
  animation:fadeUp .8s .1s ease both;
}

.hero-sub{font-size:18px;color:rgba(247,244,238,.6);line-height:1.65;max-width:460px;margin-bottom:36px;font-weight:300;animation:fadeUp .8s .2s ease both}

.hero-actions{display:flex;gap:12px;flex-wrap:wrap;animation:fadeUp .8s .3s ease both}

/* hero stats */
.hero-stats{display:flex;gap:32px;margin-top:44px;animation:fadeUp .8s .4s ease both;flex-wrap:wrap}
.hero-stat-num{font-family:var(--serif);font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px}
.hero-stat-label{font-size:12px;color:rgba(247,244,238,.45);margin-top:2px;font-weight:500}
.hero-visual{animation:fadeUp .9s .25s ease both;display:flex;justify-content:center}

/* ══ RESPONSIVE ══ */
@media(max-width:720px){
  .hero{padding:80px 22px 60px}
  .hero-inner{grid-template-columns:1fr;gap:48px}
  .hero-visual{order:-1}
}
@media(max-width:860px){
  .hero-visual{order:-1}
}
</style>