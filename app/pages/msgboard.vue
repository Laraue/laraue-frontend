<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t } = useI18n();
const botName = 'msgboard_bot';
const imageUrl = "https://laraue.com/images/note-board-bot-app.jpg";

import {
  defineOffer,
  defineSoftwareApp,
  useSchemaOrg,
  defineAggregateRating,
  defineReview,
  definePerson,
} from '@unhead/schema-org/vue'

useSchemaOrg([
  defineSoftwareApp({
    name: t('seoTitle'),
    description: t('seoDescription'),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Telegram",
    offers: [
      defineOffer({
        price: 0,
        priceCurrency: "USD",
        description: '3 message types, 3 statuses per type, up to 100 cards'
      }),
      defineOffer({
        price: 4,
        priceCurrency: "USD",
        description: 'Unlimited types, statuses, cards, AI categorization, and CSV/Notion export'
      })
    ],
    aggregateRating: defineAggregateRating({
      ratingValue: "4.8",
      reviewCount: 3,
    }),
    review: [
      defineReview({
        author: definePerson({
          name: t('testimonial1Name')
        }),
        reviewBody: t('testimonial1'),
        reviewRating: { '@type': 'Rating', ratingValue: '5' }
      }),
      defineReview({
        author: definePerson({
          name: t('testimonial2Name')
        }),
        reviewBody: t('testimonial2'),
        reviewRating: { '@type': 'Rating', ratingValue: '5' }
      }),
      defineReview({
        author: definePerson({
          name: t('testimonial3Name')
        }),
        reviewBody: t('testimonial3'),
        reviewRating: { '@type': 'Rating', ratingValue: '5' }
      })
    ],
  })
])

useSeoMeta({
  title: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
  ogTitle: computed(() => t('seoTitle')),
  ogImage: imageUrl,
  ogImageWidth: "891",
  ogImageHeight: "862",
  ogImageAlt: t('seoTitle'),
  twitterCard: "summary_large_image",
  twitterTitle: computed(() => t('seoTitle')),
  twitterDescription: computed(() => t('seoDescription')),
  twitterImage: imageUrl,
  twitterImageAlt: t('seoTitle')
})
</script>

