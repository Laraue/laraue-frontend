<script setup lang="ts">

import {computed} from "vue";
import {
  defineOffer,
  defineSoftwareApp,
  defineVideo,
  defineBreadcrumb,
  useSchemaOrg
} from "@unhead/schema-org/vue";
import LMainContent from "~/components/ui/LMainContent.vue";
import LNavIcon from "~/components/ui/LNavIcon.vue";
import LActionButton from "~/components/landins/LActionButton.vue";
import LPlatformBadge from "~/components/landins/LPlatformBadge.vue";
import LLandingIntro from "~/components/landins/LLandingIntro.vue";
import LSteps from "~/components/landins/LSteps.vue";
import LFeaturesGrid from "~/components/landins/LFeaturesGrid.vue";
import LSection from "~/components/landins/LSection.vue";
import LCallToAction from "~/components/landins/LCallToAction.vue";
import LVideo from "~/components/landins/LVideo.vue";
// The bot's video on the Laraue YouTube channel, recorded in laraue-videos (MIN-55).
const videoId = "ItFpkDgZ3Kg";
// The poster and the quiz screenshot are on the static images server (/static/images), which
// caches for a year: a changed image needs a new file name.
const { imagesBaseAddress } = useRuntimeConfig().public;
const image = (name: string) => `${imagesBaseAddress}${name}`;
const videoPosters = {
  640: image('vocabulary-bot-video-640.webp'),
  960: image('vocabulary-bot-video-960.webp'),
  1280: image('vocabulary-bot-video-1280.webp'),
};
const quiz480 = image('vocabulary-bot-quiz-480.webp');
const quiz720 = image('vocabulary-bot-quiz-720.webp');

const { t } = useI18n();
const { getStaticOgImageUrl } = usePathUtil();
const localePath = useLocalePath();
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
    value: "ZH"
  },
  {
    name: t('l7'),
    value: "ES"
  },
  {
    name: t('l8'),
    value: "UZ"
  },
  {
    name: t('l9'),
    value: "AR"
  },
  {
    name: t('l10'),
    value: "FA"
  }
])

// /start source label: users who come from this page show up as "landing" in the bot's funnel.
const botLink = "https://t.me/learn_lang_bot?start=source-landing";

const ogImageUrl = getStaticOgImageUrl('learn-language-bot-og');
useSeoMeta({
  title: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
  ogTitle: computed(() => t('seoTitle')),
  ogDescription: computed(() => t('seoDescription')),
  ogImage: ogImageUrl,
  ogImageWidth: "1200",
  ogImageHeight: "630",
  ogImageType: "image/png",
  ogImageAlt: t('seoTitle'),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: computed(() => t('seoTitle')),
  twitterDescription: computed(() => t('seoDescription')),
  twitterImage: ogImageUrl,
  twitterImageAlt: t('seoTitle')
})

useSchemaOrg([
  defineSoftwareApp({
    name: t('seoTitle'),
    description: t('seoDescription'),
    applicationCategory: "EducationalApplication",
    operatingSystem: "Telegram",
    offers: [
      defineOffer({
        price: 0,
        priceCurrency: "USD",
        description: 'Unlimited Bot usage'
      })
    ],
  }),
  {
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: t('faq1q'), acceptedAnswer: { '@type': 'Answer', text: t('faq1a') } },
      { '@type': 'Question', name: t('faq2q'), acceptedAnswer: { '@type': 'Answer', text: t('faq2a') } },
      { '@type': 'Question', name: t('faq3q'), acceptedAnswer: { '@type': 'Answer', text: t('faq3a') } },
      { '@type': 'Question', name: t('faq4q'), acceptedAnswer: { '@type': 'Answer', text: t('faq4a') } },
      { '@type': 'Question', name: t('faq5q'), acceptedAnswer: { '@type': 'Answer', text: t('faq5a') } },
      { '@type': 'Question', name: t('faq6q'), acceptedAnswer: { '@type': 'Answer', text: t('faq6a') } },
    ]
  },
  defineVideo({
    name: t('video_title'),
    description: t('video_description'),
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    uploadDate: '2026-11-14',
    duration: 'PT52S',
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_current') },
    ]
  }),
])
</script>

