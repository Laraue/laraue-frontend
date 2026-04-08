<script setup lang="ts">

import {computed} from "vue";
import {
  defineOffer,
  defineSoftwareApp,
  useSchemaOrg
} from "@unhead/schema-org/vue";
import LMainContent from "~/components/ui/LMainContent.vue";
import LActionButton from "~/components/landins/LActionButton.vue";
import LPlatformBadge from "~/components/landins/LPlatformBadge.vue";
import LLandingIntro from "~/components/landins/LLandingIntro.vue";
import LSteps from "~/components/landins/LSteps.vue";
import LFeaturesGrid from "~/components/landins/LFeaturesGrid.vue";
import LSection from "~/components/landins/LSection.vue";
import LCallToAction from "~/components/landins/LCallToAction.vue";

const { t } = useI18n();
const supportedLanguages = ref([
  {
    name: t('l1'),
    value: "RU"
  },
  {
    name: t('l2'),
    value: "JA"
  },
  {
    name: t('l3'),
    value: "FR"
  },
  {
    name: t('l4'),
    value: "HI"
  },
  {
    name: t('l5'),
    value: "DE"
  },
  {
    name: t('l6'),
    value: "ZN"
  },
  {
    name: t('l7'),
    value: "ES"
  }
])

const imageUrl = "https://laraue.com/images/quiz-mode.jpg";
useSeoMeta({
  title: computed(() => t('seoTitle')),
  ogTitle: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
  ogImage: imageUrl,
  ogImageWidth: "470",
  ogImageHeight: "611",
  ogImageAlt: t('seoTitle'),
  twitterCard: "summary_large_image",
  twitterTitle: computed(() => t('seoTitle')),
  twitterDescription: computed(() => t('seoDescription')),
  twitterImage: imageUrl,
  twitterImageAlt: t('seoTitle')
})

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
        description: 'Unlimited Bot usage'
      })
    ]
  })
])
</script>

