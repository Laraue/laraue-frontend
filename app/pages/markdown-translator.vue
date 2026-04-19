<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LHero from "~/components/ui/LHero.vue";
import LMainContent from "~/components/ui/LMainContent.vue";
import LSection from "~/components/landins/LSection.vue";
import LFeaturesGrid from "~/components/landins/LFeaturesGrid.vue";
import LFaqSection from "~/components/landins/LFaqSection.vue";
import LSelect from "~/components/landins/LSelect.vue";
import {defineOffer, defineSoftwareApp, useSchemaOrg} from "@unhead/schema-org/vue";

const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('seoTitle')),
  ogTitle: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
  ogType: "website",
})

useSchemaOrg([
  defineSoftwareApp({
    name: t('seoTitle'),
    description: t('seoDescription'),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Browser",
    offers: [
      defineOffer({
        price: 0,
        priceCurrency: "USD",
        description: 'endless tokens of 3B translation model'
      }),
      defineOffer({
        price: 3,
        priceCurrency: "USD",
        description: '10K tokens of 9B translation model'
      }),
      defineOffer({
        price: 9,
        priceCurrency: "USD",
        description: '10K tokens of 27B translation model'
      }),
      defineOffer({
        price: 25,
        priceCurrency: "USD",
        description: '10K tokens of 81B translation model'
      })
    ]
  })
])

const from = ref('en')
const to = ref('es')
const options = computed(() => {
  return [
    {
      "title": t('langEnglish'),
      "key": "en"
    },
    {
      "title": t('langSpanish'),
      "key": "es"
    },
    {
      "title": t('langFrench'),
      "key": "fr"
    },
    {
      "title": t('langGerman'),
      "key": "ge"
    },
    {
      "title": t('langJapanese'),
      "key": "ja"
    },
    {
      "title": t('langChinese'),
      "key": "zh"
    },
    {
      "title": t('langPortuguese'),
      "key": "pg"
    },
    {
      "title": t('langArabic'),
      "key": "ar"
    },
    {
      "title": t('langRussian'),
      "key": "ru"
    },
    {
      "title": t('langHindi'),
      "key": "hi"
    }
  ]
})

// Editor state
const sourceText = ref('');
const outputText = ref('');
const isTranslating = ref(false);

// Stats
const sourceChars = computed(() => sourceText.value.length);
const sourceWords = computed(() => sourceText.value.trim().split(/\s+/).filter(w => w.length).length);
const sourceLineCount = computed(() => sourceText.value.split(/\r?\n/).length);

const outputChars = computed(() => outputText.value.length);
const outputWords = computed(() => outputText.value.trim().split(/\s+/).filter(w => w.length).length);
const outputLineCount = computed(() => outputText.value.split(/\r?\n/).length);

const swapLanguages = () => {
  const temp = from.value;
  from.value = to.value;
  to.value = temp;
}

// Rendered output (simple: replace newlines with <br> for display)
const renderedOutput = computed(() => {
  if (!outputText.value) return '';
  return outputText.value.replace(/\n/g, '<br>');
});

const clearAll = () => {
  sourceText.value = '';
  outputText.value = '';
  console.log('[Mock] Cleared both panes');
}

const pasteToSource = async() => {
  try {
    const text = await navigator.clipboard.readText();
    sourceText.value = text;
    console.log('[Mock] Pasted from clipboard');
  } catch (err) {
    console.error('[Mock] Failed to paste:', err);
  }
}

const copySource = async() => {
  try {
    await navigator.clipboard.writeText(sourceText.value);
    console.log('[Mock] Copied source to clipboard');
  } catch (err) {
    console.error('[Mock] Copy failed:', err);
  }
}

const copyOutput = async() => {
  try {
    await navigator.clipboard.writeText(outputText.value);
    console.log('[Mock] Copied output to clipboard');
  } catch (err) {
    console.error('[Mock] Copy failed:', err);
  }
}

