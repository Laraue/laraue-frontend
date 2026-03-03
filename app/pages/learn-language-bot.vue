<script setup lang="ts">

import {computed} from "vue";

const { t } = useI18n();
const supportedLanguages = ref([
  {
    name: t('russianEnglish'),
    value: "RU-EN"
  },
  {
    name: t('japaneseEnglish'),
    value: "JA-EN"
  },
  {
    name: t('frenchEnglish'),
    value: "FR-EN"
  },
  {
    name: t('hindiEnglish'),
    value: "HI-EN"
  },
  {
    name: t('germanEnglish'),
    value: "DE-EN"
  },
  {
    name: t('chineseEnglish'),
    value: "ZN-EN"
  },
  {
    name: t('spanishEnglish'),
    value: "ES-EN"
  }
])

const features = ref([
  {
    "title": t('quizModeTitle'),
    "description": t('quizModeDescription'),
    "icon": "🧠",
  },
  {
    "title": t('personalizationTitle'),
    "description": t('personalizationDescription'),
    "icon": "💬",
  },
  {
    "title": t('trackingTitle'),
    "description": t('trackingDescription'),
    "icon": "📊",
  },
  {
    "title": t('easyAccessTitle'),
    "description": t('easyAccessDescription'),
    "icon": "🖥️",
  },
  {
    "title": t('viewModeTitle'),
    "description": t('viewModeDescription'),
    "icon": "👀",
  }
])

const steps = ref([
  {
    "title": t('chooseLanguageStepTitle'),
    "description": t('chooseLanguageStepDescription'),
  },
  {
    "title": t('startStepTitle'),
    "description": t('startStepDescription'),
  },
  {
    "title": t('practiseStepTitle'),
    "description": t('practiseStepDescription'),
  }
])

useSeoMeta({
  title: computed(() => t('seoTitle')),
  ogTitle: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
})
</script>

