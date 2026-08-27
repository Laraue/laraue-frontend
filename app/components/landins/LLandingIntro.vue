<script setup lang="ts">
import LProtoBanner from "~/components/ui/LProtoBanner.vue";

export interface Statistics {
  num: string | number,
  label: string,
}

defineProps<{
  preTitle: String,
  title: String,
  postTitle: String,
  statistics?: Array<Statistics>,
  alert?: String
}>()
</script>

<template>
  <LProtoBanner v-if="alert" :message="alert" />

  <!-- ══ HERO ══ -->
  <section class="hero" :class="{ 'hero--custom-bg': !!$slots.background }" aria-labelledby="hero-heading">
    <slot name="background" />
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
        <div class="hero-stats" v-if="statistics?.length">
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
/* radial glow */
.hero::after{content:'';position:absolute;top:-20%;right:-10%;width:600px;height:600px;background:radial-gradient(circle,rgba(45,125,210,.25) 0%,transparent 70%);pointer-events:none}

.hero--custom-bg::before,.hero--custom-bg::after{content:none}

.hero-inner{position:relative;z-index:1;max-width:1060px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}

/* platform badges */
.platform-badges{display:flex;align-items:center;gap:10px;margin-bottom:28px;flex-wrap:wrap;opacity:0;animation:fadeUp var(--anim-duration-lg) 0s var(--anim-ease) both}

.hero-eyebrow{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(247,244,238,.4);margin-bottom:16px;opacity:0;animation:fadeUp var(--anim-duration-lg) var(--anim-stagger) var(--anim-ease) both}

.hero-title{
  font-family:var(--serif);
  font-size:clamp(32px,4vw,56px);
  line-height:1.05;letter-spacing:-.5px;
  color:#fff;margin-bottom:12px;
  animation:fadeUp var(--anim-duration-lg) var(--anim-stagger) var(--anim-ease) both;
}

.hero-sub{font-size:18px;color:rgba(247,244,238,.6);line-height:1.65;max-width:460px;margin-bottom:36px;font-weight:300;animation:fadeUp var(--anim-duration-lg) calc(var(--anim-stagger) * 2) var(--anim-ease) both}

.hero-actions{display:flex;gap:12px;flex-wrap:wrap;animation:fadeUp var(--anim-duration-lg) calc(var(--anim-stagger) * 3) var(--anim-ease) both}

/* hero stats */
.hero-stats{display:flex;gap:32px;margin-top:44px;animation:fadeUp var(--anim-duration-lg) calc(var(--anim-stagger) * 4) var(--anim-ease) both;flex-wrap:wrap}
.hero-stat-num{font-family:var(--serif);font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px}
.hero-stat-label{font-size:12px;color:rgba(247,244,238,.45);margin-top:2px;font-weight:500}
.hero-visual{animation:fadeUp var(--anim-duration-lg) var(--anim-stagger) var(--anim-ease) both;display:flex;justify-content:center}

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