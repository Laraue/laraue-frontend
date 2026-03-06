<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('seoTitle')),
  ogTitle: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
})
</script>

<i18n lang="json">
{
  "en": {
    "freeTool": "Free Online Tool · No Signup",
    "seoTitle": "Markdown Translator – Structure-Preserving .md Translation",
    "seoDescription": "Free online Markdown translator. Translate .md files between 10+ languages while preserving headings, code blocks, tables, and all Markdown structure. No formatting lost.",
    "heroTitle": "Translate Markdown Files",
    "heroEmphasis": "Without Breaking the Format",
    "heroSub": "The only Markdown translator that preserves your headings, code blocks, tables, and lists — exactly as they are — across 10+ languages.",
    "featurePreserveHeadings": "Preserves # headings",
    "featureKeepCode": "Keeps ``` code blocks",
    "featureRetainTables": "Retains tables ",
    "featureLanguages": "10+ languages",
    "featureFree": "100% free",
    "langFrom": "From",
    "langTo": "To",
    "langEnglish": "English",
    "langSpanish": "Spanish",
    "langFrench": "French",
    "langGerman": "German",
    "langJapanese": "Japanese",
    "langChinese": "Chinese",
    "langPortuguese": "Portuguese",
    "langArabic": "Arabic",
    "langRussian": "Russian",
    "langHindi": "Hindi",
    "btnClear": "Clear",
    "btnTranslate": "Translate →",
    "btnCopy": "Copy ↗",
    "srcPlaceholder": "Paste or type your Markdown here…",
    "tgtPlaceholder": "Translation will appear here, structure fully preserved…",
    "srcHeader": "Source Markdown",
    "tgtHeader": "Translated Output",
    "lines": "lines",
    "stats": "{count} lines · {words} words",
    "featuresHeading": "Why use a structure-preserving Markdown translator?",
    "featureHeadingsTitle": "Headings stay headings.",
    "featureHeadingsDesc": "Every {code1}, {code2}, and {code3} is preserved exactly — only the text inside is translated, never the syntax.",
    "featureCodeTitle": "Code blocks untouched.",
    "featureCodeDesc": "Content inside {code} fences is never passed to the translation engine — your code stays exactly as written.",
    "featureTablesTitle": "Tables remain intact.",
    "featureTablesDesc": "Table separators, alignment markers, and column structure are fully preserved across all languages.",
    "featureLinksTitle": "Links and references preserved.",
    "featureLinksDesc": "Hyperlink syntax {code} is parsed carefully — the URL is never translated, only the display text.",
    "docsHeading": "Translate documentation, READMEs & technical docs",
    "docReadme": "Translate {strongStart}README.md{strongEnd} files for open-source projects to reach a global audience of developers.",
    "docDocs": "Localize entire {strongStart}documentation sites{strongEnd} written in Markdown or MDX without reformatting every file manually.",
    "docBlog": "Translate {strongStart}blog posts and articles{strongEnd} written in Markdown for platforms like Jekyll, Hugo, Gatsby, or Astro.",
    "docPipeline": "Support {strongStart}multilingual content pipelines{strongEnd} with a translation step that doesn't require post-processing or reformatting.",
    "faqHeading": "Frequently Asked Questions",
    "faq1q": "Can I translate a Markdown file without losing formatting?",
    "faq1a": "Yes — that's exactly what Markdown Translator is built for. We parse .md files line-by-line and translate only the text content while preserving all structural syntax: headings, code fences, tables, blockquotes, and lists. The output is valid Markdown in the target language.",
    "faq2q": "Which languages does the Markdown Translator support?",
    "faq2a": "We currently support English, Spanish, French, German, Japanese, Chinese, Portuguese, Arabic, Russian, and Hindi. More languages are being added regularly. If you need a specific language, please reach out.",
    "faq3q": "Will my code blocks be translated?",
    "faq3a": "No. Content inside triple-backtick code fences (```) is never sent to the translation engine. Your code, commands, and variable names stay exactly as they are.",
    "faq4q": "Is this Markdown translator free to use?",
    "faq4a": "Yes, completely free with no account or signup required. Simply paste your Markdown, choose your languages, and click Translate.",
    "faq5q": "Can I translate README files for GitHub?",
    "faq5a": "Absolutely. README.md files are one of the most common use cases. Paste your README, choose the target language, and get a translated version that renders correctly on GitHub, GitLab, or any Markdown renderer.",
    "relatedTopics": "Related Topics",
    "kwTranslator": "markdown translator",
    "kwTranslateFile": "translate .md file",
    "kwLocalization": "markdown localization",
    "kwReadme": "translate README.md",
    "kwPreserve": "preserve markdown formatting",
    "kwTechDocs": "technical documentation translation",
    "kwMdx": "MDX translator",
    "kwHugo": "translate Hugo site",
    "kwGatsby": "translate Gatsby markdown",
    "kwAstro": "translate Astro content",
    "kwMultilingual": "multilingual markdown",
    "kwJekyll": "translate Jekyll posts",
    "kwOpenSource": "open source README translation",
    "kwI18n": "i18n markdown",
    "swapLanguages": "Swap source and target languages"
  },
  "ru": {
    "freeTool": "Бесплатный онлайн инструмент · Без регистрации",
    "seoTitle": "Markdown Переводчик – Сохранение структуры .md файлов",
    "seoDescription": "Бесплатный онлайн переводчик Markdown. Переводите .md файлы между 10+ языками с сохранением заголовков, блоков кода, таблиц и всей структуры Markdown. Без потери форматирования.",
    "heroTitle": "Переводите Markdown файлы",
    "heroEmphasis": "Без потери форматирования",
    "heroSub": "Единственный переводчик Markdown, который сохраняет ваши заголовки, блоки кода, таблицы и списки не меняя структуру файла — на 10+ языках.",
    "featurePreserveHeadings": "Сохраняет # заголовки",
    "featureKeepCode": "Оставляет ``` блоки кода",
    "featureRetainTables": "Сохраняет таблицы",
    "featureLanguages": "10+ языков",
    "featureFree": "100% бесплатно",
    "langFrom": "С",
    "langTo": "На",
    "langEnglish": "Английский",
    "langSpanish": "Испанский",
    "langFrench": "Французский",
    "langGerman": "Немецкий",
    "langJapanese": "Японский",
    "langChinese": "Китайский",
    "langPortuguese": "Португальский",
    "langArabic": "Арабский",
    "langRussian": "Русский",
    "langHindi": "Хинди",
    "btnClear": "Очистить",
    "btnTranslate": "Перевести →",
    "btnCopy": "Копировать ↗",
    "srcPlaceholder": "Вставьте или введите Markdown здесь…",
    "tgtPlaceholder": "Перевод появится здесь, структура полностью сохранится…",
    "srcHeader": "Исходный Markdown",
    "tgtHeader": "Переведенный текст",
    "lines": "строк",
    "stats": "{count} строк · {words} слов",
    "featuresHeading": "Зачем использовать переводчик Markdown с сохранением структуры?",
    "featureHeadingsTitle": "Заголовки остаются заголовками.",
    "featureHeadingsDesc": "Каждый {code1}, {code2} и {code3} сохраняется точно — переводится только текст внутри, никогда не синтаксис.",
    "featureCodeTitle": "Блоки кода нетронуты.",
    "featureCodeDesc": "Содержимое внутри {code} блоков никогда не передается в движок перевода — ваш код остается точно как написан.",
    "featureTablesTitle": "Таблицы остаются нетронутыми.",
    "featureTablesDesc": "Разделители таблиц, маркеры выравнивания и структура колонок полностью сохраняются на всех языках.",
    "featureLinksTitle": "Ссылки и сноски сохраняются.",
    "featureLinksDesc": "Синтаксис гиперссылок {code} тщательно анализируется — URL никогда не переводится, только отображаемый текст.",
    "docsHeading": "Переводите документацию, README и технические документы",
    "docReadme": "Переводите {strongStart}README.md{strongEnd} файлы для open-source проектов, чтобы охватить глобальную аудиторию разработчиков.",
    "docDocs": "Локализуйте целые {strongStart}сайты документации{strongEnd}, написанные на Markdown или MDX, без ручного переформатирования каждого файла.",
    "docBlog": "Переводите {strongStart}посты в блогах и статьи{strongEnd}, написанные на Markdown для платформ Jekyll, Hugo, Gatsby или Astro.",
    "docPipeline": "Поддерживайте {strongStart}многоязычные конвейеры контента{strongEnd} с этапом перевода, который не требует пост-обработки или переформатирования.",
    "faqHeading": "Часто задаваемые вопросы",
    "faq1q": "Могу ли я перевести Markdown файл без потери форматирования?",
    "faq1a": "Да — именно для этого и создано приложение. Мы анализируем .md файлы построчно и переводим только текстовое содержание, сохраняя структуру: заголовки, блоки кода, таблицы, цитаты и списки. Результат — валидный Markdown.",
    "faq2q": "Какие языки поддерживает Markdown Переводчик?",
    "faq2a": "В настоящее время мы поддерживаем английский, испанский, французский, немецкий, японский, китайский, португальский, арабский, русский и хинди. Регулярно добавляются новые языки. Если вам нужен конкретный язык, пожалуйста, свяжитесь с нами.",
    "faq3q": "Будут ли переведены мои блоки кода?",
    "faq3a": "Нет. Содержимое внутри блоков кода в тройных обратных кавычках (```) никогда не переводится. Ваш код, команды и имена переменных остаются такими же, как были.",
    "faq4q": "Этот переводчик Markdown бесплатный?",
    "faq4a": "Да, полностью бесплатный, без регистрации и входа. Просто вставьте ваш Markdown, выберите языки и нажмите Перевести.",
    "faq5q": "Могу ли я переводить README файлы для GitHub?",
    "faq5a": "Абсолютно. README.md файлы — один из самых частых случаев использования. Вставьте ваш README, выберите целевой язык и получите переведенную версию, которая корректно отображается на GitHub, GitLab или любом другом сервисе, работающем с Markdown.",
    "relatedTopics": "Связанные темы",
    "kwTranslator": "переводчик markdown",
    "kwTranslateFile": "перевести .md файл",
    "kwLocalization": "локализация markdown",
    "kwReadme": "перевести README.md",
    "kwPreserve": "сохранить форматирование markdown",
    "kwTechDocs": "перевод технической документации",
    "kwMdx": "переводчик MDX",
    "kwHugo": "перевести сайт на Hugo",
    "kwGatsby": "перевести markdown в Gatsby",
    "kwAstro": "перевести контент Astro",
    "kwMultilingual": "многоязычный markdown",
    "kwJekyll": "перевести посты Jekyll",
    "kwOpenSource": "перевод README с открытым кодом",
    "kwI18n": "i18n markdown",
    "swapLanguages": "Поменять языки местами"
  }
}
</i18n>

