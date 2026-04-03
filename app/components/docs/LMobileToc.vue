<script setup lang="ts">
  defineProps({
    title: String,
    fullWidthButton: Boolean
  })

  const isMobileMenuOpened = ref(false)
  const toggleMobileMenu = () => {
    isMobileMenuOpened.value = !isMobileMenuOpened.value
  }
</script>

<template>
  <!-- mobile TOC toggle -->
  <button class="mobile-toc-toggle" @click="toggleMobileMenu" :style="[fullWidthButton ? 'width: 100%;justify-content: center;' : '']">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
    <span data-i18n="toc_label">{{ title }}</span>
  </button>
  <div class="mobile-toc-panel" :class="{open: isMobileMenuOpened}" id="mobileTocPanel">
    <ul class="toc-list">
      <slot></slot>
    </ul>
  </div>
</template>

<style scoped>
.mobile-toc-toggle{
  display:none;
  align-items:center;gap:8px;
  background:none;border:1px solid var(--border);border-radius:6px;
  padding:7px 14px;cursor:pointer;
  font-family:var(--sans);font-size:13px;font-weight:600;color:var(--muted);
  margin-bottom:24px;
  transition:border-color .15s,color .15s;
}
.mobile-toc-toggle:hover{border-color:var(--ink);color:var(--ink)}
.mobile-toc-toggle svg{width:14px;height:14px;stroke:currentColor}

.mobile-toc-panel{
  background:var(--cream);border:1px solid var(--border);border-radius:10px;
  padding:16px 0;margin-bottom:32px;
  display:none;
}
.mobile-toc-panel.open{display:block}
.mobile-toc-panel .toc-list li a{padding:7px 20px;font-size:13px}
.toc-list{list-style:none}

@media(max-width:760px){
  .mobile-toc-toggle{display:flex}
}
</style>