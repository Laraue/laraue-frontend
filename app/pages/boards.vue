<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t } = useI18n();
const imageUrl = "https://laraue.com/images/note-board-bot-app.jpg";

import {
  defineOffer,
  defineSoftwareApp,
  useSchemaOrg,
  defineAggregateRating,
  defineReview,
  definePerson,
} from '@unhead/schema-org/vue'
import LMainContent from "~/components/ui/LMainContent.vue";
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
      }),
      defineOffer({
        price: 5,
        priceCurrency: "USD",
        description: 'Organization mode. Unlimited types, statuses, cards, AI categorization, and CSV/Notion export'
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
    "seoTitle": "Laraue Boards — Turn Telegram Messages into Beautiful Kanban Boards",
    "seoDescription": "Stop losing important messages in Telegram. Note Board Bot transforms saved messages into visual boards with custom statuses. Free Kanban organization for Telegram.",
    "sec_top": "Overview",
    "sec_use_cases": "Use cases",
    "sec_platforms": "Platforms",
    "sec_features": "Features",
    "sec_how": "How it works",
    "sec_pricing": "Pricing",
    "open_webapp": "Web App",
    "hero_eyebrow": "Boards by Laraue Software",
    "hero_title": "Kanban boards\nwithout the complexity",
    "hero_sub": "Track tasks, capture ideas, manage projects — for yourself or your team. No Jira complexity, no Notion learning curve. Just clean boards that work.",
    "hero_cta_web": "Open Web App",
    "stat_free": "Free",
    "stat_free_label": "to start",
    "stat_types_label": "board types",
    "stat_modes_label": "modes: personal & team",
    "stat_setup_label": "sec. to get started",
    "mockup_title": "My Board — Sprint 3",
    "k_todo": "To Do",
    "k_doing": "Doing",
    "k_done": "Done",
    "org_badge": "3 team members online",
    "uc_label": "Built for two worlds",
    "uc_title": "Personal productivity\nor team coordination",
    "uc_sub": "Laraue Boards adapts to how you work — solo or with a team. Switch modes anytime.",
    "uc_personal_title": "Personal use",
    "uc_personal_desc": "Capture and organize your thoughts, tasks and resources without context switching. Forward Telegram messages directly to your board.",
    "uc_p1": "Capture Telegram messages with one forward",
    "uc_p2": "Organize tasks, ideas, notes and reading lists",
    "uc_p3": "Search everything by keyword instantly",
    "uc_p4": "AI auto-suggests the right category",
    "uc_p_cta": "Start with Telegram bot",
    "uc_teams_title": "Small teams",
    "uc_teams_desc": "A lightweight Jira alternative for teams that find Jira overwhelming. Create an organization, invite teammates, track work together.",
    "uc_t1": "Organization mode with shared boards",
    "uc_t2": "Invite teammates via Telegram",
    "uc_t3": "Assign tasks, track progress together",
    "uc_t4": "Export to CSV / Notion anytime",
    "uc_t_cta": "Open web app",
    "pl_label": "Two ways to use it",
    "pl_title": "Web app & Telegram Mini App",
    "pl_sub": "Start in Telegram, continue in the browser. Your boards are always in sync.",
    "web_name": "Web App",
    "web_desc": "Full-featured Kanban experience in the browser. Sign in with your Telegram account — no separate registration needed. Works on desktop and mobile.",
    "web_f1": "Telegram login — no password",
    "web_f2": "Full drag-and-drop Kanban",
    "web_f3": "Organization & team management",
    "web_f4": "Large screen — see more, do more",
    "tg_name": "Telegram Mini App",
    "tg_desc": "Access your boards directly inside Telegram without leaving the app. Forward any message to the bot and it lands on your board in seconds.",
    "tg_f1": "Forward messages from any chat",
    "tg_f2": "Native iOS & Android feel",
    "tg_f3": "Instant — no app to install",
    "tg_f4": "Same boards as the web app",
    "feat_label": "Everything you need",
    "feat_title": "Nothing you don't",
    "feat_sub": "Deliberately simple. Every feature earns its place.",
    "f1t": "Visual Kanban Boards",
    "f1d": "Drag-and-drop cards across columns. Clean, fast, works on any screen.",
    "f2t": "Organization Mode",
    "f2d": "Create a shared workspace, invite teammates, manage boards together.",
    "f3t": "Forward to Board",
    "f3d": "Send any Telegram message to the bot and it appears as a card instantly.",
    "f4t": "Custom Workflows",
    "f4d": "Define your own statuses per board type. Color-code, reorder, rename freely.",
    "f5t": "Instant Search",
    "f5d": "Find any card by keyword. Filter by type, status or date in one click.",
    "f6t": "AI Categorization",
    "f6d": "Premium: AI reads your message and suggests the right type and status.",
    "f7t": "Export",
    "f7d": "Export any board to CSV or Notion. Your data is always portable.",
    "f8t": "Privacy first",
    "f8d": "Your data is never sold. Login via Telegram — no new password.",
    "f9t": "Honest free tier",
    "f9d": "Real free plan, not a 14-day trial. Upgrade only when you need more.",
    "how_label": "Getting started",
    "how_title": "From zero to organized in 5 steps",
    "step1t": "Open the app",
    "step1d": "Sign in at msgboard.laraue.com with Telegram, or open",
    "step2t": "Create a board",
    "step2d": "Pick a template or start blank. Name your columns.",
    "step3t": "Add cards",
    "step3d": "Type a task, or forward any Telegram message directly to the board.",
    "step4t": "Invite your team",
    "step4d": "Optional: create an organization and invite teammates via Telegram.",
    "step5t": "Ship things",
    "step5d": "Drag cards, track progress, export when you need to.",
    "wf_label": "Built-in templates",
    "wf_title": "Ready-to-use workflows",
    "wf_sub": "Each type ships with a sensible default — customize anytime.",
    "wf_tasks": "Tasks",
    "wf_ideas": "Ideas",
    "wf_resources": "Resources",
    "wf_notes": "Notes",
    "wf_todo": "To Do",
    "wf_doing": "Doing",
    "wf_done": "Done",
    "wf_raw": "Raw",
    "wf_developing": "Developing",
    "wf_ready": "Ready",
    "wf_toread": "To Read",
    "wf_reading": "Reading",
    "wf_archived": "Archived",
    "wf_draft": "Draft",
    "wf_final": "Final",
    "wf_reference": "Reference",
    "pr_label": "Simple pricing",
    "pr_title": "Start free, grow when ready",
    "pr_sub": "No surprises. No trial periods. The free plan is real.",
    "tier_free": "Free",
    "tier_premium": "Premium",
    "tier_team": "Team",
    "pr_forever": "forever",
    "pr_month": "per month",
    "pr_month_member": "per member / month",
    "pf1": "4 board types",
    "pf2": "3 statuses per type",
    "pf3": "Up to 100 cards",
    "pf4": "Web app + Telegram",
    "pf5": "Keyword search",
    "pf6": "AI categorization",
    "pf7": "Export to CSV / Notion",
    "pf8": "Team organization",
    "pp1": "Unlimited board types",
    "pp2": "Unlimited custom statuses",
    "pp3": "Unlimited cards",
    "pp4": "Web app + Telegram",
    "pp5": "Keyword search",
    "pt1": "Everything in Premium",
    "pt2": "Organization workspace",
    "pt3": "Shared team boards",
    "pt4": "Invite via Telegram",
    "pt5": "Task assignment",
    "pt6": "Priority support",
    "pr_start_free": "Start free",
    "pr_get_premium": "Get Premium",
    "pr_start_team": "Start team trial",
    "pr_note": "All plans include Telegram login. No credit card required to start.",
    "tm_label": "People using it",
    "tm_title": "What they say",
    "tm1": "I used to screenshot important messages and forget about them. Now I forward everything and my task board is always current. It became part of my daily PM workflow.",
    "tm1_role": "Product Manager, SaaS startup",
    "tm2": "We were using Jira for a 3-person team. Way too much overhead. Laraue Boards gives us exactly what we need — shared boards, no configuration hell.",
    "tm2_role": "Co-founder, early-stage startup",
    "tm3": "As a researcher I save papers and notes from different Telegram groups constantly. The Resources board with Reading → Archived is exactly the workflow I needed.",
    "tm3_role": "Independent Researcher",
    "cta_label": "Get started today",
    "cta_title": "Your work deserves\nbetter than chat history",
    "cta_sub": "Free to start. No credit card. Works in 30 seconds."
  },
  "ru": {
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
    "seoTitle": "Laraue Boards — Превращайте сообщения Telegram в красивые Kanban-доски",
    "seoDescription": "Перестаньте терять важные сообщения в Telegram. Note Board Bot превращает сохраненные сообщения в визуальные доски с настраиваемыми статусами. Бесплатная Kanban-организация для Telegram.",
    "sec_top": "Обзор",
    "sec_use_cases": "Кейсы",
    "sec_platforms": "Платформы",
    "sec_features": "Функции",
    "sec_how": "Как это работает",
    "sec_pricing": "Цены",
    "open_webapp": "Веб-приложение",
    "hero_eyebrow": "Boards от Laraue Software",
    "hero_title": "Kanban-доски\nбез лишней сложности",
    "hero_sub": "Отслеживайте задачи, сохраняйте идеи, управляйте проектами — для себя или вашей команды. Без сложности Jira и долгого обучения Notion.",
    "hero_cta_web": "Открыть веб-приложение",
    "stat_free": "Free",
    "stat_free_label": "для старта",
    "stat_types_label": "типа досок",
    "stat_modes_label": "режима: личный и командный",
    "stat_setup_label": "сек. чтобы начать",
    "mockup_title": "Моя доска — Спринт 3",
    "k_todo": "Сделать",
    "k_doing": "В работе",
    "k_done": "Готово",
    "org_badge": "3 участника онлайн",
    "uc_label": "Для двух сценариев",
    "uc_title": "Личная продуктивность\nили командная работа",
    "uc_sub": "Laraue Boards адаптируются под ваш стиль работы — одиночный или командный режим.",
    "uc_personal_title": "Личное использование",
    "uc_personal_desc": "Сохраняйте мысли, задачи и материалы без переключений контекста.",
    "uc_p1": "Пересылайте сообщения Telegram одним действием",
    "uc_p2": "Организуйте задачи, идеи, заметки и ресурсы",
    "uc_p3": "Мгновенный поиск по ключевому слову",
    "uc_p4": "AI автоматически предлагает категорию",
    "uc_p_cta": "Начать через Telegram",
    "uc_teams_title": "Небольшие команды",
    "uc_teams_desc": "Лёгкая альтернатива Jira для команд, которые ищут более простые и дешевые варианты.",
    "uc_t1": "Режим организации с общими досками",
    "uc_t2": "Приглашайте коллег через Telegram",
    "uc_t3": "Назначайте задачи, отслеживайте прогресс",
    "uc_t4": "Экспорт в CSV / Notion в любой момент",
    "uc_t_cta": "Открыть веб-приложение",
    "pl_label": "Два способа использования",
    "pl_title": "Веб-приложение и Telegram Mini App",
    "pl_sub": "Начните в Telegram, продолжайте в браузере. Доски всегда синхронизированы.",
    "web_name": "Веб-приложение",
    "web_desc": "Полноценный Kanban в браузере. Вход через аккаунт Telegram без дополнительной регистрации.",
    "web_f1": "Вход через Telegram — без пароля",
    "web_f2": "Drag-and-drop Kanban",
    "web_f3": "Управление организацией и командой",
    "web_f4": "Адаптация под Большой экран",
    "tg_name": "Telegram Mini App",
    "tg_desc": "Доступ к Boards прямо внутри Telegram. Перешлите любое сообщение боту — оно сразу появится на доске.",
    "tg_f1": "Пересылка сообщений из любого чата",
    "tg_f2": "Нативный iOS и Android",
    "tg_f3": "Мгновенно — не нужно ничего устанавливать",
    "tg_f4": "Те же доски, что в веб-приложении",
    "feat_label": "Всё, что нужно",
    "feat_title": "И ничего лишнего",
    "feat_sub": "Намеренная простота. Каждая функция действительно полезна.",
    "f1t": "Визуальные Kanban-доски",
    "f1d": "Drag-and-drop карточки по колонкам.",
    "f2t": "Режим организации",
    "f2d": "Создайте общее пространство, приглашайте коллег.",
    "f3t": "Пересылка на доску",
    "f3d": "Отправьте сообщение боту — оно станет карточкой.",
    "f4t": "Пользовательские рабочие процессы",
    "f4d": "Свои статусы, цвета, порядок колонок.",
    "f5t": "Мгновенный поиск",
    "f5d": "Найдите любую карточку по ключевому слову.",
    "f6t": "AI-категоризация",
    "f6d": "Premium: AI предлагает тип и статус по содержанию.",
    "f7t": "Экспорт",
    "f7d": "Экспорт в CSV или Notion. Данные всегда ваши.",
    "f8t": "Конфиденциальность",
    "f8d": "Данные не продаются. Вход через Telegram.",
    "f9t": "Честный бесплатный тариф",
    "f9d": "Настоящий бесплатный тариф, а не пробный период.",
    "how_label": "Начало работы",
    "how_title": "От нуля до организованности за 5 шагов",
    "step1t": "Откройте приложение",
    "step1d": "Авторизуйтесь на msgboard.laraue.com через Telegram или откройте",
    "step2t": "Создайте доску",
    "step2d": "Выберите шаблон или настройте самостоятельно.",
    "step3t": "Добавьте карточки",
    "step3d": "Напишите задачу или перешлите сообщение из Telegram.",
    "step4t": "Пригласите команду",
    "step4d": "Опционально: создайте организацию и пригласите коллег.",
    "step5t": "Делайте дела",
    "step5d": "Перетаскивайте карточки, экспортируйте по необходимости.",
    "wf_label": "Встроенные шаблоны",
    "wf_title": "Готовые рабочие доски",
    "wf_sub": "Каждая с предустановленным шаблоном.",
    "wf_tasks": "Задачи",
    "wf_ideas": "Идеи",
    "wf_resources": "Ресурсы",
    "wf_notes": "Заметки",
    "wf_todo": "Сделать",
    "wf_doing": "В работе",
    "wf_done": "Готово",
    "wf_raw": "Не проработана",
    "wf_developing": "В работе",
    "wf_ready": "Готова",
    "wf_toread": "К чтению",
    "wf_reading": "Чтение",
    "wf_archived": "Архив",
    "wf_draft": "Черновик",
    "wf_final": "Готово",
    "wf_reference": "Для справки",
    "pr_label": "Простое ценообразование",
    "pr_title": "Начните бесплатно, переходите на другой тариф, если потребуется",
    "pr_sub": "Без сюрпризов. Без пробных периодов. Бесплатный тариф не ограничен по времени.",
    "tier_free": "Бесплатно",
    "tier_premium": "Premium",
    "tier_team": "Команда",
    "pr_forever": "навсегда",
    "pr_month": "в месяц",
    "pr_month_member": "за участника / месяц",
    "pf1": "4 типа досок",
    "pf2": "3 статуса на тип",
    "pf3": "До 100 карточек",
    "pf4": "Веб + Telegram",
    "pf5": "Поиск по ключевому слову",
    "pf6": "AI-категоризация",
    "pf7": "Экспорт в CSV / Notion",
    "pf8": "Командная организация",
    "pp1": "Неограниченно типов досок",
    "pp2": "Неограниченно статусов",
    "pp3": "Неограниченно карточек",
    "pp4": "Веб + Telegram",
    "pp5": "Поиск",
    "pt1": "Всё из Premium",
    "pt2": "Пространство организации",
    "pt3": "Общие доски",
    "pt4": "Приглашение через Telegram",
    "pt5": "Назначение задач",
    "pt6": "Приоритетная поддержка",
    "pr_start_free": "Начать бесплатно",
    "pr_get_premium": "Получить Premium",
    "pr_start_team": "Начать пробный период для команды",
    "pr_note": "Все планы включают веб-версию с авторизацией через Telegram. Привязка банковской карты не требуется.",
    "tm_label": "Пользователи",
    "tm_title": "Что говорят",
    "tm1": "Я раньше делал скриншоты важных сообщений и забывал о них. Теперь пересылаю всё боту — доска всегда актуальна.",
    "tm1_role": "Продакт-менеджер",
    "tm2": "Мы использовали Jira в команде из 3 человек. Слишком много настроек. Laraue Boards даёт ровно то, что нужно.",
    "tm2_role": "Со-основатель стартапа",
    "tm3": "Как исследователь я постоянно сохраняю ссылки и заметки из чатов. Доска ресурсов — именно то, что мне нужно.",
    "tm3_role": "Независимый исследователь",
    "cta_label": "Начните сегодня",
    "cta_title": "Ваши заметки заслуживают большего, чем затеряться в чате",
    "cta_sub": "Бесплатно. Без карты. За 30 секунд."
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
          num: 4,
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
        <LActionButton :title="t('hero_cta_web')" link="https://msgboard.laraue.com/" type="site" />
        <LActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
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
          <div class="org-badge">
            <div class="org-badge-dot"></div>
            <span>{{ t('org_badge') }}</span>
          </div>
        </div>
      </template>
    </LLandingIntro>

    <!-- ══ USE CASES ══ -->
    <LSection :pre-title="t('uc_label')" :title="t('uc_title')" :post-title="t('uc_sub')" type="cream">
      <div class="use-cases-grid">
        <div class="use-case-card personal reveal">
          <div class="use-case-icon">&#129504;</div>
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
          <div class="use-case-icon">&#128101;</div>
          <div class="use-case-title">{{ t('uc_teams_title') }}</div>
          <p class="use-case-desc">{{ t('uc_teams_desc') }}</p>
          <ul class="use-case-list">
            <li>{{ t('uc_t1') }}</li>
            <li>{{ t('uc_t2') }}</li>
            <li>{{ t('uc_t3') }}</li>
            <li>{{ t('uc_t4') }}</li>
          </ul>
          <a target="_blank" href="https://msgboard.laraue.com/" class="use-case-link">{{ t('uc_t_cta') }} &#8594;</a>
        </div>
      </div>
    </LSection>

    <!-- ══ PLATFORMS ══ -->
    <LSection :pre-title="t('pl_label')" :title="t('pl_title')" :post-title="t('pl_sub')" type="light">
      <div class="platforms-grid">
        <div class="platform-card reveal">
          <div class="platform-card-header">
            <div class="platform-card-icon web">&#127760;</div>
            <div>
              <div class="platform-card-name">{{ t('web_name') }}</div>
              <div class="platform-card-tag">Laraue Boards.laraue.com</div>
            </div>
          </div>
          <p class="platform-card-desc">{{ t('web_desc') }}</p>
          <ul class="platform-card-features">
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f1') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f2') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f3') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f4') }}</span></li>
          </ul>
          <a target="_blank" href="https://msgboard.laraue.com/" class="btn-secondary" style="align-self:flex-start">{{ t('open_webapp') }}</a>
        </div>

        <div class="platform-card reveal">
          <div class="platform-card-header">
            <div class="platform-card-icon tg">&#128172;</div>
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
        icon: '&#128203;',
        description: t('f1d'),
        link: localePath('/blog/documentation/laraue-boards/getting-started/quick-start')
      },
      {
        title: t('f2t'),
        icon: '&#128101;',
        description: t('f2d'),
        link: localePath('/blog/documentation/laraue-boards/concepts/organizations')
      },
      {
        title: t('f3t'),
        icon: '&#128239;',
        description: t('f3d'),
        link: localePath('/blog/documentation/laraue-boards/working-alone/telegram-messages')
      },
      {
        title: t('f4t'),
        icon: '&#127775;',
        description: t('f4d'),
        link: localePath('/blog/documentation/laraue-boards/features/attributes')
      },
      {
        title: t('f5t'),
        icon: '&#128269;',
        description: t('f5d'),
        link: localePath('/blog/documentation/laraue-boards/features/search')
      },
      {
        title: t('f6t'),
        icon: '&#10024;',
        description: t('f6d')
      },
      {
        title: t('f7t'),
        icon: '&#128229;',
        description: t('f7d')
      },
      {
        title: t('f8t'),
        icon: '&#128274;',
        description: t('f8d'),
        link: localePath('/blog/documentation/laraue-boards/getting-started/authorization')
      },
      {
        title: t('f9t'),
        icon: '&#128176;',
        description: t('f9d')
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
        {
          title: t('step5t'),
          description: t('step5d'),
        },
      ]"/>

    <!-- ══ WORKFLOWS ══ -->
    <section class="workflows" id="workflows">
      <div class="workflows-inner">
        <div class="section-label reveal">{{ t('wf_label') }}</div>
        <h2 class="section-title reveal">{{ t('wf_title') }}</h2>
        <p class="section-sub reveal">{{ t('wf_sub') }}</p>
        <div class="workflows-grid">
          <div class="workflow-card reveal">
            <div class="workflow-icon">&#128203;</div>
            <div class="workflow-name">{{ t('wf_tasks') }}</div>
            <div class="workflow-stages">
              <div class="workflow-stage"><div class="workflow-dot" style="background:#e0a653"></div><span>{{ t('wf_todo') }}</span></div>
              <div class="workflow-stage"><div class="workflow-dot" style="background:#6ab0f0"></div><span>{{ t('wf_doing') }}</span></div>
              <div class="workflow-stage"><div class="workflow-dot" style="background:#6edd9a"></div><span>{{ t('wf_done') }}</span></div>
            </div>
          </div>
          <div class="workflow-card reveal">
            <div class="workflow-icon">&#128161;</div>
            <div class="workflow-name">{{ t('wf_ideas') }}</div>
            <div class="workflow-stages">
              <div class="workflow-stage"><div class="workflow-dot" style="background:#b48ef5"></div><span>{{ t('wf_raw') }}</span></div>
              <div class="workflow-stage"><div class="workflow-dot" style="background:#6ab0f0"></div><span>{{ t('wf_developing') }}</span></div>
              <div class="workflow-stage"><div class="workflow-dot" style="background:#6edd9a"></div><span>{{ t('wf_ready') }}</span></div>
            </div>
          </div>
          <div class="workflow-card reveal">
            <div class="workflow-icon">&#128218;</div>
            <div class="workflow-name">{{ t('wf_resources') }}</div>
            <div class="workflow-stages">
              <div class="workflow-stage"><div class="workflow-dot" style="background:#e0a653"></div><span>{{ t('wf_toread') }}</span></div>
              <div class="workflow-stage"><div class="workflow-dot" style="background:#6ab0f0"></div><span>{{ t('wf_reading') }}</span></div>
              <div class="workflow-stage"><div class="workflow-dot" style="background:#aaa"></div><span>{{ t('wf_archived') }}</span></div>
            </div>
          </div>
          <div class="workflow-card reveal">
            <div class="workflow-icon">&#128221;</div>
            <div class="workflow-name">{{ t('wf_notes') }}</div>
            <div class="workflow-stages">
              <div class="workflow-stage"><div class="workflow-dot" style="background:#e0a653"></div><span>{{ t('wf_draft') }}</span></div>
              <div class="workflow-stage"><div class="workflow-dot" style="background:#6ab0f0"></div><span>{{ t('wf_final') }}</span></div>
              <div class="workflow-stage"><div class="workflow-dot" style="background:#6edd9a"></div><span>{{ t('wf_reference') }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ PRICING ══ -->
    <section class="pricing" id="pricing">
      <div class="pricing-inner">
        <div class="section-label reveal">{{ t('pr_label') }}</div>
        <h2 class="section-title reveal">{{ t('pr_title') }}</h2>
        <p class="section-sub reveal">{{ t('pr_sub') }}</p>
        <div class="pricing-grid">

          <!-- Free -->
          <div class="pricing-card reveal">
            <div class="pricing-tier">{{ t('tier_free') }}</div>
            <div class="pricing-price">$0</div>
            <div class="pricing-period">{{ t('pr_forever') }}</div>
            <ul class="pricing-features">
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pf1') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pf2') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pf3') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pf4') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pf5') }}</span></li>
              <li class="no"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>{{ t('pf6') }}</span></li>
              <li class="no"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>{{ t('pf7') }}</span></li>
              <li class="no"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>{{ t('pf8') }}</span></li>
            </ul>
            <a target="_blank" href="https://msgboard.laraue.com/" class="pricing-btn dark">{{ t('pr_start_free') }}</a>
          </div>

          <!-- Premium -->
          <div class="pricing-card featured reveal">
            <div class="pricing-tier">{{ t('tier_premium') }}</div>
            <div class="pricing-price"><sup>$</sup>4</div>
            <div class="pricing-period">{{ t('pr_month') }}</div>
            <ul class="pricing-features">
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pp1') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pp2') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pp3') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pp4') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pp5') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pf6') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pf7') }}</span></li>
              <li class="no"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>{{ t('pf8') }}</span></li>
            </ul>
            <a target="_blank" href="https://msgboard.laraue.com/" class="pricing-btn accent">{{ t('pr_get_premium') }}</a>
          </div>

          <!-- Team -->
          <div class="pricing-card reveal">
            <div class="pricing-tier">{{ t('tier_team') }}</div>
            <div class="pricing-price"><sup>$</sup>5</div>
            <div class="pricing-period">{{ t('pr_month_member') }}</div>
            <ul class="pricing-features">
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pt1') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pt2') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pt3') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pt4') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pt5') }}</span></li>
              <li class="yes"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('pt6') }}</span></li>
            </ul>
            <a target="_blank" href="https://msgboard.laraue.com/" class="pricing-btn outline">{{ t('pr_start_team') }}</a>
          </div>

        </div>
        <p class="pricing-note reveal">{{ t('pr_note') }}</p>
      </div>
    </section>

    <!-- ══ TESTIMONIALS ══ -->
    <section class="testimonials">
      <div class="testimonials-inner">
        <div class="section-label reveal">{{ t('tm_label') }}</div>
        <h2 class="section-title reveal">{{ t('tm_title') }}</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card reveal">
            <div class="testimonial-quote">{{ t('tm1') }}</div>
            <div class="testimonial-author">
              <div class="testimonial-avatar">S</div>
              <div>
                <div class="testimonial-name">Sergey C.</div>
                <div class="testimonial-role">{{ t('tm1_role') }}</div>
              </div>
            </div>
          </div>
          <div class="testimonial-card reveal">
            <div class="testimonial-quote">{{ t('tm2') }}</div>
            <div class="testimonial-author">
              <div class="testimonial-avatar">D</div>
              <div>
                <div class="testimonial-name">Daniel M.</div>
                <div class="testimonial-role">{{ t('tm2_role') }}</div>
              </div>
            </div>
          </div>
          <div class="testimonial-card reveal">
            <div class="testimonial-quote">{{ t('tm3') }}</div>
            <div class="testimonial-author">
              <div class="testimonial-avatar">M</div>
              <div>
                <div class="testimonial-name">Marcus T.</div>
                <div class="testimonial-role">{{ t('tm3_role') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <LCallToAction :title="t('cta_title')" :pre-title="t('cta_label')" :post-title="t('cta_sub')">
      <LActionButton :title="t('hero_cta_web')" link="https://msgboard.laraue.com/" type="site" />
      <LActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
    </LCallToAction>
  </LMainContent>
</template>

<style scoped>
section {
  --msg-blue:#2d7dd2; --msg-blue-light:#e8f2fc;
  --msg-green:#2d8a55; --msg-green-light:#e6f7ee;
}

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

/* org badge floating */
.org-badge{
  position:absolute;bottom:-16px;right:-16px;
  background:#fff;border:1px solid var(--border);border-radius:12px;
  padding:10px 14px;box-shadow:0 4px 20px rgba(15,14,12,.15);
  display:flex;align-items:center;gap:8px;
  font-size:12px;font-weight:600;color:var(--ink);white-space:nowrap;
}
.org-badge-dot{width:8px;height:8px;border-radius:50%;background:#53e07a;flex-shrink:0;box-shadow:0 0 0 3px rgba(83,224,122,.2)}

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

.use-case-icon{font-size:36px;margin-bottom:16px}
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
.platform-card-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.platform-card-icon.web{background:var(--msg-blue-light)}
.platform-card-icon.tg{background:#e0f4fd}
.platform-card-name{font-family:var(--serif);font-size:18px;font-weight:700;letter-spacing:-.2px}
.platform-card-tag{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:2px}
.platform-card-desc{font-size:15px;color:var(--muted);line-height:1.65;font-weight:300;flex:1;margin-bottom:24px}
.platform-card-features{list-style:none;display:flex;flex-direction:column;gap:7px;margin-bottom:28px}
.platform-card-features li{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
.platform-card-features li svg{width:14px;height:14px;stroke:var(--msg-green);flex-shrink:0}

/* ══ WORKFLOW TYPES ══ */
.workflows{padding:80px 60px;background:var(--cream);border-bottom:1px solid var(--border)}
.workflows-inner{max-width:1060px;margin:0 auto}
.workflows-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px}
.workflow-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:24px;transition:box-shadow .2s,transform .15s}
.workflow-card:hover{box-shadow:0 6px 24px rgba(15,14,12,.09);transform:translateY(-2px)}
.workflow-icon{font-size:28px;margin-bottom:12px}
.workflow-name{font-family:var(--serif);font-size:16px;font-weight:700;margin-bottom:12px;letter-spacing:-.1px}
.workflow-stages{display:flex;flex-direction:column;gap:5px}
.workflow-stage{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--muted)}
.workflow-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}

/* ══ PRICING ══ */
.pricing{padding:80px 60px;border-bottom:1px solid var(--border)}
.pricing-inner{max-width:1060px;margin:0 auto}
.pricing-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:52px}
.pricing-card{border:1px solid var(--border);border-radius:16px;padding:32px;background:#fff;position:relative;transition:box-shadow .2s,transform .15s}
.pricing-card:hover{box-shadow:0 8px 32px rgba(15,14,12,.09);transform:translateY(-3px)}
.pricing-card.featured{border-color:var(--ink);box-shadow:0 4px 24px rgba(15,14,12,.12)}
.pricing-card.featured::before{content:'Most popular';position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 14px;border-radius:12px;white-space:nowrap}
.pricing-tier{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
.pricing-price{font-family:var(--serif);font-size:42px;font-weight:800;color:var(--ink);letter-spacing:-1.5px;line-height:1}
.pricing-price sup{font-size:18px;font-weight:700;letter-spacing:0;vertical-align:top;margin-top:8px;display:inline-block}
.pricing-period{font-size:13px;color:var(--muted);margin-top:4px;margin-bottom:24px}
.pricing-features{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
.pricing-features li{display:flex;align-items:flex-start;gap:9px;font-size:13px;color:var(--muted);line-height:1.4}
.pricing-features li svg{width:14px;height:14px;flex-shrink:0;margin-top:2px}
.pricing-features li.yes svg{stroke:var(--msg-green)}
.pricing-features li.no{opacity:.45}
.pricing-features li.no svg{stroke:var(--muted)}
.pricing-btn{display:block;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;transition:background .2s,transform .15s}
.pricing-btn.dark{background:var(--ink);color:#fff}
.pricing-btn.dark:hover{background:var(--accent);transform:translateY(-1px)}
.pricing-btn.accent{background:var(--accent);color:#fff;box-shadow:0 3px 14px rgba(200,75,47,.3)}
.pricing-btn.accent:hover{background:#b03d24;transform:translateY(-1px)}
.pricing-btn.outline{background:transparent;color:var(--ink);border:1.5px solid var(--border)}
.pricing-btn.outline:hover{border-color:var(--ink);background:var(--cream)}

/* pricing note */
.pricing-note{text-align:center;margin-top:28px;font-size:13px;color:var(--muted)}

/* ══ TESTIMONIALS ══ */
.testimonials{padding:80px 60px;background:var(--cream);border-bottom:1px solid var(--border)}
.testimonials-inner{max-width:1060px;margin:0 auto}
.testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.testimonial-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:28px;display:flex;flex-direction:column}
.testimonial-quote{font-size:15px;color:var(--ink);line-height:1.7;font-weight:300;flex:1;margin-bottom:20px;font-style:italic}
.testimonial-quote::before{content:'\201C';font-family:var(--serif);font-size:48px;line-height:.5;color:var(--border);display:block;margin-bottom:12px}
.testimonial-author{display:flex;align-items:center;gap:12px}
.testimonial-avatar{width:36px;height:36px;border-radius:50%;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:14px;font-weight:700;flex-shrink:0}
.testimonial-name{font-weight:700;font-size:13px}
.testimonial-role{font-size:11px;color:var(--muted)}

/* ══ RESPONSIVE ══ */
@media(max-width:1100px){
  .sidebar-links li a span:not(.sidebar-icon){display:none}
  .sidebar-links li a{padding:11px;justify-content:center;border-left:none;border-radius:8px;margin:0 4px}
  .sidebar-links li a.active{background:rgba(200,75,47,.1)}
  .sidebar-links li a .sidebar-icon{width:auto;font-size:16px}
}
@media(max-width:900px){
  .use-cases-grid,.platforms-grid,.pricing-grid,.testimonials-grid{grid-template-columns:1fr}
  .workflows-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:720px){
  .hero-visual{order:-1}
  .workflows,.pricing,.testimonials{padding:60px 22px}
  .workflows-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:480px){
  .workflows-grid{grid-template-columns:1fr}
}
</style>