<i18n lang="json">
{
  "en": {
    "bc_home": "Home",
    "bc_current": "Vocabulary Bot",
    "seoTitle": "Vocabulary Bot — a Free Telegram Bot to Learn English Words",
    "seoDescription": "A free Telegram bot for building your English vocabulary: short quizzes on nearly 6,000 English words from A1 to C1, translated into 10 languages. Daily reminders, progress stats, a leaderboard and achievements — no app to install, no account to create.",
    "faq1q": "Is Vocabulary Bot free?",
    "faq1a": "Yes, the bot is free to use with no limits on quizzes or words.",
    "faq2q": "Do I need to install an app or create an account?",
    "faq2a": "No. Everything runs inside Telegram — just start a chat with the bot and begin the quiz.",
    "faq3q": "Which languages are supported?",
    "faq3a": "The bot teaches English words with translations into 10 languages: Russian, Japanese, French, Hindi, German, Chinese, Spanish, Uzbek, Arabic and Persian.",
    "faq4q": "How are words organized?",
    "faq4a": "Nearly 6,000 English words are grouped by CEFR level from A1 to C1, so you can start at your current level and move on at your own pace.",
    "faq5q": "Will the bot remind me to practice?",
    "faq5a": "Yes, if you want it to. After your first quiz the bot offers a daily reminder at the time you choose, and you can turn it off in Settings. It writes only on days you haven't practiced yet.",
    "faq6q": "How do I see my progress?",
    "faq6a": "My Progress shows your days in a row, this week's quizzes and accuracy, learned words per CEFR level and the words you miss most, with a button for a review quiz built from them.",
    "sec_overview": "Overview",
    "sec_features": "Features",
    "sec_how": "How it works",
    "sec_languages": "Languages",
    "sec_quiz": "Quiz mode",
    "hero_eyebrow": "Vocabulary Bot by Laraue Software",
    "hero_title": "Learn English words\ninside Telegram",
    "hero_sub": "Short quizzes on nearly 6,000 English words from A1 to C1, a daily reminder, progress stats, a weekly leaderboard and achievements — all inside Telegram. No app to install, no account to create.",
    "hero_cta": "Start learning now",
    "stat_langs": "language pairs",
    "stat_cefr": "CEFR levels",
    "stat_free": "Free",
    "stat_free_label": "forever",
    "view_github": "View on GitHub",
    "view_blog": "How it works",
    "feat_label": "What you get",
    "feat_title": "Powerful learning features",
    "feat_sub": "Proven language learning methods, delivered inside the app you already use every day.",
    "f1t": "Quiz Mode",
    "f1d": "Short multiple-choice quizzes that make English words stick, with feedback after every answer. The first one takes about a minute.",
    "f2t": "CEFR Levels",
    "f2d": "Words organized by CEFR level from A1 to C1, with topics. Choose the levels and topics you need in Settings — no guesswork about difficulty.",
    "f3t": "Progress Tracking",
    "f3d": "Days in a row, this week's quizzes and accuracy, learned words per level and the words you miss most — with a review quiz built from them.",
    "f4t": "Daily Reminders",
    "f4d": "Pick a time and the bot sends one reminder a day, only when you haven't practiced yet, with a button straight into a quiz.",
    "f5t": "Leaderboard and Achievements",
    "f5d": "Compete on the weekly and monthly leaderboard, win trophies for the top 3, and collect achievements for streaks, perfect quizzes and learned words.",
    "f6t": "No Install Needed",
    "f6d": "Works inside Telegram on any device — phone, tablet, desktop. No separate app, no account creation. Just open and learn.",
    "how_label": "Getting started",
    "how_title": "Start learning in 3 steps",
    "how_sub": "No setup, no configuration, no credit card.",
    "step1t": "Open the bot",
    "step1d": "Search learn_lang_bot in Telegram and hit Start. That's it — no registration.",
    "step2t": "Tap to start the first quiz",
    "step2d": "The bot picks the translation language from your Telegram app. The first quiz is a few A1 words — change the language and levels anytime in Settings.",
    "step3t": "Come back every day",
    "step3d": "A word is learned after three correct answers in a row. Turn on a daily reminder to keep your streak going.",
    "lang_label": "Supported pairs",
    "lang_title": "10 language pairs",
    "lang_sub": "English words with translations into your language. More pairs coming soon.",
    "l1": "English for Russian speakers",
    "l2": "English for Japanese speakers",
    "l3": "English for French speakers",
    "l4": "English for Hindi speakers",
    "l5": "English for German speakers",
    "l6": "English for Chinese speakers",
    "l7": "English for Spanish speakers",
    "l8": "English for Uzbek speakers",
    "l9": "English for Arabic speakers",
    "l10": "English for Persian speakers",
    "more_coming": "More coming",
    "quiz_label": "Core feature",
    "quiz_title": "Quiz Mode",
    "quiz_desc": "The fastest way to build your English vocabulary. You see a word, pick the right translation from four options of the same part of speech, and get immediate feedback. A quiz is ten questions — short enough for a coffee break.",
    "qf1": "Multiple-choice format proven to improve retention",
    "qf2": "Immediate feedback after every answer: correct or wrong",
    "qf3": "All four options share the part of speech, so grammar does not give the answer away",
    "qf4": "Adaptive — revisits words you get wrong more often",
    "qf5": "A review quiz from the words you miss most",
    "oss_label": "Transparent by design",
    "oss_title": "Source code is public",
    "oss_sub": "The bot's source code is public on GitHub, so you can read how it works. It is free for personal and other noncommercial use; commercial use needs a separate agreement.",
    "oss_card_desc": "Built with C# on .NET. The word list and the languages are plain JSON files in the repository.",
    "cta_eyebrow": "Free. No account. No install.",
    "cta_title": "Start building your vocabulary today",
    "cta_sub": "Open the bot and answer your first question in under 60 seconds.",
    "video_title": "Vocabulary Bot in 52 seconds: learn English words in Telegram",
    "video_play": "Play the video: Vocabulary Bot in 52 seconds",
    "video_description": "The first quiz, daily reminders, My Progress, achievements and the weekly leaderboard of Vocabulary Bot, a free Telegram bot for learning English words.",
    "quiz_alt": "Quiz results in Vocabulary Bot: six words, five right and one wrong"
  },
  "ru": {
    "bc_home": "Главная",
    "bc_current": "Бот для изучения языков",
    "seoTitle": "Vocabulary Bot — бесплатный Telegram-бот для изучения английских слов",
    "seoDescription": "Бесплатный бот в Telegram, чтобы учить английские слова и пополнять словарный запас: короткие квизы по почти 6 000 слов от A1 до C1, напоминания каждый день, статистика, рейтинг и достижения. Без установки и регистрации.",
    "faq1q": "Vocabulary Bot бесплатный?",
    "faq1a": "Да, бот бесплатен без ограничений на количество квизов и слов.",
    "faq2q": "Нужно ли устанавливать приложение или создавать аккаунт?",
    "faq2a": "Нет. Всё работает внутри Telegram — просто начните чат с ботом и приступайте к квизу.",
    "faq3q": "Какие языки поддерживаются?",
    "faq3a": "Бот учит английским словам с переводом на 10 языков: русский, японский, французский, хинди, немецкий, китайский, испанский, узбекский, арабский и персидский.",
    "faq4q": "Как организованы слова?",
    "faq4a": "Почти 6 000 английских слов сгруппированы по уровням CEFR от A1 до C1, поэтому можно начать с текущего уровня и двигаться в своём темпе.",
    "faq5q": "Бот напомнит позаниматься?",
    "faq5a": "Да, если захотите. После первого квиза бот предложит ежедневное напоминание в удобное время, выключить его можно в настройках. Он пишет только в те дни, когда вы ещё не занимались.",
    "faq6q": "Где посмотреть прогресс?",
    "faq6a": "В разделе «Мой прогресс»: дни подряд, квизы и точность за неделю, выученные слова по уровням CEFR и слова, в которых вы чаще ошибаетесь, — с кнопкой квиза на повторение из них.",
    "sec_overview": "Обзор",
    "sec_features": "Функции",
    "sec_how": "Как это работает",
    "sec_languages": "Языки",
    "sec_quiz": "Режим квиза",
    "hero_eyebrow": "Бот для запоминания слов от Laraue Software",
    "hero_title": "Учите английские слова\nне выходя из Telegram",
    "hero_sub": "Короткие квизы по почти 6 000 английских слов от A1 до C1, напоминание каждый день, статистика, рейтинг недели и достижения — всё внутри Telegram. Без установки и регистрации.",
    "hero_cta": "Начать изучение",
    "stat_langs": "языковых пар",
    "stat_cefr": "уровни CEFR",
    "stat_free": "Бесплатно",
    "stat_free_label": "навсегда",
    "view_github": "Открыть на GitHub",
    "view_blog": "Как это устроено",
    "feat_label": "Что включено",
    "feat_title": "Мощные функции",
    "feat_sub": "Проверенные методы изучения языков — в приложении, которым вы пользуетесь каждый день.",
    "f1t": "Режим квиза",
    "f1d": "Короткие квизы с выбором ответа, которые помогают запоминать английские слова. Ответ проверяется сразу. Первый квиз занимает около минуты.",
    "f2t": "Уровни CEFR",
    "f2d": "Слова по уровням CEFR от A1 до C1 и по темам. Выберите нужные уровни и темы в настройках и учите только то, что нужно.",
    "f3t": "Отслеживание прогресса",
    "f3d": "Дни подряд, квизы и точность за неделю, выученные слова по уровням и слова, в которых вы чаще ошибаетесь, — и квиз на их повторение.",
    "f4t": "Напоминания каждый день",
    "f4d": "Выберите время, и бот пришлёт одно напоминание в день — только если вы ещё не занимались, с кнопкой сразу в квиз.",
    "f5t": "Рейтинг и достижения",
    "f5d": "Соревнуйтесь в рейтинге недели и месяца, получайте трофеи за первые три места и собирайте достижения за серии дней, квизы без ошибок и выученные слова.",
    "f6t": "Без установки",
    "f6d": "Работает в Telegram на любом устройстве. Никакой регистрации, никаких дополнительных приложений.",
    "how_label": "Начало работы",
    "how_title": "Начните за 3 шага",
    "how_sub": "Без долгих настроек и скачиваний.",
    "step1t": "Откройте бота",
    "step1d": "Найдите learn_lang_bot в Telegram и нажмите «Старт».",
    "step2t": "Начните первый квиз одной кнопкой",
    "step2d": "Бот сам выберет язык перевода по языку вашего Telegram. Первый квиз — несколько слов уровня A1. Язык и уровни можно поменять в настройках.",
    "step3t": "Возвращайтесь каждый день",
    "step3d": "Слово считается выученным после трёх правильных ответов подряд. Включите напоминание, чтобы не прерывать серию.",
    "lang_label": "Поддерживаемые пары",
    "lang_title": "10 языковых пар",
    "lang_sub": "Английские слова с переводом на ваш язык. Постоянно добавляются новые пары.",
    "l1": "Английский для русскоговорящих",
    "l2": "Английский для говорящих по-японски",
    "l3": "Английский для говорящих по-французски",
    "l4": "Английский для говорящих на хинди",
    "l5": "Английский для говорящих по-немецки",
    "l6": "Английский для говорящих по-китайски",
    "l7": "Английский для говорящих по-испански",
    "l8": "Английский для говорящих по-узбекски",
    "l9": "Английский для говорящих по-арабски",
    "l10": "Английский для говорящих на фарси",
    "more_coming": "Скоро новые пары",
    "quiz_label": "Основной режим",
    "quiz_title": "Режим квиза",
    "quiz_desc": "Самый быстрый способ пополнить словарный запас. Для каждого слова выбираете перевод из четырёх вариантов той же части речи и сразу видите, верно ли. Квиз — десять вопросов, хватит и короткого перерыва.",
    "qf1": "Формат с выбором ответа, проверенный практикой",
    "qf2": "Моментальный ответ после каждого выбора: верно или неверно",
    "qf3": "Все четыре варианта одной части речи, поэтому грамматика не подсказывает ответ",
    "qf4": "Адаптивность — слова с ошибками повторяются чаще",
    "qf5": "Квиз на повторение из слов, в которых вы чаще ошибаетесь",
    "oss_label": "Абсолютная прозрачность",
    "oss_title": "Исходный код открыт",
    "oss_sub": "Исходный код бота открыт на GitHub, так что можно прочитать, как он устроен. Он бесплатен для личного и другого некоммерческого использования; для коммерческого нужно отдельное соглашение.",
    "oss_card_desc": "Написан на C# на .NET. Список слов и языки — обычные JSON-файлы в репозитории.",
    "cta_eyebrow": "Бесплатно. Без аккаунта. Без установки приложений.",
    "cta_title": "Начните пополнять словарный запас сегодня",
    "cta_sub": "Откройте бота и ответьте на первый вопрос меньше чем за минуту.",
    "video_title": "Vocabulary Bot за 52 секунды: английские слова в Telegram",
    "video_play": "Смотреть видео: Vocabulary Bot за 52 секунды",
    "video_description": "Первый квиз, ежедневные напоминания, «Мой прогресс», достижения и рейтинг недели в Vocabulary Bot — бесплатном Telegram-боте для изучения английских слов.",
    "quiz_alt": "Итоги квиза в Vocabulary Bot: шесть слов, пять верных ответов и одна ошибка"
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
          num: 10,
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
        <LActionButton :title="t('hero_cta')" :link="botLink" type="telegram" />
        <LActionButton :title="t('view_blog')" :link="localePath('/blog/projects/learn-language')" type="site" />
      </template>
      <template #visual>
        <LVideo
            :video-id="videoId"
            :title="t('video_title')"
            :play-label="t('video_play')"
            :posters="videoPosters"
            sizes="(max-width: 720px) calc(100vw - 44px), (max-width: 1180px) calc((100vw - 200px) / 2), 490px" />
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
          icon: 'question',
          description: t('f1d')
        },
        {
          title: t('f2t'),
          icon: 'book',
          description: t('f2d')
        },
        {
          title: t('f3t'),
          icon: 'chart',
          description: t('f3d')
        },
        {
          title: t('f4t'),
          icon: 'bell',
          description: t('f4d')
        },
        {
          title: t('f5t'),
          icon: 'trophy',
          description: t('f5d')
        },
        {
          title: t('f6t'),
          icon: 'phone',
          description: t('f6d')
        }
      ]" />

    <!-- ══ QUIZ MODE SCREENSHOT ══ -->
    <section class="screenshot" id="quiz">
      <div class="screenshot-inner">
        <div>
          <div class="section-label">{{ t('quiz_label') }}</div>
          <h2 class="section-title">{{ t('quiz_title') }}</h2>
          <p class="screenshot-desc">{{ t('quiz_desc') }}</p>
          <ul class="screenshot-feats">
            <li>{{ t('qf1') }}</li>
            <li>{{ t('qf2') }}</li>
            <li>{{ t('qf3') }}</li>
            <li>{{ t('qf4') }}</li>
            <li>{{ t('qf5') }}</li>
          </ul>
          <LActionButton :title="t('hero_cta')" type="telegram" :link="botLink" />
        </div>
        <div>
          <!-- Real screenshot if available, placeholder otherwise -->
          <div class="screenshot-img">
            <img
                :src="quiz480"
                :srcset="`${quiz480} 480w, ${quiz720} 720w`"
                sizes="(max-width: 860px) calc(100vw - 44px), 490px"
                :alt="t('quiz_alt')"
                width="720"
                height="912"
                loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    <LSection class="features" :pre-title="t('lang_label')" :postTitle="t('lang_sub')" :title="t('lang_title')" type="cream">
      <div class="languages-grid">
        <div v-for="language in supportedLanguages" class="lang-card">
          <div class="lang-flag">{{ language.value }}</div>
          <div class="lang-info">
            <div class="lang-pair">{{ language.name }}</div>
            <div class="lang-code">EN -> {{ language.value }}</div>
          </div>
        </div>
        <div class="lang-card" style="border-style:dashed;background:transparent;cursor:default;justify-content:center">
          <div style="text-align:center">
            <div class="lang-pair" style="font-size:13px;color:var(--muted)"> + {{ t('more_coming') }}</div>
          </div>
        </div>
      </div>
    </LSection>

    <!-- ══ OPEN SOURCE ══ -->
    <section class="oss" id="oss">
      <div class="oss-inner">
        <div>
          <div class="section-label">{{ t('oss_label') }}</div>
          <h2 class="section-title">{{ t('oss_title') }}</h2>
          <p class="section-sub">{{ t('oss_sub') }}</p>
        </div>
        <div>
          <div class="oss-card">
            <div class="oss-icon"><LNavIcon name="code" /></div>
            <h3 class="oss-title">Laraue.Apps.LearnLanguage</h3>
            <p class="oss-desc" data-i18n="oss_card_desc">{{ t('oss_card_desc') }}</p>
            <LActionButton :title="t('view_github')" link="https://github.com/Laraue/Laraue.Apps.LearnLanguage" type="github"/>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <LCallToAction :title="t('cta_title')" :pre-title="t('cta_eyebrow')" :post-title="t('cta_sub')">
      <LActionButton :title="t('hero_cta')" :link="botLink" type="telegram" />
      <LActionButton :title="t('view_github')" link="https://github.com/Laraue/Laraue.Apps.LearnLanguage" type="github" />
    </LCallToAction>

  </LMainContent>