<i18n lang="json">
{
  "en": {
    "seoTitle": "Increase Vocabulary with Flashcards Bot",
    "seoDescription": "The telegram bot that helps to learn top 5k used words of English, Japanese, Russian and French languages",
    "title": "The Telegram bot to increase your vocabulary",
    "description": "Master languages with multiple ways to study vocabulary. Learn anytime, anywhere without installing any app!",
    "start": "Start Learning Now",
    "featuresTitle": "Powerful Learning Features",
    "featuresDescription": "The bot combines technologies with proven learning methods",
    "quizModeTitle": "Quiz Mode",
    "quizModeDescription": "Engage in interactive, gamified quizzes designed to boost retention and make learning vocabulary fun and effective.",
    "personalizationTitle": "Personalized Learning",
    "personalizationDescription": "Customize your study sessions to focus on specific language pairs or difficulty levels that suit your goals.",
    "trackingTitle": "Progress Tracking",
    "trackingDescription": "Monitor your learning streak, quiz scores, and word mastery to stay motivated and track your improvement over time.",
    "easyAccessTitle": "Seamless Access",
    "easyAccessDescription": "Access the platform instantly on Telegram, compatible with smartphones, tablets, or desktops without downloading apps.",
    "viewModeTitle": "View Mode",
    "viewModeDescription": "Organize and explore words by CEFR level (A1-C2), topic (e.g., travel, business), or alphabetically for tailored learning.",
    "howItWorksTitle": "How It Works",
    "howItWorksDescription": "Learning a new language has never been easier",
    "chooseLanguageStepTitle": "Choose Your Language",
    "chooseLanguageStepDescription": "Select any of the available languages pair on settings",
    "startStepTitle": "Start Learning",
    "startStepDescription": "Use Quiz Mode to learn new words",
    "practiseStepTitle": "Practice & Improve",
    "practiseStepDescription": "Each finished Quiz will update and show your statistics",
    "supportedLanguagesTitle": "Supported Languages",
    "supportedLanguagesDescription": "Learn the most popular languages with our platform",
    "sourceCodeTitle": "Source Code & Contributions",
    "sourceCodeDescription": "Explore the project's architecture, contribute to development, and report issues on GitHub.",
    "viewOnGitHub": "View on GitHub",
    "russianEnglish": "Russian-English",
    "japaneseEnglish": "Japanese-English",
    "frenchEnglish": "French-English",
    "hindiEnglish": "Hindi-English",
    "germanEnglish": "German-English",
    "chineseEnglish": "Chinese-English",
    "spanishEnglish": "Spanish-English"
  },
  "ru": {
    "seoTitle": "Бот для пополнения словарного запаса",
    "seoDescription": "Бот позволяет выучить самые часто используемые слова английского, русского, испанского и других языков",
    "title": "Telegram бот для развития словарного запаса",
    "description": "Изучайте слова различных языков с помощью интерактивных карточек. Обучайтесь в любое время без установки дополнительных приложений.",
    "start": "Начать обучение",
    "featuresTitle": "Эффективные способы обучения",
    "featuresDescription": "Бот объединяет технологии и проверенные временем методы",
    "quizModeTitle": "Режим квиза",
    "quizModeDescription": "Интерактивные геймицированные квизы сделаны помогают не заскучать во время изучения.",
    "personalizationTitle": "Персоанализация",
    "personalizationDescription": "Настройте обучения под себя, сфокусировавшись только на интересных топиках или определенной сложности слов.",
    "trackingTitle": "Отслеживайте прогресс",
    "trackingDescription": "Наблюдайте за статистикой пройденных квизов и результатами обучения.",
    "easyAccessTitle": "Доступ отовсюду",
    "easyAccessDescription": "Бот доступен в Telegram с любого устройства. Не нужно дополнительно устанавливать никаких приложений.",
    "viewModeTitle": "Режим просмотра",
    "viewModeDescription": "Есть возможность прсмотреть слова определенных топиков или уровней сложности вне режима квиза.",
    "howItWorksTitle": "Как это работает",
    "howItWorksDescription": "Изучение нового языка еще не было проще",
    "chooseLanguageStepTitle": "Выберите язык",
    "chooseLanguageStepDescription": "Можно выбрать любую языковую пару и изменить ее в любой момент",
    "startStepTitle": "Начните обучение",
    "startStepDescription": "Используйте режим квиза, чтобы выучить новые слова",
    "practiseStepTitle": "Практикуйтесь и улучшайте знания",
    "practiseStepDescription": "После каждого завершенного квиза обновляется и показавается стаистка обучения",
    "supportedLanguagesTitle": "Поддерживаемые языки",
    "supportedLanguagesDescription": "Изучайте самые популярные языковые пары",
    "sourceCodeTitle": "Исходный код",
    "sourceCodeDescription": "Изучить архитектуру проекта, внести вклад в разработку или сообщить о проблемах можно на GitHub.",
    "viewOnGitHub": "Открыть GitHub",
    "russianEnglish": "Русский - английский",
    "japaneseEnglish": "Японский - английский",
    "frenchEnglish": "Французский - английский",
    "hindiEnglish": "Хинди - английский",
    "germanEnglish": "Немецкий - английский",
    "chineseEnglish": "Китайский - английский",
    "spanishEnglish": "Испанский - английский"
  }
}
</i18n>