<i18n lang="json">
{
  "en": {
    "seoTitle": "Increase Vocabulary with Flashcards Bot",
    "seoDescription": "The telegram bot that helps to learn top 5k used words of English, Japanese, Russian and French languages",
    "sec_overview": "Overview",
    "sec_features": "Features",
    "sec_how": "How it works",
    "sec_languages": "Languages",
    "sec_quiz": "Quiz mode",
    "hero_eyebrow": "Vocabulary Bot by Laraue Software",
    "hero_title": "Learn languages\ninside Telegram",
    "hero_sub": "Interactive quiz mode, CEFR-structured word lists, and progress tracking — all inside Telegram. No app to install, no account to create.",
    "hero_cta": "Start learning now",
    "stat_langs": "language pairs",
    "stat_cefr": "CEFR levels",
    "stat_free": "Free",
    "stat_free_label": "forever",
    "view_github": "View on GitHub",
    "feat_label": "What you get",
    "feat_title": "Powerful learning features",
    "feat_sub": "Proven language learning methods, delivered inside the app you already use every day.",
    "f1t": "Quiz Mode",
    "f1d": "Interactive multiple-choice quizzes that make vocabulary stick. Immediate feedback, XP rewards, and streak tracking to keep you motivated.",
    "f2t": "CEFR Levels",
    "f2d": "Words organized by A1 through C2 proficiency levels. Start where you are, progress at your own pace — no guesswork about difficulty.",
    "f3t": "Progress Tracking",
    "f3d": "Monitor your learning streak, quiz scores and word mastery over time. Visual stats keep you accountable and show real improvement.",
    "f4t": "View Mode",
    "f4d": "Browse and study words organized by CEFR level, topic, or alphabetically. Great for refreshing vocabulary before an exam or meeting.",
    "f5t": "Personalized Learning",
    "f5d": "Choose your language pair, set your level, and focus on specific topics. The bot adapts to your choices and tracks what you know.",
    "f6t": "No Install Needed",
    "f6d": "Works inside Telegram on any device — phone, tablet, desktop. No separate app, no account creation, no friction. Just open and learn.",
    "how_label": "Getting started",
    "how_title": "Start learning in 3 steps",
    "how_sub": "No setup, no configuration, no credit card.",
    "step1t": "Open the bot",
    "step1d": "Search learn_lang_bot in Telegram and hit Start. That's it — no registration.",
    "step2t": "Pick your language",
    "step2d": "Choose from 7 language pairs and set your CEFR level. Change anytime from settings.",
    "step3t": "Start the quiz",
    "step3d": "Answer questions, earn XP, build your streak. Come back daily to keep improving.",
    "lang_label": "Supported pairs",
    "lang_title": "7 language pairs",
    "lang_sub": "All the most popular languages, all English-based. More pairs coming soon.",
    "l1": "Russian → English",
    "l2": "Japanese → English",
    "l3": "French → English",
    "l4": "Hindi → English",
    "l5": "German → English",
    "l6": "Chinese → English",
    "l7": "Spanish → English",
    "more_coming": "More coming",
    "quiz_label": "Core feature",
    "quiz_title": "Quiz Mode",
    "quiz_desc": "The fastest way to build vocabulary. You see a word, pick the right translation from four options, and get immediate feedback. Wrong answers are revisited automatically.",
    "qf1": "Multiple-choice format proven to improve retention",
    "qf2": "Immediate correct/wrong feedback with explanation",
    "qf3": "XP system and streak counter to build habit",
    "qf4": "Adaptive — revisits words you get wrong more often",
    "qf5": "Stats updated after every session",
    "oss_label": "Transparent by design",
    "oss_title": "Fully open source",
    "oss_sub": "The bot's source code is public on GitHub. Explore the architecture, contribute features, or fork it for your own language learning project.",
    "oss_card_desc": "Built with C# and the Telegram.NET library. Clean architecture, reusable components, and documented code. Pull requests welcome.",
    "cta_eyebrow": "Free. No account. No install.",
    "cta_title": "Start building your vocabulary today",
    "cta_sub": "Open the bot, pick your language, and start your first quiz in under 60 seconds."
  },
  "ru": {
    "seoTitle": "Бот для пополнения словарного запаса",
    "seoDescription": "Бот позволяет выучить самые часто используемые слова английского, русского, испанского и других языков",
    "sec_overview": "Обзор",
    "sec_features": "Функции",
    "sec_how": "Как это работает",
    "sec_languages": "Языки",
    "sec_quiz": "Режим квиза",
    "hero_eyebrow": "Бот для запоминания слов от Laraue Software",
    "hero_title": "Учите языки\nне выходя из Telegram",
    "hero_sub": "Режим квиза, изучение по уровням CEFR и отслеживание прогресса — всё внутри Telegram. Без дополнительных установок и регистраций.",
    "hero_cta": "Начать изучение",
    "stat_langs": "языковых пар",
    "stat_cefr": "уровни CEFR",
    "stat_free": "Бесплатно",
    "stat_free_label": "навсегда",
    "view_github": "Открыть на GitHub",
    "feat_label": "Что включено",
    "feat_title": "Мощные функции",
    "feat_sub": "Проверенные методы изучения языков — в приложении, которым вы пользуетесь каждый день.",
    "f1t": "Режим квиза",
    "f1d": "Интерактивные квизы, которые помогают запоминать слова. Моментальная обратная связь и система серий правильных ответов.",
    "f2t": "Уровни CEFR",
    "f2d": "Слова по уровням от A1 до C1. Легкий старт в новых языках. Учите только то, что необходимо.",
    "f3t": "Отслеживание прогресса",
    "f3d": "Серии правильных ответов, результаты квизов и уровень знания слов. Статистика показывает реальный прогресс.",
    "f4t": "Режим просмотра",
    "f4d": "Просматривайте слова по уровню CEFR, тематике или алфавиту. Подходит для повторения перед экзаменом.",
    "f5t": "Персонализация",
    "f5d": "Выберите языковую пару, уровень и тематику. Бот адаптируется под ваши запросы.",
    "f6t": "Без установки",
    "f6d": "Работает в Telegram на любом устройстве. Никакой регистрации, никаких дополнительных приложений.",
    "how_label": "Начало работы",
    "how_title": "Начните за 3 шага",
    "how_sub": "Без долгих настроек и скачиваний.",
    "step1t": "Откройте бота",
    "step1d": "Найдите learn_lang_bot в Telegram и нажмите «Старт».",
    "step2t": "Выберите язык",
    "step2d": "Выберите языковую пару, уровень CEFR.",
    "step3t": "Начните квиз",
    "step3d": "Отвечайте на вопросы, получайте опыт, набирайте серии правильных ответов.",
    "lang_label": "Поддерживаемые пары",
    "lang_title": "7 языковых пар",
    "lang_sub": "Самые популярные языковые пары. Постоянно добавляются новые.",
    "l1": "Русский → Английский",
    "l2": "Японский → Английский",
    "l3": "Французский → Английский",
    "l4": "Хинди → Английский",
    "l5": "Немецкий → Английский",
    "l6": "Китайский → Английский",
    "l7": "Испанский → Английский",
    "more_coming": "Скоро новые пары",
    "quiz_label": "Основной режим",
    "quiz_title": "Режим квиза",
    "quiz_desc": "Самый быстрый способ пополнить словарный запас. Выбираете перевод из восьми вариантов для предложенного слова. Неправильные ответы повторяются автоматически.",
    "qf1": "Формат с выбором ответа, проверенный практикой",
    "qf2": "Моментальная обратная связь с объяснением",
    "qf3": "Система опыта и счётчик правильных ответов подряд для формирования привычки",
    "qf4": "Адаптивность — слова с ошибками повторяются чаще",
    "qf5": "Статистика обновляется после каждой сессии",
    "oss_label": "Абсолютная прозрачность",
    "oss_title": "Полностью open source",
    "oss_sub": "Исходный код бота открыт на GitHub. Изучите архитектуру, внесите вклад или сделайте fork.",
    "oss_card_desc": "Написан на C# с использованием Telegram.NET. Чистая архитектура, переиспользуемые компоненты, документированный код.",
    "cta_eyebrow": "Бесплатно. Без аккаунта. Без установки приложений.",
    "cta_title": "Начните пополнять словарный запас сегодня",
    "cta_sub": "Откройте бота, выберите язык и пройдите первый квиз за 60 секунд."
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
          num: 7,
          label: t('stat_langs')
        },
        {
          num: 'A1-C1',
          label: t('stat_cefr')
        },
        {
          num: t('stat_free'),
          label: t('stat_free_label')
        }
      ]">
      <template #badges>
        <LPlatformBadge type="tg" title="Telegram Bot — Free" />
      </template>
      <template #actions>
        <LActionButton :title="t('hero_cta')" link="https://t.me/learn_lang_bot" type="telegram" />
        <LActionButton :title="t('view_github')" link="https://github.com/win7user10/Laraue.Apps.LearnLanguage" type="github" />
      </template>
      <template #visual>
        <!-- phone mockup -->
        <div class="phone-mockup">
          <div class="phone-notch"><div class="phone-notch-bar"></div></div>
          <div class="phone-status">
            <div class="phone-status-avatar">&#129302;</div>
            <div>
              <div class="phone-status-name">Vocabulary Bot</div>
              <div class="phone-status-sub">@learn_lang_bot</div>
            </div>
            <div class="phone-status-dot"></div>
          </div>
          <div class="phone-body">
            <div class="bubble bot">
              Let&#8217;s practice! <span class="cefr-badge">B1</span><br>
              <strong style="color:#fff">What does &#8220;resilient&#8221; mean?</strong>
              <div class="bubble-time">12:04</div>
            </div>
            <div class="quiz-card">
              <div class="quiz-word">Resilient</div>
              <div class="quiz-sub">Choose the correct translation</div>
              <div class="quiz-options">
                <div class="quiz-option correct">&#10003; Able to recover</div>
                <div class="quiz-option">Fragile</div>
                <div class="quiz-option wrong">&#10007; Rigid</div>
                <div class="quiz-option">Slow</div>
              </div>
            </div>
            <div class="bubble user">
              Able to recover
              <div class="bubble-time">12:04</div>
            </div>
            <div class="bubble bot">
              &#127881; Correct! Streak: <strong style="color:#6edd9a">5</strong><br>
              <span style="opacity:.6;font-size:11px">+10 XP &#183; Next word in 3s</span>
              <div class="bubble-time">12:04</div>
            </div>
          </div>
        </div>
      </template>
    </LLandingIntro>

    <!-- ══ HOW IT WORKS ══ -->
    <LSteps
        :title="t('how_title')"
        :pre-title="t('how_label')"
        :post-title="t('how_sub')"
        :steps="[
        {
          title: t('step1t'),
          description: t('step1d'),
        },
        {
          title: t('step2t'),
          description: t('step2d'),
        },
        {
          title: t('step3t'),
          description: t('step3d'),
        }
      ]" />

    <!-- ══ FEATURES ══ -->
    <LFeaturesGrid
      :pre-title="t('feat_label')"
      :title="t('feat_title')"
      :post-title="t('feat_sub')"
      type="cream"
      :features="[
        {
          title: t('f1t'),
          icon: '&#128203;',
          description: t('f1d')
        },
        {
          title: t('f2t'),
          icon: '&#128218;',
          description: t('f2d')
        },
        {
          title: t('f3t'),
          icon: '&#128202;',
          description: t('f3d')
        },
        {
          title: t('f4t'),
          icon: '&#128065;',
          description: t('f4d')
        },
        {
          title: t('f5t'),
          icon: '&#127775;',
          description: t('f5d')
        },
        {
          title: t('f6t'),
          icon: '&#128241;',
          description: t('f6d')
        }
      ]" />

    <!-- ══ QUIZ MODE SCREENSHOT ══ -->
    <section class="screenshot" id="quiz">
      <div class="screenshot-inner">
        <div>
          <div class="section-label reveal">{{ t('quiz_label') }}</div>
          <h2 class="section-title reveal">{{ t('quiz_title') }}</h2>
          <p class="screenshot-desc reveal">{{ t('quiz_desc') }}</p>
          <ul class="screenshot-feats reveal">
            <li>{{ t('qf1') }}</li>
            <li>{{ t('qf2') }}</li>
            <li>{{ t('qf3') }}</li>
            <li>{{ t('qf4') }}</li>
            <li>{{ t('qf5') }}</li>
          </ul>
          <LActionButton :title="t('hero_cta')" type="telegram" link="https://t.me/learn_lang_bot" />
        </div>
        <div class="reveal">
          <!-- Real screenshot if available, placeholder otherwise -->
          <div class="screenshot-img">
            <img src="https://laraue.com/images/quiz-mode.jpg" alt="Quiz Mode screenshot" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    <LSection class="features" :pre-title="t('lang_label')" :postTitle="t('lang_sub')" :title="t('lang_title')" type="cream">
      <div class="languages-grid">
        <div v-for="language in supportedLanguages" class="lang-card reveal">
          <div class="lang-flag">{{ language.value }}</div>
          <div class="lang-info">
            <div class="lang-pair">{{ language.name }}</div>
            <div class="lang-code">EN -> {{ language.value }}</div>
          </div>
        </div>
        <div class="lang-card reveal" style="border-style:dashed;background:transparent;cursor:default;justify-content:center;opacity:.6">
          <div style="text-align:center">
            <div class="lang-pair" style="font-size:13px"> + {{ t('more_coming') }}</div>
          </div>
        </div>
      </div>
    </LSection>

    <!-- ══ OPEN SOURCE ══ -->
    <section class="oss" id="oss">
      <div class="oss-inner">
        <div>
          <div class="section-label reveal">{{ t('oss_label') }}</div>
          <h2 class="section-title reveal">{{ t('oss_title') }}</h2>
          <p class="section-sub reveal">{{ t('oss_sub') }}</p>
        </div>
        <div class="reveal">
          <div class="oss-card">
            <div class="oss-icon">&#11088;</div>
            <div class="oss-title">Laraue.Apps.LearnLanguage</div>
            <p class="oss-desc" data-i18n="oss_card_desc">{{ t('oss_card_desc') }}</p>
            <LActionButton :title="t('view_github')" link="https://github.com/win7user10/Laraue.Apps.LearnLanguage" type="github"/>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <LCallToAction :title="t('cta_title')" :pre-title="t('cta_eyebrow')" :post-title="t('cta_sub')">
      <LActionButton :title="t('hero_cta')" link="https://t.me/learn_lang_bot" type="telegram" />
      <LActionButton :title="t('view_github')" link="https://github.com/win7user10/Laraue.Apps.LearnLanguage" type="github" />
    </LCallToAction>

  </LMainContent>
