<script setup lang="ts">

  const { localePathFromSegments } = usePathUtil()
  const localePath = useLocalePath()

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
      <li><nuxt-link active-class="active" :to="localePath('boards')"><span class="sidebar-icon">&#128203;</span><span>Laraue Boards</span></nuxt-link></li>
      <li><a href="https://github.com/win7user10" target="_blank" rel="noopener"><span class="sidebar-icon">&#11088;</span><span>GitHub</span></a></li>
    </ul>
    <div class="sidebar-footer">
      <p>Laraue Software<br>{{ t('slogan') }}</p>
    </div>
  </aside>
</template>

<style scoped>
/* sidebar */
.sidebar{position:fixed;top:var(--nav-h);bottom:0;left:0;width:var(--sidebar-w);z-index:100;background:rgba(247,244,238,.72);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-right:1px solid rgba(217,212,201,.6);display:flex;flex-direction:column;padding:28px 0 24px;overflow-y:auto;box-shadow:4px 0 24px rgba(15,14,12,.05)}
.sidebar-section-label{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);padding:0 20px;margin-bottom:6px;margin-top:18px;opacity:.7}
.sidebar-section-label:first-child{margin-top:0}
.sidebar-links{list-style:none}
.sidebar-links li a{display:flex;align-items:center;gap:9px;padding:9px 20px;font-size:13px;font-weight:500;color:var(--muted);text-decoration:none;transition:color .15s,background .15s;border-left:3px solid transparent}
.sidebar-links li a:hover{color:var(--ink);background:rgba(15,14,12,.04)}
.sidebar-links li a.active{color:var(--ink);font-weight:600;background:rgba(200,75,47,.06);border-left-color:var(--accent)}
.sidebar-icon{font-size:14px;width:18px;text-align:center;flex-shrink:0}
.sidebar-badge{margin-left:auto;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--accent-light);color:var(--accent);padding:2px 6px;border-radius:4px}
.sidebar-divider{height:1px;background:rgba(217,212,201,.6);margin:14px 20px}
.sidebar-footer{margin-top:auto;padding:0 20px}
.sidebar-footer p{font-size:11px;color:var(--muted);line-height:1.5;opacity:.7}
@media(max-width:720px){
  .sidebar{display:none}
}
</style>