<template>
  <!-- ══════════════════════════════════
       HERO (H1 with primary keyword)
  ══════════════════════════════════ -->
  <section class="hero" aria-labelledby="hero-heading">
    <div class="hero-badge" role="status">
      <div class="badge-dot" aria-hidden="true"></div>
      {{ t('freeTool') }}
    </div>

    <h1 id="hero-heading">
      {{ t('heroTitle') }}<br />
      <em>{{ t('heroEmphasis') }}</em>
    </h1>

    <p class="hero-sub">
      {{ t('heroSub') }}
    </p>

    <div class="hero-features" role="list" aria-label="Key features">
      <div class="feature-chip" role="listitem">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        {{ t('featurePreserveHeadings') }}
      </div>
      <div class="feature-chip" role="listitem">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        {{ t('featureKeepCode') }}
      </div>
      <div class="feature-chip" role="listitem">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        {{ t('featureRetainTables') }}
      </div>
      <div class="feature-chip" role="listitem">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        {{ t('featureLanguages') }}
      </div>
      <div class="feature-chip" role="listitem">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        {{ t('featureFree') }}
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════
       MAIN TRANSLATOR TOOL
  ══════════════════════════════════ -->
  <main id="translator">
    <section class="translator-section" aria-label="Markdown translation tool">

      <!-- Language bar -->
      <div class="lang-bar" role="form" aria-label="Translation settings">
        <span class="lang-label">{{ t('langFrom') }}</span>
        <div class="lang-select-wrap" id="src-wrap">
          <div class="lang-select-btn" id="src-btn" onclick="toggleDropdown('src')" aria-haspopup="listbox" :aria-label="t('langFrom')">
            <span id="src-flag">🇬🇧</span>
            <span id="src-text" style="flex:1">{{ t('langEnglish') }}</span>
            <span style="opacity:.4;font-size:10px">▼</span>
          </div>
          <div class="lang-dropdown" id="src-dropdown" style="display:none" role="listbox"></div>
        </div>

        <button class="swap-btn" onclick="swapLanguages()" :aria-label="t('swapLanguages')" :title="t('swapLanguages')">⇄</button>

        <span class="lang-label">{{ t('langTo') }}</span>
        <div class="lang-select-wrap" id="tgt-wrap">
          <div class="lang-select-btn" id="tgt-btn" onclick="toggleDropdown('tgt')" aria-haspopup="listbox" :aria-label="t('langTo')">
            <span id="tgt-flag">🇪🇸</span>
            <span id="tgt-text" style="flex:1">{{ t('langSpanish') }}</span>
            <span style="opacity:.4;font-size:10px">▼</span>
          </div>
          <div class="lang-dropdown" id="tgt-dropdown" style="display:none" role="listbox"></div>
        </div>

        <div class="spacer"></div>

        <button class="btn-clear" onclick="clearAll()" :aria-label="t('btnClear')">{{ t('btnClear') }}</button>
        <button class="btn-translate" id="translate-btn" onclick="handleTranslate()" :aria-label="t('btnTranslate')">
          <span id="btn-label">{{ t('btnTranslate') }}</span>
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-bar" id="stats-bar" style="display:none" role="status" aria-live="polite"></div>

      <!-- Editor panes -->
      <div class="panes">
        <div class="pane" id="src-pane">
          <div class="pane-header">
            <span class="pane-header-left">{{ t('srcHeader') }}</span>
            <span style="font-size:10px;color:var(--slate-light)" id="src-counter">0 {{ t('lines') }}</span>
          </div>
          <textarea
              id="source-area"
              :aria-label="t('srcHeader')"
              :placeholder="t('srcPlaceholder')"
              oninput="updateCounter()"
          ></textarea>
        </div>

        <div class="pane-divider" aria-hidden="true"></div>

        <div class="pane output-pane" id="tgt-pane">
          <div class="pane-header">
            <span class="pane-header-left">{{ t('tgtHeader') }}</span>
            <button class="btn-copy" id="copy-btn" onclick="copyOutput()" style="display:none" :aria-label="t('btnCopy')">{{ t('btnCopy') }}</button>
          </div>
          <textarea
              id="output-area"
              :aria-label="t('tgtHeader')"
              :placeholder="t('tgtPlaceholder')"
              readonly
          ></textarea>
        </div>
      </div>
    </section>
  </main>

  <!-- ══════════════════════════════════
       FEATURES SECTION (SEO content)
  ══════════════════════════════════ -->
  <section class="seo-section" id="features" aria-labelledby="features-heading">
    <div class="seo-grid">
      <div>
        <h2 id="features-heading">{{ t('featuresHeading') }}</h2>
        <ul class="feature-list">
          <li>
            <div class="icon" aria-hidden="true">#</div>
            <div>
              <strong>{{ t('featureHeadingsTitle') }}</strong> {{ t('featureHeadingsDesc', {
              code1: '#',
              code2: '##',
              code3: '###'
              }) }}
            </div>
          </li>
          <li>
            <div class="icon" aria-hidden="true">{ }</div>
            <div>
              <strong>{{ t('featureCodeTitle') }}</strong> {{ t('featureCodeDesc', {
              code: '```'
              }) }}
            </div>
          </li>
          <li>
            <div class="icon" aria-hidden="true">|</div>
            <div>
              <strong>{{ t('featureTablesTitle') }}</strong> {{ t('featureTablesDesc') }}
            </div>
          </li>
          <li>
            <div class="icon" aria-hidden="true">→</div>
            <div>
              <strong>{{ t('featureLinksTitle') }}</strong> {{ t('featureLinksDesc', {
              code: '[text](url)'
              }) }}
            </div>
          </li>
        </ul>
      </div>

      <div>
        <h2>{{ t('docsHeading') }}</h2>
        <ul class="feature-list">
          <li>
            <div class="icon" aria-hidden="true">📄</div>
            <div v-html="t('docReadme', {
              strongStart: '<strong>',
              strongEnd: '</strong>'
            })"></div>
          </li>
          <li>
            <div class="icon" aria-hidden="true">📚</div>
            <div v-html="t('docDocs', {
              strongStart: '<strong>',
              strongEnd: '</strong>'
            })"></div>
          </li>
          <li>
            <div class="icon" aria-hidden="true">✍️</div>
            <div v-html="t('docBlog', {
              strongStart: '<strong>',
              strongEnd: '</strong>'
            })"></div>
          </li>
          <li>
            <div class="icon" aria-hidden="true">🌍</div>
            <div v-html="t('docPipeline', {
              strongStart: '<strong>',
              strongEnd: '</strong>'
            })"></div>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════
       FAQ SECTION (structured data target)
  ══════════════════════════════════ -->
  <section class="faq-section" id="faq" aria-labelledby="faq-heading">
    <h2 id="faq-heading">{{ t('faqHeading') }}</h2>

    <article class="faq-item">
      <h3 class="faq-q">{{ t('faq1q') }}</h3>
      <p class="faq-a">{{ t('faq1a') }}</p>
    </article>

    <article class="faq-item">
      <h3 class="faq-q">{{ t('faq2q') }}</h3>
      <p class="faq-a">{{ t('faq2a') }}</p>
    </article>

    <article class="faq-item">
      <h3 class="faq-q">{{ t('faq3q') }}</h3>
      <p class="faq-a">{{ t('faq3a') }}</p>
    </article>

    <article class="faq-item">
      <h3 class="faq-q">{{ t('faq4q') }}</h3>
      <p class="faq-a">{{ t('faq4a') }}</p>
    </article>

    <article class="faq-item">
      <h3 class="faq-q">{{ t('faq5q') }}</h3>
      <p class="faq-a">{{ t('faq5a') }}</p>
    </article>
  </section>

  <!-- ══════════════════════════════════
       KEYWORD TAG CLOUD (visible SEO signal)
  ══════════════════════════════════ -->
  <aside class="seo-keywords" :aria-label="t('relatedTopics')">
    <h3>{{ t('relatedTopics') }}</h3>
    <div class="keyword-tags">
      <span class="kw-tag">{{ t('kwTranslator') }}</span>
      <span class="kw-tag">{{ t('kwTranslateFile') }}</span>
      <span class="kw-tag">{{ t('kwLocalization') }}</span>
      <span class="kw-tag">{{ t('kwReadme') }}</span>
      <span class="kw-tag">{{ t('kwPreserve') }}</span>
      <span class="kw-tag">{{ t('kwTechDocs') }}</span>
      <span class="kw-tag">{{ t('kwMdx') }}</span>
      <span class="kw-tag">{{ t('kwHugo') }}</span>
      <span class="kw-tag">{{ t('kwGatsby') }}</span>
      <span class="kw-tag">{{ t('kwAstro') }}</span>
      <span class="kw-tag">{{ t('kwMultilingual') }}</span>
      <span class="kw-tag">{{ t('kwJekyll') }}</span>
      <span class="kw-tag">{{ t('kwOpenSource') }}</span>
      <span class="kw-tag">{{ t('kwI18n') }}</span>
    </div>
  </aside>