<i18n lang="json">
{
  "en": {
    "seoTitle": "Message Board — Turn Telegram Messages into Beautiful Boards",
    "seoDescription": "Stop losing important messages in Telegram. Note Board Bot transforms saved messages into visual boards with custom statuses. Free Kanban organization for Telegram.",

    "badge": "Web App + Telegram Mini App",
    "heroTitle": "Turn Messages into Beautiful Boards",
    "heroTitleSpan": "Beautiful Boards",
    "heroSub": "Stop losing important messages in chat history. Forward to {botName} and organize everything visually — in seconds.",
    "openBot": "Open {botName}",
    "howItWorks": "How it works",

    "stat1Num": "5",
    "stat1Label": "Easy Steps",
    "stat2Num": "4",
    "stat2Label": "Message Types",
    "stat3Num": "Free",
    "stat3Label": "To Start",

    "processLabel": "Process",
    "howTitle": "From message to board in 5 steps",
    "howSub": "No new habits to build — just forward messages you already care about.",

    "step1": "Forward a message",
    "step1Desc": "Send any Telegram message directly to {botName}",
    "step2": "Choose a type",
    "step2Desc": "Pick Task, Idea, Resource, or Note with one tap",
    "step3": "Set a status",
    "step3Desc": "Bot suggests the right status workflow for your type",
    "step4": "Open the board",
    "step4Desc": "All your cards appear on a clean visual Kanban board",
    "step5": "Drag & progress",
    "step5Desc": "Move cards across columns as your work advances",

    "featuresLabel": "Features",
    "featuresTitle": "Everything you need, nothing you don't",

    "feature1Title": "Forward Any Message",
    "feature1Desc": "Forward links, text, tasks, or ideas from any chat. The bot preserves the original sender, chat name, and timestamp.",
    "feature2Title": "Visual Kanban Boards",
    "feature2Desc": "Three-column boards with drag-and-drop cards. Clean, fast, and built right inside Telegram as a mini app.",
    "feature3Title": "Color-coded Statuses",
    "feature3Desc": "Every message type has its own workflow. Customize statuses, reorder them, and color-code each label.",
    "feature4Title": "Instant Search",
    "feature4Desc": "Find any saved message by keyword. Filter by type, status, or date — all your context is always one search away.",
    "feature5Title": "Mobile-First Design",
    "feature5Desc": "Optimized for thumbs. The mini app feels native on iOS and Android — smooth, responsive, and distraction-free.",
    "feature6Title": "AI Auto-categorization",
    "feature6Desc": "Premium feature: Let AI suggest the right type and status based on message content. One tap to confirm.",

    "typesLabel": "Message Types",
    "typesTitle": "Built-in workflows for every context",
    "typesSub": "Each type comes with a default status workflow — ready to use from day one.",

    "tasks": "Tasks",
    "todo": "To Do",
    "doing": "Doing",
    "done": "Done",
    "ideas": "Ideas",
    "raw": "Raw",
    "developing": "Developing",
    "ready": "Ready",
    "resources": "Resources",
    "toRead": "To Read",
    "reading": "Reading",
    "archived": "Archived",
    "notes": "Notes",
    "draft": "Draft",
    "final": "Final",
    "reference": "Reference",

    "pricingLabel": "Pricing",
    "pricingTitle": "Simple, honest pricing",
    "pricingSub": "Start free, upgrade when you need more power.",

    "free": "Free",
    "forever": "forever",
    "premium": "Premium",
    "perMonth": "per month",
    "mostPopular": "Most Popular",

    "featureTypes3": "3 message types",
    "featureStatuses3": "3 statuses per type",
    "featureCards100": "Up to 100 cards",
    "featureBoard": "Visual Kanban board",
    "featureSearch": "Keyword search",
    "featureAIFree": "AI auto-categorization",
    "featureExportFree": "Export to CSV / Notion",

    "featureTypesUnlimited": "Unlimited message types",
    "featureStatusesUnlimited": "Unlimited custom statuses",
    "featureCardsUnlimited": "Unlimited cards",
    "featureAIPremium": "AI auto-categorization",
    "featureExportPremium": "Export to CSV / Notion",

    "startFree": "Start for free",
    "getPremium": "Get Premium",

    "testimonialsLabel": "Testimonials",
    "testimonialsTitle": "People who stopped losing messages",
    "testimonialsSub": "Real people, real workflows — finally organized.",

    "testimonial1": "I used to screenshot important messages and forget about them. Now I forward everything to Note Board Bot and my task board is always current. It's become part of my daily PM workflow.",
    "testimonial1Name": "Sarah K.",
    "testimonial1Role": "Product Manager, SaaS startup",

    "testimonial2": "As a researcher, I'm constantly saving papers, links, and notes from different Telegram groups. The Resources board with 'To Read → Reading → Archived' is exactly what I needed.",
    "testimonial2Name": "Marcus T.",
    "testimonial2Role": "Independent Researcher",

    "testimonial3": "Running a startup means constant idea overflow in chats. Note Board Bot lets me capture every idea instantly and review them properly when I have time. The AI suggestion feature is surprisingly accurate.",
    "testimonial3Name": "Alex R.",
    "testimonial3Role": "Founder, early-stage startup",

    "ctaLabel": "Get started",
    "ctaTitle": "Your messages deserve better than chat history",
    "ctaSub": "Join thousands organizing their Telegram messages visually. Free to start, takes 30 seconds.",
    "forwarded": "Forwarded from Work Chat",
    "deadline": "Deadline: Friday — finalize the Q4 report and send to management.",
    "nowVisible": "now visible on your board",
    "savedAs": "Saved in"
  },
  "ru": {
    "seoTitle": "Message Board — Превращайте сообщения Telegram в красивые доски",
    "seoDescription": "Перестаньте терять важные сообщения в Telegram. Note Board Bot превращает сохраненные сообщения в визуальные доски с настраиваемыми статусами. Бесплатная Kanban-организация для Telegram.",

    "badge": "Web App + Telegram Mini App",
    "heroTitle": "Превращайте сообщения в ",
    "heroTitleSpan": "Kanban доски",
    "heroSub": "Хватит терять важные сообщения в истории чатов. Пересылайте их в {botName} и организуйте все визуально — за секунды.",
    "openBot": "Открыть {botName}",
    "howItWorks": "Как это работает",

    "stat1Num": "5",
    "stat1Label": "Шагов",
    "stat2Num": "4",
    "stat2Label": "Типа сообщений",
    "stat3Num": "Бесплатно",
    "stat3Label": "Для старта",

    "processLabel": "Процесс",
    "howTitle": "От сообщения до доски за 5 шагов",
    "howSub": "Никаких новых привычек — просто пересылайте сообщения, которые вам важны.",

    "step1": "Перешлите сообщение",
    "step1Desc": "Отправьте любое сообщение из Telegram в {botName}",
    "step2": "Выберите тип",
    "step2Desc": "Выберите тип - Задача, Идея, Ресурс или Заметка",
    "step3": "Укажите статус",
    "step3Desc": "Бот предложит подходящий workflow для вашего типа",
    "step4": "Откройте доску",
    "step4Desc": "Все карточки появятся на чистой визуальной Kanban-доске",
    "step5": "Перетаскивайте",
    "step5Desc": "Двигайте карточки между колонками по мере прогресса",

    "featuresLabel": "Возможности",
    "featuresTitle": "Всё необходимое, ничего лишнего",

    "feature1Title": "Пересылайте любые сообщения",
    "feature1Desc": "Пересылайте ссылки, текст, задачи или идеи из любого чата. Бот сохраняет отправителя, название чата и время.",
    "feature2Title": "Визуальные Kanban-доски",
    "feature2Desc": "Доски с карточками, которые можно перетаскивать. Прямо внутри Telegram, в мини-приложении.",
    "feature3Title": "Цветные статусы",
    "feature3Desc": "У каждого типа сообщений свой workflow. Настраивайте статусы, меняйте порядок и назначайте цвета.",
    "feature4Title": "Мгновенный поиск",
    "feature4Desc": "Находите любое сообщение по ключевым словам. Фильтруйте по типу, статусу или дате.",
    "feature5Title": "Мобильный дизайн",
    "feature5Desc": "Оптимизировано для больших пальцев. Мини-приложение работает как нативное и на iOS и на Android — плавно и отзывчиво.",
    "feature6Title": "AI-категоризация",
    "feature6Desc": "Платная функция: ИИ предлагает тип и статус на основе содержания сообщения. Одно нажатие для подтверждения.",

    "typesLabel": "Типы сообщений",
    "typesTitle": "Готовые workflow для любых задач",
    "typesSub": "У каждого категории задачи предустановленные статусы — можно начать использовать моментально.",

    "tasks": "Задачи",
    "todo": "К выполнению",
    "doing": "В процессе",
    "done": "Готово",
    "ideas": "Идеи",
    "raw": "Черновик",
    "developing": "Разработка",
    "ready": "Готова",
    "resources": "Ресурсы",
    "toRead": "К прочтению",
    "reading": "Читаю",
    "archived": "В архиве",
    "notes": "Заметки",
    "draft": "Черновик",
    "final": "Готово",
    "reference": "Для справки",

    "pricingLabel": "Цены",
    "pricingTitle": "Простые и честное ценообразование",
    "pricingSub": "Начните бесплатно, активируйте новый функионал по мере необходимости.",

    "free": "Бесплатно",
    "forever": "навсегда",
    "premium": "Премиум",
    "perMonth": "в месяц",
    "mostPopular": "Выбор большинства",

    "featureTypes3": "3 типа сообщений",
    "featureStatuses3": "3 статуса на тип",
    "featureCards100": "До 100 карточек",
    "featureBoard": "Визуальная Kanban-доска",
    "featureSearch": "Поиск по ключевым словам",
    "featureAIFree": "AI-категоризация",
    "featureExportFree": "Экспорт в CSV / Notion",

    "featureTypesUnlimited": "Безлимитные типы сообщений",
    "featureStatusesUnlimited": "Безлимитные статусы",
    "featureCardsUnlimited": "Безлимитные карточки",
    "featureAIPremium": "AI-категоризация",
    "featureExportPremium": "Экспорт в CSV / Notion",

    "startFree": "Начать бесплатно",
    "getPremium": "Купить Премиум",

    "testimonialsLabel": "Отзывы",
    "testimonialsTitle": "Люди, которые перестали путаться в сообщениях",
    "testimonialsSub": "Реальные люди, реальные рабочие процессы.",

    "testimonial1": "Раньше я делал скриншоты важных сообщений и забывал о них. Теперь я пересылаю всё в Note Board Bot, и моя доска задач всегда актуальна. Это стало частью моего ежедневного рабочего процесса.",
    "testimonial1Name": "Сара К.",
    "testimonial1Role": "Продакт-менеджер, SaaS-стартап",

    "testimonial2": "Как исследователь, я постоянно сохраняю статьи, ссылки и заметки из разных Telegram-групп. Доска Ресурсов с этапами 'К прочтению → Читаю → В архиве' — это именно то, что мне нужно.",
    "testimonial2Name": "Маркус Т.",
    "testimonial2Role": "Независимый исследователь",

    "testimonial3": "Управление стартапом означает постоянный поток идей в чатах. Note Board Bot позволяет мгновенно сохранять каждую идею и просматривать их, когда есть время. AI-функция удивительно точная.",
    "testimonial3Name": "Алекс Р.",
    "testimonial3Role": "Основатель, стартап на ранней стадии",

    "ctaLabel": "Начните сейчас",
    "ctaTitle": "Ваши сообщения это нечто большее, чем история чата",
    "ctaSub": "Присоединяйтесь к тысячам людей, которые организуют сообщения Telegram визуально. Бесплатно, займет 30 секунд.",
    "forwarded": "Переслано из рабочего чата",
    "deadline": "Дедлайн: Пятница — закочить отчет за 4-й квартал и отправить начальству.",
    "nowVisible": "теперь на Kanban доске",
    "savedAs": "Сохранено в"
  }
}
</i18n>