</template>

<style scoped>
/* ══ SCREENSHOT ══ */
.screenshot{padding:80px 60px;background:var(--color-workspace);border-top:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);position:relative;overflow:hidden}
.screenshot-inner{max-width:1060px;margin:0 auto;position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.screenshot .section-label{color:var(--color-accent)}
.screenshot .section-label::after{background:var(--color-accent)}
.screenshot .section-title{color:var(--color-text)}
.screenshot-desc{font-size:16px;color:var(--color-muted);line-height:1.7;margin-bottom:32px}
.screenshot-feats{list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:36px}
.screenshot-feats li{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--color-text)}
.screenshot-feats li::before{content:'✓';font-weight:700;color:var(--color-success);flex-shrink:0;margin-top:1px}
.screenshot-img{border-radius:14px;overflow:hidden;border:1px solid var(--color-border);box-shadow:var(--shadow-popover)}
.screenshot-img img{width:100%;display:block}
.screenshot-img-placeholder svg{width:40px;height:40px;stroke:currentColor;opacity:.4}

/* ══ LANGUAGES ══ */
.languages-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:48px}
.lang-card{
  background:var(--color-surface);border:1px solid var(--border);border-radius:12px;
  padding:20px 18px;display:flex;align-items:center;gap:14px;
  transition:box-shadow .15s,transform .15s,border-color .15s;
  cursor:default;
}
.lang-card:hover{box-shadow:0 4px 20px rgba(16,24,40,.08);transform:translateY(-2px);border-color:var(--accent)}
.lang-flag{font-size:26px;flex-shrink:0;line-height:1}
.lang-pair{font-weight:700;font-size:14px;color:var(--ink)}
.lang-code{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-top:2px}

/* ══ OPEN SOURCE ══ */
.oss{padding:80px 60px;border-bottom:1px solid var(--border)}
.oss-inner{max-width:1060px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.oss-card{background:var(--color-surface);border:1px solid var(--border);border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(16,24,40,.06)}
.oss-icon{width:44px;height:44px;border-radius:11px;background:var(--accent-light);color:var(--accent);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.oss-icon :deep(.nav-icon-svg){width:22px;height:22px}
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