</template>

<style scoped>

section, aside {
  --blue-900: #0d2240;
  --blue-800: #133366;
  --blue-600: #1a5ab8;
  --blue-500: #2470d4;
  --blue-400: #4a8fe8;
  --blue-200: #bdd4f5;
  --blue-100: #ddeafc;
  --blue-50:  #f0f6ff;
  --white:    #ffffff;
  --slate:    #64748b;
  --slate-light: #94a3b8;
  --green-500: #16a34a;
  --green-100: #dcfce7;
  --red-500:   #dc2626;
}

body {
  background: var(--white);
  color: var(--blue-900);
  min-height: 100vh;
}

/* ── ANIMATIONS ── */
@keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
@keyframes spin     { to { transform: rotate(360deg); } }
@keyframes shimmer  { 0%,100% { opacity:.4; } 50% { opacity:1; } }
@keyframes slideIn  { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:none; } }

.fade-up   { animation: fadeUp  .5s ease both; }
.slide-in  { animation: slideIn .4s ease both; }
.spin-anim { animation: spin 1s linear infinite; display:inline-block; }

/* ── HEADER ── */
.site-header {
  background: var(--white);
  border-bottom: 1.5px solid var(--blue-100);
  padding: 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: 0 1px 12px rgba(36,112,212,0.07);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.logo-icon {
  width: 34px; height: 34px;
  background: var(--blue-600);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  color: #fff;
  flex-shrink: 0;
}
.logo-text {
  font-family: 'Instrument Serif', serif;
  font-size: 20px;
  color: var(--blue-900);
  letter-spacing: -0.02em;
}
.logo-text span { color: var(--blue-500); }

.nav-links {
  display: flex; gap: 28px; list-style: none;
}
.nav-links a {
  font-size: 12px; color: var(--slate);
  text-decoration: none; letter-spacing: 0.04em;
  transition: color .15s;
}
.nav-links a:hover { color: var(--blue-600); }

.header-cta {
  background: var(--blue-500);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-family: 'Geist Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  transition: background .15s;
}
.header-cta:hover { background: var(--blue-600); }

/* ── HERO ── */
.hero {
  background: linear-gradient(160deg, var(--blue-50) 0%, #fff 60%);
  padding: 72px 48px 56px;
  text-align: center;
  border-bottom: 1px solid var(--blue-100);
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(36,112,212,0.08), transparent 70%);
  pointer-events: none;
}

.hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--blue-100); color: var(--blue-600);
  border-radius: 100px; padding: 4px 14px;
  font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 22px;
  animation: fadeUp .4s ease both;
}
.badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--blue-500);
  animation: shimmer 1.6s ease-in-out infinite;
}

