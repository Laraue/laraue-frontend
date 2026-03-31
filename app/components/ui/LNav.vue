<script setup lang="ts">

interface MenuItem {
  text: string;
  link?: string;
  children?: MenuItem[];
  id: string,
  label?: string;
  icon?: string;
}

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const menuItems = computed<MenuItem[]>(() => {
  return [
    {
      text: t('home'),
      id: "0",
      link: localePath("/"),
    },
    {
      text: t('apps'),
      id: "1",
      children: [
        {
          text: t('markdownConverter'),
          link: localePath("/markdown-converter"),
          id: "1-1",
          icon: "📝"
        },
        {
          text: t('apartmentsAggregator'),
          link: localePath("/crawled-apartments"),
          id: "1-2",
          icon: "🏠"
        },
        {
          text: t("noteBoardBot"),
          link: localePath("/msgboard"),
          id: "1-3",
          icon: "📋"
        },
      ]
    },
    {
      text: t('telegramBots'),
      id: "2",
      children: [
        {
          text: t('vocabularyBot'),
          link: localePath("/learn-language-bot"),
          id: "2-1",
          icon: "🤖"
        },
      ]
    },
    {
      text: $t('prototypes'),
      id: "3",
      children: [
        {
          text: t("pdfExtractor"),
          link: localePath("/pdf-extractor"),
          id: "3-1",
          icon: "📄"
        },
        {
          text: t("markdownTranslator"),
          link: localePath("/markdown-translator"),
          id: "3-2",
          icon: "🌍"
        }
      ]
    },
    {
      text: t('blog'),
      id: "4",
      link: localePath("/blog"),
    },
  ]
});

const isMobileMenuActive = ref(false);
const activeItem: Ref<string | undefined> = ref(undefined);
const isActive = (id: string) => activeItem.value === id;
const closeMenu = () => {
  if (!isMobileMenuActive.value)
    activeItem.value = undefined;
}

const dropdownOpened = ref(false)
const { locale, setLocale } = useI18n()
const changeLanguage = (code: string) => {
  setLocale(code as any)
  dropdownOpened.value = false
}

const toggleMobileSubMenu = (id: string) => {
  if (activeItem.value === id)
    activeItem.value = undefined;
  else
    activeItem.value = id
}

</script>
<i18n lang="json">
{
  "en": {
    "home": "Home",
    "apps": "Apps",
    "telegramBots": "Telegram Bots",
    "blog": "Blog",
    "prototypes": "Prototypes"
  },
  "ru": {
    "home": "Главная",
    "apps": "Приложения",
    "telegramBots": "Боты",
    "blog": "Блог",
    "prototypes": "Прототипы"
  }
}
</i18n>

<template>
  <!-- ══════════════════════════════════════
       TOP NAV  (multi-level)
  ══════════════════════════════════════════ -->
  <nav class="topnav" aria-label="Main navigation">

    <a :href="localePath('/')" class="nav-logo" aria-label="Laraue Software">
      <svg class="nav-logo-mark" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <rect width="34" height="34" rx="8" fill="#0f0e0c"/>
        <path d="M10 8L10 24L22 24" stroke="#f7f4ee" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="25" cy="10" r="2.5" fill="#c84b2f"/>
      </svg>
      <span class="nav-logo-name">Laraue Software</span>
    </a>

    <ul class="nav-menu" role="menubar" v-click-outside="closeMenu">
      <li
        v-for="menuItem in menuItems"
        :key="menuItem.id"
        :class="{
          open: isActive(menuItem.id),
        }">
        <button v-if="menuItem.children" role="menuitem" aria-haspopup="true" aria-expanded="false" @click="isActive(menuItem.id) ? closeMenu() : activeItem = menuItem.id">
          <span>{{ menuItem.text }}</span>
          <svg class="nav-chevron" viewBox="0 0 12 12" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,4 6,8 10,4"/></svg>
        </button>
        <a v-else :href="menuItem.link" :class="{ active: route.path == menuItem.link }" role="menuitem" data-i18n="nav_blog">{{ menuItem.text }}</a>
        <div v-if="menuItem.children" class="nav-dropdown" role="menu">
          <a v-for="subItem in menuItem.children" :href="subItem.link" role="menuitem">
            <span class="dd-icon" v-if="subItem.icon">{{ subItem.icon }}</span>
            <span class="dd-label">{{ subItem.text }}</span>
            <span class="dd-badge" v-if="subItem.label">{{ subItem.label }}</span>
          </a>
        </div>
      </li>
    </ul>

    <div class="nav-right">
      <div class="lang-switcher" role="group" aria-label="Language">
        <button class="lang-btn" :class="{active: locale === 'en'}" @click="changeLanguage('en')" aria-pressed="true">EN</button>
        <div class="lang-divider" aria-hidden="true"></div>
        <button class="lang-btn" :class="{active: locale === 'ru'}" @click="changeLanguage('ru')" aria-pressed="false">RU</button>
      </div>
    </div>

    <!-- Hamburger (mobile) -->
    <button class="nav-hamburger" :class="{open: isMobileMenuActive}" aria-label="Open menu" aria-expanded="false" aria-controls="mobileDrawer" @click="isMobileMenuActive = !isMobileMenuActive">
      <span></span>
      <span></span>
      <span></span>
    </button>

  </nav>

  <!-- ══════════════════════════════════════
     MOBILE DRAWER
