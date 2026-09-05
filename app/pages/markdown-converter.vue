<script setup lang="ts">
import {computed, ref} from "vue";
import LMainContent from "~/components/ui/LMainContent.vue";
import LHero from "~/components/ui/LHero.vue";
import LNavIcon from "~/components/ui/LNavIcon.vue";
import LFeaturesGrid from "~/components/landins/LFeaturesGrid.vue";
import LFaqSection from "~/components/landins/LFaqSection.vue";
import {defineOffer, defineSoftwareApp, defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";

const localePath = useLocalePath();

const markdown = ref('');
const transpiled = ref('')

const { transpile } = useMarkdownApi();

const loadResponse = async() => {
  const response = await transpile({ content: markdown.value })
  transpiled.value = response.htmlContent ?? ""
}

watch(() => markdown.value, () => loadResponse())

const addToMarkdown = (template: Template) => {
  let insertValue = template.data;
  if (markdown.value != '' && !markdown.value.endsWith("\r\n"))
    insertValue = "\r\n".repeat(template.inlineElement ? 2 : 1) + insertValue;

  markdown.value += insertValue;
}

interface Template {
  data: string;
  text: string;
  inlineElement: boolean;
  hint: string;
}

const { t } = useI18n()
const { getStaticOgImageUrl } = usePathUtil();
const templates = ref([
  {
    data: "# Heading 1",
    text: t('heading1'),
    inlineElement: false,
    hint: "# H1",
  },
  {
    data: "# Heading 2",
    text: t('heading2'),
    inlineElement: false,
    hint: "## H2",
  },
  {
    data: "# Heading 3",
    text: t('heading3'),
    inlineElement: false,
    hint: "### H3",
  },
  {
    data: "**bold text**",
    text: t('bold'),
    inlineElement: true,
    hint: "**bold**",
  },
  {
    data: "*italic*",
    text: t('italic'),
    inlineElement: true,
    hint: "*italic*",
  },
  {
    data: "- List item 1\r\n- List item 2",
    text: t('unorderedList'),
    inlineElement: false,
    hint: "- list",
  },
  {
    data: "1. First\r\n2. Second",
    text: t('orderedList'),
    inlineElement: false,
    hint: "1. list",
  },
  {
    data: "[link text](https://example.com)",
    text: t('link'),
    inlineElement: true,
    hint: "[link]()",
  },
  {
    data: "![alt text](https://picsum.photos/200/300)",
    text: t('image'),
    inlineElement: true,
    hint: "![image]()",
  },
  {
    data: "`inline code`",
    text: t('inlineCode'),
    inlineElement: true,
    hint: "`code`",
  },
  {
    data: "```\r\ncode block\r\n```",
    text: t('codeBlock'),
    inlineElement: true,
    hint: "```block",
  }
])

const ogImageUrl = getStaticOgImageUrl('markdown-converter-og');

useSeoMeta({
  title: t('seoTitle'),
  description: t('seoDescription'),
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
        description: 'Unlimited converter usage'
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
    mainEntity: [
      { '@type': 'Question', name: t('faq1q'), acceptedAnswer: { '@type': 'Answer', text: t('faq1a') } },
      { '@type': 'Question', name: t('faq2q'), acceptedAnswer: { '@type': 'Answer', text: t('faq2a') } },
      { '@type': 'Question', name: t('faq3q'), acceptedAnswer: { '@type': 'Answer', text: t('faq3a') } },
      { '@type': 'Question', name: t('faq4q'), acceptedAnswer: { '@type': 'Answer', text: t('faq4a') } },
      { '@type': 'Question', name: t('faq5q'), acceptedAnswer: { '@type': 'Answer', text: t('faq5a') } },
    ]
  },
])

/* ── ACTIONS ── */
const clearEditor = () => {
  if(confirm('Clear the editor?'))
    markdown.value = "";
}