.hero h1 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(36px, 5vw, 58px);
  font-weight: 400;
  color: var(--blue-900);
  line-height: 1.12;
  letter-spacing: -0.03em;
  max-width: 720px;
  margin: 0 auto 20px;
  animation: fadeUp .5s .05s ease both;
}
.hero h1 em {
  font-style: italic;
  color: var(--blue-500);
}

.hero-sub {
  font-size: 14px; color: var(--slate);
  max-width: 520px; margin: 0 auto 36px;
  line-height: 1.8;
  animation: fadeUp .5s .1s ease both;
}

.hero-features {
  display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
  margin-bottom: 8px;
  animation: fadeUp .5s .15s ease both;
}
.feature-chip {
  display: flex; align-items: center; gap: 6px;
  background: #fff; border: 1.5px solid var(--blue-200);
  border-radius: 100px; padding: 5px 14px;
  font-size: 11px; color: var(--blue-800);
  letter-spacing: 0.03em;
}
.feature-chip svg { width: 12px; height: 12px; color: var(--blue-500); }

/* ── TRANSLATOR ── */
.translator-section {
  padding: 48px 48px 64px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Language bar */
.lang-bar {
  display: flex; align-items: center; gap: 14px;
  flex-wrap: wrap; margin-bottom: 24px;
}
.lang-label {
  font-size: 10px; color: var(--slate-light);
  letter-spacing: 0.15em; text-transform: uppercase;
}

/* Custom select */
.lang-select-wrap { position: relative; min-width: 160px; }
.lang-select-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 14px; border-radius: 10px;
  background: var(--white); border: 1.5px solid var(--blue-200);
  color: var(--blue-900); font-family: 'Geist Mono', monospace;
  font-size: 13px; cursor: pointer; width: 100%;
  transition: border-color .15s, box-shadow .15s;
  user-select: none;
  box-sizing: border-box;
}
.lang-select-btn:hover {
  border-color: var(--blue-400);
  box-shadow: 0 0 0 3px rgba(36,112,212,0.08);
}
.lang-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0;
  background: #fff; border: 1.5px solid var(--blue-200);
  border-radius: 12px; overflow: hidden; z-index: 100;
  box-shadow: 0 12px 40px rgba(13,34,64,0.12);
}
.lang-option {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; cursor: pointer;
  font-family: 'Geist Mono', monospace; font-size: 13px;
  color: var(--blue-900); transition: background .1s;
}
.lang-option:hover { background: var(--blue-50); }
.lang-option.active { background: var(--blue-50); color: var(--blue-600); }

