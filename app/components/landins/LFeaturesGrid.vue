<script setup lang="ts">
import LSection from "~/components/landins/LSection.vue";
import LNavIcon from "~/components/ui/LNavIcon.vue";

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

// Icon names (e.g. "board", "mail") render via LNavIcon; anything else (emoji) renders as-is.
const isIconName = (icon: string) => /^[a-z]+$/.test(icon)
</script>

<template>
  <LSection class="features" :pre-title="preTitle" :postTitle="postTitle" :title="title" :type="type" :class="type">
    <div class="features-grid">
      <nuxt-link class="feat-cell" :to="feature.link" v-for="(feature, index) in features">
        <div class="feat-icon" :class="{ 'feat-icon-svg': isIconName(feature.icon) }">
          <LNavIcon v-if="isIconName(feature.icon)" :name="feature.icon" />
          <template v-else>{{ feature.icon }}</template>
        </div>
        <h3 class="feat-title">{{ feature.title }}</h3>
        <div class="feat-desc">{{ feature.description }}
        </div>
      </nuxt-link>
    </div>
  </LSection>
</template>

<style scoped>
/* ══ FEATURES ══ */
.features{padding:88px 60px;position:relative;overflow:hidden}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}
.feat-cell{padding:28px 24px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-card);box-shadow:var(--shadow-card);color:inherit;text-decoration:none;transition:border-color var(--duration-base),transform var(--duration-base)}
.feat-cell:hover{border-color:var(--color-accent);transform:translateY(-2px)}
.feat-icon{font-size:26px;margin-bottom:14px}
.feat-icon-svg{width:44px;height:44px;border-radius:var(--radius-card);background:var(--accent-light);color:var(--accent);display:flex;align-items:center;justify-content:center}
.feat-icon-svg :deep(.nav-icon-svg){width:22px;height:22px}
.feat-title{font-weight:700;font-size:14px;margin-bottom:9px;letter-spacing:-.1px}
.feat-desc{font-size:13px;line-height:1.6;color:var(--color-muted)}

@media(max-width:900px){
  .features-grid{grid-template-columns:1fr 1fr}
}

@media(max-width:720px){
  .features,
  .features-grid{grid-template-columns:1fr}
  .features {padding: 60px 22px;}
}
</style>