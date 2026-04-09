<script setup lang="ts">
  defineProps({
    title: String,
    subTitle: String,
    features: Array<String>,
  })

  const { t } = useI18n();
</script>

<i18n lang="json">
{
  "en": {
    "fromTeam": "From the team"
  },
  "ru": {
    "fromTeam": "От команды"
  }
}
</i18n>

<template>
  <!-- BLOG HERO -->
  <div class="blog-hero">
    <div class="blog-hero-bg" aria-hidden="true"></div>
    <div class="blog-hero-inner">
      <div class="section-label reveal" data-i18n="blog_eyebrow">{{ t('fromTeam') }}</div>
      <h1 class="reveal" data-i18n="blog_title">{{ title }}</h1>
      <p class="blog-hero-sub reveal" data-i18n="blog_sub">{{ subTitle }}</p>
      <div class="blog-hero-features" v-if="features">
      <span v-for="feature in features" class="blog-hero-feature">
        <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        {{ feature }}
      </span>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped>
.blog-hero{padding:56px 60px 44px;border-bottom:1px solid var(--border);position:relative;overflow:hidden}
.blog-hero-bg{position:absolute;inset:0;z-index:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 100% 100% at 0% 0%,black 20%,transparent 80%);opacity:.28}
.blog-hero-inner{position:relative;z-index:1;max-width:1060px;margin:0 auto}
.blog-hero h1{font-family:var(--serif);font-size:clamp(32px,4vw,52px);font-weight:800;line-height:1.08;letter-spacing:-.5px;margin-bottom:12px}
.blog-hero-sub{font-size:17px;color:var(--muted);font-weight:300;max-width:500px;line-height:1.6;}
.section-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-label::after{content:'';flex:1;max-width:40px;height:1px;background:var(--accent);opacity:.5}
.blog-hero-features {display: flex;flex-wrap: wrap;gap: 8px;margin-top: 22px;}
.blog-hero-feature {display: inline-flex;align-items: center;gap: 5px;background: var(--accent-light);border: 1px solid rgba(15, 118, 110, .18);color: var(--accent);padding: 4px 11px;border-radius: 20px;font-size: 11px;font-weight: 700;letter-spacing: .02em;}
.blog-hero-feature  svg{width:10px;height:10px;stroke:currentColor;stroke-width:2.5;flex-shrink:0}



@media(max-width:720px){
  .blog-hero{padding:40px 22px 32px}
}
</style>