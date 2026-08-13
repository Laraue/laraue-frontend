<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t } = useI18n();
const config = useRuntimeConfig();
const imageUrl = config.public.imagesBaseAddress + "note-board-bot-app.jpg";

import {
  defineOffer,
  defineSoftwareApp,
  defineBreadcrumb,
  useSchemaOrg,
} from '@unhead/schema-org/vue'
import LMainContent from "~/components/ui/LMainContent.vue";
import LNavIcon from "~/components/ui/LNavIcon.vue";
import LLandingIntro from "~/components/landins/LLandingIntro.vue";
import LActionButton from "~/components/landins/LActionButton.vue";
import LSection from "~/components/landins/LSection.vue";
import LFeaturesGrid from "~/components/landins/LFeaturesGrid.vue";
import LSteps from "~/components/landins/LSteps.vue";
import LPlatformBadge from "~/components/landins/LPlatformBadge.vue";
import LCallToAction from "~/components/landins/LCallToAction.vue";
const localePath = useLocalePath();

useSchemaOrg([
  defineSoftwareApp({
    name: t('seoTitle'),
    description: t('seoDescription'),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Telegram",
    offers: [
      defineOffer({
        price: 0,
        priceCurrency: "USD",
        description: 'Free: boards, spaces, epics, issues, custom attributes, organizations. Telegram bot, Mini App and web app included.'
      })
    ]
  }),
  {
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: t('faq1q'), acceptedAnswer: { '@type': 'Answer', text: t('faq1a') } },
      { '@type': 'Question', name: t('faq2q'), acceptedAnswer: { '@type': 'Answer', text: t('faq2a') } },
      { '@type': 'Question', name: t('faq3q'), acceptedAnswer: { '@type': 'Answer', text: t('faq3a') } },
      { '@type': 'Question', name: t('faq4q'), acceptedAnswer: { '@type': 'Answer', text: t('faq4a') } },
    ]
  },
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_current') },
    ]
  }),
])

