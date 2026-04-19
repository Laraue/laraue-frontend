<script setup lang="ts">

import LMainContent from "~/components/ui/LMainContent.vue";

const { setLocale, t } = useI18n()
const localPath = useLocalePath();

useSeoMeta({
  title: computed(() => t('seo_title')),
  ogTitle: computed(() => t('seo_title')),
  description: computed(() => t('seo_description')),
  ogType: "website",
})

</script>

<i18n lang="json">
{
  "en": {
    "seo_title": "Laraue Software — Focused Tools for Productive People",
    "seo_description": "Laraue Software builds reliable, privacy-first tools for people who work with information. Try Laraue Boards — turn Telegram messages into a visual Kanban board in seconds.",
    "hero_eyebrow": "Laraue Software",
    "hero_title_1": "Software built",
    "hero_title_2": "with",
    "hero_title_3": "purpose",
    "hero_title_4": "not noise.",
    "hero_sub": "We build focused, reliable tools for people who work with information. Small team, long-term thinking, honest software.",
    "hero_cta1": "Try Laraue Boards →",
    "hero_cta2": "Learn about us",
    "card_tag": "Featured product",
    "card_desc": "Turn Telegram messages into a visual Kanban board — in seconds.",
    "k_todo": "To Do",
    "k_doing": "Doing",
    "k_done": "Done",
    "k1": "Q4 Report",
    "k2": "Team call",
    "k3": "Research doc",
    "k4": "Logo brief",
    "trust1": "No data sold, ever",
    "trust2": "Open-source roots",
    "trust3": "Direct founder support",
    "trust4": "Free tier — no credit card",
    "trust5": "Transparent team & roadmap",
    "about_label": "Who we are",
    "about_title_1": "A small team.",
    "about_title_2": "A serious craft.",
    "about_p1": "is a focused software company dedicated to building tools that actually solve problems. We don't chase hype — we build software we'd use ourselves.",
    "about_p2": "Our background is in",
    "about_p3": "open-source development",
    "about_p4": "and reusable library design. That mindset — clean APIs, predictable behavior, long-term maintainability — carries through everything we ship.",
    "v1t": "Built to last",
    "v1d": "No quick hacks. We design for longevity and reliability from day one.",
    "v2t": "Honest pricing",
    "v2d": "Simple tiers, no dark patterns. You always know what you're paying for.",
    "v3t": "Transparent",
    "v3d": "We're open about who we are, how we store data, and how products work.",
    "v4t": "User-first",
    "v4d": "Features are driven by real user feedback, not growth metrics.",
    "stat1": "Live products used daily",
    "stat2": "Open-source library roots on GitHub",
    "stat3": "Required to get started — always",
    "prod_label": "Flagship product",
    "prod_sub": "Stop losing important messages in Telegram chat history. Forward once, organize visually on a Kanban board — from any chat.",
    "f1t": "Forward any message",
    "f1d": "Works with links, text, tasks, ideas — from any Telegram chat or group.",
    "f2t": "Visual Kanban board",
    "f2d": "Three-column boards with drag-and-drop. Clean, fast, built inside Telegram as a mini app.",
    "f3t": "AI auto-categorization",
    "f3d": "Premium: Let AI suggest the right type and status. One tap to confirm.",
    "f4t": "Instant search",
    "f4d": "Find anything by keyword. Filter by type, status, or date — instantly.",
    "f5t": "Mobile-first",
    "f5d": "Optimized for thumbs. Smooth and responsive on both iOS and Android.",
    "f6t": "Free to start",
    "f6d": "No credit card, no friction. Start free and upgrade only when you need more.",
    "prod_cta1": "Open",
    "prod_cta2": "See full product page",
    "tools_label": "More tools",
    "tools_title": "The full toolkit",
    "tool1n": "Markdown to HTML Converter",
    "tool1d": "Convert Markdown files to clean, styled HTML with a single upload. Fast and dependency-free.",
    "tool2n": "AI Apartments Aggregator",
    "tool2d": "An AI-powered tool that aggregates and surfaces apartment listings from across the web.",
    "tool2n_short": "AI Apartments",
    "tool3n": "Vocabulary Bot",
    "tool3d": "A Telegram bot for learning new vocabulary — smart repetition, daily prompts, no app required.",
    "tool4n": "PDF to JSON Converter",
    "tool4d": "Extract structured data from PDFs into clean JSON. Built for developers and data pipelines.",
    "tool5n": "Markdown AI Translator",
    "tool5d": "Translate Markdown documents with AI while preserving all formatting and structure.",
    "tool6n": "Open-Source Libraries",
    "tool6d": "All reusable libraries from our stack are open-sourced on GitHub. Free for everyone.",
    "try_it": "Try it →",
    "view_github": "View GitHub →",
    "trust_label": "Our commitment",
    "trust_title_1": "You should know",
    "trust_title_2": "who handles your data.",
    "p1t": "Your data stays yours",
    "p1d": "We never sell, broker, or share user data with third parties. Period.",
    "p2t": "No hidden tracking",
    "p2d": "We collect only what's necessary to run the product — nothing more.",
    "p3t": "Direct access to the founder",
    "p3d": "Questions or concerns? Reach the person who built it — not a support bot.",
    "p4t": "Honest free tier",
    "p4d": "The free plan is real and always will be. We grow when you find genuine value.",
    "fc_name": "Laraue Software",
    "fc_role": "Independent Software Studio",
    "fc_bio": "We're an indie development organization focused on building reusable libraries and purposeful tools. Driven by a passion for clean, efficient software — and the belief that small teams can ship things that matter."
  },
  "ru": {
    "seo_title": "Laraue Software — Приложения и билиотеки для увеличения продуктивности",
    "seo_description": "Laraue Software создаёт узкоспециализированные, надёжные инструменты. Попробуйте Laraue Boards — превратите сообщения Telegram в Kanban доски за секунды.",
    "hero_eyebrow": "Laraue Software",
    "hero_title_1": "ПО, созданное",
    "hero_title_2": "с",
    "hero_title_3": "целью",
    "hero_title_4": "а не для галочки",
    "hero_sub": "Мы создаём узкоспециализированные, надёжные инструменты. Небольшая команда, долгосрочные планы, честный софт.",
    "hero_cta1": "Попробовать Laraue Boards →",
    "hero_cta2": "О компании",
    "card_tag": "Главный продукт",
    "card_desc": "Превращайте сообщения Telegram в Kanban-доску — за секунды.",
    "k_todo": "Сделать",
    "k_doing": "В работе",
    "k_done": "Готово",
    "k1": "Отчёт Q4",
    "k2": "Созвон",
    "k3": "Исследование",
    "k4": "Логотип",
    "trust1": "Бережно относимся к данным",
    "trust2": "Контрибьютим в Open-source",
    "trust3": "Прямая связь с основателем",
    "trust4": "Бесплатные тарифы",
    "trust5": "Прозрачные процессы",
    "about_label": "Кто мы",
    "about_title_1": "Небольшая команда.",
    "about_title_2": "Серьёзный подход.",
    "about_p1": "- компания, создающая инструменты, которые решают реальные задачи. Мы не гонимся за хайпом — мы строим то, чем пользуемся сами.",
    "about_p2": "Наш бэкграунд -",
    "about_p3": "open-source разработка",
    "about_p4": "и проектирование переиспользуемых библиотек. Наш подход — чистые API, предсказуемое поведение, долгосрочная поддержка — во всем, что мы выпускаем.",
    "v1t": "Надежно",
    "v1d": "Никаких костылей. Мы проектируем ПО с прицелом на надёжность с первого дня.",
    "v2t": "Честные цены",
    "v2d": "Понятные тарифы, без непонятных списаний. Вы знаете, за что платите.",
    "v3t": "Прозрачность",
    "v3d": "Открыто рассказываем о хранении данных и о работе продуктов.",
    "v4t": "Ценим пользователей",
    "v4d": "Функции появляются из реальной обратной связи, а не из метрик.",
    "stat1": "Живых продуктов используется ежедневно",
    "stat2": "Open-source библиотек на GitHub",
    "stat3": "Стартовая цена любого продукта",
    "prod_label": "Флагманский продукт",
    "prod_sub": "Превратите свои и командные чаты в Telegram в настоящие Kanban-доски. Получите полноценный Agile, не выходя из любимого мессенджера.",
    "f1t": "Пересылайте сообщения",
    "f1d": "Ссылки, текст, задачи, идеи — из любого чата Telegram.",
    "f2t": "Визуальная Kanban-доска",
    "f2d": "Колонки с drag-and-drop. Встроено в Telegram как мини-приложение.",
    "f3t": "AI-категоризация",
    "f3d": "Premium: ИИ предложит тип и статус, исходя из содержания. Одно нажатие для подтверждения.",
    "f4t": "Мгновенный поиск",
    "f4d": "Найдите что угодно по ключевому слову. Пользовательские аттрибуты и фильтры.",
    "f5t": "Mobile-first",
    "f5d": "Оптимизировано для работы с телефона. Плавная работа на iOS и Android.",
    "f6t": "Бесплатный старт",
    "f6d": "Без привязки карты. Платите, только когда это действительно нужно.",
    "prod_cta1": "Открыть",
    "prod_cta2": "Страница продукта",
    "tools_label": "Другие инструменты",
    "tools_title": "Полный набор",
    "tool1n": "Конвертер Markdown → HTML",
    "tool1d": "Конвертируйте Markdown в HTML одним кликом. Никаких зависимостей.",
    "tool2n": "AI-агрегатор квартир",
    "tool2d": "ИИ-инструмент, собирающий объявления об продаже квартир со всего интернета.",
    "tool2n_short": "AI Квартиры",
    "tool3n": "Бот-словарь",
    "tool3d": "Telegram-бот для изучения новых слов — умное повторение, ежедневные напоминания.",
    "tool4n": "PDF в JSON",
    "tool4d": "Извлекайте данные из PDF в формате JSON. Для разработчиков и пайплайнов.",
    "tool5n": "AI-переводчик Markdown",
    "tool5d": "Переводите Markdown-документы с ИИ, сохраняя форматирование и структуру.",
    "tool6n": "Open-Source библиотеки",
    "tool6d": "Все библиотеки из нашего стека опубликованы на GitHub. Бесплатно.",
    "try_it": "Попробовать →",
    "view_github": "Открыть GitHub →",
    "trust_label": "Наши обязательства",
    "trust_title_1": "Вы должны знать",
    "trust_title_2": "кто обрабатывает ваши данные.",
    "p1t": "Ваши данные — ваши",
    "p1d": "Мы никогда не продаём и не передаём данные третьим лицам. Точка.",
    "p2t": "Никакой скрытой слежки",
    "p2d": "Собираем только то, что нужно для работы продукта — и ничего лишнего.",
    "p3t": "Прямой доступ к основателю",
    "p3d": "Вопросы? Напишите человеку, который это построил — а не чат-боту.",
    "p4t": "Честный бесплатный тариф",
    "p4d": "Бесплатный план действительно бесплатный и таким останется. Мы растём вместе с вашей ценностью.",
    "fc_name": "Laraue Software",
    "fc_role": "Независимая студия разработки",
    "fc_bio": "Инди-организация, создающая переиспользуемые библиотеки и продуманные инструменты. Нас движет страсть к чистому коду — и вера в то, что небольшие команды делают вещи, которые имеют значение."
  }
}
</i18n>