const downloadOutput = () => {
  if (!outputText.value) {
    console.log('[Mock] No output to download');
    return;
  }
  const blob = new Blob([outputText.value], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'translated.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('[Mock] Downloaded output as translated.md');
}

const loadSample = (type: 'readme' | 'docs' | 'table') => {
  let sample = '';
  if (type === 'readme') {
    sample = `# My Awesome Project\n\nThis is a sample README.\n\n\`\`\`bash\nnpm install\n\`\`\`\n\n- Feature one\n- Feature two`;
  } else if (type === 'docs') {
    sample = `## Installation\n\nTo install, run:\n\n\`\`\`\nnpm install -g mytool\n\`\`\`\n\nThen see the [docs](https://example.com).`;
  } else {
    sample = `| Header 1 | Header 2 |\n|----------|----------|\n| cell 1   | cell 2   |\n| cell 3   | cell 4   |`;
  }
  sourceText.value = sample;
  console.log(`[Mock] Loaded ${type} sample`);
}

const doTranslate = () => {
  if (!sourceText.value.trim()) {
    console.log('[Mock] No source text to translate');
    return;
  }
  isTranslating.value = true;
  console.log(`[Mock] Translating from ${from.value} to ${to.value}...`);
  // Simulate API delay
  setTimeout(() => {
    outputText.value = `[Mock Translation from ${from.value} to ${to.value}]\n\n${sourceText.value}`;
    isTranslating.value = false;
    console.log('[Mock] Translation completed');
  }, 500);
}

const updateSourceStats = () => {
  // This is automatically handled by computed properties, but we keep it for compatibility
  console.log('[Mock] Source stats updated');
}

</script>

<i18n lang="json">
{
  "en": {
    "seoTitle": "Markdown Translator – Structure-Preserving .md Translation",
    "seoDescription": "Free online Markdown translator. Translate .md files between 10+ languages while preserving headings, code blocks, tables, and all Markdown structure. No formatting lost.",
    "heroTitle": "Translate Markdown Files Without Breaking the Format",
    "heroSub": "The only Markdown translator that preserves your headings, code blocks, tables, and lists — exactly as they are — across 10+ languages.",
    "featurePreserveHeadings": "Preserves # headings",
    "featureKeepCode": "Keeps ``` code blocks",
    "featureRetainTables": "Retains tables",
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
    "swapLanguages": "Swap source and target languages",
    "sampleReadme": "📄 Load README sample",
    "sampleDocs": "📚 Load docs sample",
    "sampleTable": "📊 Load table sample",
    "srcHeader": "Source Markdown",
    "tgtHeader": "Translated Output",
    "btnPaste": "Paste",
    "btnCopy": "Copy",
    "btnDownloadMd": ".md",
    "srcPlaceholder": "# Paste your Markdown here\n\nWrite or paste any Markdown content — headings, code blocks, tables, lists, links — and click **Translate** to get a structure-preserving translation.",
    "tgtPlaceholder": "Paste Markdown on the left and click\nTranslate →",
    "characters": "characters",
    "words": "words",
    "lines": "lines",
    "btnClear": "Clear",
    "btnTranslate": "Translate →",
    "featuresHeading": "Why use a structure-preserving Markdown translator?",
    "featureHeadingsTitle": "Headings stay headings.",
    "featureHeadingsDesc": "Every #, ##, and ### is preserved exactly — only the text inside is translated, never the syntax.",
    "featureCodeTitle": "Code blocks untouched.",
    "featureCodeDesc": "Content inside ``` fences is never passed to the translation engine — your code stays exactly as written.",
    "featureTablesTitle": "Tables remain intact.",
    "featureTablesDesc": "Table separators, alignment markers, and column structure are fully preserved across all languages.",
    "featureLinksTitle": "Links and references preserved.",
    "featureLinksDesc": "Hyperlink syntax [text](url) is parsed carefully — the URL is never translated, only the display text.",
    "docsHeading": "Translate documentation, READMEs & technical docs",
    "useCaseReadmeTitle": "README.md files",
    "useCaseReadmeDesc": "Translate open-source README files to reach a global audience of developers without breaking any Markdown formatting.",
    "useCaseDocsTitle": "Documentation sites",
    "useCaseDocsDesc": "Localize entire documentation sites written in Markdown or MDX without reformatting every file manually after translation.",
    "useCaseBlogTitle": "Blog posts & articles",
    "useCaseBlogDesc": "Translate blog posts written in Markdown for Jekyll, Hugo, Gatsby, Astro, or any static site generator that uses .md files.",
    "useCasePipelineTitle": "Multilingual content pipelines",
    "useCasePipelineDesc": "Add a translation step to content pipelines that doesn't require post-processing, reformatting, or manual cleanup of broken Markdown.",
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
    "whyMatter": "Why it matters",
    "whyMatterDesc": "Most translation tools destroy Markdown syntax. This one doesn't — it parses the document structure first, translates only human-readable text, then reconstructs the file.",
    "whoFor": "Who it's for"
  },
  "ru": {
    "seoTitle": "Markdown Переводчик – Сохранение структуры .md файлов",
    "seoDescription": "Бесплатный онлайн переводчик Markdown. Переводите .md файлы между 10+ языками с сохранением заголовков, блоков кода, таблиц и всей структуры Markdown. Без потери форматирования.",
    "heroTitle": "Переводите Markdown файлы без потери форматирования",
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
    "swapLanguages": "Поменять языки местами",
    "sampleReadme": "📄 Загрузить пример README",
    "sampleDocs": "📚 Загрузить пример документации",
    "sampleTable": "📊 Загрузить пример таблицы",
    "srcHeader": "Исходный Markdown",
    "tgtHeader": "Переведенный текст",
    "btnPaste": "Вставить",
    "btnCopy": "Копировать",
    "btnDownloadMd": ".md",
    "srcPlaceholder": "# Вставьте Markdown сюда\n\nНапишите или вставьте любой Markdown — заголовки, блоки кода, таблицы, списки, ссылки — и нажмите **Перевести**, чтобы получить перевод с сохранением структуры.",
    "tgtPlaceholder": "Вставьте Markdown слева и нажмите \nПеревести →",
    "characters": "символов",
    "words": "слов",
    "lines": "строк",
    "btnClear": "Очистить",
    "btnTranslate": "Перевести →",
    "featuresHeading": "Зачем использовать переводчик Markdown с сохранением структуры?",
    "featureHeadingsTitle": "Заголовки остаются заголовками.",
    "featureHeadingsDesc": "Каждый #, ## и ### сохраняется точно — переводится только текст внутри, никогда не синтаксис.",
    "featureCodeTitle": "Блоки кода нетронуты.",
    "featureCodeDesc": "Содержимое внутри ``` блоков никогда не передается в движок перевода — ваш код остается точно как написан.",
    "featureTablesTitle": "Таблицы остаются нетронутыми.",
    "featureTablesDesc": "Разделители таблиц, маркеры выравнивания и структура колонок полностью сохраняются на всех языках.",
    "featureLinksTitle": "Ссылки и сноски сохраняются.",
    "featureLinksDesc": "Синтаксис гиперссылок [text](url) тщательно анализируется — URL никогда не переводится, только отображаемый текст.",
    "docsHeading": "Переводите документацию, README и технические документы",
    "useCaseReadmeTitle": "Файлы README.md",
    "useCaseReadmeDesc": "Переводите README-файлы open-source проектов, чтобы охватить глобальную аудиторию разработчиков без нарушения форматирования Markdown.",
    "useCaseDocsTitle": "Сайты документации",
    "useCaseDocsDesc": "Локализуйте целые сайты документации на Markdown или MDX без ручного переформатирования каждого файла.",
    "useCaseBlogTitle": "Посты блога и статьи",
    "useCaseBlogDesc": "Переводите посты блога на Markdown для Jekyll, Hugo, Gatsby, Astro или любого генератора статических сайтов, работающего с .md файлами.",
    "useCasePipelineTitle": "Многоязычные конвейеры контента",
    "useCasePipelineDesc": "Добавьте этап перевода в конвейеры контента, который не требует постобработки, переформатирования или ручного исправления сломанного Markdown.",
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
    "whyMatter": "Почему это важно",
    "whyMatterDesc": "Большинство утилит для перевода ломают синтаксис Markdown. Эта — нет. Она сначала строит дерево документа, затем переводит только читаемый текст, заменяя его в оригинальной структуре.",
    "whoFor": "Для кого это"
  }
}
</i18n>

<template>
  <LMainContent>
    <LHero
        :title="t('heroTitle')"
        :sub-title="t('heroSub')"
        :features="[
        t('featurePreserveHeadings'),
        t('featureKeepCode'),
        t('featureRetainTables'),
        t('featureLanguages'),
        t('featureFree')
      ]"
    />

    <!-- TRANSLATOR TOOL -->
    <div class="translator-shell">
      <!-- Language bar -->
      <div class="lang-bar">
        <LSelect :label="t('langFrom')" v-model="from" :options="options" />
        <button
            class="lang-swap-btn"
            id="swapBtn"
            :title="t('swapLanguages')"
            :aria-label="t('swapLanguages')"
            @click="swapLanguages"
        >⇄</button>
        <LSelect :label="t('langTo')" v-model="to" :options="options" />

        <div class="lang-bar-actions">
          <button class="toolbar-btn" @click="clearAll" :title="t('btnClear')">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
            </svg>
            {{ t('btnClear') }}
          </button>
          <button class="toolbar-btn btn-translate" id="translateBtn" @click="doTranslate" :disabled="isTranslating">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            {{ t('btnTranslate') }}
          </button>
        </div>
      </div>

      <!-- Loading bar -->
      <div class="loading-bar" id="loadingBar"></div>

      <!-- Sample chips -->
      <div class="sample-chips" id="sampleChips">
        <span class="sample-chip" @click="loadSample('readme')" :title="t('sampleReadme')">
          {{ t('sampleReadme') }}
        </span>
        <span class="sample-chip" @click="loadSample('docs')" :title="t('sampleDocs')">
          {{ t('sampleDocs') }}
        </span>
        <span class="sample-chip" @click="loadSample('table')" :title="t('sampleTable')">
          {{ t('sampleTable') }}
        </span>
      </div>

      <!-- Editor panes -->
      <div class="editor-panes" style="margin-top:14px">
        <!-- Left: source -->
        <div class="editor-pane">
          <div class="pane-header">
            <span class="pane-label">{{ t('srcHeader') }}</span>
            <div class="pane-actions">
              <span class="line-count">{{ sourceLineCount }} {{ t('lines') }}</span>
              <button class="pane-btn" @click="pasteToSource" :title="t('btnPaste')">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1"/>
                </svg>
                {{ t('btnPaste') }}
              </button>
              <button class="pane-btn" id="copySrcBtn" @click="copySource" :title="t('btnCopy')">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                {{ t('btnCopy') }}
              </button>
            </div>
          </div>
          <textarea
              class="md-textarea"
              id="mdSource"
              :placeholder="t('srcPlaceholder')"
              spellcheck="false"
              autocomplete="off"
              :aria-label="t('srcHeader')"
              v-model="sourceText"
              @input="updateSourceStats"
          ></textarea>
          <div class="stats-bar">
            <span class="stat-item"><strong>{{ sourceChars }}</strong> {{ t('characters') }}</span>
            <span class="stat-item"><strong>{{ sourceWords }}</strong> {{ t('words') }}</span>
          </div>
        </div>

        <!-- Right: output -->
        <div class="editor-pane">
          <div class="pane-header">
            <span class="pane-label">{{ t('tgtHeader') }}</span>
            <div class="pane-actions">
              <span class="line-count">{{ outputLineCount }} {{ t('lines') }}</span>
              <button class="pane-btn" id="copyOutBtn" @click="copyOutput" :title="t('btnCopy')">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                {{ t('btnCopy') }}
              </button>
              <button class="pane-btn" id="downloadOutBtn" @click="downloadOutput" :title="t('btnDownloadMd')">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {{ t('btnDownloadMd') }}
              </button>
            </div>
          </div>
          <div class="md-output" id="mdOutput" :aria-label="t('tgtHeader')" v-if="renderedOutput" v-html="renderedOutput"></div>
          <div class="md-output" id="mdOutput" :aria-label="t('tgtHeader')" v-else>
            <div class="md-output-placeholder" id="outputPlaceholder">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              <p>{{ t('tgtPlaceholder') }}</p>
            </div>
          </div>
          <div class="stats-bar">
            <span class="stat-item"><strong>{{ outputChars }}</strong> {{ t('characters') }}</span>
            <span class="stat-item"><strong>{{ outputWords }}</strong> {{ t('words') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- FEATURES (structure‑preserving) -->
    <LSection
        type="light"
        :pre-title="t('whyMatter')"
        :title="t('featuresHeading')"
        :post-title="t('whyMatterDesc')"
    >
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-card-icon">#</div>
          <div class="feature-card-title">{{ t('featureHeadingsTitle') }}</div>
          <p class="feature-card-desc" v-html="t('featureHeadingsDesc')"></p>
        </div>
        <div class="feature-card">
          <div class="feature-card-icon">{ }</div>
          <div class="feature-card-title">{{ t('featureCodeTitle') }}</div>
          <p class="feature-card-desc" v-html="t('featureCodeDesc')"></p>
        </div>
        <div class="feature-card">
          <div class="feature-card-icon">|</div>
          <div class="feature-card-title">{{ t('featureTablesTitle') }}</div>
          <p class="feature-card-desc" v-html="t('featureTablesDesc')"></p>
        </div>
        <div class="feature-card">
          <div class="feature-card-icon">→</div>
          <div class="feature-card-title">{{ t('featureLinksTitle') }}</div>
          <p class="feature-card-desc" v-html="t('featureLinksDesc')"></p>
        </div>
      </div>
    </LSection>

    <!-- USE CASES -->
    <LFeaturesGrid
        type="cream"
        :pre-title="t('whoFor')"
        :title="t('docsHeading')"
        :post-title="t('docsHeading')"
        :features="[
        { icon: '📄', title: t('useCaseReadmeTitle'), description: t('useCaseReadmeDesc') },
        { icon: '📚', title: t('useCaseDocsTitle'), description: t('useCaseDocsDesc') },
        { icon: '✍️', title: t('useCaseBlogTitle'), description: t('useCaseBlogDesc') },
        { icon: '🌍', title: t('useCasePipelineTitle'), description: t('useCasePipelineDesc') }
      ]"
    />

    <!-- FAQ -->
    <LFaqSection
        :title="t('faqHeading')"
        :items="[
        { question: t('faq1q'), answer: t('faq1a') },
        { question: t('faq2q'), answer: t('faq2a') },
        { question: t('faq3q'), answer: t('faq3a') },
        { question: t('faq4q'), answer: t('faq4a') },
        { question: t('faq5q'), answer: t('faq5a') }
      ]"
    />

    <!-- SEO TAGS -->
    <div class="seo-tags" :aria-label="t('relatedTopics')">
      <div class="seo-tags-inner">
        <span class="seo-tag">{{ t('kwTranslator') }}</span>
        <span class="seo-tag">{{ t('kwTranslateFile') }}</span>
        <span class="seo-tag">{{ t('kwLocalization') }}</span>
        <span class="seo-tag">{{ t('kwReadme') }}</span>
        <span class="seo-tag">{{ t('kwPreserve') }}</span>
        <span class="seo-tag">{{ t('kwTechDocs') }}</span>
        <span class="seo-tag">{{ t('kwMdx') }}</span>
        <span class="seo-tag">{{ t('kwHugo') }}</span>
        <span class="seo-tag">{{ t('kwGatsby') }}</span>
        <span class="seo-tag">{{ t('kwAstro') }}</span>
        <span class="seo-tag">{{ t('kwMultilingual') }}</span>
        <span class="seo-tag">{{ t('kwJekyll') }}</span>
        <span class="seo-tag">{{ t('kwOpenSource') }}</span>
        <span class="seo-tag">{{ t('kwI18n') }}</span>
      </div>
    </div>
  </LMainContent>
