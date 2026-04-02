<script setup lang="ts">

import LButton from "~/components/ui/LButton.vue";
const localePath = useLocalePath();

</script>

<template>
  <aside class="blog-sidebar" aria-label="Tag filters">
    <div class="filter-panel">
      <div class="filter-panel-title" data-i18n="filter_tags">Filter by tag</div>
      <div class="tag-list">
        <button class="tag-filter-btn active" data-tag="all" onclick="filterByTag('all')" data-i18n="tag_all">All</button>
        <button class="tag-filter-btn" data-tag="Crawler" onclick="filterByTag('Crawler')">Crawler</button>
        <button class="tag-filter-btn" data-tag=".NET" onclick="filterByTag('.NET')">.NET</button>
        <button class="tag-filter-btn" data-tag="C#" onclick="filterByTag('C#')">C#</button>
        <button class="tag-filter-btn" data-tag="Telegram" onclick="filterByTag('Telegram')">Telegram</button>
        <button class="tag-filter-btn" data-tag="PdfQL" onclick="filterByTag('PdfQL')">PdfQL</button>
        <button class="tag-filter-btn" data-tag="SQL" onclick="filterByTag('SQL')">SQL</button>
        <button class="tag-filter-btn" data-tag="AI" onclick="filterByTag('AI')">AI</button>
        <button class="tag-filter-btn" data-tag="Ollama" onclick="filterByTag('Ollama')">Ollama</button>
        <button class="tag-filter-btn" data-tag="CMS" onclick="filterByTag('CMS')">CMS</button>
      </div>
    </div>
    <div class="filter-panel">
      <div class="filter-panel-title" data-i18n="filter_cta_title">Want more?</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:14px;line-height:1.55" data-i18n="filter_cta_body">MsgBoard is our newest product. Try it free &#8212; no credit card needed.</p>
      <LButton :href="localePath('msgboard')">
        Try MsgBoard
      </LButton>
    </div>
  </aside>
</template>

<style scoped>
.blog-sidebar{position:sticky;top:calc(var(--nav-h) + 56px)}
.filter-panel{background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:14px}
.filter-panel-title{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
.tag-list{display:flex;flex-wrap:wrap;gap:5px}
.tag-filter-btn{font-size:11px;font-weight:600;background:var(--cream);color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:4px 9px;cursor:pointer;transition:background .15s,color .15s,border-color .15s;font-family:var(--sans)}
.tag-filter-btn:hover{background:var(--border);color:var(--ink)}
.tag-filter-btn.active{background:var(--ink);color:var(--paper);border-color:var(--ink)}
</style>