.swap-btn {
  width: 38px; height: 38px; border-radius: 10px;
  background: var(--blue-50); border: 1.5px solid var(--blue-200);
  color: var(--blue-500); cursor: pointer; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s; flex-shrink: 0;
}
.swap-btn:hover {
  background: var(--blue-500); color: #fff; border-color: var(--blue-500);
}

.spacer { flex: 1; }

.btn-clear {
  background: transparent; border: 1.5px solid var(--blue-200);
  border-radius: 10px; color: var(--slate); cursor: pointer;
  padding: 9px 18px; font-family: 'Geist Mono', monospace;
  font-size: 12px; transition: all .15s;
}
.btn-clear:hover { border-color: var(--blue-400); color: var(--blue-600); }

.btn-translate {
  background: var(--blue-500); border: none; border-radius: 10px;
  color: #fff; cursor: pointer; padding: 9px 28px;
  font-family: 'Geist Mono', monospace; font-size: 13px; font-weight: 500;
  display: flex; align-items: center; gap: 8px;
  transition: background .15s, box-shadow .15s;
  box-shadow: 0 2px 12px rgba(36,112,212,0.3);
}
.btn-translate:hover:not(:disabled) {
  background: var(--blue-600);
  box-shadow: 0 4px 20px rgba(36,112,212,0.4);
}
.btn-translate:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }

