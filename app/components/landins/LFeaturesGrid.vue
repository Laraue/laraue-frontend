<script setup lang="ts">
import LSection from "~/components/landins/LSection.vue";

export interface Feature {
  icon: string,
  title: string,
  description: string,
  link?: string,
}

defineProps<{
  preTitle: string,
  title: string,
  postTitle: string,
  type: 'light' | 'cream' | 'dark'
  features: Feature[],
}>()
</script>

<template>
  <LSection class="features" :pre-title="preTitle" :postTitle="postTitle" :title="title" :type="type" :class="type">
    <div class="features-grid">
      <nuxt-link class="feat-cell reveal" :to="feature.link" v-for="feature in features">
        <div class="feat-icon">{{ feature.icon }}</div>
        <div class="feat-title">{{ feature.title }}</div>
        <div class="feat-desc">{{ feature.description }}
        </div>
      </nuxt-link>
    </div>
  </LSection>
</template>

<style scoped>
/* ══ FEATURES ══ */
.features{padding:80px 60px;background:var(--ink);position:relative;overflow:hidden}
.features::before{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:48px 48px}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-top:52px}
.feat-cell{padding:30px 26px;transition:background .2s;background: #fff;text-decoration: none;}
.dark .feat-cell { background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08); }
.dark .feat-cell:hover { background:rgba(255,255,255,.07); }
.feat-icon{font-size:26px;margin-bottom:14px}
.feat-title{font-weight:700;font-size:14px;margin-bottom:9px;letter-spacing:-.1px}
.dark .feat-title{color:#fff;}
.feat-desc{font-size:13px;line-height:1.6}
.dark .feat-desc{color:rgba(247,244,238,.45);}

@media(max-width:900px){
  .features-grid{grid-template-columns:1fr 1fr}
}

@media(max-width:720px){
  .features,
  .features-grid{grid-template-columns:1fr}
  .features {padding: 60px 22px;}
}
</style>