<template>
  <LMainContent>
    <!-- HERO -->
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-grid-bg" aria-hidden="true"></div>
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-eyebrow">{{ t('hero_eyebrow') }}</div>
          <h1 class="hero-title" id="hero-heading">{{ t('hero_title_1') }}<br/>{{ t('hero_title_2') }} <em> {{ t('hero_title_3') }} </em>, <br>{{ t('hero_title_4') }}</h1>
          <p class="hero-sub">{{ t('hero_sub') }}</p>
          <div class="hero-actions">

            <a :href="localPath('msgboard')" class="btn-primary">{{ t('hero_cta1') }}</a>
            <a href="#about" class="btn-secondary">{{ t('hero_cta2') }}</a>
          </div>
        </div>
        <div class="hero-visual" aria-label="Laraue Boards product preview">
          <div class="product-card">
            <div class="product-card-header">
              <div class="product-card-dots"><span></span><span></span><span></span></div>
              <span class="product-card-title-bar">Laraue Boards — My Board</span>
            </div>
            <div class="product-card-body">
              <span class="product-tag">{{ t('card_tag') }}</span>
              <div class="product-card-name">Laraue Boards</div>
              <div class="product-card-desc">{{ t('card_desc') }}</div>
              <div class="kanban-mini">
                <div class="kanban-col">
                  <div class="kanban-col-label" data-i18n="k_todo">To Do</div>
                  <div class="kanban-item accent-border" data-i18n="k1">Q4 Report</div>
                  <div class="kanban-item accent-border" data-i18n="k2">Team call</div>
                </div>
                <div class="kanban-col">
                  <div class="kanban-col-label" data-i18n="k_doing">Doing</div>
                  <div class="kanban-item blue-border" data-i18n="k3">Research doc</div>
                </div>
                <div class="kanban-col">
                  <div class="kanban-col-label" data-i18n="k_done">Done</div>
                  <div class="kanban-item green-border" data-i18n="k4">Logo brief</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TRUST BAR -->
    <div class="trust-bar" aria-label="Trust indicators">
      <div class="trust-item"><div class="trust-icon" aria-hidden="true">🔒</div><span data-i18n="trust1">{{ t('trust1') }}</span></div>
      <div class="trust-item"><div class="trust-icon" aria-hidden="true">🛠️</div><span data-i18n="trust2">{{ t('trust2') }}</span></div>
      <div class="trust-item"><div class="trust-icon" aria-hidden="true">💬</div><span data-i18n="trust3">{{ t('trust3') }}</span></div>
      <div class="trust-item"><div class="trust-icon" aria-hidden="true">🆓</div><span data-i18n="trust4">{{ t('trust4') }}</span></div>
      <div class="trust-item"><div class="trust-icon" aria-hidden="true">📍</div><span data-i18n="trust5">{{ t('trust5') }}</span></div>
    </div>

    <!-- ABOUT -->
    <section id="about" aria-labelledby="about-heading">
      <div class="section">
        <div class="about-grid">
          <div class="about-text">
            <div class="section-label reveal" data-i18n="about_label">{{ t('about_label') }}</div>
            <h2 class="section-title reveal" id="about-heading">{{ t('about_title_1') }}<br>{{ t('about_title_2') }}</h2>
            <p class="reveal" data-i18n="about_p1"><strong>Laraue Software</strong> {{ t('about_p1') }}</p>
            <p class="reveal" data-i18n="about_p2">{{ t('about_p2') }} <strong>{{ t('about_p3') }}</strong> {{ t('about_p4') }}</p>
            <div class="about-values reveal">
              <div class="value-card"><div class="value-card-icon">⚙️</div><div class="value-card-title" data-i18n="v1t">{{ t('v1t') }}</div><div class="value-card-text" data-i18n="v1d">{{ t('v1d') }}</div></div>
              <div class="value-card"><div class="value-card-icon">🤝</div><div class="value-card-title" data-i18n="v2t">{{ t('v2t') }}</div><div class="value-card-text" data-i18n="v2d">{{ t('v2d') }}</div></div>
              <div class="value-card"><div class="value-card-icon">🔍</div><div class="value-card-title" data-i18n="v3t">{{ t('v3t') }}</div><div class="value-card-text" data-i18n="v3d">{{ t('v3d') }}</div></div>
              <div class="value-card"><div class="value-card-icon">🌱</div><div class="value-card-title" data-i18n="v4t">{{ t('v4t') }}</div><div class="value-card-text" data-i18n="v4d">{{ t('v4d') }}</div></div>
            </div>
          </div>
          <div class="about-stats reveal">
            <div class="stat-card"><div class="stat-num">4+</div><div class="stat-label" data-i18n="stat1">{{ t('stat1') }}</div></div>
            <div class="stat-card"><div class="stat-num">100%</div><div class="stat-label" data-i18n="stat2">{{ t('stat2') }}</div></div>
            <div class="stat-card"><div class="stat-num">$0</div><div class="stat-label" data-i18n="stat3">{{ t('stat3') }}</div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED PRODUCT -->
    <section class="product-section" id="products" aria-labelledby="product-heading">
      <div class="product-section-inner">
        <div class="section-label reveal" data-i18n="prod_label">{{ t('prod_label') }}</div>
        <h2 class="section-title reveal" id="product-heading">Laraue Boards</h2>
        <p class="product-section-sub reveal" data-i18n="prod_sub">{{ t('prod_sub') }}</p>
        <div class="features-grid reveal">
          <div class="feature-cell"><div class="feature-cell-icon">📨</div><div class="feature-cell-title" data-i18n="f1t">{{ t('f1t') }}</div><div class="feature-cell-text" data-i18n="f1d">{{ t('f1d') }}</div></div>
          <div class="feature-cell"><div class="feature-cell-icon">🗂️</div><div class="feature-cell-title" data-i18n="f2t">{{ t('f2t') }}</div><div class="feature-cell-text" data-i18n="f2d">{{ t('f2d') }}</div></div>
          <div class="feature-cell"><div class="feature-cell-icon">✨</div><div class="feature-cell-title" data-i18n="f3t">{{ t('f3t') }}</div><div class="feature-cell-text" data-i18n="f3d">{{ t('f3d') }}</div></div>
          <div class="feature-cell"><div class="feature-cell-icon">🔍</div><div class="feature-cell-title" data-i18n="f4t">{{ t('f4t') }}</div><div class="feature-cell-text" data-i18n="f4d">{{ t('f4d') }}</div></div>
          <div class="feature-cell"><div class="feature-cell-icon">📱</div><div class="feature-cell-title" data-i18n="f5t">{{ t('f5t') }}</div><div class="feature-cell-text" data-i18n="f5d">{{ t('f5d') }}</div></div>
          <div class="feature-cell"><div class="feature-cell-icon">💸</div><div class="feature-cell-title" data-i18n="f6t">{{ t('f6t') }}</div><div class="feature-cell-text" data-i18n="f6d">{{ t('f6d') }}</div></div>
        </div>
        <div class="product-cta-row reveal">
          <a rel="nofollow" target="_blank" href="https://t.me/msgboard_bot" class="btn-primary">{{ t('prod_cta1') }} @msgboard_bot →</a>
          <a rel="nofollow" target="_blank" href="https://laraue.com/msgboard" class="btn-ghost">{{ t('prod_cta2') }}</a>
        </div>
      </div>
    </section>

    <!-- TOOLS -->
    <section class="tools-section" id="tools" aria-labelledby="tools-heading">
      <div class="section-label reveal" data-i18n="tools_label">{{ t('tools_label') }}</div>
      <h2 class="section-title reveal" id="tools-heading" data-i18n="tools_title">{{ t('tools_title') }}</h2>
      <div class="tools-grid">

        <a :href="localPath('markdown-converter')" class="tool-card reveal">
          <div class="tool-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" fill="#1a1a2e"/>
              <rect x="8" y="11" width="18" height="3" rx="1.5" fill="#6c8ebf"/>
              <rect x="8" y="17" width="32" height="2" rx="1" fill="#4a6fa5" opacity=".7"/>
              <rect x="8" y="22" width="28" height="2" rx="1" fill="#4a6fa5" opacity=".5"/>
              <rect x="8" y="27" width="22" height="2" rx="1" fill="#4a6fa5" opacity=".35"/>
              <path d="M30 34 L38 34 L34 28 Z" fill="#e0572e"/>
              <rect x="36" y="31" width="2" height="8" rx="1" fill="#e0572e"/>
            </svg>
          </div>
          <div class="tool-card-name" data-i18n="tool1n">{{ t('tool1n') }}</div>
          <div class="tool-card-desc" data-i18n="tool1d">{{ t('tool1d') }}</div>
          <div class="tool-card-arrow" data-i18n="try_it">{{ t('try_it') }}</div>
        </a>

        <a :href="localPath('crawled-apartments')" class="tool-card reveal">
          <div class="tool-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" fill="#1c2b1e"/>
              <rect x="10" y="22" width="12" height="16" rx="2" fill="#3a7d44"/>
              <rect x="26" y="16" width="12" height="22" rx="2" fill="#4a9b56"/>
              <rect x="13" y="26" width="4" height="5" rx="1" fill="#1c2b1e"/>
              <rect x="29" y="20" width="4" height="5" rx="1" fill="#1c2b1e"/>
              <rect x="29" y="28" width="4" height="4" rx="1" fill="#1c2b1e"/>
              <path d="M6 38 H42" stroke="#3a7d44" stroke-width="2" stroke-linecap="round"/>
              <circle cx="36" cy="12" r="4" fill="#e0572e" opacity=".9"/>
              <path d="M36 10v4M34 12h4" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="tool-card-name" data-i18n="tool2n">{{ t('tool2n') }}</div>
          <div class="tool-card-desc" data-i18n="tool2d">{{ t('tool2d') }}</div>
          <div class="tool-card-arrow" data-i18n="try_it">{{ t('try_it') }}</div>
        </a>

        <a :href="localPath('learn-language-bot')" class="tool-card reveal">
          <div class="tool-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" fill="#1a1a2e"/>
              <rect x="8" y="14" width="22" height="14" rx="4" fill="#229ed9"/>
              <path d="M8 32 L14 28 H8 Z" fill="#229ed9"/>
              <circle cx="14" cy="21" r="2" fill="#fff"/>
              <circle cx="19" cy="21" r="2" fill="#fff"/>
              <circle cx="24" cy="21" r="2" fill="#fff"/>
              <path d="M30 20 Q38 20 38 27 Q38 32 32 33 L34 36 L28 33 Q24 32 24 27" stroke="#4a9b56" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="tool-card-name" data-i18n="tool3n">{{ t('tool3n') }}</div>
          <div class="tool-card-desc" data-i18n="tool3d">{{ t('tool3d') }}</div>
          <div class="tool-card-arrow" data-i18n="try_it">{{ t('try_it') }}</div>
        </a>

        <a :href="localPath('pdf-extractor')" class="tool-card reveal">
          <div class="tool-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" fill="#2b1a1a"/>
              <rect x="12" y="8" width="20" height="28" rx="3" fill="#4a2020"/>
              <path d="M28 8 L32 12 L28 12 Z" fill="#2b1a1a"/>
              <rect x="28" y="8" width="4" height="4" rx="1" fill="#6b3030"/>
              <rect x="16" y="18" width="12" height="2" rx="1" fill="#e0572e" opacity=".8"/>
              <rect x="16" y="22" width="10" height="2" rx="1" fill="#e0572e" opacity=".5"/>
              <rect x="16" y="26" width="8" height="2" rx="1" fill="#e0572e" opacity=".3"/>
              <path d="M28 30 L36 38" stroke="#f7f4ee" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="27" cy="29" r="5" stroke="#f7f4ee" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="tool-card-name" data-i18n="tool4n">{{ t('tool4n') }}</div>
          <div class="tool-card-desc" data-i18n="tool4d">{{ t('tool4d') }}</div>
          <div class="tool-card-arrow" data-i18n="try_it">{{ t('try_it') }}</div>
        </a>

        <a :href="localPath('markdown-translator')" class="tool-card reveal">
          <div class="tool-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" fill="#1a1f2b"/>
              <circle cx="18" cy="24" r="8" stroke="#4a7fcc" stroke-width="2" fill="none"/>
              <path d="M18 16 Q22 24 18 32" stroke="#4a7fcc" stroke-width="1.5" fill="none"/>
              <path d="M10 24 H26" stroke="#4a7fcc" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M28 18 L40 18" stroke="#e0572e" stroke-width="2" stroke-linecap="round"/>
              <path d="M28 24 L40 24" stroke="#e0572e" stroke-width="2" stroke-linecap="round"/>
              <path d="M28 30 L36 30" stroke="#e0572e" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="tool-card-name" data-i18n="tool5n">{{ t('tool5n') }}</div>
          <div class="tool-card-desc" data-i18n="tool5d">{{ t('tool5d') }}.</div>
          <div class="tool-card-arrow" data-i18n="try_it">{{ t('try_it') }}</div>
        </a>

        <a rel="nofollow" target="_blank" href="https://github.com/win7user10" class="tool-card reveal" style="background:var(--cream)">
          <div class="tool-logo" style="background:#f7f4ee">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" fill="#f7f4ee"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M24 8C15.163 8 8 15.163 8 24c0 7.073 4.584 13.07 10.944 15.19.8.148 1.092-.347 1.092-.77 0-.38-.014-1.386-.021-2.72-4.449.966-5.389-2.144-5.389-2.144-.727-1.847-1.775-2.338-1.775-2.338-1.451-.993.11-.973.11-.973 1.604.113 2.449 1.647 2.449 1.647 1.426 2.444 3.741 1.737 4.653 1.328.145-1.033.558-1.737 1.015-2.136-3.553-.404-7.288-1.776-7.288-7.904 0-1.746.623-3.172 1.645-4.29-.165-.406-.713-2.031.157-4.234 0 0 1.341-.43 4.396 1.638A15.3 15.3 0 0124 14.01c1.36.007 2.729.183 4.008.538 3.053-2.067 4.392-1.638 4.392-1.638.872 2.203.324 3.828.159 4.234 1.024 1.118 1.643 2.544 1.643 4.29 0 6.143-3.741 7.495-7.304 7.89.575.494 1.086 1.47 1.086 2.963 0 2.139-.02 3.862-.02 4.387 0 .428.288.928 1.1.77C35.42 37.066 40 31.072 40 24c0-8.837-7.163-16-16-16z" fill="#0f0e0c"/>
            </svg>
          </div>
          <div class="tool-card-name" data-i18n="tool6n">{{ t('tool6n') }}</div>
          <div class="tool-card-desc" data-i18n="tool6d">{{ t('tool6d') }}</div>
          <div class="tool-card-arrow" data-i18n="view_github">{{ t('view_github') }}</div>
        </a>

      </div>
    </section>

    <!-- TRANSPARENCY -->
    <section class="transparency-section" id="contact" aria-labelledby="trust-heading">
      <div class="transparency-inner">
        <div>
          <div class="section-label reveal" data-i18n="trust_label">{{ t('trust_label') }}</div>
          <h2 class="section-title reveal" id="trust-heading">{{ t('trust_title_1') }}<br>{{ t('trust_title_2') }}</h2>
          <ul class="transparency-pledges reveal">
            <li class="pledge-item"><div class="pledge-check" aria-hidden="true">✓</div><div class="pledge-text"><strong data-i18n="p1t">{{ t('p1t') }}</strong><span data-i18n="p1d">{{ t('p1d') }}</span></div></li>
            <li class="pledge-item"><div class="pledge-check" aria-hidden="true">✓</div><div class="pledge-text"><strong data-i18n="p2t">{{ t('p2t') }}</strong><span data-i18n="p2d">{{ t('p2d') }}</span></div></li>
            <li class="pledge-item"><div class="pledge-check" aria-hidden="true">✓</div><div class="pledge-text"><strong data-i18n="p3t">{{ t('p3t') }}</strong><span data-i18n="p3d">{{ t('p3d') }}</span></div></li>
            <li class="pledge-item"><div class="pledge-check" aria-hidden="true">✓</div><div class="pledge-text"><strong data-i18n="p4t">{{ t('p4t') }}</strong><span data-i18n="p4d">{{ t('p4d') }}</span></div></li>
          </ul>
        </div>
        <div class="reveal">
          <div class="founder-card">
            <div class="founder-card-top">
              <div class="founder-avatar-wrap" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="64" height="64" fill="#162032"/>
                  <!-- stylised developer avatar: monitor + code -->
                  <rect x="12" y="14" width="40" height="26" rx="4" fill="#1e3a5f"/>
                  <rect x="16" y="18" width="32" height="18" rx="2" fill="#0d1f33"/>
                  <!-- code lines -->
                  <rect x="19" y="21" width="8" height="2" rx="1" fill="#4a7fcc"/>
                  <rect x="19" y="25" width="14" height="2" rx="1" fill="#4a7fcc" opacity=".6"/>
                  <rect x="19" y="29" width="10" height="2" rx="1" fill="#e0572e" opacity=".8"/>
                  <rect x="30" y="21" width="6" height="2" rx="1" fill="#43b77a" opacity=".7"/>
                  <!-- stand -->
                  <rect x="28" y="40" width="8" height="4" rx="1" fill="#1e3a5f"/>
                  <rect x="22" y="44" width="20" height="3" rx="1.5" fill="#1e3a5f"/>
                  <!-- accent dot -->
                  <circle cx="50" cy="16" r="5" fill="#c84b2f"/>
                  <path d="M50 13.5v5M47.5 16h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
            <div class="founder-card-body">
              <div class="founder-name" data-i18n="fc_name">Laraue Software</div>
              <div class="founder-role" data-i18n="fc_role">{{ t('fc_role') }}</div>
              <p class="founder-bio" data-i18n="fc_bio">{{ t('fc_bio') }}</p>
              <div class="founder-links">
                <a rel="nofollow" target="_blank" href="https://github.com/win7user10" class="founder-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  GitHub
                </a>
                <a rel="nofollow" target="_blank" href="https://t.me/win7user10" class="founder-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.54-.46.67-.93.42l-2.58-1.9-1.24 1.2c-.14.13-.26.25-.52.25l.18-2.6 4.74-4.28c.2-.18-.05-.28-.32-.1L7.36 14.5l-2.52-.79c-.55-.17-.56-.55.11-.81l9.86-3.8c.46-.17.86.11.83.7z"/></svg>
                  Telegram
                </a>
                <a href="https://laraue.com/blog" class="founder-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                  Blog
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </LMainContent>
</template>

