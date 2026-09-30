<script setup lang="ts">

  const { localePathFromSegments } = usePathUtil()
  const boardsUrl = useBoardsUrl()

  export interface LinksSection {
    links: SidebarItem[]
    title: string
  }

  defineProps<{
    linksSections?: LinksSection[]
  }>()

  const { t } = useI18n();
</script>

<i18n lang="json">
{
  "en": {
    "home": "Home",
    "pages": "Pages",
    "slogan": "Small team, serious craft."
  },
  "ru": {
    "home": "Главная",
    "pages": "Страницы",
    "slogan": "Маленькая команда, большие продукты."
  }
}
</i18n>

<template>
  <!-- PERSISTENT SIDEBAR -->
  <aside class="sidebar" aria-label="Blog navigation">
    <template v-for="linksSection in linksSections">
      <p class="sidebar-section-label">{{ linksSection.title }}</p>
      <ul class="sidebar-links">
        <li v-for="link in linksSection.links">
          <nuxt-link :to="localePathFromSegments(link.path)" active-class="active" id="sb-all">
            <span class="sidebar-icon">{{ link.icon }}</span>
            <span data-i18n="tab_all">{{ link.title }}</span>
            <span class="sidebar-badge">{{ link.count }}</span>
          </nuxt-link>
        </li>
      </ul>
      <div class="sidebar-divider"></div>
    </template>
    <p class="sidebar-section-label">{{ t('pages') }}</p>
    <ul class="sidebar-links">
      <li><nuxt-link active-class="active" to="/"><span class="sidebar-icon">&#127968;</span><span>{{ t('home') }}</span></nuxt-link></li>
      <li><a :href="boardsUrl"><span class="sidebar-icon">&#128203;</span><span>Laraue Boards</span></a></li>
      <li><a href="https://github.com/Laraue" target="_blank" rel="noopener"><span class="sidebar-icon">&#11088;</span><span>GitHub</span></a></li>
    </ul>
    <div class="sidebar-footer">
      <p>Laraue Software<br>{{ t('slogan') }}</p>
    </div>
  </aside>
</template>

<style scoped>
/* sidebar */
.sidebar{position:sticky;top:var(--nav-h);height: calc(100vh - var(--nav-h));bottom:0;left:0;width:var(--sidebar-w);z-index:100;background:var(--color-workspace);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-right:1px solid var(--color-divider);display:flex;flex-direction:column;padding:28px 0 24px;overflow-y:auto;box-shadow:4px 0 24px rgba(16,24,40,.05)}
.sidebar-section-label{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);padding:0 20px;margin-bottom:6px;margin-top:18px;opacity:.7}
.sidebar-section-label:first-child{margin-top:0}
.sidebar-links{list-style:none}
.sidebar-links{padding:0 10px}
.sidebar-links li a{display:flex;align-items:center;gap:9px;padding:8px 10px;margin-bottom:2px;font-size:13px;font-weight:500;color:var(--muted);text-decoration:none;border-radius:var(--radius-control);transition:color .15s,background .15s}
.sidebar-links li a:hover{color:var(--ink);background:var(--color-hover)}
.sidebar-links li a.active{color:var(--color-accent);font-weight:600;background:var(--color-accent-soft)}
.sidebar-links li a:focus-visible{outline-offset:-2px}
.sidebar-links li a.active .sidebar-badge{background:var(--color-surface)}
.sidebar-icon{font-size:14px;width:18px;text-align:center;flex-shrink:0}
.sidebar-badge{margin-left:auto;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--accent-light);color:var(--accent);padding:2px 6px;border-radius:4px}
.sidebar-divider{height:1px;background:var(--color-divider);margin:14px 20px}
.sidebar-footer{margin-top:auto;padding:0 20px}
.sidebar-footer p{font-size:11px;color:var(--muted);line-height:1.5;opacity:.7}
@media(max-width:1100px){
  .sidebar{display:none}
}
</style>