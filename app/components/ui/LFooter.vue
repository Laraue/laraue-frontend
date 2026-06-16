<script setup lang="ts">
  const { t } = useI18n()
  const localePath = useLocalePath()
</script>

<i18n lang="json">
{
  "en": {
    "footer_tag": "Small team. Serious craft. Software built to last.",
    "footer_products": "Products",
    "footer_company": "Company",
    "footer_blog": "Blog",
    "footer_contact": "Contact",
    "footer_made": "Built with care, shipped with purpose.",
    "tool1n": "Markdown to HTML Converter",
    "tool2n_short": "AI Apartments",
    "tool3n": "Vocabulary Bot",
    "nav_about": "About"
  },
  "ru": {
    "footer_tag": "Небольшая команда. Серьёзный подход. Работаем на результат.",
    "footer_products": "Продукты",
    "footer_company": "Компания",
    "footer_blog": "Блог",
    "footer_contact": "Контакты",
    "footer_made": "Сделано с заботой, выпущено с умом.",
    "tool1n": "Конвертер Markdown → HTML",
    "tool2n_short": "AI Квартиры",
    "tool3n": "Бот-словарь",
    "nav_about": "О нас"
  }
}
</i18n>

<template>
  <!-- FOOTER -->
  <footer>
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="/" class="footer-logo" aria-label="Laraue Software">
            <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <rect width="34" height="34" rx="8" fill="rgba(255,255,255,0.1)"/>
              <path d="M10 8 L10 24 L22 24" stroke="#f7f4ee" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="25" cy="10" r="2.5" fill="#c84b2f"/>
            </svg>
            <span style="font-family:var(--serif);font-size:16px;font-weight:700;color:var(--paper)">Laraue Software</span>
          </a>
          <p class="footer-tagline">{{ t('footer_tag') }}</p>
        </div>
        <div>
          <div class="footer-col-title">Products</div>
          <ul class="footer-col-links">
            <li><a :href="localePath('boards')">Laraue Boards</a></li>
            <li><a :href="localePath('markdown-converter')">{{ t('tool1n') }}</a></li>
            <li><a :href="localePath('crawled-apartments')">{{ t('tool2n_short') }}</a></li>
            <li><a :href="localePath('learn-language-bot')">{{ t('tool3n') }}</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">{{ t('footer_company') }}</div>
          <ul class="footer-col-links">
            <li><a :href="localePath('blog')">{{ t('footer_blog') }}</a></li>
            <li><a rel="nofollow" target="_blank" href="https://github.com/win7user10">GitHub</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Contact</div>
          <ul class="footer-col-links">
            <li><a rel="nofollow" target="_blank" href="https://t.me/win7user10">Telegram @win7user10</a></li>
            <li><a rel="nofollow" target="_blank" href="https://github.com/win7user10">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Laraue Software.</span>
        <span>{{ t('footer_made') }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* FOOTER */
footer{background:var(--ink);color:rgba(247,244,238,.65);padding:60px 48px 40px;}
.footer-inner{max-width:1160px;margin:0 auto}
.footer-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;gap:40px;flex-wrap:wrap}
.footer-brand .footer-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--paper);margin-bottom:16px}
.footer-tagline{font-size:13px;color:rgba(247,244,238,.45);max-width:240px;line-height:1.6}
.footer-col-title{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(247,244,238,.4);margin-bottom:16px}
.footer-col-links{list-style:none;display:flex;flex-direction:column;gap:10px}
.footer-col-links a{text-decoration:none;font-size:14px;color:rgba(247,244,238,.6);transition:color .2s}
.footer-col-links a:hover{color:var(--paper)}
.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(247,244,238,.3);flex-wrap:wrap;gap:12px}

/* RESPONSIVE */
@media(max-width:720px){
  footer{padding:40px 22px}
  .footer-top{flex-direction:column;gap:28px}
}

</style>