useSeoMeta({
  title: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
  ogTitle: computed(() => t('seoTitle')),
  ogDescription: computed(() => t('seoDescription')),
  ogImage: imageUrl,
  ogImageWidth: "891",
  ogImageHeight: "862",
  ogImageAlt: t('seoTitle'),
  ogType: "website",
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
    "bc_home": "Home",
    "bc_current": "Laraue Boards",
    "task_label": "Task",
    "resource_label": "Resource",
    "idea_label": "Idea",
    "mockup_task1": "Fix auth bug",
    "mockup_task2": "Write docs",
    "mockup_idea1": "Add dark mode",
    "mockup_task3": "Redesign nav",
    "mockup_resource1": "Figma file",
    "mockup_task4": "Set up CI",
    "mockup_task5": "Deploy v0.1",

    "seoTitle": "Laraue Boards — Turn Telegram Messages into Kanban Boards",
    "seoDescription": "Stop losing important messages in Telegram. Laraue Boards turns messages you send to {'@'}msgboard_bot into cards on a kanban board. Free, open source, works as a Telegram Mini App and a web app.",

    "sec_top": "Overview",
    "sec_use_cases": "Use cases",
    "sec_platforms": "Platforms",
    "sec_features": "Features",
    "sec_how": "How it works",
    "sec_open": "Open source",

    "open_webapp": "Web App",

    "hero_eyebrow": "Boards by Laraue Software",
    "hero_title": "Kanban boards\nwithout the complexity",
    "hero_sub": "Send a message to the bot — it becomes a card. Organise it later on a board, alone or with your team. No Jira complexity, no Notion learning curve.",
    "hero_cta_web": "Open Web App",

    "stat_free": "Free",
    "stat_free_label": "and open source",
    "stat_types_label": "interfaces: bot, Mini App, web",
    "stat_modes_label": "modes: personal & team",
    "stat_setup_label": "sec. to get started",

    "mockup_title": "My Board — Sprint 3",
    "k_todo": "To Do",
    "k_doing": "Doing",
    "k_done": "Done",

    "uc_label": "Built for two worlds",
    "uc_title": "Personal productivity\nor team coordination",
    "uc_sub": "Laraue Boards adapts to how you work — solo or with a team.",
    "uc_personal_title": "Personal use",
    "uc_personal_desc": "Capture thoughts, tasks and links without leaving Telegram. Forward a message to the bot and it lands on your board.",
    "uc_p1": "Forward any message — text, photo, video or album",
    "uc_p2": "Edit the message in Telegram, the card updates",
    "uc_p3": "Search everything by keyword",
    "uc_p4": "Organise into epics and columns when you have time",
    "uc_p_cta": "Start with the Telegram bot",
    "uc_teams_title": "Small teams",
    "uc_teams_desc": "A lightweight Jira alternative for teams that find Jira overwhelming. Create an organization, invite teammates, track work together.",
    "uc_t1": "Organization mode with shared boards",
    "uc_t2": "Invite teammates via Telegram",
    "uc_t3": "Permissions per operation on spaces, epics and issues",
    "uc_t4": "Custom attributes defined by an admin",
    "uc_t_cta": "Open web app",

    "pl_label": "Two ways to use it",
    "pl_title": "Web app & Telegram Mini App",
    "pl_sub": "Start in Telegram, continue in the browser. Your boards are always in sync.",
    "web_name": "Web App",
    "web_desc": "Full-featured Kanban in the browser. Sign in with your Telegram account — no separate registration. Works on desktop and mobile.",
    "web_f1": "Telegram login — no password",
    "web_f2": "Full drag-and-drop Kanban",
    "web_f3": "Organization & permission management",
    "web_f4": "Large screen — see more, do more",
    "tg_name": "Telegram Mini App",
    "tg_desc": "Access your boards inside Telegram without leaving the app. Forward any message to the bot and it lands on your board in seconds.",
    "tg_f1": "Forward messages from any chat",
    "tg_f2": "Native iOS & Android feel",
    "tg_f3": "Instant — nothing to install",
    "tg_f4": "The same boards as the web app",

    "feat_label": "Everything you need",
    "feat_title": "Nothing you don't",
    "feat_sub": "Deliberately simple. Every feature earns its place.",
    "f1t": "Visual Kanban Boards",
    "f1d": "Drag-and-drop cards across columns. Clean, fast, works on any screen.",
    "f2t": "Forward to Board",
    "f2d": "Send any Telegram message to the bot and it appears as a card instantly — with a 👍 to confirm.",
    "f3t": "Media and albums",
    "f3d": "Photos, videos and whole albums become one card with all the attachments, in original quality.",
    "f4t": "Edits sync back",
    "f4d": "Edit the message in Telegram and the card changes with it. The reaction turns into a ❤.",
    "f5t": "Spaces and issue keys",
    "f5d": "Group epics into spaces per project. Every issue gets a key like WRK-42 you can quote in a chat.",
    "f6t": "Custom attributes",
    "f6d": "An admin defines attributes — task type, due by — and the team fills them in on issues.",
    "f7t": "Organization & permissions",
    "f7d": "Shared boards, and permissions set per operation on spaces, epics and issues.",
    "f8t": "Privacy first",
    "f8d": "Login via Telegram — no new password. Your data is never sold.",
    "f9t": "Open source",
    "f9d": "The backend and the frontend are public. Read exactly what happens to your message.",

    "how_label": "Getting started",
    "how_title": "From zero to organized in 4 steps",
    "step1t": "Open the bot",
    "step1d": "Start a chat with",
    "step2t": "Send a message",
    "step2d": "Type a task or forward anything from another chat. It becomes a card.",
    "step3t": "Organise it",
    "step3d": "Open the Mini App or the web app, drag cards between columns, group them into epics.",
    "step4t": "Invite your team",
    "step4d": "Optional: create an organization, invite teammates via Telegram, and set permissions.",

    "os_label": "Built in the open",
    "os_title": "Open source, mistakes included",
    "os_sub": "You can read the code — and you can read how it was written.",
    "os_code_title": "The code is public",
    "os_code_desc": "Backend and frontend are both on GitHub. People told us they were not ready to trust private notes to a product they did not know — open code is the honest answer to that.",
    "os_code_cta": "View on GitHub",
    "os_devlog_title": "The devlog",
    "os_devlog_desc": "We write down how the product is being built, including what went wrong — the bot that asked too many questions and had to be rolled back, the database decision we got wrong.",
    "os_devlog_cta": "Read the full story",

    "faq_label": "Questions",
    "faq_title": "Common questions",
    "faq1q": "Is it free?",
    "faq1a": "Yes. Everything on this page is free to use. Paid plans will arrive later, together with the AI features, and what works today stays free.",
    "faq2q": "Is it really open source?",
    "faq2a": "Yes. Both the backend and the frontend are public on GitHub, so you can read exactly what happens to a message after you send it.",
    "faq3q": "How is this different from Telegram Saved Messages?",
    "faq3a": "Saved Messages is a great place to save something quickly, but a bad place to find it later. Laraue Boards keeps the saving just as easy and gives what you saved a board, columns and statuses.",
    "faq4q": "Do I need an account or a password?",
    "faq4a": "No. You log in with Telegram. In the Mini App you are already logged in, and the web version has a Telegram login button.",

    "pr_note": "Laraue Boards is free. Paid plans will come later, alongside the AI features — everything that works today stays free.",

    "cta_label": "Get started today",
    "cta_title": "Your work deserves\nbetter than chat history",
    "cta_sub": "Free and open source. Works in 30 seconds.",
    "documentation": "Documentation",
    "project_page": "How it's built",
    "project_description": "More details"
  },
  "ru": {
    "bc_home": "Главная",
    "bc_current": "Laraue Boards",
    "task_label": "Задача",
    "resource_label": "Ресурс",
    "idea_label": "Идея",
    "mockup_task1": "Пофиксить баг",
    "mockup_task2": "Написать доки",
    "mockup_idea1": "Добавить темную тему",
    "mockup_task3": "Редизайн навигации",
    "mockup_resource1": "Файл Figma",
    "mockup_task4": "Настроить CI",
    "mockup_task5": "Релиз v0.1",

    "seoTitle": "Laraue Boards — превращайте сообщения Telegram в Kanban-доски",
    "seoDescription": "Перестаньте терять важные сообщения в Telegram. Laraue Boards превращает сообщения, отправленные боту {'@'}msgboard_bot, в карточки на канбан-доске. Бесплатно, открытый код, работает как Telegram Mini App и веб-приложение.",

    "sec_top": "Обзор",
    "sec_use_cases": "Кейсы",
    "sec_platforms": "Платформы",
    "sec_features": "Функции",
    "sec_how": "Как это работает",
    "sec_open": "Открытый код",

    "open_webapp": "Веб-приложение",

    "hero_eyebrow": "Boards от Laraue Software",
    "hero_title": "Kanban-доски\nбез лишней сложности",
    "hero_sub": "Отправьте сообщение боту — оно станет карточкой. Работайте с ней на доске, в одиночку или в команде. Без сложности Jira и долгого обучения Notion.",
    "hero_cta_web": "Открыть веб-приложение",

    "stat_free": "0$",
    "stat_free_label": "открытый код",
    "stat_types_label": "интерфейса: бот, Mini App, веб",
    "stat_modes_label": "режима: соло и командный",
    "stat_setup_label": "секунд чтобы начать",

    "mockup_title": "Моя доска — Спринт 3",
    "k_todo": "Сделать",
    "k_doing": "В работе",
    "k_done": "Готово",

    "uc_label": "Для двух сценариев",
    "uc_title": "Личная продуктивность\nили командная работа",
    "uc_sub": "Laraue Boards адаптируются под ваш стиль работы — одиночный или командный режим.",
    "uc_personal_title": "Личное использование",
    "uc_personal_desc": "Сохраняйте мысли, задачи и ссылки, не выходя из Telegram. Перешлите сообщение боту — оно окажется на доске.",
    "uc_p1": "Пересылайте что угодно — текст, фото, видео или альбом",
    "uc_p2": "Отредактировали сообщение в Telegram — карточка обновилась",
    "uc_p3": "Поиск по ключевому слову",
    "uc_p4": "Организуйте по эпикам и статусам, когда найдется время",
    "uc_p_cta": "Начать через Telegram-бота",
    "uc_teams_title": "Небольшие команды",
    "uc_teams_desc": "Лёгкая альтернатива Jira для команд, которым она кажется избыточной. Создайте организацию, пригласите коллег, работайте над задачами вместе.",
    "uc_t1": "Режим организации с общими досками",
    "uc_t2": "Приглашайте коллег через Telegram",
    "uc_t3": "Права по операциям над спейсами, эпиками и issues",
    "uc_t4": "Кастомные атрибуты, настраиваемые админом",
    "uc_t_cta": "Открыть веб-приложение",

    "pl_label": "Два способа использования",
    "pl_title": "Веб-приложение и Telegram Mini App",
    "pl_sub": "Начните в Telegram, продолжайте в браузере. Доски всегда синхронизированы.",
    "web_name": "Веб-приложение",
    "web_desc": "Полноценный Kanban в браузере. Вход через аккаунт Telegram без дополнительной регистрации.",
    "web_f1": "Вход через Telegram — без пароля",
    "web_f2": "Drag-and-drop Kanban",
    "web_f3": "Управление организацией и правами",
    "web_f4": "Адаптация под большой экран",
    "tg_name": "Telegram Mini App",
    "tg_desc": "Доступ к доскам прямо внутри Telegram. Перешлите любое сообщение боту — оно сразу появится на доске.",
    "tg_f1": "Пересылка сообщений из любого чата",
    "tg_f2": "Нативный iOS и Android",
    "tg_f3": "Мгновенно — ничего не нужно устанавливать",
    "tg_f4": "Те же доски, что в веб-приложении",

    "feat_label": "Всё, что нужно",
    "feat_title": "И ничего лишнего",
    "feat_sub": "Намеренная простота. Каждая функция действительно полезна.",
    "f1t": "Визуальные Kanban-доски",
    "f1d": "Drag-and-drop карточки по колонкам. Работает на любом экране.",
    "f2t": "Пересылка на доску",
    "f2d": "Отправьте сообщение боту — оно станет карточкой, а бот подтвердит это реакцией 👍.",
    "f3t": "Медиа и альбомы",
    "f3d": "Фото, видео и целые альбомы становятся одной карточкой со всеми вложениями, в исходном качестве.",
    "f4t": "Правки синхронизируются",
    "f4d": "Отредактируйте сообщение в Telegram — карточка изменится. Реакция сменится на ❤.",
    "f5t": "Спейсы и номера issues",
    "f5d": "Группируйте эпики в спейсы по проектам. У каждого issue есть номер вида WRK-42 — на него можно сослаться в чате.",
    "f6t": "Кастомные атрибуты",
    "f6d": "Админ задаёт атрибуты — тип задачи, выполнить до — а команда заполняет их в issues.",
    "f7t": "Организация и права",
    "f7d": "Общие доски и права, настраиваемые по операциям над спейсами, эпиками и issues.",
    "f8t": "Конфиденциальность",
    "f8d": "Вход через Telegram — без нового пароля. Данные не продаются.",
    "f9t": "Открытый код",
    "f9d": "Бэкенд и фронтенд открыты. Можно проверить, что происходит с сообщением.",

    "how_label": "Начало работы",
    "how_title": "От нуля до организованности за 4 шага",
    "step1t": "Откройте бота",
    "step1d": "Начните чат с",
    "step2t": "Отправьте сообщение",
    "step2d": "Напишите задачу или перешлите что-нибудь из другого чата. Это станет карточкой.",
    "step3t": "Разберите задачи",
    "step3d": "Откройте Mini App или веб-версию, перетаскивайте карточки между колонками, группируйте их в эпики.",
    "step4t": "Пригласите команду",
    "step4d": "Опционально: создайте организацию, пригласите коллег через Telegram и настройте права.",

    "os_label": "Разработка на виду",
    "os_title": "Открытый код, включая ошибки",
    "os_sub": "Можно прочитать код — и то, как он писался.",
    "os_code_title": "Код открыт",
    "os_code_desc": "Бэкенд и фронтенд лежат на GitHub. Пользователи писали, что не готовы доверить личные заметки незнакомому продукту, — открытый код честный ответ на это.",
    "os_code_cta": "Посмотреть на GitHub",
    "os_devlog_title": "Цикл статей",
    "os_devlog_desc": "Мы рассказываем, как продукт разрабатывается, включая то, что пошло не так: бот, который задавал слишком много вопросов и был откачен, решение в базе данных, которое оказалось неверным.",
    "os_devlog_cta": "Читать полную историю",

    "faq_label": "Вопросы",
    "faq_title": "Частые вопросы",
    "faq1q": "Это бесплатно?",
    "faq1a": "Да. Всё, что описано на этой странице, бесплатно. Платные тарифы появятся позже, вместе с ИИ-функциями, а то, что работает сегодня, останется бесплатным.",
    "faq2q": "Проект действительно опенсорсный?",
    "faq2a": "Да. Бэкенд и фронтенд открыты на GitHub — можно прочитать, что именно происходит с сообщением после отправки.",
    "faq3q": "Чем это отличается от «Сохраненных сообщений» в Telegram?",
    "faq3a": "«Сохраненные сообщения» — отличное место, чтобы что-то быстро сохранить, но плохое, чтобы это потом найти. Laraue Boards оставляет сохранение таким же простым и даёт сохранённому доску, колонки и статусы.",
    "faq4q": "Нужен ли аккаунт или пароль?",
    "faq4a": "Нет. Вход через Telegram: в Mini App вы уже авторизованы, а в веб-версии есть кнопка входа через Telegram.",

    "pr_note": "Laraue Boards бесплатен. Платные тарифы появятся позже, вместе с ИИ-функциями, — всё, что работает сегодня, останется бесплатным.",

    "cta_label": "Начните сегодня",
    "cta_title": "Ваши заметки заслуживают большего,\nчем затеряться в чате",
    "cta_sub": "Бесплатно и с открытым кодом. За 30 секунд.",
    "documentation": "Документация",
    "project_page": "Как это сделано",
    "project_description": "Подробнее о проекте"
  }
}
</i18n>

