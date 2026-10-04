<script setup lang="ts">
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import LHero from "~/components/ui/LHero.vue";
import LMainContent from "~/components/ui/LMainContent.vue";
import LNavIcon from "~/components/ui/LNavIcon.vue";
import LSection from "~/components/landins/LSection.vue";
import LFeaturesGrid from "~/components/landins/LFeaturesGrid.vue";
import LFaqSection from "~/components/landins/LFaqSection.vue";
import LSelect from "~/components/landins/LSelect.vue";
import LSteps from "~/components/landins/LSteps.vue";
import LToolExample from "~/components/landins/LToolExample.vue";
import {defineOffer, defineSoftwareApp, defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";
import {ApiError} from "~/composables/apiError";

const { t } = useI18n();
const localePath = useLocalePath();
const { getStaticOgImageUrl } = usePathUtil();

const ogImageUrl = getStaticOgImageUrl('markdown-translator-og');

useSeoMeta({
  title: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
  ogTitle: computed(() => t('seoTitle')),
  ogDescription: computed(() => t('seoDescription')),
  ogImage: ogImageUrl,
  ogImageWidth: "1200",
  ogImageHeight: "630",
  ogImageType: "image/png",
  ogImageAlt: computed(() => t('seoTitle')),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: computed(() => t('seoTitle')),
  twitterDescription: computed(() => t('seoDescription')),
  twitterImage: ogImageUrl,
  twitterImageAlt: computed(() => t('seoTitle')),
})

const faqItems = computed(() => [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  question: t(`faq${n}q`),
  answer: t(`faq${n}a`),
})))