<template>
  <header>
    <h1>{{ t('title') }}</h1>
    <p>{{ t('description') }}</p>
    <div>
      <a target="_blank" rel="nofollow" href="https://t.me/learn_lang_bot" class="btn-start">{{ t('start') }}</a>
      <img src="/images/quiz-mode.jpg" alt="Learn Language Bot" class="hero-image">
    </div>
  </header>
  <main>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>{{ t('featuresTitle') }}</h2>
          <p>{{ t('featuresDescription') }}</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features">
            <div class="feature-icon">
              <i>{{ feature.icon }}</i>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>{{ t('howItWorksTitle') }}</h2>
          <p>{{ t('howItWorksDescription') }}</p>
        </div>
        <div class="steps">
          <div class="step" v-for="(step, i) in steps">
            <div class="step-number">{{ i + 1 }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>{{ t('supportedLanguagesTitle') }}</h2>
          <p>{{ t('supportedLanguagesDescription') }}</p>
        </div>
        <div class="languages-grid">
          <div class="language-card" v-for="language in supportedLanguages">
            <h3>{{ language.name }}</h3>
            <p>{{ language.value }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="project">
      <h3 class="project-title">{{ t('sourceCodeTitle') }}</h3>
      <div class="project-content">
        <p>{{ t('sourceCodeDescription') }}</p>
        <a href="https://github.com/win7user10/Laraue.Apps.LearnLanguage" target="_blank" rel="nofollow" class="github-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-1.5 0-3 .5-4 1.4L6 6.2V22h2l3-3a5.5 5.5 0 0 0 0-3.4L11 5.5a5.5 5.5 0 0 0-3.5 3.5L5 15h2v4a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-4l3-3a5.5 5.5 0 0 0-1.3 1.3z"></path>
          </svg>
          {{ t('viewOnGitHub') }}
        </a>
      </div>
    </section>
  </main>
</template>

<style scoped>

header {
  background: #f8f9fa;
  color: #343a40;
  padding: 120px 20px;
  text-align: center;
  border-bottom: 1px solid #dee2e6;
}

header h1 {
  font-size: 2.5em;
  font-weight: 700;
  margin: 0;
}

header p {
  font-size: 1.2em;
  margin: 10px 0;
}

.btn-start {
  background: linear-gradient(135deg, #8c2abf, #a489c3);
  color: white;
  padding: 15px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  display: inline-block;
  margin-top: 20px;
  margin-right: 20px;
  transition: opacity 0.3s;
}

.btn-start:hover {
  opacity: 0.9;
}

.section {
  padding: 80px 0;
}

main {
  background: url("/images/learn-words-background.png") no-repeat center center/cover;
}

.section-title {
  text-align: center;
  margin-bottom: 60px;
}

.section-title h2 {
  font-size: 2.5rem;
  color: #7437ae;;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.section-title h2::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: #00b4d8;
  border-radius: 2px;
}

.section-title p {
  font-size: 1.2rem;
  color: #6c757d;;
  max-width: 700px;
  margin: 0 auto;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-top: 50px;
}

.step {
  flex: 1;
  min-width: 250px;
  max-width: 300px;
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.language-card {
  background: white;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.language-card h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #7437ae;
}

.step-number {
  width: 50px;
  height: 50px;
  background: #8c2abf;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 20px;
}

.step h3 {
  margin-bottom: 15px;
  color: #7437ae;
}

h3 {
  font-size: 1.17em;
  text-align: center;
}

section {
  text-align: center;
  margin: 40px auto;
  max-width: 1000px;
}

.features h2,
.languages h2 {
  font-size: 2.5rem;
  color: #7437ae;
  font-weight: 500;
  margin: 5vh 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  background: white;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: #8c2abf;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #343a40;
}

.feature-card p {
  color: #6c757d;
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: rgba(140, 42, 191, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #8c2abf;
  font-size: 2rem;
}

.card h3 {
  margin: 0 0 10px;
  color: #343a40;
}

.card p {
  margin: 0;
  font-size: 1em;
  color: #6c757d;
}

.languages .card {
  text-align: center;
}

footer {
  background-color: #f8f9fa;
  color: #343a40;
  padding: 20px;
  text-align: center;
  border-top: 1px solid #dee2e6;
}

footer a {
  color: #00b4d8;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

.project {
  background-color: #3a353c;
  padding: 40px;
  text-align: center;
  margin-top: 80px;
  margin-bottom: 0;
  max-width: 100%;
  min-height: 20vh;
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.project-title {
  color: #fff;
  font-size: 24px;
  margin-bottom: 15px;
}

.project-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
  align-items: center;
  display: flex;
  flex-flow: column;
}

.project-content p {
  color: #ddd;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.github-button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #a057d1;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
  transition: background-color 0.3s;
  position: relative; /* For the icon positioning */
}

.github-button:hover {
  background-color: #7f209e;
}

.github-button svg {
  margin-right: 8px;
  vertical-align: middle; /* Align icon with text */
}

.hero-image {
  max-width: 300px;
  margin: 30px auto 0;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);;
  border: 5px solid #c6e3ec;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  header {
    padding: 100px 20px;
  }

  main {
    padding: 30px 20px;
  }

  header h1 {
    font-size: 2.5rem;
  }

  header p {
    font-size: 1.1rem;
  }

  .section {
    padding: 10px 0;
  }

  .section-title h2 {
    font-size: 2rem;
    text-align: center;
  }

  .language-card p {
    text-align: center;
  }

  .step p {
    text-align: center;
  }
}
</style>