const downloadHtml = () => {
  if (!transpiled.value)
    alert('Nothing to download yet — write some Markdown first.'); return;

  const full = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Converted Document</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:780px;margin:40px auto;padding:0 24px;line-height:1.7;color:#1a1a1a}
  h1,h2,h3{font-weight:700;margin:1.4em 0 .5em;line-height:1.2}
  h1{font-size:2em} h2{font-size:1.4em;border-bottom:1px solid #ddd;padding-bottom:.3em} h3{font-size:1.15em}
  code{font-family:monospace;background:#f4f4f4;padding:2px 6px;border-radius:3px;font-size:.9em}
  pre{background:#1a1a2e;color:#d4cfca;padding:16px 20px;border-radius:8px;overflow-x:auto}
  pre code{background:none;padding:0;color:inherit}
  blockquote{border-left:3px solid #3b5bdb;padding:10px 16px;margin:16px 0;background:#eef2ff;border-radius:0 6px 6px 0}
  table{border-collapse:collapse;width:100%;margin:16px 0}
  th,td{padding:8px 12px;border:1px solid #ddd;text-align:left}
  th{background:#f4f4f4}
  a{color:#3b5bdb}
  img{max-width:100%;border-radius:6px}
  hr{border:none;border-top:1px solid #ddd;margin:24px 0}
</style>
</head>
<body>
${transpiled.value}
</body>
</html>`;

  const blob=new Blob([full],{type:'text/html'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='converted.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

const copyHtml = () => {
  navigator.clipboard.writeText(transpiled.value);
}

const SAMPLE = `# The Quick Brown Fox

Welcome to the **Markdown to HTML Converter** by Laraue Software.

## Features

- *Live preview* as you type
- Toggle between **Rendered** view and **HTML source**
- One-click templates via the toolbar chips
- **Copy** or **Download** the generated HTML

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("world"));
\`\`\`

## Blockquote

> "Any fool can write code that a computer can understand.
> Good programmers write code that humans can understand."
> — Martin Fowler

## Table

| Language | Paradigm    | Year |
|----------|-------------|------|
| C#       | OOP / FP    | 2000 |
| Python   | Multi       | 1991 |
| Rust     | Systems     | 2010 |

---

Made with ❤️ by [Laraue Software](https://laraue.com)
`;

const loadSample = () => {
  markdown.value = SAMPLE;
}

const pasteFromClipboard = () => {
  navigator.clipboard.readText().then(text=>{
    markdown.value = text;
  }).catch(()=>{
    document.execCommand('paste');
  });
}

const currentView = ref("rendered")
const setView = (view: string) =>{
  currentView.value = view;
}

const copyMarkdown = () => {
  navigator.clipboard.writeText(markdown.value);
}

</script>

<i18n lang="json">
{
  "en": {
    "bc_home": "Home",
    "bc_current": "Markdown to HTML Converter",
    "seoTitle": "Markdown to HTML Converter",
    "seoDescription": "The utility for online Markdown to HTML Converting",
    "sidebar_label": "Tool",
    "sidebar_other": "Other tools",
    "sidebar_footer": "Laraue Software\nSmall team, serious craft.",
    "sec_editor": "Editor",
    "sec_about": "About",
    "page_title": "Markdown to HTML Converter",
    "page_desc": "Write or paste Markdown on the left — see formatted HTML on the right, live. Toggle between rendered preview and raw HTML source.",
    "heroFeature1": "Live preview",
    "heroFeature2": "Tables & code blocks",
    "heroFeature3": "Sanitized HTML output",
    "heroFeature4": "One-click download",
    "heroFeature5": "100% free",
    "panel_md": "Markdown Source",
    "btn_clear": "Clear",
    "btn_sample": "Sample",
    "btn_download": "Download .html",
    "btn_paste": "Paste",
    "btn_copy_md": "Copy",
    "btn_copy_html": "Copy HTML",
    "view_rendered": "Rendered",
    "view_source": "HTML",
    "placeholder_text": "Start typing Markdown on the left\nand the HTML preview will appear here.",
    "about_label": "About this tool",
    "about_title": "What it does",
    "about_text": "Markdown to HTML Converter is a free online tool for writers, developers, and content creators. Write or paste Markdown in the left panel — see formatted HTML output live on the right.",
    "about_text2": "Perfect for drafting blog posts, GitHub READMEs, documentation, or any content where you need both human-friendly editing and clean HTML.",
    "oss_label": "Open source",
    "oss_title": "Built on Laraue.Interpreter",
    "oss_text": "The converter is powered by the open-source",
    "oss_text2": "library — a C# Markdown parser built by Laraue Software. All generated HTML is sanitized for safe embedding.",
    "placeholder": "Start typing Markdown here…\n\nType or paste your Markdown and see it render live on the right.",
    "whoFor": "Who it's for",
    "useCasesHeading": "Preview Markdown before you publish it as HTML",
    "useCasesSub": "From a quick README check to drafting a blog post — see the exact HTML before it goes live.",
    "useCaseReadmeTitle": "README.md files",
    "useCaseReadmeDesc": "Preview exactly how your README will render — tables, code blocks, and images included — before pushing to GitHub or GitLab.",
    "useCaseDocsTitle": "Documentation sites",
    "useCaseDocsDesc": "Draft pages for Hugo, Jekyll, Gatsby, Astro, or any static site generator and check the rendered HTML before you commit.",
    "useCaseBlogTitle": "Blog posts & drafts",
    "useCaseBlogDesc": "Write blog posts in Markdown and get clean, sanitized HTML ready to paste into your CMS or blogging platform.",
    "useCaseEmailTitle": "Emails & newsletters",
    "useCaseEmailDesc": "Convert Markdown notes into HTML you can paste directly into an email template or newsletter tool.",
    "faqLabel": "Questions",
    "faqHeading": "Frequently Asked Questions",
    "faq1q": "Is this Markdown to HTML converter free to use?",
    "faq1a": "Yes, completely free with no account or signup required. Paste your Markdown and see the HTML instantly.",
    "faq2q": "Does it support tables, code blocks, and blockquotes?",
    "faq2a": "Yes. Headings, bold and italic text, links, images, ordered and unordered lists, code blocks, blockquotes, and tables are all supported.",
    "faq3q": "Is the generated HTML safe to embed on my site?",
    "faq3a": "Yes. All HTML output is sanitized before it's rendered, so it's safe to paste into a CMS, blog, or web page.",
    "faq4q": "Can I download the converted HTML file?",
    "faq4a": "Yes — click Download .html to get a complete, styled HTML document you can open directly or host as-is.",
    "faq5q": "Can I use this to preview a README.md before pushing to GitHub?",
    "faq5a": "Absolutely. Paste your README.md content and see exactly how it will render, including tables and code blocks, before you commit.",
    "relatedTopics": "Related Topics",
    "kw1": "markdown to html",
    "kw2": "html converter",
    "kw3": "markdown preview",
    "kw4": "github readme preview",
    "kw5": "markdown renderer",
    "kw6": "html from markdown",
    "kw7": "online markdown editor",
    "kw8": "free markdown converter",
    "kw9": "gfm to html",
    "kw10": "markdown live preview",
    "kw11": "documentation html export",
    "kw12": "markdown to html online",
    "relatedToolTitle": "Need to translate Markdown too?",
    "relatedToolDesc": "Translate .md files between 10+ languages while preserving all structure — headings, tables, code blocks.",
    "relatedToolCta": "Try Markdown Translator"
  },
  "ru": {
    "bc_home": "Главная",
    "bc_current": "Конвертер Markdown в HTML",
    "seoTitle": "Конвертер Markdown в HTML",
    "seoDescription": "Простая онлайн утилита для конвертации Markdown в HTML",
    "sec_editor": "Редактор",
    "sec_about": "Об инструменте",
    "page_title": "Markdown → HTML конвертер",
    "page_desc": "Напишите или вставьте Markdown слева — получите HTML справа. Переключайтесь между превью и исходным HTML.",
    "heroFeature1": "Живой превью",
    "heroFeature2": "Таблицы и блоки кода",
    "heroFeature3": "Безопасный HTML",
    "heroFeature4": "Скачивание в один клик",
    "heroFeature5": "100% бесплатно",
    "panel_md": "Исходный Markdown",
    "btn_clear": "Очистить",
    "btn_sample": "Пример",
    "btn_download": "Скачать .html",
    "btn_paste": "Вставить",
    "btn_copy_md": "Копировать",
    "btn_copy_html": "Копировать HTML",
    "view_rendered": "Превью",
    "view_source": "HTML",
    "placeholder_text": "Начните ввод Markdown слева\n— превью появится здесь.",
    "about_label": "Об инструменте",
    "about_title": "Что делает",
    "about_text": "Markdown to HTML Converter — бесплатный онлайн-инструмент для преобразования Markdown в HTML в режиме реального времени.",
    "about_text2": "Подходит для блогов и README, документации, любого контента где используется Markdown, но нужно получить HTML.",
    "oss_label": "Open source",
    "oss_title": "Основан на Laraue.Interpreter",
    "oss_text": "Конвертер построен на open-source библиотеке",
    "oss_text2": ". Это C# Markdown парсер, сделанный Laraue Software. Весь HTML экранируется перед отрисовкой в браузере.",
    "placeholder": "Начните ввод здесь…\n\nНапишите или вставьте сюда Markdown и наблюдайте за результатом справа.",
    "whoFor": "Для кого это",
    "useCasesHeading": "Просматривайте HTML перед публикацией",
    "useCasesSub": "От быстрой проверки README до черновика статьи — увидьте точный HTML до того, как он опубликован.",
    "useCaseReadmeTitle": "Файлы README.md",
    "useCaseReadmeDesc": "Проверьте, как именно будет отображаться README — с таблицами, блоками кода и изображениями — перед публикацией на GitHub или GitLab.",
    "useCaseDocsTitle": "Сайты документации",
    "useCaseDocsDesc": "Готовьте страницы для Hugo, Jekyll, Gatsby, Astro или любого генератора статических сайтов и проверяйте HTML перед коммитом.",
    "useCaseBlogTitle": "Посты блога и черновики",
    "useCaseBlogDesc": "Пишите посты блога на Markdown и получайте чистый, безопасный HTML, готовый для вставки в вашу CMS.",
    "useCaseEmailTitle": "Письма и рассылки",
    "useCaseEmailDesc": "Превращайте заметки на Markdown в HTML, который можно вставить прямо в шаблон письма или рассылки.",
    "faqLabel": "Вопросы",
    "faqHeading": "Часто задаваемые вопросы",
    "faq1q": "Этот конвертер Markdown в HTML бесплатный?",
    "faq1a": "Да, полностью бесплатный, без регистрации и входа. Вставьте Markdown и сразу увидите HTML.",
    "faq2q": "Поддерживаются ли таблицы, блоки кода и цитаты?",
    "faq2a": "Да. Заголовки, жирный и курсивный текст, ссылки, изображения, списки, блоки кода, цитаты и таблицы — всё поддерживается.",
    "faq3q": "Безопасно ли вставлять полученный HTML на мой сайт?",
    "faq3a": "Да. Весь HTML экранируется перед отрисовкой, поэтому его безопасно вставлять в CMS, блог или веб-страницу.",
    "faq4q": "Можно ли скачать полученный HTML-файл?",
    "faq4a": "Да — нажмите «Скачать .html», чтобы получить готовый HTML-документ, который можно открыть или разместить как есть.",
    "faq5q": "Можно ли использовать это, чтобы проверить README.md перед публикацией на GitHub?",
    "faq5a": "Конечно. Вставьте содержимое README.md и увидите точно, как он будет отображаться, включая таблицы и блоки кода, перед коммитом.",
    "relatedTopics": "Связанные темы",
    "kw1": "markdown в html",
    "kw2": "html конвертер",
    "kw3": "превью markdown",
    "kw4": "превью readme github",
    "kw5": "рендер markdown",
    "kw6": "html из markdown",
    "kw7": "онлайн редактор markdown",
    "kw8": "бесплатный конвертер markdown",
    "kw9": "gfm в html",
    "kw10": "живой превью markdown",
    "kw11": "экспорт документации в html",
    "kw12": "markdown в html онлайн",
    "relatedToolTitle": "Нужно ещё и перевести Markdown?",
    "relatedToolDesc": "Переводите .md файлы между 10+ языками с сохранением всей структуры — заголовков, таблиц, блоков кода.",
    "relatedToolCta": "Открыть Markdown Переводчик"
  }
}
</i18n>

<template>
  <LMainContent>
    <LHero
      disable-reveal-animation
      :title="t('page_title')"
      :sub-title="t('page_desc')"
      :features="[
        t('heroFeature1'),
        t('heroFeature2'),
        t('heroFeature3'),
        t('heroFeature4'),
        t('heroFeature5')
      ]"
    />

    <!-- TOOLBAR -->
    <div class="converter-toolbar" role="toolbar" aria-label="Formatting shortcuts">
      <div class="cheat-chips" id="cheatChips" role="group" aria-label="Insert template">
        <button v-for="template in templates" class="cheat-chip" :title="template.text" @click="addToMarkdown(template)">{{ template.hint }}</button>
      </div>
      <div class="toolbar-sep"></div>
      <div class="toolbar-actions">
        <button class="toolbar-btn" @click="clearEditor" title="Clear editor">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          <span>{{ t('btn_clear') }}</span>
        </button>
        <button class="toolbar-btn" @click="loadSample" title="Load sample">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>{{ t('btn_sample') }}</span>
        </button>
        <button class="toolbar-btn" @click="downloadHtml" title="Download HTML file">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>{{ t('btn_download') }}</span>
        </button>
      </div>
    </div>

    <!-- EDITOR AREA -->
    <div class="editor-area converter-shell" id="editorArea">

      <!-- LEFT: Markdown input -->
      <div class="editor-panel">
        <div class="panel-header">
          <span class="panel-label">{{ t('panel_md') }}</span>
          <div class="panel-actions">
            <button class="panel-btn" id="pasteBtn" @click="pasteFromClipboard">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
              <span>{{ t('btn_paste') }}</span>
            </button>
            <button class="panel-btn" id="copyMdBtn" @click="copyMarkdown">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>{{ t('btn_copy_md') }}</span>
            </button>
          </div>
        </div>
        <textarea
          class="md-textarea"
          id="mdInput"
          v-model="markdown"
          :placeholder="t('placeholder')"
          spellcheck="false"
          autocomplete="off"
          aria-label="Markdown input"
        ></textarea>
      </div>

      <!-- RIGHT: HTML output -->
      <div class="editor-panel output-panel">
        <div class="panel-header">
          <span class="panel-label" id="outputPanelLabel">HTML Output</span>
          <div class="panel-actions">
            <div class="view-toggle" role="group" aria-label="Output view">
              <button class="view-toggle-btn" :class="{ active: currentView === 'rendered' }" @click="setView('rendered')">{{ t('view_rendered') }}</button>
              <div class="view-toggle-sep"></div>
              <button class="view-toggle-btn" :class="{ active: currentView === 'source' }" @click="setView('source')">{{ t('view_source') }}</button>
            </div>
            <button class="panel-btn" id="copyHtmlBtn" @click="copyHtml">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>{{ t('btn_copy_html') }}</span>
            </button>
          </div>
        </div>

        <!-- rendered preview -->
        <div class="rendered-view" v-if="transpiled && currentView === 'rendered'" v-html="transpiled"></div>
        <div class="rendered-view" v-else-if="!transpiled">
          <div class="rendered-placeholder">
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <p>{{ t('placeholder_text') }}</p>
            </div>
          </div>

        </div>

        <!-- raw HTML source -->
        <div v-else class="source-view" aria-label="HTML source output">{{ transpiled }}</div>
      </div>

    </div><!-- /editor-area -->

    <!-- ABOUT SECTION -->
    <div class="about-section" id="about">
      <div class="about-section-inner">
        <div>
          <div class="about-block-label">{{ t('about_label') }}</div>
          <h2 class="about-block-title">{{ t('about_title') }}</h2>
          <p class="about-block-text">
            {{ t('about_text') }}
          </p>
          <p class="about-block-text" style="margin-top:12px">
            {{ t('about_text2') }}
          </p>
          <div class="about-tags">
            <span class="about-tag">markdown to html</span>
            <span class="about-tag">live preview</span>
            <span class="about-tag">html source</span>
            <span class="about-tag">markdown editor</span>
            <span class="about-tag">free online tool</span>
            <span class="about-tag">documentation helper</span>
          </div>
        </div>
        <div>
          <div class="about-block-label">{{ t('oss_label') }}</div>
          <h2 class="about-block-title">{{ t('oss_title') }}</h2>
          <p class="about-block-text">
            {{ t('oss_text') }}
            <a href="https://github.com/win7user10/Laraue.Interpreter" target="_blank" rel="noopener">
              Laraue.Interpreter.Markdown
            </a>
            {{ t('oss_text2') }}
          </p>
        </div>
      </div>
    </div>

    <!-- USE CASES -->
    <LFeaturesGrid
        type="cream"
        :pre-title="t('whoFor')"
        :title="t('useCasesHeading')"
        :post-title="t('useCasesSub')"
        :features="[
        { icon: 'folder', title: t('useCaseReadmeTitle'), description: t('useCaseReadmeDesc') },
        { icon: 'book', title: t('useCaseDocsTitle'), description: t('useCaseDocsDesc') },
        { icon: 'edit', title: t('useCaseBlogTitle'), description: t('useCaseBlogDesc') },
        { icon: 'mail', title: t('useCaseEmailTitle'), description: t('useCaseEmailDesc') }
      ]"
    />

    <!-- FAQ -->
    <LFaqSection
        :pre-title="t('faqLabel')"
        :title="t('faqHeading')"
        :items="[
        { question: t('faq1q'), answer: t('faq1a') },
        { question: t('faq2q'), answer: t('faq2a') },
        { question: t('faq3q'), answer: t('faq3a') },
        { question: t('faq4q'), answer: t('faq4a') },
        { question: t('faq5q'), answer: t('faq5a') }
      ]"
    />

    <!-- RELATED TOOL -->
    <div class="related-tool">
      <div class="related-tool-inner">
        <div class="related-tool-icon"><LNavIcon name="globe" /></div>
        <div class="related-tool-text">
          <strong>{{ t('relatedToolTitle') }}</strong>
          <span>{{ t('relatedToolDesc') }}</span>
        </div>
        <a :href="localePath('markdown-translator')" class="related-tool-link">{{ t('relatedToolCta') }} &#8594;</a>
      </div>
    </div>

    <!-- SEO TAGS -->
    <div class="seo-tags" :aria-label="t('relatedTopics')">
      <div class="seo-tags-inner">
        <span class="seo-tag">{{ t('kw1') }}</span>
        <span class="seo-tag">{{ t('kw2') }}</span>
        <span class="seo-tag">{{ t('kw3') }}</span>
        <span class="seo-tag">{{ t('kw4') }}</span>
        <span class="seo-tag">{{ t('kw5') }}</span>
        <span class="seo-tag">{{ t('kw6') }}</span>
        <span class="seo-tag">{{ t('kw7') }}</span>
        <span class="seo-tag">{{ t('kw8') }}</span>
        <span class="seo-tag">{{ t('kw9') }}</span>
        <span class="seo-tag">{{ t('kw10') }}</span>
        <span class="seo-tag">{{ t('kw11') }}</span>
        <span class="seo-tag">{{ t('kw12') }}</span>
      </div>
    </div>
  </LMainContent>
</template>

<style scoped>
/* toolbar */
.converter-toolbar{
  display:flex;align-items:center;gap:0;
  padding:0 48px;
  background:var(--cream);
  border-bottom:1px solid var(--border);
  height:48px;
  flex-shrink:0;
  overflow-x:auto;
}
/* cheat sheet chips */
.cheat-chips{display:flex;align-items:center;gap:6px;flex:1;overflow-x:auto;padding:6px 0}
.cheat-chip{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 9px;
  background:#fff;border:1px solid var(--border);border-radius:5px;
  font-family:var(--mono);font-size:11px;color:var(--ink);
  cursor:pointer;white-space:nowrap;flex-shrink:0;
  transition:border-color .12s,background .12s,color .12s;
}
.cheat-chip:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-light)}
.cheat-chip-label{font-family:var(--sans);font-size:10px;color:var(--muted);font-weight:600}

.toolbar-sep{width:1px;height:24px;background:var(--border);margin:0 8px;flex-shrink:0}

/* toolbar action buttons */
.toolbar-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}
.toolbar-btn{
  display:inline-flex;align-items:center;gap:5px;
  padding:5px 12px;border-radius:6px;border:1px solid var(--border);
  background:#fff;font-family:var(--sans);font-size:12px;font-weight:600;
  color:var(--muted);cursor:pointer;white-space:nowrap;
  transition:border-color .15s,color .15s,background .15s;
}
.toolbar-btn:hover{border-color:var(--ink);color:var(--ink);background:var(--paper)}
.toolbar-btn svg{width:13px;height:13px;stroke:currentColor;flex-shrink:0}
.toolbar-btn.active{background:var(--ink);color:#fff;border-color:var(--ink)}

/* view toggle */
.view-toggle{display:flex;border:1px solid var(--border);border-radius:6px;overflow:hidden;flex-shrink:0}
.view-toggle-btn{padding:4px 10px;font-size:11px;font-weight:700;letter-spacing:.03em;background:none;border:none;cursor:pointer;font-family:var(--sans);color:var(--muted);transition:background .15s,color .15s}
.view-toggle-btn:hover{background:var(--cream);color:var(--ink)}
.view-toggle-btn.active{background:var(--ink);color:#fff}
.view-toggle-sep{width:1px;background:var(--border)}

/* ══ EDITOR AREA ══ */
.editor-area{
  flex:1;display:grid;grid-template-columns:1fr 1fr;
  min-height:0; /* critical for flex children */
}

/* panel */
.editor-panel{
  display:flex;flex-direction:column;
  min-height:0;overflow:hidden;
  border-right:1px solid var(--border);
}
.editor-panel:last-child{border-right:none}

.panel-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 18px;
  background:var(--cream);border-bottom:1px solid var(--border);
  flex-shrink:0;
}
.panel-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.panel-actions{display:flex;align-items:center;gap:6px}
.panel-btn{
  display:inline-flex;align-items:center;gap:4px;
  padding:4px 10px;border-radius:5px;border:1px solid var(--border);
  background:#fff;font-size:11px;font-weight:600;color:var(--muted);
  cursor:pointer;font-family:var(--sans);
  transition:border-color .15s,color .15s,background .15s;
}
.panel-btn:hover{border-color:var(--ink);color:var(--ink)}
.panel-btn svg{width:12px;height:12px;stroke:currentColor;flex-shrink:0}
.panel-btn.success{border-color:#43b77a;color:#43b77a;background:#f0fbf5}

/* markdown textarea */
.md-textarea{
  flex:1;width:100%;border:none;outline:none;resize:none;
  font-family:var(--mono);font-size:13px;line-height:1.7;
  color:#2a2725;background:#fff;
  padding:20px 22px;
  tab-size:2;
}

/* output panel */
.output-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* rendered view */
.rendered-view{
  flex:1;overflow-y:auto;padding:24px 28px;
  background:#fff;font-family:var(--sans);
}
/* rendered html typography */
.rendered-view :deep(h1){font-family:var(--serif);font-size:26px;font-weight:800;line-height:1.2;color:var(--ink);margin:0 0 16px;letter-spacing:-.3px}
.rendered-view :deep(h2){font-family:var(--serif);font-size:20px;font-weight:700;line-height:1.25;color:var(--ink);margin:28px 0 12px;letter-spacing:-.2px;border-bottom:1px solid var(--border);padding-bottom:6px}
.rendered-view :deep(h3){font-family:var(--serif);font-size:16px;font-weight:700;color:var(--ink);margin:22px 0 8px}
.rendered-view :deep(h4){font-size:14px;font-weight:700;color:var(--ink);margin:18px 0 6px;text-transform:uppercase;letter-spacing:.04em}
.rendered-view :deep(p){font-size:15px;line-height:1.7;color:#2a2725;margin-bottom:14px}
.rendered-view :deep(ul),.rendered-view :deep(ol){padding-left:24px;margin-bottom:14px}
.rendered-view :deep(li){font-size:15px;line-height:1.6;margin-bottom:4px;color:#2a2725}
.rendered-view :deep(strong){font-weight:700;color:var(--ink)}
.rendered-view :deep(em){font-style:italic}
.rendered-view :deep(a){color:var(--blue);text-decoration:underline;text-decoration-color:rgba(59,91,219,.3);text-underline-offset:2px}
.rendered-view :deep(a:hover){text-decoration-color:var(--blue)}
.rendered-view :deep(code){font-family:var(--mono);font-size:.85em;background:var(--cream);border:1px solid var(--border);padding:1px 5px;border-radius:4px;color:var(--ink)}
.rendered-view :deep(pre){background:var(--ink);border-radius:8px;padding:16px 20px;margin:16px 0;overflow-x:auto}
.rendered-view :deep(pre code){background:none;border:none;padding:0;color:#d4cfca;font-size:12px;line-height:1.7}
.rendered-view :deep(blockquote){border-left:3px solid var(--blue);padding:10px 16px;margin:16px 0;background:var(--blue-light);border-radius:0 6px 6px 0}
.rendered-view :deep(blockquote p){margin:0;color:var(--muted);font-style:italic}
.rendered-view :deep(table){border-collapse:collapse;width:100%;margin:16px 0;font-size:14px}
.rendered-view :deep(th){background:var(--cream);font-weight:700;padding:8px 12px;border:1px solid var(--border);text-align:left}
.rendered-view :deep(td){padding:7px 12px;border:1px solid var(--border)}
.rendered-view :deep(tr:nth-child(even) td){background:var(--paper)}
.rendered-view :deep(hr){border:none;border-top:1px solid var(--border);margin:24px 0}
.rendered-view :deep(img){max-width:100%;border-radius:6px;border:1px solid var(--border);margin:8px 0}

/* source view */
.source-view{
  flex:1;overflow-y:auto;padding:20px 22px;
  background:#1a1a2e;
  font-family:var(--mono);font-size:12px;line-height:1.7;
  color:#d4cfca;white-space:pre-wrap;word-break:break-word;
}
.source-view.visible{display:block}

/* empty placeholder */
.rendered-placeholder{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;padding:40px;text-align:center;color:var(--muted);gap:12px;
}
.rendered-placeholder svg{width:40px;height:40px;stroke:currentColor;opacity:.3}
.rendered-placeholder p{font-size:14px;line-height:1.5;opacity:.7}

/* ══ BELOW-FOLD CONTENT ══ */
.about-section{
  padding:60px 48px;border-top:1px solid var(--border);
  background:var(--paper);
}
.about-section-inner{max-width:860px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start}
.about-block-label{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);margin-bottom:12px;display:flex;align-items:center;gap:6px}
.about-block-label::after{content:'';flex:1;max-width:32px;height:1px;background:var(--blue);opacity:.4}
.about-block-title{font-family:var(--serif);font-size:20px;font-weight:700;margin-bottom:12px;letter-spacing:-.2px}
.about-block-text{font-size:14px;color:var(--muted);line-height:1.7;font-weight:300}
.about-block-text strong{color:var(--ink);font-weight:600}
.about-block-text a{color:var(--blue);text-decoration:underline;text-decoration-color:rgba(59,91,219,.3)}
.about-block-text a:hover{text-decoration-color:var(--blue)}
.about-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
.about-tag{font-size:11px;font-weight:600;background:var(--blue-light);color:var(--blue);padding:3px 9px;border-radius:5px}

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
.seo-tags{padding:28px 48px;border-bottom:1px solid var(--border);display:flex}
.seo-tags-inner{display:flex;flex-wrap:wrap;gap:6px;margin:0 auto}
.seo-tag{font-size:11px;color:var(--muted);background:var(--cream);border:1px solid var(--border);padding:3px 9px;border-radius:4px}

/* markdown textarea */
.md-textarea{
  flex:1;width:100%;border:none;outline:none;resize:none;
  font-family:var(--mono);font-size:13px;line-height:1.7;
  color:#2a2725;background:#fff;
  padding:20px 22px;
  tab-size:2;
}

/* ══ RESPONSIVE ══ */
@media(max-width:1100px){
  .converter-toolbar,.about-section,.related-tool,.seo-tags{padding-left:32px;padding-right:32px}
  footer{padding-left:32px;padding-right:32px}
}
@media(max-width:840px){
  .editor-area{grid-template-columns:1fr;grid-template-rows:1fr 1fr}
  .editor-panel{border-right:none;border-bottom:1px solid var(--border)}
  .editor-panel:last-child{border-bottom:none}
  .about-section-inner{grid-template-columns:1fr;gap:36px}
}
@media(max-width:640px){
  .converter-toolbar {
    flex-wrap: wrap;        /* allow chips and actions to stack */
    height: auto;           /* remove fixed height */
    padding: 8px 12px;      /* comfortable touch spacing */
    gap: 10px;              /* space between wrapped rows */
    overflow-x: visible;    /* prevent whole toolbar scrolling */
  }

  .cheat-chips {
    width: 100%;            /* full width on top row */
    order: 1;               /* ensure chips appear first */
    overflow-x: auto;       /* keep horizontal scroll for many chips */
    -webkit-overflow-scrolling: touch;
  }

  .toolbar-sep {
    display: none;          /* hide separator on mobile */
  }

  .toolbar-actions {
    width: 100%;            /* full width for action buttons */
    order: 2;
    justify-content: space-between; /* spread buttons evenly */
    gap: 8px;
    padding-bottom: 6px;
  }

  .toolbar-btn {
    flex: 1;                /* make buttons equally wide */
    justify-content: center;
    padding: 6px 8px;       /* larger touch target */
    font-size: 12px;        /* readable but compact */
  }
}
@media(max-width:720px){
  .converter-toolbar{padding:0 12px;}
  .cheat-chips{gap:4px}
  .about-section{padding:44px 20px}
  .related-tool,.seo-tags{padding:20px 22px}
}
@media(max-width:480px){
  .editor-area{grid-template-rows:auto auto;min-height:600px}
  .md-textarea{min-height:240px}
}
</style>