useSchemaOrg([
  defineSoftwareApp({
    name: t('seoTitle'),
    description: t('seoDescription'),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Browser",
    featureList: [t('featurePreserveHeadings'), t('featureKeepCode'), t('featureRetainTables'), t('featureLanguages')],
    offers: [
      defineOffer({
        price: 0,
        priceCurrency: "USD",
        description: 'endless tokens of 3B translation model'
      }),
      defineOffer({
        price: 3,
        priceCurrency: "USD",
        description: '100K tokens of 9B translation model'
      }),
      defineOffer({
        price: 9,
        priceCurrency: "USD",
        description: '100K tokens of 27B translation model'
      }),
      defineOffer({
        price: 25,
        priceCurrency: "USD",
        description: '100K tokens of 81B translation model'
      })
    ],
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_current') },
    ]
  }),
  {
    '@type': 'FAQPage',
    mainEntity: faqItems.value.map(({ question, answer }) => ({
      '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  },
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
  console.log('Cleared both panes');
}

const pasteToSource = async() => {
  try {
    sourceText.value = await navigator.clipboard.readText();
    console.log('Pasted from clipboard');
  } catch (err) {
    console.error('Failed to paste:', err);
  }
}

const copySource = async() => {
  try {
    await navigator.clipboard.writeText(sourceText.value);
    console.log('Copied source to clipboard');
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

const copyOutput = async() => {
  try {
    await navigator.clipboard.writeText(outputText.value);
    console.log('Copied output to clipboard');
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

const downloadOutput = () => {
  if (!outputText.value) {
    console.log('No output to download');
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
  console.log('Downloaded output as translated.md');
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

const { translate } = useMarkdownApi()
const errors = ref<{ [key: string]: string[] }>({})
const generalError = ref<string | null>(null)

watch([sourceText, from, to], () => {
  errors.value = {}
  generalError.value = null
})

const doTranslate = async () => {
  if (!sourceText.value.trim()) {
    console.log('[Mock] No source text to translate');
    return;
  }

  isTranslating.value = true;
  console.log(`Translating from ${from.value} to ${to.value}...`);

  try {
    const result = await translate({
      from: from.value,
      to: to.value,
      content: sourceText.value,
    })

    outputText.value = result.content;
    console.log(`Translation completed`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      errors.value = error.errors
    } else {
      console.error('Translation failed:', error)
      generalError.value = error instanceof Error ? error.message : 'Translation failed. Please try again later.'
    }
  } finally {
    isTranslating.value = false;
  }
}

const updateSourceStats = () => {
  // This is automatically handled by computed properties, but we keep it for compatibility
  console.log('[Mock] Source stats updated');
}

</script>

<i18n lang="json">
{
  "en": {
    "bc_home": "Home",
    "bc_current": "Markdown Translator",
    "seoTitle": "Markdown Translator: Translate .md and README Files Online",
    "seoDescription": "Free MD translator: translate Markdown and README.md files between 10+ languages online. Headings, code blocks, tables and links stay intact. No signup.",
    "heroTitle": "Markdown Translator: Translate .md and README Files Without Breaking the Format",
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
    "sampleReadme": "Load README sample",
    "sampleDocs": "Load docs sample",
    "sampleTable": "Load table sample",
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
    "docsSub": "From a single README to a full documentation site — pick the workflow that fits how you publish.",
    "useCaseReadmeTitle": "README.md files",
    "useCaseReadmeDesc": "Translate open-source README files to reach a global audience of developers without breaking any Markdown formatting.",
    "useCaseDocsTitle": "Documentation sites",
    "useCaseDocsDesc": "Localize entire documentation sites written in Markdown or MDX without reformatting every file manually after translation.",
    "useCaseBlogTitle": "Blog posts & articles",
    "useCaseBlogDesc": "Translate blog posts written in Markdown for Jekyll, Hugo, Gatsby, Astro, or any static site generator that uses .md files.",
    "useCasePipelineTitle": "Multilingual content pipelines",
    "useCasePipelineDesc": "Add a translation step to content pipelines that doesn't require post-processing, reformatting, or manual cleanup of broken Markdown.",
    "faqLabel": "Questions",
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
    "relatedToolTitle": "Need to convert Markdown to HTML too?",
    "relatedToolDesc": "Preview your Markdown as clean, sanitized HTML — live, with tables and code blocks fully supported.",
    "relatedToolCta": "Try Markdown to HTML Converter",
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
    "whoFor": "Who it's for",
    "howLabel": "How it works",
    "howTitle": "How to translate a Markdown file",
    "howSub": "Three steps, no signup.",
    "step1t": "Paste your Markdown",
    "step1d": "Paste the contents of your .md or README.md file into the left pane, or load one of the samples.",
    "step2t": "Choose the languages",
    "step2d": "Pick the source and the target language: English, Spanish, French, German, Japanese, Chinese, Portuguese, Arabic, Russian or Hindi.",
    "step3t": "Translate and copy",
    "step3d": "Press Translate. Headings, code blocks, tables and links keep their syntax, only the text is translated. Copy the result or download it as a .md file.",
    "exLabel": "Example",
    "exTitle": "Example: a README from English to Spanish",
    "exSub": "The structure stays the same, only the readable text changes. The wording of a real translation may differ.",
    "exSourceLabel": "Source Markdown (English)",
    "exResultLabel": "Translated Markdown (Spanish)",
    "exSource": "# My Awesome Project\n\nInstall the tool and run it:\n\n```bash\nnpm install -g mytool\n```\n\nSee the [docs](https://example.com).",
    "exResult": "# Mi increíble proyecto\n\nInstala la herramienta y ejecútala:\n\n```bash\nnpm install -g mytool\n```\n\nConsulta la [documentación](https://example.com).",
    "limitsTitle": "Limits",
    "limit1": "The translation is made by an AI model. Check technical terms and product names before you publish the result.",
    "limit2": "Code blocks and link addresses are never translated, only the readable text is.",
    "limit3": "You paste text, one document at a time. A very long document is easier to translate section by section.",
    "faq6q": "How do I translate a README.md from Japanese to English?",
    "faq6a": "Paste the README.md, set From to Japanese and To to English, and press Translate. Any pair of the supported languages works the same way, and the result renders correctly on GitHub.",
    "faq7q": "What are the limits of the Markdown translator?",
    "faq7a": "The translation is made by an AI model, so check technical terms before you publish. Code blocks and link addresses are never translated. A very long document is easier to translate section by section."
  },
  "ru": {
    "bc_home": "Главная",
    "bc_current": "Переводчик Markdown",
    "seoTitle": "Переводчик Markdown: перевод .md и README онлайн",
    "seoDescription": "Бесплатный переводчик Markdown: переводите .md и README файлы на 10+ языков онлайн. Заголовки, блоки кода, таблицы и ссылки остаются на месте. Без регистрации.",
    "heroTitle": "Переводчик Markdown: переводите .md и README без потери форматирования",
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
    "sampleReadme": "Загрузить пример README",
    "sampleDocs": "Загрузить пример документации",
    "sampleTable": "Загрузить пример таблицы",
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
    "docsSub": "От одного файла README до целого сайта документации — выберите подходящий сценарий работы.",
    "useCaseReadmeTitle": "Файлы README.md",
    "useCaseReadmeDesc": "Переводите README-файлы open-source проектов, чтобы охватить глобальную аудиторию разработчиков без нарушения форматирования Markdown.",
    "useCaseDocsTitle": "Сайты документации",
    "useCaseDocsDesc": "Локализуйте целые сайты документации на Markdown или MDX без ручного переформатирования каждого файла.",
    "useCaseBlogTitle": "Посты блога и статьи",
    "useCaseBlogDesc": "Переводите посты блога на Markdown для Jekyll, Hugo, Gatsby, Astro или любого генератора статических сайтов, работающего с .md файлами.",
    "useCasePipelineTitle": "Многоязычные конвейеры контента",
    "useCasePipelineDesc": "Добавьте этап перевода в конвейеры контента, который не требует постобработки, переформатирования или ручного исправления сломанного Markdown.",
    "faqLabel": "Вопросы",
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
    "relatedToolTitle": "Нужно ещё и конвертировать Markdown в HTML?",
    "relatedToolDesc": "Просматривайте Markdown как чистый, безопасный HTML — с поддержкой таблиц и блоков кода.",
    "relatedToolCta": "Открыть конвертер Markdown в HTML",
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
    "whoFor": "Для кого это",
    "howLabel": "Как это работает",
    "howTitle": "Как перевести Markdown файл",
    "howSub": "Три шага, без регистрации.",
    "step1t": "Вставьте Markdown",
    "step1d": "Вставьте содержимое .md или README.md файла в левое поле или загрузите один из примеров.",
    "step2t": "Выберите языки",
    "step2d": "Выберите исходный и целевой язык: английский, испанский, французский, немецкий, японский, китайский, португальский, арабский, русский или хинди.",
    "step3t": "Переведите и скопируйте",
    "step3d": "Нажмите «Перевести». Заголовки, блоки кода, таблицы и ссылки сохраняют синтаксис, переводится только текст. Скопируйте результат или скачайте его как .md файл.",
    "exLabel": "Пример",
    "exTitle": "Пример: README с английского на испанский",
    "exSub": "Структура остаётся прежней, меняется только читаемый текст. Формулировки настоящего перевода могут отличаться.",
    "exSourceLabel": "Исходный Markdown (английский)",
    "exResultLabel": "Переведённый Markdown (испанский)",
    "exSource": "# My Awesome Project\n\nInstall the tool and run it:\n\n```bash\nnpm install -g mytool\n```\n\nSee the [docs](https://example.com).",
    "exResult": "# Mi increíble proyecto\n\nInstala la herramienta y ejecútala:\n\n```bash\nnpm install -g mytool\n```\n\nConsulta la [documentación](https://example.com).",
    "limitsTitle": "Ограничения",
    "limit1": "Перевод делает ИИ-модель. Проверьте технические термины и названия продуктов перед публикацией результата.",
    "limit2": "Блоки кода и адреса ссылок никогда не переводятся, переводится только читаемый текст.",
    "limit3": "Вы вставляете текст, по одному документу за раз. Очень длинный документ проще переводить по разделам.",
    "faq6q": "Как перевести README.md с японского на английский?",
    "faq6a": "Вставьте README.md, выберите «С» — японский, «На» — английский и нажмите «Перевести». Любая пара поддерживаемых языков работает так же, а результат корректно отображается на GitHub.",
    "faq7q": "Какие у переводчика Markdown ограничения?",
    "faq7a": "Перевод делает ИИ-модель, поэтому проверьте технические термины перед публикацией. Блоки кода и адреса ссылок никогда не переводятся. Очень длинный документ проще переводить по разделам."
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
          <LNavIcon name="folder" />{{ t('sampleReadme') }}
        </span>
        <span class="sample-chip" @click="loadSample('docs')" :title="t('sampleDocs')">
          <LNavIcon name="book" />{{ t('sampleDocs') }}
        </span>
        <span class="sample-chip" @click="loadSample('table')" :title="t('sampleTable')">
          <LNavIcon name="table" />{{ t('sampleTable') }}
        </span>
      </div>

      <!-- Error Alert -->
      <div v-if="Object.keys(errors).length || generalError" class="error-alert" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div class="error-content">
          <strong>Translation error</strong>
          <ul v-if="Object.keys(errors).length">
            <li v-for="(msgs, field) in errors" :key="field">
              <span class="error-field">{{ field }}:</span>
              <span v-for="msg in msgs" :key="msg" class="error-message">{{ msg }}</span>
            </li>
          </ul>
          <p v-else>{{ generalError }}</p>
        </div>
        <button class="error-dismiss" @click="errors = {}; generalError = null" aria-label="Dismiss">✕</button>
      </div>

      <!-- Editor panes -->
      <div class="editor-panes">
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

    <!-- HOW IT WORKS -->
    <LSteps
        :pre-title="t('howLabel')"
        :title="t('howTitle')"
        :post-title="t('howSub')"
        :steps="[
        { title: t('step1t'), description: t('step1d') },
        { title: t('step2t'), description: t('step2d') },
        { title: t('step3t'), description: t('step3d') }
      ]"
    />

    <!-- EXAMPLE AND LIMITS -->
    <LToolExample
        :pre-title="t('exLabel')"
        :title="t('exTitle')"
        :post-title="t('exSub')"
        :source-label="t('exSourceLabel')"
        :source="t('exSource')"
        :result-label="t('exResultLabel')"
        :result="t('exResult')"
        :limits-title="t('limitsTitle')"
        :limits="[t('limit1'), t('limit2'), t('limit3')]"
    />

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
          <h3 class="feature-card-title">{{ t('featureHeadingsTitle') }}</h3>
          <p class="feature-card-desc" v-html="t('featureHeadingsDesc')"></p>
        </div>
        <div class="feature-card">
          <div class="feature-card-icon">{ }</div>
          <h3 class="feature-card-title">{{ t('featureCodeTitle') }}</h3>
          <p class="feature-card-desc" v-html="t('featureCodeDesc')"></p>
        </div>
        <div class="feature-card">
          <div class="feature-card-icon">|</div>
          <h3 class="feature-card-title">{{ t('featureTablesTitle') }}</h3>
          <p class="feature-card-desc" v-html="t('featureTablesDesc')"></p>
        </div>
        <div class="feature-card">
          <div class="feature-card-icon">→</div>
          <h3 class="feature-card-title">{{ t('featureLinksTitle') }}</h3>
          <p class="feature-card-desc" v-html="t('featureLinksDesc')"></p>
        </div>
      </div>
    </LSection>

    <!-- USE CASES -->
    <LFeaturesGrid
        type="cream"
        :pre-title="t('whoFor')"
        :title="t('docsHeading')"
        :post-title="t('docsSub')"
        :features="[
        { icon: 'folder', title: t('useCaseReadmeTitle'), description: t('useCaseReadmeDesc') },
        { icon: 'book', title: t('useCaseDocsTitle'), description: t('useCaseDocsDesc') },
        { icon: 'edit', title: t('useCaseBlogTitle'), description: t('useCaseBlogDesc') },
        { icon: 'globe', title: t('useCasePipelineTitle'), description: t('useCasePipelineDesc') }
      ]"
    />

    <!-- FAQ -->
    <LFaqSection
        :pre-title="t('faqLabel')"
        :title="t('faqHeading')"
        :items="faqItems"
    />

    <!-- RELATED TOOL -->
    <div class="related-tool">
      <div class="related-tool-inner">
        <div class="related-tool-icon"><LNavIcon name="markdown" /></div>
        <div class="related-tool-text">
          <strong>{{ t('relatedToolTitle') }}</strong>
          <span>{{ t('relatedToolDesc') }}</span>
        </div>
        <a :href="localePath('markdown-converter')" class="related-tool-link">{{ t('relatedToolCta') }} &#8594;</a>
      </div>
    </div>

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
.lang-swap-btn{width:40px;height:40px;border-radius:8px;border:1.5px solid var(--border);background:var(--color-surface);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:border-color .2s,background .2s,transform .2s;flex-shrink:0;align-self:flex-end;margin-bottom:0}
.lang-swap-btn:hover{border-color:var(--accent);background:var(--accent-light);transform:rotate(180deg)}
.lang-bar-actions{display:flex;gap:8px;margin-left:auto;align-items:flex-end}
.toolbar-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1.5px solid var(--border);background:var(--color-surface);font-family:var(--sans);font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;transition:border-color .2s,color .2s,background .2s;white-space:nowrap}
.toolbar-btn:hover{border-color:var(--ink);color:var(--ink)}
.toolbar-btn svg{width:14px;height:14px;stroke:currentColor;flex-shrink:0}
.btn-translate{background:var(--accent);color:#fff;border-color:var(--accent);box-shadow:0 2px 12px rgba(53,104,212,.22)}
.btn-translate:hover{background:var(--accent-mid);border-color:var(--accent-mid);color:#fff;box-shadow:0 4px 20px rgba(53,104,212,.32);transform:translateY(-1px)}
.btn-translate:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-translate svg{width:16px;height:16px}

/* loading bar */
.loading-bar{height:2px;background:linear-gradient(90deg,transparent,var(--accent),var(--accent-mid),transparent);background-size:200%;animation:loadbar 1.2s infinite;border-radius:1px;display:none;margin-bottom:12px}
.loading-bar.visible{display:block}
@keyframes loadbar{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* editor panes */
.editor-panes{display:grid;grid-template-columns:1fr 1fr;min-height:400px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--color-surface);margin-top:14px;}
.editor-pane{display:flex;flex-direction:column;border-right:1px solid var(--border)}
.editor-pane:last-child{border-right:none}
.pane-header{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--cream);border-bottom:1px solid var(--border);flex-shrink:0}
.pane-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.pane-actions{display:flex;align-items:center;gap:6px}
.pane-btn{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:5px;border:1px solid var(--border);background:var(--color-surface);font-size:11px;font-weight:600;color:var(--muted);cursor:pointer;font-family:var(--sans);transition:border-color .15s,color .15s,background .15s}
.pane-btn:hover{border-color:var(--ink);color:var(--ink)}
.pane-btn.success{border-color:var(--color-success);color:var(--color-success);background:color-mix(in srgb,var(--color-success) 10%,var(--color-surface))}
.pane-btn svg{width:11px;height:11px;stroke:currentColor;flex-shrink:0}
.line-count{font-size:10px;color:var(--muted);font-family:var(--mono)}
.md-textarea{flex:1;width:100%;border:none;outline:none;resize:none;font-family:var(--mono);font-size:13px;line-height:1.7;color:var(--color-text);background:var(--color-surface);padding:18px 20px;tab-size:2;min-height:320px}
.md-output{flex:1;padding:18px 20px;font-family:var(--mono);font-size:13px;line-height:1.7;color:var(--color-text);background:var(--color-surface);overflow-y:auto;white-space:pre-wrap;word-break:break-word;min-height:320px}
.md-output-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;color:var(--muted);text-align:center;padding:32px}
.md-output-placeholder svg{width:36px;height:36px;stroke:currentColor;opacity:.25}
.md-output-placeholder p{font-size:13px;line-height:1.5}

/* char / line stats bar */
.stats-bar{padding:7px 16px;background:var(--cream);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.stat-item{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px}
.stat-item strong{color:var(--ink);font-weight:600}

/* sample chips */
.sample-chips{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;margin-bottom: 14px;}
.sample-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;background:var(--accent-light);border:1px solid rgba(53,104,212,.18);border-radius:6px;font-size:12px;font-weight:600;color:var(--accent);cursor:pointer;transition:background .15s,border-color .15s}
.sample-chip :deep(.nav-icon-svg){width:13px;height:13px;flex-shrink:0}
.sample-chip:hover{background:var(--accent-light);border-color:var(--accent)}


/* feature grid */
.feature-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top: 36px;}
.feature-card{background:var(--color-surface);border:1px solid var(--border);border-radius:14px;padding:24px;transition:box-shadow .2s,transform .15s,border-color .2s}
.feature-card:hover{box-shadow:0 6px 24px rgba(16,24,40,.07);transform:translateY(-2px);border-color:rgba(53,104,212,.2)}
.feature-card-icon{width:40px;height:40px;border-radius:10px;background:var(--accent-light);border:1px solid rgba(53,104,212,.12);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:15px;font-weight:700;color:var(--accent);margin-bottom:14px;flex-shrink:0}
.feature-card-title{font-weight:700;font-size:15px;color:var(--ink);margin-bottom:6px}
.feature-card-desc{font-size:13px;color:var(--muted);line-height:1.6}

/* ══ RELATED TOOL ══ */
.related-tool{padding:28px 48px;border-bottom:1px solid var(--border);background:var(--paper)}
.related-tool-inner{max-width:1060px;margin:0 auto;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.related-tool-icon{width:40px;height:40px;border-radius:10px;background:var(--accent-light);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.related-tool-icon :deep(.nav-icon-svg){width:20px;height:20px}
.related-tool-text{flex:1;min-width:200px;display:flex;flex-direction:column;gap:2px}
.related-tool-text strong{font-size:14px;color:var(--ink)}
.related-tool-text span{font-size:13px;color:var(--muted)}
.related-tool-link{font-size:13px;font-weight:700;color:var(--accent);text-decoration:none;white-space:nowrap}
.related-tool-link:hover{text-decoration:underline}

/* ══ TAGS (SEO) ══ */
.seo-tags{padding:28px 48px;border-bottom:1px solid var(--border);display:flex;}
.seo-tags-inner{display:flex;flex-wrap:wrap;gap:6px;margin: 0 auto;}
.seo-tag{font-size:11px;color:var(--muted);background:var(--cream);border:1px solid var(--border);padding:3px 9px;border-radius:4px}

/* Error alert styling */
.error-alert {
  display: flex;
  gap: 12px;
  background: #fff2f0;
  border: 1px solid #e5484d;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--color-danger);
}
.error-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}
.error-content {
  flex: 1;
}
.error-content strong {
  display: block;
  font-weight: 700;
  margin-bottom: 4px;
}
.error-content ul {
  margin: 4px 0 0 0;
  padding-left: 20px;
}
.error-content li {
  margin: 2px 0;
}
.error-field {
  font-weight: 600;
  text-transform: capitalize;
  margin-right: 6px;
}
.error-message {
  color: var(--color-danger);
}
.error-dismiss {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-danger);
  opacity: 0.6;
  padding: 0 4px;
  line-height: 1;
}
.error-dismiss:hover {
  opacity: 1;
}

/* ══ RESPONSIVE ══ */
@media(max-width:1100px){
  .translator-shell,.seo-tags,.related-tool{padding-left:32px;padding-right:32px}
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
  .translator-shell,.seo-tags,.related-tool{padding-left:20px;padding-right:20px}
  .translator-shell{padding-top:24px}
  .lang-bar{flex-wrap:wrap}
}
@media(max-width:480px){
  .lang-swap-btn{display:none}
}
</style>