<style scoped>
/* HERO */
.hero{min-height:100vh;display:flex;align-items:center;padding:120px 48px 80px;position:relative;overflow:hidden}
.hero-grid-bg{position:absolute;inset:0;z-index:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 70% at 50% 40%,black 30%,transparent 100%);opacity:.45}
.hero-inner{position:relative;z-index:1;max-width:1160px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:28px}
.hero-eyebrow::before{content:'';display:block;width:24px;height:1px;background:var(--accent)}
.hero-title{font-family:var(--serif);font-size:clamp(36px,4.5vw,60px);line-height:1.08;letter-spacing:-.5px;color:var(--ink);margin-bottom:24px;animation:fadeUp .8s .1s ease both}
.hero-title em{font-style:italic;color:var(--accent)}
.hero-sub{font-size:18px;color:var(--muted);line-height:1.65;max-width:440px;margin-bottom:40px;font-weight:300;animation:fadeUp .8s .2s ease both}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;animation:fadeUp .8s .3s ease both}
.btn-primary{background:var(--ink);color:var(--paper);padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:-.01em;transition:background .2s,transform .15s,box-shadow .2s;box-shadow:0 2px 12px rgba(15,14,12,.18)}
.btn-primary:hover{background:var(--accent);transform:translateY(-2px);box-shadow:0 6px 20px rgba(200,75,47,.28)}
.btn-secondary{background:transparent;color:var(--ink);padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:500;font-size:15px;border:1px solid var(--border);transition:border-color .2s,background .2s,transform .15s}
.btn-secondary:hover{border-color:var(--ink);background:var(--cream);transform:translateY(-2px)}
.hero-visual{animation:fadeUp .9s .25s ease both}
/* product card */
.product-card{background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(15,14,12,.1),0 2px 8px rgba(15,14,12,.06)}
.product-card-header{background:var(--ink);padding:12px 18px;display:flex;align-items:center;gap:10px}
.product-card-dots{display:flex;gap:6px}
.product-card-dots span{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.25)}
.product-card-dots span:first-child{background:#e05353}
.product-card-dots span:nth-child(2){background:#e0a653}
.product-card-dots span:nth-child(3){background:#53e07a}
.product-card-title-bar{color:rgba(255,255,255,.6);font-size:11px;font-weight:500;letter-spacing:.03em;margin:0 auto}
.product-card-body{padding:22px}
.product-tag{display:inline-block;background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px;border-radius:4px;margin-bottom:10px}
.product-card-name{font-family:var(--serif);font-size:18px;font-weight:700;margin-bottom:7px;letter-spacing:-.2px}
.product-card-desc{font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:18px}
.kanban-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.kanban-col{background:var(--paper);border-radius:7px;padding:9px}
.kanban-col-label{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
.kanban-item{background:#fff;border:1px solid var(--border);border-radius:5px;padding:7px 9px;font-size:10px;line-height:1.4;margin-bottom:5px;color:var(--ink)}
.kanban-item.accent-border{border-left:3px solid var(--accent)}
.kanban-item.green-border{border-left:3px solid #43b77a}
.kanban-item.blue-border{border-left:3px solid #4a7fcc}

/* TRUST BAR */
.trust-bar{background:var(--cream);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:20px 48px;display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap}
.trust-item{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted);font-weight:500}
.trust-icon{width:32px;height:32px;background:#fff;border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px}

/* SECTIONS */
.section{padding:100px 48px;max-width:1160px;margin:0 auto}
.section-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-label::after{content:'';flex:1;max-width:40px;height:1px;background:var(--accent);opacity:.5}
.section-title{font-family:var(--serif);font-size:clamp(28px,3.5vw,44px);line-height:1.12;letter-spacing:-.3px;margin-bottom:20px}

/* ABOUT */
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;padding:80px 0}
.about-text p{font-size:17px;color:var(--muted);line-height:1.75;font-weight:300;margin-bottom:20px}
.about-text p strong{color:var(--ink);font-weight:600}
.about-values{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:10px}
.value-card{background:var(--cream);border:1px solid var(--border);border-radius:12px;padding:20px}
.value-card-icon{font-size:24px;margin-bottom:10px}
.value-card-title{font-weight:600;font-size:14px;margin-bottom:6px}
.value-card-text{font-size:13px;color:var(--muted);line-height:1.5}
.about-stats{display:flex;flex-direction:column;gap:24px}
.stat-card{background:var(--cream);border:1px solid var(--border);border-radius:16px;padding:28px 32px;position:relative;overflow:hidden}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent),transparent)}
.stat-num{font-family:var(--serif);font-size:44px;font-weight:800;line-height:1;letter-spacing:-1px;color:var(--ink)}
.stat-label{font-size:13px;color:var(--muted);font-weight:500;margin-top:6px}

/* PRODUCT SECTION */
.product-section{background:var(--ink);padding:100px 48px;position:relative;overflow:hidden}
.product-section::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:48px 48px}
.product-section-inner{max-width:1160px;margin:0 auto;position:relative;z-index:1}
.product-section .section-label{color:var(--accent)}
.product-section .section-label::after{background:var(--accent)}
.product-section .section-title{color:var(--paper)}
.product-section-sub{font-size:17px;color:rgba(247,244,238,.55);font-weight:300;max-width:520px;line-height:1.7;margin-bottom:60px}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-bottom:60px}
.feature-cell{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:32px 28px;transition:background .2s}
.feature-cell:hover{background:rgba(255,255,255,.07)}
.feature-cell-icon{font-size:28px;margin-bottom:16px}
.feature-cell-title{font-weight:600;font-size:15px;color:var(--paper);margin-bottom:10px}
.feature-cell-text{font-size:13px;color:rgba(247,244,238,.5);line-height:1.6}
.product-cta-row{display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.product-cta-row .btn-primary{background:var(--accent);box-shadow:0 4px 20px rgba(200,75,47,.4)}
.product-cta-row .btn-primary:hover{background:#e0572e}
.product-cta-row .btn-ghost{color:rgba(247,244,238,.6);text-decoration:none;font-size:14px;font-weight:500;border-bottom:1px solid rgba(247,244,238,.2);transition:color .2s,border-color .2s}
.product-cta-row .btn-ghost:hover{color:var(--paper);border-color:var(--paper)}

/* TOOLS */
.tools-section{padding:100px 48px;max-width:1160px;margin:0 auto}
.tools-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}
.tool-card{border:1px solid var(--border);border-radius:14px;padding:28px;background:#fff;transition:box-shadow .2s,transform .2s,border-color .2s;text-decoration:none;color:inherit;display:block}
.tool-card:hover{box-shadow:0 8px 32px rgba(15,14,12,.1);transform:translateY(-3px);border-color:var(--ink)}
.tool-logo{width:48px;height:48px;border-radius:12px;margin-bottom:16px;overflow:hidden;border:1px solid var(--border);flex-shrink:0}
.tool-logo svg{width:100%;height:100%;display:block}
.tool-card-name{font-weight:600;font-size:15px;margin-bottom:8px}
.tool-card-desc{font-size:13px;color:var(--muted);line-height:1.55}
.tool-card-arrow{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--accent);margin-top:16px;transition:gap .15s}
.tool-card:hover .tool-card-arrow{gap:8px}

/* TRANSPARENCY */
.transparency-section{background:var(--cream);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:80px 48px}
.transparency-inner{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:80px;align-items:start}
.transparency-pledges{list-style:none;display:flex;flex-direction:column;gap:16px;margin-top:36px}
.pledge-item{display:flex;align-items:flex-start;gap:14px;padding:18px 20px;background:#fff;border:1px solid var(--border);border-radius:10px}
.pledge-check{width:22px;height:22px;flex-shrink:0;background:var(--ink);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--paper);font-size:11px;margin-top:1px}
.pledge-text{font-size:14px;line-height:1.55}
.pledge-text strong{display:block;font-weight:600;margin-bottom:2px}
.pledge-text span{color:var(--muted)}
.founder-card{background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,14,12,.08)}
.founder-card-top{background:var(--ink);padding:28px 28px 52px;position:relative}
.founder-card-top::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:32px;background:#fff;clip-path:ellipse(55% 100% at 50% 100%)}
.founder-avatar-wrap{width:64px;height:64px;border-radius:50%;overflow:hidden;border:3px solid rgba(255,255,255,.2);margin-bottom:16px}
.founder-avatar-wrap svg{width:100%;height:100%;display:block}
.founder-card-body{padding:20px 28px 28px}
.founder-name{font-family:var(--serif);font-size:20px;font-weight:700;letter-spacing:-.2px;margin-bottom:4px}
.founder-role{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.founder-bio{font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:20px;font-weight:300}
.founder-links{display:flex;gap:10px;flex-wrap:wrap}
.founder-link{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border:1px solid var(--border);border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;color:var(--ink);transition:border-color .2s,background .2s}
.founder-link:hover{border-color:var(--ink);background:var(--cream)}

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */

/* ── Tablet: narrow sidebar ── */
@media(max-width:1100px){
  .sidebar-links li a span:not(.sidebar-icon){display:none}
  .sidebar-links li a{padding:11px;justify-content:center;border-left:none;border-radius:8px;margin:0 4px}
  .sidebar-links li a.active{background:rgba(200,75,47,.1)}
  .sidebar-links li a .sidebar-icon{width:auto;font-size:16px}
}

/* ── Mobile: hide sidebar + desktop nav, show hamburger ── */
@media(max-width:720px){
  .hero{padding:80px 22px 60px}
  .hero-inner{grid-template-columns:1fr;gap:40px}
  .hero-visual{order:-1}
  .trust-bar{padding:16px 22px;gap:18px}
  .section{padding:56px 22px}
  .about-grid{grid-template-columns:1fr;gap:36px;padding:48px 0}
  .about-values{grid-template-columns:1fr 1fr}
  .product-section{padding:56px 22px}
  .features-grid{grid-template-columns:1fr 1fr;gap:2px}
  .tools-section{padding:56px 22px}
  .tools-grid{grid-template-columns:1fr 1fr;gap:12px}
  .transparency-section{padding:56px 22px}
  .transparency-inner{grid-template-columns:1fr;gap:36px}
}

@media(max-width:480px){
  .about-values{grid-template-columns:1fr}
  .features-grid{grid-template-columns:1fr}
  .tools-grid{grid-template-columns:1fr}
}
</style>