</template>

<style scoped>
/* ══ TRANSLATOR SHELL ══ */
.translator-shell{padding:32px 48px;border-bottom:1px solid var(--border)}

/* language bar */
.lang-bar{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.lang-swap-btn{width:40px;height:40px;border-radius:8px;border:1.5px solid var(--border);background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:border-color .2s,background .2s,transform .2s;flex-shrink:0;align-self:flex-end;margin-bottom:0}
.lang-swap-btn:hover{border-color:var(--accent);background:var(--accent-light);transform:rotate(180deg)}
.lang-bar-actions{display:flex;gap:8px;margin-left:auto;align-items:flex-end}
.toolbar-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1.5px solid var(--border);background:#fff;font-family:var(--sans);font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;transition:border-color .2s,color .2s,background .2s;white-space:nowrap}
.toolbar-btn:hover{border-color:var(--ink);color:var(--ink)}
.toolbar-btn svg{width:14px;height:14px;stroke:currentColor;flex-shrink:0}
.btn-translate{background:var(--accent);color:#fff;border-color:var(--accent);box-shadow:0 2px 12px rgba(15,118,110,.22)}
.btn-translate:hover{background:var(--accent-mid);border-color:var(--accent-mid);color:#fff;box-shadow:0 4px 20px rgba(15,118,110,.32);transform:translateY(-1px)}
.btn-translate:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-translate svg{width:16px;height:16px}

/* loading bar */
.loading-bar{height:2px;background:linear-gradient(90deg,transparent,var(--accent),var(--accent-mid),transparent);background-size:200%;animation:loadbar 1.2s infinite;border-radius:1px;display:none;margin-bottom:12px}
.loading-bar.visible{display:block}
@keyframes loadbar{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* editor panes */
.editor-panes{display:grid;grid-template-columns:1fr 1fr;min-height:400px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:#fff}
.editor-pane{display:flex;flex-direction:column;border-right:1px solid var(--border)}
.editor-pane:last-child{border-right:none}
.pane-header{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--cream);border-bottom:1px solid var(--border);flex-shrink:0}
.pane-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.pane-actions{display:flex;align-items:center;gap:6px}
.pane-btn{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:5px;border:1px solid var(--border);background:#fff;font-size:11px;font-weight:600;color:var(--muted);cursor:pointer;font-family:var(--sans);transition:border-color .15s,color .15s,background .15s}
.pane-btn:hover{border-color:var(--ink);color:var(--ink)}
.pane-btn.success{border-color:#43b77a;color:#43b77a;background:#f0fbf5}
.pane-btn svg{width:11px;height:11px;stroke:currentColor;flex-shrink:0}
.line-count{font-size:10px;color:var(--muted);font-family:var(--mono)}
.md-textarea{flex:1;width:100%;border:none;outline:none;resize:none;font-family:var(--mono);font-size:13px;line-height:1.7;color:#2a2725;background:#fff;padding:18px 20px;tab-size:2;min-height:320px}
.md-output{flex:1;padding:18px 20px;font-family:var(--mono);font-size:13px;line-height:1.7;color:#2a2725;background:#fff;overflow-y:auto;white-space:pre-wrap;word-break:break-word;min-height:320px}
.md-output-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;color:var(--muted);text-align:center;padding:32px}
.md-output-placeholder svg{width:36px;height:36px;stroke:currentColor;opacity:.25}
.md-output-placeholder p{font-size:13px;opacity:.6;line-height:1.5}

/* char / line stats bar */
.stats-bar{padding:7px 16px;background:var(--cream);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.stat-item{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px}
.stat-item strong{color:var(--ink);font-weight:600}

/* sample chips */
.sample-chips{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.sample-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;background:var(--accent-light);border:1px solid rgba(15,118,110,.18);border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s}
.sample-chip:hover{background:var(--accent-light);border-color:var(--accent)}


/* feature grid */
.feature-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top: 36px;}
.feature-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:24px;transition:box-shadow .2s,transform .15s,border-color .2s}
.feature-card:hover{box-shadow:0 6px 24px rgba(15,14,12,.07);transform:translateY(-2px);border-color:rgba(15,118,110,.2)}
.feature-card-icon{width:40px;height:40px;border-radius:10px;background:var(--accent-light);border:1px solid rgba(15,118,110,.12);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:15px;font-weight:700;color:var(--accent);margin-bottom:14px;flex-shrink:0}
.feature-card-title{font-weight:700;font-size:15px;color:var(--ink);margin-bottom:6px}
.feature-card-desc{font-size:13px;color:var(--muted);line-height:1.6}

/* ══ TAGS (SEO) ══ */
.seo-tags{padding:28px 48px;border-bottom:1px solid var(--border);display:flex;}
.seo-tags-inner{display:flex;flex-wrap:wrap;gap:6px;margin: 0 auto;}
.seo-tag{font-size:11px;color:var(--muted);background:var(--cream);border:1px solid var(--border);padding:3px 9px;border-radius:4px}

/* ══ RESPONSIVE ══ */
@media(max-width:1100px){
  .translator-shell,.seo-tags{padding-left:32px;padding-right:32px}
}
@media(max-width:820px){
  .editor-panes{grid-template-columns:1fr;min-height:auto}
  .editor-pane{border-right:none;border-bottom:1px solid var(--border)}
  .editor-pane:last-child{border-bottom:none}
  .feature-grid{grid-template-columns:1fr}
  .lang-bar-actions{margin-left:0;width:100%}
  .btn-translate{flex:1;justify-content:center}
}
@media(max-width:720px){
  .translator-shell,.seo-tags{padding-left:20px;padding-right:20px}
  .translator-shell{padding-top:24px}
  .lang-bar{flex-wrap:wrap}
}
@media(max-width:480px){
  .lang-swap-btn{display:none}
}
</style>