<template>
  <main>
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-grid-overlay"></div>

    <div class="hero-left">
      <div class="badge">{{ t('badge') }}</div>
      <h1 class="hero-title">
        {{ t('heroTitle').replace('Beautiful Boards', '') }}<span>{{ t('heroTitleSpan') }}</span>
      </h1>
      <p class="hero-sub">
        {{ t('heroSub', { botName: '@' + botName }) }}
      </p>
      <div class="hero-ctas">
        <a :href="'https://t.me/' + botName" target="_blank" rel="nofollow" class="btn-primary">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 6.628 5.374 12 12 12 6.629 0 12-5.372 12-12C24 5.373 18.629 0 12 0zm5.562 8.247l-2.01 9.465c-.147.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.215-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.52l-2.95-.924c-.64-.2-.652-.64.135-.948l11.547-4.452c.533-.194 1.001.13.35.051z"/></svg>
          {{ t('openBot', { botName: '@' + botName }) }}
        </a>
        <a href="#how-it-works" class="btn-secondary">
          {{ t('howItWorks') }} →
        </a>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-num">{{ t('stat1Num') }}</div>
          <div class="stat-label">{{ t('stat1Label') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">{{ t('stat2Num') }}</div>
          <div class="stat-label">{{ t('stat2Label') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">{{ t('stat3Num') }}</div>
          <div class="stat-label">{{ t('stat3Label') }}</div>
        </div>
      </div>
    </div>

    <div class="hero-right">
      <div class="phone-mockup">
        <div class="phone-screen">
          <div class="phone-notch"></div>
          <div class="tg-header">
            <div class="tg-avatar">📋</div>
            <div>
              <div class="tg-name">Note Board Bot</div>
              <div class="tg-status">● online</div>
            </div>
          </div>
          <div class="tg-messages">
            <div class="tg-msg">
              <div>{{ t('forwarded') }}</div>
              <div style="margin-top:4px;color:#5b80a8;font-size:10px;">{{ t('deadline') }}</div>
              <div class="msg-meta">12:41</div>
            </div>
            <div class="tg-msg bot">
              <div>{{ t('step2') }}</div>
              <div class="tg-types">
                <div class="tg-type-btn">📋 {{ t('tasks') }}</div>
                <div class="tg-type-btn">💡 {{ t('ideas') }}</div>
                <div class="tg-type-btn">📚 {{ t('resources') }}</div>
                <div class="tg-type-btn">📝 {{ t('notes') }}</div>
              </div>
              <div class="msg-meta">12:41</div>
            </div>
            <div class="tg-msg">
              📋 {{ t('tasks') }}
              <div class="msg-meta">12:42</div>
            </div>
            <div class="tg-msg bot">
              ✅ {{ t('savedAs') }} {{ t('tasks') }}!<br>
              <span style="opacity:0.8;font-size:10px;">{{ t('todo') }} → {{ t('nowVisible') }}</span>
              <div class="msg-meta">12:42</div>
            </div>
          </div>
        </div>
      </div>

      <div class="board-float">
        <div class="board-float-title">📋 My Board</div>
        <div class="mini-col">
          <div class="mini-col-label">{{ t('todo') }}</div>
          <div class="mini-card">Q4 Report</div>
          <div class="mini-card">Team call</div>
        </div>
        <div class="mini-col">
          <div class="mini-col-label">{{ t('doing') }}</div>
          <div class="mini-card" style="border-color:#22c55e;color:#16a34a;background:#f0fdf4;">Research doc</div>
        </div>
        <div class="mini-col">
          <div class="mini-col-label">{{ t('done') }}</div>
          <div class="mini-card" style="border-color:#94a3b8;color:#64748b;background:#f8fafc;">Logo brief</div>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="how" id="how-it-works">
    <div class="container">
      <div class="how-header">
        <div class="section-label">{{ t('processLabel') }}</div>
        <h2 class="section-title">{{ t('howTitle') }}</h2>
        <p class="section-sub">{{ t('howSub') }}</p>
      </div>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text">
            <strong>{{ t('step1') }}</strong><br>
            {{ t('step1Desc', {botName: '@' + botName}) }}
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">
            <strong>{{ t('step2') }}</strong><br>
            {{ t('step2Desc') }}
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text">
            <strong>{{ t('step3') }}</strong><br>
            {{ t('step3Desc') }}
          </div>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div class="step-text">
            <strong>{{ t('step4') }}</strong><br>
            {{ t('step4Desc') }}
          </div>
        </div>
        <div class="step">
          <div class="step-num">5</div>
          <div class="step-text">
            <strong>{{ t('step5') }}</strong><br>
            {{ t('step5Desc') }}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="features" id="features">
    <div class="container">
      <div class="section-label">{{ t('featuresLabel') }}</div>
      <h2 class="section-title">{{ t('featuresTitle') }}</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📨</div>
          <div class="feature-title">{{ t('feature1Title') }}</div>
          <p class="feature-desc">{{ t('feature1Desc') }}</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🗂️</div>
          <div class="feature-title">{{ t('feature2Title') }}</div>
          <p class="feature-desc">{{ t('feature2Desc') }}</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🏷️</div>
          <div class="feature-title">{{ t('feature3Title') }}</div>
          <p class="feature-desc">{{ t('feature3Desc') }}</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <div class="feature-title">{{ t('feature4Title') }}</div>
          <p class="feature-desc">{{ t('feature4Desc') }}</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <div class="feature-title">{{ t('feature5Title') }}</div>
          <p class="feature-desc">{{ t('feature5Desc') }}</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">✨</div>
          <div class="feature-title">{{ t('feature6Title') }}</div>
          <p class="feature-desc">{{ t('feature6Desc') }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- MESSAGE TYPES -->
  <section class="types" id="types">
    <div class="container">
      <div class="types-header">
        <div class="section-label">{{ t('typesLabel') }}</div>
        <h2 class="section-title">{{ t('typesTitle') }}</h2>
        <p class="section-sub">{{ t('typesSub') }}</p>
      </div>
      <div class="types-grid">
        <div class="type-card">
          <div class="type-header">
            <div class="type-emoji">📋</div>
            <div class="type-name">{{ t('tasks') }}</div>
          </div>
          <div class="type-stages">
            <div class="stage"><div class="stage-dot"></div>{{ t('todo') }}</div>
            <div class="stage"><div class="stage-dot"></div>{{ t('doing') }}</div>
            <div class="stage"><div class="stage-dot"></div>{{ t('done') }}</div>
          </div>
        </div>
        <div class="type-card">
          <div class="type-header">
            <div class="type-emoji">💡</div>
            <div class="type-name">{{ t('ideas') }}</div>
          </div>
          <div class="type-stages">
            <div class="stage"><div class="stage-dot"></div>{{ t('raw') }}</div>
            <div class="stage"><div class="stage-dot"></div>{{ t('developing') }}</div>
            <div class="stage"><div class="stage-dot"></div>{{ t('ready') }}</div>
          </div>
        </div>
        <div class="type-card">
          <div class="type-header">
            <div class="type-emoji">📚</div>
            <div class="type-name">{{ t('resources') }}</div>
          </div>
          <div class="type-stages">
            <div class="stage"><div class="stage-dot"></div>{{ t('toRead') }}</div>
            <div class="stage"><div class="stage-dot"></div>{{ t('reading') }}</div>
            <div class="stage"><div class="stage-dot"></div>{{ t('archived') }}</div>
          </div>
        </div>
        <div class="type-card">
          <div class="type-header">
            <div class="type-emoji">📝</div>
            <div class="type-name">{{ t('notes') }}</div>
          </div>
          <div class="type-stages">
            <div class="stage"><div class="stage-dot"></div>{{ t('draft') }}</div>
            <div class="stage"><div class="stage-dot"></div>{{ t('final') }}</div>
            <div class="stage"><div class="stage-dot"></div>{{ t('reference') }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section class="pricing" id="pricing">
    <div class="container">
      <div class="pricing-header">
        <div class="section-label">{{ t('pricingLabel') }}</div>
        <h2 class="section-title">{{ t('pricingTitle') }}</h2>
        <p class="section-sub">{{ t('pricingSub') }}</p>
      </div>
      <div class="pricing-grid">
        <div class="price-card">
          <div class="price-tier">{{ t('free') }}</div>
          <div class="price-amount">$0</div>
          <div class="price-period">{{ t('forever') }}</div>
          <div class="price-divider"></div>
          <div class="price-features">
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureTypes3') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureStatuses3') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureCards100') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureBoard') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureSearch') }}</span></div>
            <div class="pf pf-x"><div class="pf-check">✕</div><span>{{ t('featureAIFree') }}</span></div>
            <div class="pf pf-x"><div class="pf-check">✕</div><span>{{ t('featureExportFree') }}</span></div>
          </div>
          <a target="_blank" rel="nofollow" :href="'https://t.me/' + botName" class="btn-price">{{ t('startFree') }}</a>
        </div>
        <div class="price-card featured">
          <div class="price-popular">{{ t('mostPopular') }}</div>
          <div class="price-tier">{{ t('premium') }}</div>
          <div class="price-amount">$4</div>
          <div class="price-period">{{ t('perMonth') }}</div>
          <div class="price-divider"></div>
          <div class="price-features">
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureTypesUnlimited') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureStatusesUnlimited') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureCardsUnlimited') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureBoard') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureSearch') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureAIPremium') }}</span></div>
            <div class="pf"><div class="pf-check">✓</div><span>{{ t('featureExportPremium') }}</span></div>
          </div>
          <a target="_blank" rel="nofollow" :href="'https://t.me/' + botName" class="btn-price">{{ t('getPremium') }}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="testimonials" id="testimonials">
    <div class="container">
      <div class="t-header">
        <div class="section-label">{{ t('testimonialsLabel') }}</div>
        <h2 class="section-title">{{ t('testimonialsTitle') }}</h2>
        <p class="section-sub">{{ t('testimonialsSub') }}</p>
      </div>
      <div class="t-grid">
        <div class="t-card">
          <div class="t-quote-mark">"</div>
          <p class="t-text">{{ t('testimonial1') }}</p>
          <div class="t-author">
            <div class="t-avatar">S</div>
            <div>
              <div class="t-name">{{ t('testimonial1Name') }}</div>
              <div class="t-role">{{ t('testimonial1Role') }}</div>
            </div>
          </div>
        </div>
        <div class="t-card">
          <div class="t-quote-mark">"</div>
          <p class="t-text">{{ t('testimonial2') }}</p>
          <div class="t-author">
            <div class="t-avatar">M</div>
            <div>
              <div class="t-name">{{ t('testimonial2Name') }}</div>
              <div class="t-role">{{ t('testimonial2Role') }}</div>
            </div>
          </div>
        </div>
        <div class="t-card">
          <div class="t-quote-mark">"</div>
          <p class="t-text">{{ t('testimonial3') }}</p>
          <div class="t-author">
            <div class="t-avatar">A</div>
            <div>
              <div class="t-name">{{ t('testimonial3Name') }}</div>
              <div class="t-role">{{ t('testimonial3Role') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="final-cta">
    <div class="final-cta-inner">
      <div class="section-label">{{ t('ctaLabel') }}</div>
      <h2 class="section-title">{{ t('ctaTitle') }}</h2>
      <p class="section-sub">{{ t('ctaSub') }}</p>
      <a target="_blank" rel="nofollow" :href="'https://t.me/' + botName" class="btn-primary" style="display:inline-flex;">
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 6.628 5.374 12 12 12 6.629 0 12-5.372 12-12C24 5.373 18.629 0 12 0zm5.562 8.247l-2.01 9.465c-.147.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.215-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.52l-2.95-.924c-.64-.2-.652-.64.135-.948l11.547-4.452c.533-.194 1.001.13.35.051z"/></svg>
        {{ t('openBot', { botName: '@' + botName }) }}
      </a>
    </div>
  </section>
  </main>
</template>

<style scoped>
main {
  width: 100%;
}
section {
  --ink: #0d1b2a;
  --deep: #0a2540;
  --mid: #1a4a7a;
  --sky: #2563eb;
  --azure: #3b82f6;
  --mist: #93c5fd;
  --frost: #dbeafe;
  --white: #f8fbff;
  --card: #ffffff;
  --subtle: #e0eeff;
  --text: #1e3a5f;
  --muted: #5b80a8;
  --radius: 16px;
  --shadow: 0 4px 24px rgba(10, 37, 64, 0.09);
  --shadow-lg: 0 16px 56px rgba(10, 37, 64, 0.13);
}
/* ── HERO ── */
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0;
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
      radial-gradient(ellipse 80% 70% at 70% -10%, #bfdbfe 0%, transparent 55%),
      radial-gradient(ellipse 50% 60% at 100% 80%, #dbeafe 0%, transparent 50%),
      linear-gradient(160deg, #f0f7ff 0%, #e8f2ff 60%, #d6eaff 100%);
  z-index: 0;
}

.hero-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
      linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  z-index: 0;
}

.hero-left {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 56px 80px 72px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
  color: var(--sky);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 100px;
  width: fit-content;
  margin-bottom: 28px;
}

.badge::before {
  content: '';
  width: 6px; height: 6px;
  background: var(--sky);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.hero-title {
  font-size: clamp(38px, 4.5vw, 60px);
  font-weight: 800;
  line-height: 1.08;
  color: var(--deep);
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}

.hero-title span {
  background: linear-gradient(135deg, var(--sky) 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: 18px;
  color: var(--muted);
  font-weight: 300;
  max-width: 440px;
  margin-bottom: 40px;
  line-height: 1.7;
}

.hero-ctas {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--sky);
  color: white;
  font-size: 15px;
  font-weight: 500;
  padding: 14px 28px;
  border-radius: 12px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.35);
}

.btn-primary:hover {
  background: var(--mid);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.45);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: var(--sky);
  font-size: 15px;
  font-weight: 500;
  padding: 14px 28px;
  border-radius: 12px;
  text-decoration: none;
  border: 1.5px solid var(--mist);
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-secondary:hover {
  border-color: var(--sky);
  background: var(--frost);
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  gap: 32px;
  margin-top: 52px;
  padding-top: 32px;
  border-top: 1px solid rgba(37, 99, 235, 0.12);
}

.stat-item { display: flex; flex-direction: column; gap: 2px; }
.stat-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--deep);
}
.stat-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }

