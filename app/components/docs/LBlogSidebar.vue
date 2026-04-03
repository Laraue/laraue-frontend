<script setup lang="ts">

import LButton from "~/components/ui/LButton.vue";
const localePath = useLocalePath();

const {locale, t} = useI18n()
const { getTags } = useBlogApi()
const tags = await getTags(locale.value)

const route = useRoute()
const isTagActive = (tag: string) => {
  return route.query["tag"] === tag;
}

</script>

<i18n lang="json">
{
  "en": {
    "filterTags": "Filter posts by tag",
    "wantMore": "Want more?",
    "try": "Try",
    "msgBoard": "Message Board is our newest product. Try it free - no credit card needed."
  },
  "ru": {
    "filterTags": "Фильтрация по тегам",
    "wantMore": "Хотите больше?",
    "try": "Попробовать",
    "msgBoard": "Message Board наш новый продукт. Попробуйте бесплатно."
  }
}
</i18n>

<template>
  <aside class="blog-sidebar" aria-label="Tag filters">
    <div class="filter-panel">
      <div class="filter-panel-title" data-i18n="filter_tags">{{ t('filterTags') }}</div>
      <div class="tag-list">
        <nuxt-link :to="localePath({ name: 'blog', query: isTagActive(tag.key) ? {} : {tag: tag.key} })"
          v-for="tag in tags"
          class="tag-filter-btn"
          :class="{ active: route.query['tag'] === tag.key }">
          {{ tag.key }}
        </nuxt-link>
      </div>
    </div>
    <div class="filter-panel">
      <div class="filter-panel-title" data-i18n="filter_cta_title">{{ t('wantMore') }}</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:14px;line-height:1.55" data-i18n="filter_cta_body">{{ t('msgBoard') }}</p>
      <LButton :href="localePath('msgboard')">
        {{ t('try') }}
      </LButton>
    </div>
  </aside>
</template>

<style scoped>
.blog-sidebar{position:sticky;top:calc(var(--nav-h) + 56px)}
.filter-panel{background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:14px}
.filter-panel-title{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
.tag-list{display:flex;flex-wrap:wrap;gap:5px}
.tag-filter-btn{font-size:11px;font-weight:600;background:var(--cream);color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:4px 9px;cursor:pointer;transition:background .15s,color .15s,border-color .15s;font-family:var(--sans);text-decoration:none;}
.tag-filter-btn:hover{background:var(--border);color:var(--ink)}
.tag-filter-btn.active{background:var(--ink);color:var(--paper);border-color:var(--ink)}
</style>