/* Stats */
.stats-bar {
  display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 20px;
}
.stat-chip {
  display: flex; align-items: baseline; gap: 8px;
  background: var(--green-100); border: 1px solid #86efac;
  border-radius: 8px; padding: 6px 14px;
}
.stat-num {
  font-family: 'Instrument Serif', serif; font-size: 20px;
  color: var(--green-500);
}
.stat-label {
  font-size: 10px; color: #15803d;
  letter-spacing: 0.08em; text-transform: uppercase;
}

/* Panes */
.panes {
  display: flex; gap: 0; border: 1.5px solid var(--blue-200);
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 32px rgba(13,34,64,0.07);
}

.pane {
  flex: 1; display: flex; flex-direction: column; min-width: 0;
}
.pane-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  background: var(--blue-50);
  border-bottom: 1.5px solid var(--blue-200);
}
.pane-header-left {
  font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--slate);
}
.pane-divider {
  width: 1.5px; background: var(--blue-200); flex-shrink: 0; align-self: stretch;
}

.pane textarea {
  flex: 1; resize: none; border: none; outline: none;
  font-family: 'Geist Mono', monospace; font-size: 13px;
  line-height: 1.8; padding: 20px 22px;
  color: var(--blue-900); background: transparent;
  min-height: 460px;
}
.pane textarea::placeholder { color: var(--blue-200); }
.pane textarea:focus { background: rgba(36,112,212,0.01); }