<template>
  <LMainContent>
    <LLandingIntro
        :pre-title="t('hero_eyebrow')"
        :title="t('hero_title')"
        :post-title="t('hero_sub')"
        :statistics="[
        {
          num: t('stat_free'),
          label: t('stat_free_label')
        },
        {
          num: 3,
          label: t('stat_types_label')
        },
        {
          num: 2,
          label: t('stat_modes_label')
        },
        {
          num: 30,
          label: t('stat_setup_label')
        }
      ]">
      <template #badges>
        <LPlatformBadge type="web" title="Web App" />
        <LPlatformBadge type="tg" title="Telegram Mini App" />
      </template>
      <template #actions>
        <LActionButton :title="t('hero_cta_web')" link="https://boards.laraue.com/" type="site" />
        <LActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
        <div class="hero-quick-links">
          <a :href="localePath('/blog/documentation/laraue-boards')">{{ t('documentation') }} &#8594;</a>
          <a :href="localePath('/blog/projects/boards')">{{ t('project_description') }} &#8594;</a>
        </div>
      </template>
      <template #visual>
        <div class="hero-visual">
          <!-- Kanban mockup -->
          <div class="kanban-mockup">
            <div class="kanban-mockup-bar">
              <div class="kanban-mockup-dots"><span></span><span></span><span></span></div>
              <span class="kanban-mockup-title">{{ t('mockup_title') }}</span>
            </div>
            <div class="kanban-mockup-body">
              <div class="km-col">
                <div class="km-col-title">{{ t('k_todo') }}</div>
                <div class="km-card red"><div class="km-card-label">{{ t('task_label') }}</div>{{ t('mockup_task1') }}</div>
                <div class="km-card red"><div class="km-card-label">{{ t('task_label') }}</div>{{ t('mockup_task2') }}</div>
                <div class="km-card purple"><div class="km-card-label">{{ t('idea_label') }}</div>{{ t('mockup_idea1') }}</div>
              </div>
              <div class="km-col">
                <div class="km-col-title">{{ t('k_doing') }}</div>
                <div class="km-card blue"><div class="km-card-label">{{ t('task_label') }}</div>{{ t('mockup_task3') }}</div>
                <div class="km-card blue"><div class="km-card-label">{{ t('resource_label') }}</div>{{ t('mockup_resource1') }}</div>
              </div>
              <div class="km-col">
                <div class="km-col-title">{{ t('k_done') }}</div>
                <div class="km-card green"><div class="km-card-label">{{ t('task_label') }}</div>{{ t('mockup_task4') }}</div>
                <div class="km-card green"><div class="km-card-label">{{ t('task_label') }}</div>{{ t('mockup_task5') }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </LLandingIntro>

    <!-- ══ USE CASES ══ -->
    <LSection :pre-title="t('uc_label')" :title="t('uc_title')" :post-title="t('uc_sub')" type="cream">
      <div class="use-cases-grid">
        <div class="use-case-card personal reveal">
          <div class="use-case-icon"><LNavIcon name="brain" /></div>
          <div class="use-case-title">{{ t('uc_personal_title') }}</div>
          <p class="use-case-desc">{{ t('uc_personal_desc') }}</p>
          <ul class="use-case-list">
            <li>{{ t('uc_p1') }}</li>
            <li>{{ t('uc_p2') }}</li>
            <li>{{ t('uc_p3') }}</li>
            <li>{{ t('uc_p4') }}</li>
          </ul>
          <a href="https://t.me/msgboard_bot" class="use-case-link" target="_blank" rel="noopener">{{ t('uc_p_cta') }} &#8594;</a>
        </div>
        <div class="use-case-card teams reveal">
          <div class="use-case-icon"><LNavIcon name="partners" /></div>
          <div class="use-case-title">{{ t('uc_teams_title') }}</div>
          <p class="use-case-desc">{{ t('uc_teams_desc') }}</p>
          <ul class="use-case-list">
            <li>{{ t('uc_t1') }}</li>
            <li>{{ t('uc_t2') }}</li>
            <li>{{ t('uc_t3') }}</li>
            <li>{{ t('uc_t4') }}</li>
          </ul>
          <a target="_blank" href="https://boards.laraue.com/" class="use-case-link">{{ t('uc_t_cta') }} &#8594;</a>
        </div>
      </div>
    </LSection>

    <!-- ══ PLATFORMS ══ -->
    <LSection :pre-title="t('pl_label')" :title="t('pl_title')" :post-title="t('pl_sub')" type="light">
      <div class="platforms-grid">
        <div class="platform-card reveal">
          <div class="platform-card-header">
            <div class="platform-card-icon web"><LNavIcon name="globe" /></div>
            <div>
              <div class="platform-card-name">{{ t('web_name') }}</div>
              <div class="platform-card-tag">boards.laraue.com</div>
            </div>
          </div>
          <p class="platform-card-desc">{{ t('web_desc') }}</p>
          <ul class="platform-card-features">
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f1') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f2') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f3') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f4') }}</span></li>
          </ul>
          <a target="_blank" href="https://boards.laraue.com/" class="btn-secondary" style="align-self:flex-start">{{ t('open_webapp') }}</a>
        </div>

        <div class="platform-card reveal">
          <div class="platform-card-header">
            <div class="platform-card-icon tg"><LNavIcon name="chat" /></div>
            <div>
              <div class="platform-card-name">{{ t('tg_name') }}</div>
              <div class="platform-card-tag">@msgboard_bot</div>
            </div>
          </div>
          <p class="platform-card-desc">{{ t('tg_desc') }}</p>
          <ul class="platform-card-features">
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f1') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f2') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f3') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f4') }}</span></li>
          </ul>
          <a href="https://t.me/msgboard_bot" class="btn-tg" style="align-self:flex-start" target="_blank" rel="noopener">&#128172; @msgboard_bot</a>
        </div>

      </div>
    </LSection>

    <!-- ══ FEATURES ══ -->
    <LFeaturesGrid
        :pre-title="t('feat_label')"
        :title="t('feat_title')"
        :post-title="t('feat_sub')"
        type="dark"
        :features="[
      {
        title: t('f1t'),
        icon: 'board',
        description: t('f1d'),
        link: localePath('/blog/documentation/laraue-boards/getting-started/quick-start')
      },
      {
        title: t('f2t'),
        icon: 'mail',
        description: t('f2d'),
        link: localePath('/blog/documentation/laraue-boards/working-alone/telegram-messages')
      },
      {
        title: t('f3t'),
        icon: 'camera',
        description: t('f3d')
      },
      {
        title: t('f4t'),
        icon: 'edit',
        description: t('f4d')
      },
      {
        title: t('f5t'),
        icon: 'tag',
        description: t('f5d')
      },
      {
        title: t('f6t'),
        icon: 'gear',
        description: t('f6d'),
        link: localePath('/blog/documentation/laraue-boards/features/attributes')
      },
      {
        title: t('f7t'),
        icon: 'partners',
        description: t('f7d'),
        link: localePath('/blog/documentation/laraue-boards/concepts/organizations')
      },
      {
        title: t('f8t'),
        icon: 'lock',
        description: t('f8d'),
        link: localePath('/blog/documentation/laraue-boards/getting-started/authorization')
      },
      {
        title: t('f9t'),
        icon: 'code',
        description: t('f9d'),
        link: 'https://github.com/win7user10/Laraue.Apps.Boards'
      }
    ]" />

    <!-- ══ HOW IT WORKS ══ -->
    <LSteps
        :pre-title="t('how_label')"
        :title="t('how_title')"
        :steps="[
        {
          title: t('step1t'),
          description: t('step1d') + ' @msgboard_bot.',
        },
        {
          title: t('step2t'),
          description: t('step2d'),
        },
        {
          title: t('step3t'),
          description: t('step3d'),
        },
        {
          title: t('step4t'),
          description: t('step4d'),
        },
      ]"/>

    <!-- ══ OPEN SOURCE / BUILT IN THE OPEN ══ -->
    <LSection :pre-title="t('os_label')" :title="t('os_title')" :post-title="t('os_sub')" type="cream">
      <div class="use-cases-grid">
        <div class="use-case-card personal reveal">
          <div class="use-case-icon"><LNavIcon name="code" /></div>
          <div class="use-case-title">{{ t('os_code_title') }}</div>
          <p class="use-case-desc">{{ t('os_code_desc') }}</p>
          <ul class="use-case-list">
            <li>Laraue.Apps.Boards — .NET 10 / C#, PostgreSQL 18</li>
            <li>laraue-boards — Nuxt 4, Vue 3, TypeScript</li>
          </ul>
          <a href="https://github.com/win7user10/Laraue.Apps.Boards" class="use-case-link" target="_blank" rel="noopener">{{ t('os_code_cta') }} &#8594;</a>
        </div>
        <div class="use-case-card teams reveal">
          <div class="use-case-icon"><LNavIcon name="book" /></div>
          <div class="use-case-title">{{ t('os_devlog_title') }}</div>
          <p class="use-case-desc">{{ t('os_devlog_desc') }}</p>
          <a :href="localePath('/blog/articles/building-jira-alternative-solo-why-and-repositories')" class="use-case-link">{{ t('os_devlog_cta') }} &#8594;</a>
        </div>
      </div>
      <p class="pricing-note reveal">{{ t('pr_note') }}</p>
    </LSection>

    <!-- ══ FAQ ══ -->
    <section class="faq" id="faq">
      <div class="faq-inner">
        <div class="section-label reveal">{{ t('faq_label') }}</div>
        <h2 class="section-title reveal">{{ t('faq_title') }}</h2>
        <div class="faq-list">
          <details class="faq-item reveal">
            <summary>{{ t('faq1q') }}</summary>
            <p>{{ t('faq1a') }}</p>
          </details>
          <details class="faq-item reveal">
            <summary>{{ t('faq2q') }}</summary>
            <p>{{ t('faq2a') }}</p>
          </details>
          <details class="faq-item reveal">
            <summary>{{ t('faq3q') }}</summary>
            <p>{{ t('faq3a') }}</p>
          </details>
          <details class="faq-item reveal">
            <summary>{{ t('faq4q') }}</summary>
            <p>{{ t('faq4a') }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <LCallToAction :title="t('cta_title')" :pre-title="t('cta_label')" :post-title="t('cta_sub')">
      <LActionButton :title="t('hero_cta_web')" link="https://boards.laraue.com/" type="site" />
      <LActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
    </LCallToAction>
  </LMainContent>
</template>

<style scoped>
section {
  --msg-blue:#2d7dd2; --msg-blue-light:#e8f2fc;
  --msg-green:#2d8a55; --msg-green-light:#e6f7ee;
}

/* ══ HERO QUICK LINKS ══ */
.hero-quick-links{flex-basis:100%;display:flex;gap:20px;flex-wrap:wrap;margin-top:6px}
.hero-quick-links a{font-size:13px;font-weight:600;color:rgba(247,244,238,.65);text-decoration:underline;text-decoration-color:rgba(247,244,238,.3);text-underline-offset:3px;transition:color .2s,text-decoration-color .2s}
.hero-quick-links a:hover{color:#fff;text-decoration-color:rgba(255,255,255,.6)}

/* ══ SHARED UTILS ══ */
.btn-secondary{background:transparent;color:var(--ink);padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;border:1.5px solid var(--border);display:inline-flex;align-items:center;gap:8px;transition:border-color .2s,background .2s,transform .15s}
.btn-secondary:hover{border-color:var(--ink);background:var(--cream);transform:translateY(-2px)}
.btn-tg{background:#229ed9;color:#fff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-flex;align-items:center;gap:8px;transition:background .2s,transform .15s}
.btn-tg:hover{background:#1a8abf;transform:translateY(-1px)}
.section-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-label::after{content:'';flex:1;max-width:40px;height:1px;background:var(--accent);opacity:.5}
.section-title{font-family:var(--serif);font-size:clamp(26px,3vw,42px);line-height:1.12;letter-spacing:-.3px;margin-bottom:16px}
.section-sub{font-size:17px;color:var(--muted);font-weight:300;line-height:1.7;}

.hero-title em{font-style:italic;color:#6ab0f0}
.hero-title .accent{color:var(--accent)}
/* hero kanban visual */
.hero-visual{animation:fadeUp .9s .25s ease both;position:relative}

.kanban-mockup{
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.12);
  border-radius:16px;overflow:hidden;
  backdrop-filter:blur(8px);
}
.kanban-mockup-bar{
  background:rgba(255,255,255,.08);
  padding:10px 16px;display:flex;align-items:center;gap:8px;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.kanban-mockup-dots{display:flex;gap:5px}
.kanban-mockup-dots span{width:8px;height:8px;border-radius:50%}
.kanban-mockup-dots span:nth-child(1){background:#e05353}
.kanban-mockup-dots span:nth-child(2){background:#e0a653}
.kanban-mockup-dots span:nth-child(3){background:#53e07a}
.kanban-mockup-title{font-size:11px;color:rgba(255,255,255,.4);margin:0 auto;font-weight:600;letter-spacing:.03em}

.kanban-mockup-body{padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.km-col-title{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:8px;padding:0 2px}
.km-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 11px;margin-bottom:7px;font-size:11px;color:rgba(255,255,255,.8);line-height:1.4;border-left-width:3px}
.km-card.red{border-left-color:var(--accent)}
.km-card.blue{border-left-color:#6ab0f0}
.km-card.green{border-left-color:#6edd9a}
.km-card.purple{border-left-color:#b48ef5}
.km-card-label{font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px;opacity:.5}

/* ══ USE CASES ══ */
.use-cases-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px}

.use-case-card{
  background:#fff;border:1px solid var(--border);border-radius:16px;
  padding:36px 36px 32px;overflow:hidden;position:relative;
  transition:box-shadow .2s,transform .2s;
}
.use-case-card:hover{box-shadow:0 8px 32px rgba(15,14,12,.1);transform:translateY(-3px)}
.use-case-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px}
.use-case-card.personal::before{background:linear-gradient(90deg,var(--msg-blue),#6ab0f0)}
.use-case-card.teams::before{background:linear-gradient(90deg,var(--accent),#e0572e)}

.use-case-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.use-case-card.personal .use-case-icon{background:var(--msg-blue-light);color:var(--msg-blue)}
.use-case-card.teams .use-case-icon{background:var(--accent-light);color:var(--accent)}
.use-case-icon :deep(.nav-icon-svg){width:22px;height:22px}
.use-case-title{font-family:var(--serif);font-size:22px;font-weight:700;letter-spacing:-.2px;margin-bottom:10px}
.use-case-desc{font-size:15px;color:var(--muted);line-height:1.65;font-weight:300;margin-bottom:24px}
.use-case-list{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:28px}
.use-case-list li{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--muted);line-height:1.4}
.use-case-list li::before{content:'✓';font-weight:700;color:var(--msg-green);flex-shrink:0;margin-top:1px}
.use-case-card.teams .use-case-list li::before{color:var(--accent)}

.use-case-link{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;text-decoration:none;transition:gap .15s}
.use-case-card.personal .use-case-link{color:var(--msg-blue)}
.use-case-card.teams .use-case-link{color:var(--accent)}
.use-case-card:hover .use-case-link{gap:10px}

/* ══ PLATFORMS ══ */
.platforms-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px}

.platform-card{
  border:1px solid var(--border);border-radius:16px;
  padding:36px;background:#fff;
  display:flex;flex-direction:column;
  transition:box-shadow .2s,transform .2s;
}
.platform-card:hover{box-shadow:0 8px 32px rgba(15,14,12,.09);transform:translateY(-3px)}

.platform-card-header{display:flex;align-items:center;gap:14px;margin-bottom:20px}
.platform-card-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.platform-card-icon.web{background:var(--msg-blue-light);color:var(--msg-blue)}
.platform-card-icon.tg{background:#e0f4fd;color:#229ed9}
.platform-card-icon :deep(.nav-icon-svg){width:24px;height:24px}
.platform-card-name{font-family:var(--serif);font-size:18px;font-weight:700;letter-spacing:-.2px}
.platform-card-tag{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:2px}
.platform-card-desc{font-size:15px;color:var(--muted);line-height:1.65;font-weight:300;flex:1;margin-bottom:24px}
.platform-card-features{list-style:none;display:flex;flex-direction:column;gap:7px;margin-bottom:28px}
.platform-card-features li{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
.platform-card-features li svg{width:14px;height:14px;stroke:var(--msg-green);flex-shrink:0}

/* ══ PRICING NOTE ══ */
.pricing-note{text-align:center;margin-top:36px;font-size:14px;color:var(--muted)}

/* ══ FAQ ══ */
.faq{padding:80px 60px;border-bottom:1px solid var(--border)}
.faq-inner{max-width:820px;margin:0 auto}
.faq-list{display:flex;flex-direction:column;gap:12px;margin-top:40px}
.faq-item{background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px 24px;transition:box-shadow .2s}
.faq-item:hover{box-shadow:0 4px 18px rgba(15,14,12,.07)}
.faq-item summary{font-weight:700;font-size:15px;color:var(--ink);cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:'+';font-size:20px;font-weight:400;color:var(--muted);flex-shrink:0;transition:transform .2s}
.faq-item[open] summary::after{transform:rotate(45deg)}
.faq-item p{margin-top:14px;font-size:15px;color:var(--muted);line-height:1.7;font-weight:300}

/* ══ RESPONSIVE ══ */
@media(max-width:1100px){
  .sidebar-links li a span:not(.sidebar-icon){display:none}
  .sidebar-links li a{padding:11px;justify-content:center;border-left:none;border-radius:8px;margin:0 4px}
  .sidebar-links li a.active{background:rgba(200,75,47,.1)}
  .sidebar-links li a .sidebar-icon{width:auto;font-size:16px}
}
@media(max-width:900px){
  .use-cases-grid,.platforms-grid{grid-template-columns:1fr}
}
@media(max-width:720px){
  .hero-visual{order:-1}
  .faq{padding:60px 22px}
}
</style>