/* ── HERO RIGHT — MOCKUP ── */
.hero-right {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 60px 40px;
}

.phone-mockup {
  width: 280px;
  background: #1a1a2e;
  border-radius: 40px;
  padding: 12px;
  box-shadow:
      0 40px 100px rgba(10, 37, 64, 0.25),
      0 0 0 1px rgba(255,255,255,0.08);
  position: relative;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-14px) rotate(0deg); }
}

.phone-screen {
  background: #f0f4ff;
  border-radius: 30px;
  overflow: hidden;
  height: 540px;
  display: flex;
  flex-direction: column;
}

.phone-notch {
  background: #1a1a2e;
  height: 28px;
  border-radius: 0 0 18px 18px;
  width: 100px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.tg-header {
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #e8efff;
  flex-shrink: 0;
}

.tg-avatar {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, var(--sky), #60a5fa);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.tg-name { font-size: 13px; font-weight: 600; color: var(--deep); }
.tg-status { font-size: 10px; color: #22c55e; }

.tg-messages { padding: 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; overflow: hidden; }

.tg-msg {
  background: white;
  border-radius: 12px 12px 12px 4px;
  padding: 10px 12px;
  font-size: 11px;
  color: var(--text);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  max-width: 82%;
  line-height: 1.5;
}

.tg-msg.bot {
  background: linear-gradient(135deg, var(--sky), #60a5fa);
  color: white;
  border-radius: 12px 12px 4px 12px;
  align-self: flex-end;
}

.tg-msg .msg-meta { font-size: 9px; opacity: 0.55; margin-top: 3px; }

.tg-types {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.tg-type-btn {
  background: rgba(255,255,255,0.25);
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 9px;
  font-weight: 500;
}

/* Board floating card */
.board-float {
  position: absolute;
  left: 370px;
  top: 30%;
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: var(--shadow-lg);
  width: 160px;
  animation: float2 5s ease-in-out infinite;
  border: 1px solid var(--subtle);
}

@keyframes float2 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.board-float-title { font-size: 10px; font-weight: 700; color: var(--deep); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }

.mini-col { margin-bottom: 6px; }
.mini-col-label { font-size: 8px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.mini-card {
  background: var(--frost);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 9px;
  color: var(--sky);
  font-weight: 500;
  margin-bottom: 3px;
  border-left: 2px solid var(--azure);
}

/* ── SECTION BASE ── */
section { position: relative; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 40px; }

.section-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--sky);
  margin-bottom: 12px;
}

.section-title {
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 700;
  color: var(--deep);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}

.section-sub {
  font-size: 17px;
  color: var(--muted);
  font-weight: 300;
  max-width: 560px;
  line-height: 1.7;
}

/* ── HOW IT WORKS ── */
.how {
  padding: 100px 0;
  background: white;
}

.how-header { text-align: center; margin-bottom: 72px; }
.how-header .section-sub { margin: 0 auto; }

.steps {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  position: relative;
}

.steps::before {
  content: '';
  position: absolute;
  top: 32px;
  left: calc(10% + 24px);
  right: calc(10% + 24px);
  height: 2px;
  background: linear-gradient(90deg, var(--mist), var(--sky), var(--mist));
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 16px;
  position: relative;
  z-index: 1;
}

.step-num {
  width: 64px; height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--sky), #60a5fa);
  color: white;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
  margin-bottom: 20px;
  flex-shrink: 0;
}

.step:nth-child(2) .step-num { background: linear-gradient(135deg, #3b82f6, #93c5fd); }
.step:nth-child(3) .step-num { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
.step:nth-child(4) .step-num { background: linear-gradient(135deg, #1e40af, #2563eb); }
.step:nth-child(5) .step-num { background: linear-gradient(135deg, #0a2540, #1a4a7a); }

.step-text { font-size: 13.5px; color: var(--muted); line-height: 1.6; }
.step-text strong { display: block; font-size: 14px; color: var(--deep); margin-bottom: 6px; font-weight: 600; }

/* ── FEATURES ── */
.features {
  padding: 100px 0;
  background: linear-gradient(180deg, #f0f7ff 0%, white 100%);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 60px;
}

.feature-card {
  background: white;
  border-radius: var(--radius);
  padding: 32px;
  border: 1px solid var(--subtle);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--sky), var(--mist));
  opacity: 0;
  transition: opacity 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--mist);
}

.feature-card:hover::before { opacity: 1; }

.feature-icon {
  width: 48px; height: 48px;
  background: var(--frost);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 20px;
}

.feature-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--deep);
  margin-bottom: 10px;
}

.feature-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

/* ── MESSAGE TYPES ── */
.types {
  padding: 100px 0;
  background: white;
}

.types-header { margin-bottom: 60px; }

.types-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.type-card {
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--subtle);
  transition: all 0.3s ease;
}

.type-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.type-header {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-card:nth-child(1) .type-header { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
.type-card:nth-child(2) .type-header { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
.type-card:nth-child(3) .type-header { background: linear-gradient(135deg, #fff7ed, #fed7aa); }
.type-card:nth-child(4) .type-header { background: linear-gradient(135deg, #faf5ff, #e9d5ff); }

.type-emoji { font-size: 22px; }
.type-name { font-size: 15px; font-weight: 700; color: var(--deep); }

.type-stages { padding: 16px 20px 20px; background: white; }

.stage {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid var(--subtle);
  font-size: 13px;
  color: var(--text);
}

.stage:last-child { border-bottom: none; }

.stage-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-card:nth-child(1) .stage-dot { background: var(--sky); }
.type-card:nth-child(2) .stage-dot { background: #22c55e; }
.type-card:nth-child(3) .stage-dot { background: #f97316; }
.type-card:nth-child(4) .stage-dot { background: #a855f7; }

/* ── PRICING ── */
.pricing {
  padding: 100px 0;
  background: linear-gradient(180deg, #f0f7ff 0%, white 100%);
}

.pricing-header { text-align: center; margin-bottom: 60px; }
.pricing-header .section-sub { margin: 0 auto; }

.pricing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  max-width: 840px;
  margin: 0 auto;
}

.price-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  border: 1.5px solid var(--subtle);
  position: relative;
}

.price-card.featured {
  background: linear-gradient(155deg, var(--deep) 0%, var(--mid) 100%);
  border-color: transparent;
  color: white;
}

.price-popular {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, var(--sky), #60a5fa);
  color: white;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 5px 18px;
  border-radius: 100px;
  white-space: nowrap;
}

.price-tier { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; margin-bottom: 8px; }
.price-card .price-tier { color: var(--muted); }
.price-card.featured .price-tier { color: var(--mist); }

.price-amount {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 4px;
}

.price-card .price-amount { color: var(--deep); }
.price-card.featured .price-amount { color: white; }

.price-period { font-size: 14px; margin-bottom: 28px; }
.price-card .price-period { color: var(--muted); }
.price-card.featured .price-period { color: rgba(255,255,255,0.6); }

.price-divider { height: 1px; margin-bottom: 24px; }
.price-card .price-divider { background: var(--subtle); }
.price-card.featured .price-divider { background: rgba(255,255,255,0.15); }

.price-features { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }

.pf {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.price-card .pf { color: var(--text); }
.price-card.featured .pf { color: rgba(255,255,255,0.85); }

.pf-check {
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
  margin-top: 1px;
}

.price-card .pf-check { background: var(--frost); color: var(--sky); }
.price-card.featured .pf-check { background: rgba(255,255,255,0.2); color: white; }

.pf-x { opacity: 0.4; }

.btn-price {
  display: block;
  text-align: center;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s;
  cursor: pointer;
  border: none;
}

.price-card .btn-price {
  background: var(--frost);
  color: var(--sky);
  border: 1.5px solid var(--mist);
}
.price-card .btn-price:hover { background: var(--sky); color: white; border-color: var(--sky); }

.price-card.featured .btn-price {
  background: white;
  color: var(--sky);
}
.price-card.featured .btn-price:hover { background: var(--frost); }

/* ── TESTIMONIALS ── */
.testimonials {
  padding: 100px 0;
  background: white;
}

.t-header { text-align: center; margin-bottom: 60px; }
.t-header .section-sub { margin: 0 auto; }

.t-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.t-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 32px;
  border: 1px solid var(--subtle);
  position: relative;
  transition: all 0.3s ease;
}

.t-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

.t-quote-mark {
  font-size: 64px;
  color: var(--mist);
  line-height: 0.8;
  margin-bottom: 16px;
  font-weight: 700;
}

.t-text { font-size: 15px; color: var(--text); line-height: 1.75; margin-bottom: 24px; font-style: italic; font-weight: 300; }

.t-author { display: flex; align-items: center; gap: 12px; }

.t-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.t-card:nth-child(1) .t-avatar { background: linear-gradient(135deg, var(--sky), #60a5fa); }
.t-card:nth-child(2) .t-avatar { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
.t-card:nth-child(3) .t-avatar { background: linear-gradient(135deg, #0a2540, #1a4a7a); }

.t-name { font-size: 14px; font-weight: 600; color: var(--deep); }
.t-role { font-size: 12px; color: var(--muted); margin-top: 1px; }

/* ── FINAL CTA ── */
.final-cta {
  padding: 100px 40px;
  text-align: center;
  background: linear-gradient(135deg, var(--deep) 0%, var(--mid) 60%, #1e40af 100%);
  position: relative;
  overflow: hidden;
}

.final-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
}

.final-cta-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }

.final-cta .section-label { color: var(--mist); }
.final-cta .section-title { color: white; }
.final-cta .section-sub { color: rgba(255,255,255,0.6); margin: 16px auto 40px; }

.final-cta .btn-primary {
  background: white;
  color: var(--sky);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  font-size: 16px;
  padding: 16px 36px;
}

.final-cta .btn-primary:hover {
  background: var(--frost);
  color: var(--deep);
}

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .hero { grid-template-columns: 1fr; min-height: auto; }
  .hero-left { padding: 80px 40px 40px; }
  .hero-right { padding: 40px; justify-content: flex-start; }
  .board-float { display: none; }
  .steps { grid-template-columns: 1fr 1fr; gap: 32px; }
  .steps::before { display: none; }
  .features-grid { grid-template-columns: 1fr 1fr; }
  .types-grid { grid-template-columns: 1fr 1fr; }
  .t-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 640px) {
  .container { padding: 0 20px; }
  .hero-left { padding: 75px 20px 40px; text-align: center; align-items: center; }
  .hero-right { padding: 20px; justify-content: center; }
  .phone-mockup { width: 240px; }
  .phone-screen { height: 460px; }
  .hero-stats { gap: 20px; }
  .hero-ctas { flex-flow: column; align-items: center; }
  .steps { grid-template-columns: 1fr; }
  .features-grid { grid-template-columns: 1fr; }
  .types-grid { grid-template-columns: 1fr 1fr; }
  .pricing-grid { grid-template-columns: 1fr; }
  .t-grid { grid-template-columns: 1fr; }
  section { padding: 0; }
}
</style>