.output-pane textarea {
  color: var(--blue-700, #1e50a0);
  background: #fafcff;
}
.output-pane textarea::placeholder { color: var(--blue-200); }

.btn-copy {
  background: transparent; border: 1px solid var(--blue-300, #93c5fd);
  border-radius: 6px; color: var(--blue-500); cursor: pointer;
  padding: 4px 10px; font-family: 'Geist Mono', monospace; font-size: 10px;
  letter-spacing: 0.08em; transition: all .15s;
}
.btn-copy:hover { background: var(--blue-100); }

/* ── SEO CONTENT ── */
.seo-section {
  background: var(--blue-50);
  border-top: 1.5px solid var(--blue-100);
  padding: 72px 48px;
}

.seo-grid {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
}

.seo-section h2 {
  font-family: 'Instrument Serif', serif;
  font-size: 32px; font-weight: 400;
  color: var(--blue-900); letter-spacing: -0.02em;
  margin-bottom: 24px; line-height: 1.2;
}

.feature-list { list-style: none; display: flex; flex-direction: column; gap: 14px; }
.feature-list li {
  display: flex; align-items: flex-start; gap: 12px;
  font-size: 13px; color: var(--slate); line-height: 1.7;
}
.feature-list .icon {
  width: 22px; height: 22px; background: var(--blue-600); border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: #fff; flex-shrink: 0; margin-top: 2px;
}

/* FAQ */
.faq-section {
  padding: 72px 48px;
  max-width: 800px; margin: 0 auto;
}
.faq-section h2 {
  font-family: 'Instrument Serif', serif;
  font-size: 34px; font-weight: 400;
  color: var(--blue-900); letter-spacing: -0.02em;
  margin-bottom: 36px; text-align: center;
}
.faq-item {
  border-bottom: 1.5px solid var(--blue-100);
  padding: 22px 0;
}
.faq-q {
  font-size: 14px; color: var(--blue-900);
  font-weight: 500; margin-bottom: 10px;
}
.faq-a {
  font-size: 13px; color: var(--slate); line-height: 1.8;
}

/* Keywords section (hidden from visual, present for SEO) */
.seo-keywords {
  padding: 0 48px 40px;
  max-width: 1200px; margin: 0 auto;
}
.seo-keywords h3 {
  font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--slate-light); margin-bottom: 12px;
}
.keyword-tags {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.kw-tag {
  background: #fff; border: 1px solid var(--blue-200);
  border-radius: 100px; padding: 4px 12px;
  font-size: 11px; color: var(--slate);
}

/* ── FOOTER ── */
.site-footer {
  background: var(--blue-900);
  color: var(--blue-200); padding: 40px 48px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px;
}
.footer-logo {
  font-family: 'Instrument Serif', serif;
  font-size: 18px; color: #fff;
}
.footer-logo span { color: var(--blue-400); }
.footer-meta { font-size: 11px; color: var(--slate-light); }

@media (max-width: 768px) {
  .site-header { padding: 0 20px; }
  .hero, .translator-section, .seo-section, .faq-section, .seo-keywords { padding-left: 20px; padding-right: 20px; }
  .seo-grid { grid-template-columns: 1fr; gap: 40px; }
  .panes { flex-direction: column; }
  .pane-divider { width: auto; height: 1.5px; }
  .lang-bar { gap: 10px; }
  .nav-links { display: none; }
  .hero h1 { font-size: 32px; }
}
</style>