══════════════════════════════════════════ -->
  <div class="mobile-drawer" id="mobileDrawer" aria-label="Mobile navigation" :class="{open: isMobileMenuActive}">
    <ul class="mobile-nav-links">
      <li
          v-for="menuItem in menuItems"
          :key="menuItem.id"
          :class="{
          open: isActive(menuItem.id),
        }">
        <template v-if="menuItem.children">
          <button @click="toggleMobileSubMenu(menuItem.id)">
            <span>{{ menuItem.text }}</span>
            <svg :class="{open: isActive(menuItem.id)}" width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="2,4 6,8 10,4"/></svg>
          </button>
          <ul class="mobile-submenu" :class="{ open: isActive(menuItem.id) }">
            <li v-for="subItem in menuItem.children"><a :href="subItem.link" data-i18n="tool3n">{{ subItem.icon }} {{ subItem.text }}</a></li>
          </ul>
        </template>
        <a v-else :href="menuItem.link" data-i18n="nav_blog">{{ menuItem.text }}</a>
      </li>
    </ul>

    <div class="mobile-bottom">
      <div class="mobile-lang">
        <button class="mobile-lang-btn" :class="{active: locale === 'en'}" @click="changeLanguage('en')">EN — English</button>
        <button class="mobile-lang-btn" :class="{active: locale === 'ru'}" @click="changeLanguage('ru')">RU — Русский</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lang-switcher{display:flex;align-items:center;border:1px solid var(--border);border-radius:6px;overflow:hidden;flex-shrink:0}
.lang-btn{background:none;border:none;cursor:pointer;padding:6px 11px;font-family:var(--serif);font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--muted);transition:background .15s,color .15s;line-height:1}
.lang-btn:hover{background:var(--cream);color:var(--ink)}
.lang-btn.active{background:var(--ink);color:var(--paper)}
.lang-divider{width:1px;height:20px;background:var(--border);flex-shrink:0}
/* ══════════════════════════════════════════
   TOP NAV  — multi-level with dropdowns
══════════════════════════════════════════ */
.topnav{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 300;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  padding: 0 32px;
  background: rgba(247, 244, 238, .90);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  gap: 0;
}

/* logo */
.nav-logo{
  display:flex;align-items:center;gap:9px;
  text-decoration:none;color:var(--ink);
  flex-shrink:0;margin-right:8px;
}
.nav-logo-mark{width:32px;height:32px;flex-shrink:0}
.nav-logo-name{font-family:var(--serif);font-size:16px;font-weight:700;white-space:nowrap}

/* primary link list */
.nav-menu{
  display:flex;align-items:stretch;list-style:none;
  height:100%;margin-left:8px;flex:1;justify-content: center;
}

/* top-level item */
.nav-menu > li{
  position:relative;
  display:flex;align-items:center;
}

.nav-menu > li > a,
.nav-menu > li > button{
  display:flex;align-items:center;gap:4px;
  padding:0 14px;height:100%;
  font-size:13px;font-weight:600;color:var(--muted);
  text-decoration:none;background:none;border:none;cursor:pointer;
  font-family:var(--sans);letter-spacing:.01em;
  white-space:nowrap;
  transition:color .15s,background .15s;
  border-bottom:2px solid transparent;
}
.nav-menu > li > a:hover,
.nav-menu > li > button:hover{color:var(--ink);background:rgba(15,14,12,.04)}
.nav-menu > li > a.active,
.nav-menu > li.open > button{color:var(--ink);border-bottom-color:var(--accent)}

