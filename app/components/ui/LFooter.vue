<script setup lang="ts">
  const { t } = useI18n()
  const localePath = useLocalePath()
  const boardsUrl = useBoardsUrl()
</script>

<i18n lang="json">
{
  "en": {
    "footer_tag": "Small team. Serious craft.",
    "footer_products": "Products",
    "footer_company": "Company",
    "footer_blog": "Blog",
    "footer_contact": "Contact",
    "tool1n": "Markdown to HTML Converter",
    "tool2n_short": "AI Apartments",
    "tool3n": "Vocabulary Bot",
    "nav_about": "About",
    "footer_privacy": "Privacy policy"
  },
  "ru": {
    "footer_tag": "Небольшая команда. Серьёзный подход.",
    "footer_products": "Продукты",
    "footer_company": "Компания",
    "footer_blog": "Блог",
    "footer_contact": "Контакты",
    "tool1n": "Конвертер Markdown → HTML",
    "tool2n_short": "AI Квартиры",
    "tool3n": "Бот-словарь",
    "nav_about": "О нас",
    "footer_privacy": "Политика конфиденциальности"
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
            <img src="https://laraue.com/static/images/icons/laraue-android-chrome-black-192x192.png" alt="" width="30" height="30" style="border-radius:8px">
            <span style="font-family:var(--serif);font-size:16px;font-weight:700;color:var(--color-text)">Laraue Software</span>
          </a>
          <p class="footer-tagline">{{ t('footer_tag') }}</p>
        </div>
        <div>
          <div class="footer-col-title">Products</div>
          <ul class="footer-col-links">
            <li><a :href="boardsUrl">Laraue Boards</a></li>
            <li><a :href="localePath('markdown-converter')">{{ t('tool1n') }}</a></li>
            <li><a :href="localePath('crawled-apartments')">{{ t('tool2n_short') }}</a></li>
            <li><a :href="localePath('learn-language-bot')">{{ t('tool3n') }}</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">{{ t('footer_company') }}</div>
          <ul class="footer-col-links">
            <li><a :href="localePath('blog')">{{ t('footer_blog') }}</a></li>
            <li><a rel="nofollow" target="_blank" href="https://github.com/Laraue">GitHub</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Contact</div>
          <ul class="footer-col-links">
            <li><a rel="nofollow" target="_blank" href="https://t.me/win7user10">Telegram @win7user10</a></li>
            <li><a rel="nofollow" target="_blank" href="https://github.com/Laraue">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Laraue Software.</span>
        <a :href="localePath('privacy')" class="footer-legal-link">{{ t('footer_privacy') }}</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* FOOTER */
footer{background:var(--color-workspace);border-top:1px solid var(--color-divider);color:var(--color-muted);padding:60px 48px 40px;}
.footer-inner{max-width:1160px;margin:0 auto}
.footer-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;gap:40px;flex-wrap:wrap}
.footer-brand .footer-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--color-text);margin-bottom:16px}
.footer-tagline{font-size:13px;color:var(--color-muted);max-width:240px;line-height:1.6}
.footer-col-title{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--color-muted);margin-bottom:16px}
.footer-col-links{list-style:none;display:flex;flex-direction:column;gap:10px}
.footer-col-links a{text-decoration:none;font-size:14px;color:var(--color-muted);transition:color .2s}
.footer-col-links a:hover{color:var(--color-text)}
.footer-legal-link{color:var(--color-muted);text-decoration:none;transition:color .2s}
.footer-legal-link:hover{color:var(--color-text)}
.footer-bottom{border-top:1px solid var(--color-divider);padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--color-muted);flex-wrap:wrap;gap:12px}

/* RESPONSIVE */
@media(max-width:720px){
  footer{padding:40px 22px}
  .footer-top{flex-direction:column;gap:28px}
}

</style>