</template>

<style scoped>
/* ── hero phone mockup ── */
.phone-mockup{
  width:260px;flex-shrink:0;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.14);
  border-radius:28px;overflow:hidden;
  box-shadow:0 24px 64px rgba(0,0,0,.4),0 4px 16px rgba(0,0,0,.2);
}
.phone-notch{
  height:28px;background:rgba(0,0,0,.4);
  display:flex;align-items:center;justify-content:center;
}
.phone-notch-bar{width:60px;height:4px;background:rgba(255,255,255,.2);border-radius:2px}
.phone-status{
  background:rgba(34,158,217,.9);
  padding:12px 16px;
  display:flex;align-items:center;gap:10px;
}
.phone-status-avatar{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.phone-status-name{font-size:13px;font-weight:700;color:#fff}
.phone-status-sub{font-size:10px;color:rgba(255,255,255,.65)}
.phone-status-dot{width:7px;height:7px;border-radius:50%;background:#6edd9a;margin-left:auto;box-shadow:0 0 0 2px rgba(110,221,154,.25)}

.phone-body{padding:14px;display:flex;flex-direction:column;gap:8px;background:rgba(0,0,0,.25)}

/* chat bubbles */
.bubble{
  max-width:86%;padding:8px 12px;border-radius:12px;font-size:12px;line-height:1.5;
}
.bubble.bot{background:rgba(255,255,255,.1);color:rgba(255,255,255,.85);align-self:flex-start;border-radius:4px 12px 12px 12px}
.bubble.user{background:rgba(34,158,217,.75);color:#fff;align-self:flex-end;border-radius:12px 4px 12px 12px}
.bubble-time{font-size:9px;opacity:.5;text-align:right;margin-top:3px}

/* quiz card inside phone */
.quiz-card{
  background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);
  border-radius:12px;padding:12px;margin:4px 0;
}
.quiz-word{font-family:var(--serif);font-size:18px;font-weight:700;color:#fff;text-align:center;margin-bottom:4px}
.quiz-sub{font-size:10px;color:rgba(255,255,255,.45);text-align:center;margin-bottom:10px;letter-spacing:.04em;text-transform:uppercase}
.quiz-options{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.quiz-option{
  padding:6px 8px;border-radius:7px;
  font-size:11px;font-weight:600;text-align:center;
  border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.7);
  background:rgba(255,255,255,.07);
  cursor:default;
}
.quiz-option.correct{background:rgba(110,221,154,.2);border-color:rgba(110,221,154,.5);color:#6edd9a}
.quiz-option.wrong{background:rgba(224,87,46,.15);border-color:rgba(224,87,46,.4);color:#e0572e}

.cefr-badge{display:inline-block;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:rgba(110,221,154,.2);color:#6edd9a;padding:2px 7px;border-radius:4px}
/* ══ SCREENSHOT ══ */
.screenshot{padding:80px 60px;background:var(--ink);position:relative;overflow:hidden}
.screenshot::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:48px 48px}
.screenshot-inner{max-width:1060px;margin:0 auto;position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.screenshot .section-label{color:rgba(255,255,255,.4)}
.screenshot .section-label::after{background:rgba(255,255,255,.2)}
.screenshot .section-title{color:#fff}
.screenshot-desc{font-size:16px;color:rgba(255,255,255,.55);font-weight:300;line-height:1.7;margin-bottom:32px}
.screenshot-feats{list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:36px}
.screenshot-feats li{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:rgba(255,255,255,.7)}
.screenshot-feats li::before{content:'✓';font-weight:700;color:#6edd9a;flex-shrink:0;margin-top:1px}
.screenshot-img{border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.1);box-shadow:0 16px 48px rgba(0,0,0,.4)}
.screenshot-img img{width:100%;display:block}
.screenshot-img-placeholder svg{width:40px;height:40px;stroke:currentColor;opacity:.4}

/* ══ LANGUAGES ══ */
.languages-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:48px}
.lang-card{
  background:#fff;border:1px solid var(--border);border-radius:12px;
  padding:20px 18px;display:flex;align-items:center;gap:14px;
  transition:box-shadow .15s,transform .15s,border-color .15s;
  cursor:default;
}
.lang-card:hover{box-shadow:0 4px 20px rgba(15,14,12,.08);transform:translateY(-2px);border-color:var(--accent)}
.lang-flag{font-size:26px;flex-shrink:0;line-height:1}
.lang-pair{font-weight:700;font-size:14px;color:var(--ink)}
.lang-code{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-top:2px}

/* ══ OPEN SOURCE ══ */
.oss{padding:80px 60px;border-bottom:1px solid var(--border)}
.oss-inner{max-width:1060px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.oss-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(15,14,12,.06)}
.oss-icon{font-size:40px;margin-bottom:16px}
.oss-title{font-family:var(--serif);font-size:20px;font-weight:700;margin-bottom:10px;letter-spacing:-.2px}
.oss-desc{font-size:14px;color:var(--muted);line-height:1.65;margin-bottom:24px;font-weight:300}
.oss-link svg{width:15px;height:15px;fill:currentColor;flex-shrink:0}

/* ══ RESPONSIVE ══ */
@media(max-width:1100px){
  .languages-grid{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:860px){
  .screenshot-inner,.oss-inner{grid-template-columns:1fr;gap:48px}
  .languages-grid{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:720px){
  .features,.screenshot,.oss{padding:60px 22px}
  .languages-grid{grid-template-columns:repeat(2,1fr);gap:10px}
}
@media(max-width:420px){
  .languages-grid{grid-template-columns:1fr}
}
</style>