/* chevron icon */
.nav-chevron{width:12px;height:12px;flex-shrink:0;transition:transform .2s;stroke:currentColor}
.nav-menu > li.open .nav-chevron{transform:rotate(180deg)}

/* ── dropdown panel ── */
.nav-dropdown{
  position:absolute;top:calc(100% + 1px);left:0;
  min-width:220px;
  background:rgba(247,244,238,.97);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
  border:1px solid var(--border);
  border-radius:0 0 10px 10px;
  box-shadow:0 8px 32px rgba(15,14,12,.12);
  padding:8px 0;
  opacity:0;pointer-events:none;
  transform:translateY(-6px);
  transition:opacity .18s ease,transform .18s ease;
  z-index:400;
}
.nav-menu > li.open .nav-dropdown{opacity:1;pointer-events:all;transform:translateY(0)}

.nav-dropdown a{
  display:flex;align-items:center;gap:10px;
  padding:9px 18px;
  font-size:13px;font-weight:500;color:var(--muted);
  text-decoration:none;
  transition:color .12s,background .12s;
}
.nav-dropdown a:hover{color:var(--ink);background:var(--cream)}
.nav-dropdown a .dd-icon{font-size:15px;width:20px;text-align:center;flex-shrink:0}
.nav-dropdown a .dd-label{flex:1}
.nav-dropdown a .dd-badge{
  font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--accent-light);color:var(--accent);
  padding:2px 6px;border-radius:4px;
}
.nav-dropdown-divider{height:1px;background:var(--border);margin:6px 0}
/* ── hamburger (mobile only) ── */
.nav-hamburger{
  display:none;
  background:none;border:1px solid var(--border);
  border-radius:6px;padding:7px 9px;cursor:pointer;
  flex-direction:column;gap:4px;margin-left:auto;
}
.nav-hamburger span{display:block;width:18px;height:2px;background:var(--ink);border-radius:1px;transition:transform .2s,opacity .2s}
.nav-hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg) }
.nav-hamburger.open span:nth-child(2) { opacity: 0 }
.nav-hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg) }
/* mobile drawer */
.mobile-drawer{
  display:none;
  position:fixed;top:var(--nav-h);left:0;right:0;bottom:0;
  z-index:250;overflow-y:auto;
  background:var(--paper);
  border-top:1px solid var(--border);
  transform:translateX(-100%);
  transition:transform .28s cubic-bezier(.4,0,.2,1);
}
.mobile-drawer.open{transform:translateX(0)}

.mobile-nav-links{list-style:none;padding:16px 0}
.mobile-nav-links > li > a,
.mobile-nav-links > li > button{
  display:flex;align-items:center;justify-content:space-between;
  width:100%;padding:13px 24px;
  font-size:15px;font-weight:600;color:var(--ink);
  text-decoration:none;background:none;border:none;cursor:pointer;
  font-family:var(--sans);text-align:left;
  border-bottom:1px solid var(--border);
}
.mobile-nav-links > li > a:hover,
.mobile-nav-links > li > button:hover{background:var(--cream)}
.mobile-nav-links .open svg { transform:rotate(180deg) }

.mobile-submenu{
  list-style:none;
  max-height:0;overflow:hidden;
  transition:max-height .25s ease;
  background:var(--cream);
}
.mobile-submenu.open{max-height:400px}
.mobile-submenu a{
  display:flex;align-items:center;gap:10px;
  padding:11px 24px 11px 40px;
  font-size:14px;color:var(--muted);text-decoration:none;
  border-bottom:1px solid var(--border);
}
.mobile-submenu a:hover{color:var(--ink);background:rgba(15,14,12,.04)}

.mobile-bottom{padding:20px 24px;display:flex;flex-direction:column;gap:12px}
.mobile-lang{display:flex;gap:8px}
.mobile-lang-btn{
  flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;
  background:none;cursor:pointer;font-family:var(--serif);font-size:13px;font-weight:700;
  color:var(--muted);transition:background .15s,color .15s,border-color .15s;
}
.mobile-lang-btn.active{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.mobile-cta{
  display:block;text-align:center;padding:14px;
  background:var(--accent);color:#fff;border-radius:8px;
  text-decoration:none;font-weight:700;font-size:15px;
}
/* ── Mobile: hide sidebar + desktop nav, show hamburger ── */
@media(max-width:720px){
  .nav-menu{display:none}
  .lang-switcher{display:none}
  .nav-hamburger{display:flex}
  .mobile-drawer{display:block}
}
</style>