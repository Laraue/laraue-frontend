<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {type PsqlExecutionResult, usePdfExtractorApi} from "~/composables/pdfExtractorApi";
import LMainContent from "~/components/ui/LMainContent.vue";
import LHero from "~/components/ui/LHero.vue";
import LNavIcon from "~/components/ui/LNavIcon.vue";
import LProtoBanner from "~/components/ui/LProtoBanner.vue";
import LFaqSection from "~/components/landins/LFaqSection.vue";
import {defineOffer, defineSoftwareApp, defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";

const { runQuery, checkSyntax } = usePdfExtractorApi();

const isLoading = ref(false);
const result = ref<PsqlExecutionResult>({ result: null, errors: [] });

const { t } = useI18n();
const localePath = useLocalePath();

const isCopied = ref(false);
const copyToClipBoard = () => {
  const copyText = JSON.stringify(result.value.result);
  navigator.clipboard.writeText(copyText);
  isCopied.value = true;
}

const run = async () => {
  isCopied.value = false;
  try {
    const bytes = await getBase64(selectedFile.value?.file);
    result.value = await withLoader(() => runQuery(pdfql.value, bytes));
  }
  catch (e: any) {
    result.value.result = null;
    result.value.errors.push({message: e.message});
  }
}

const downloadResult = () => {
  if(!result.value.result)return;
  const blob=new Blob([JSON.stringify(result.value.result)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='extracted.json';a.click();URL.revokeObjectURL(a.href);
}

const runSyntaxCheck = async () => {
  result.value.result = null;
  result.value.errors = (await checkSyntax(pdfql.value)).errors;
}

const getBase64 = (file: File) : Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.slice());
    reader.onload = () => resolve(reader.result?.slice(37) as string);
    reader.onerror = (error) => reject(error);
  });
};

const withLoader = async (func: () => Promise<any>) => {
  try {
    isLoading.value = true;
    return await func();
  } finally {
    isLoading.value = false;
  }
}

const modes = computed(() => [
  {
    title: t('selectTables'),
    pdfql: "select(tables)",
    key: "tables",
    icon: "table",
    description: t('modeDescTables'),
  },
  {
    title: t('selectTableRows'),
    pdfql: "select(tableRows)",
    key: "tableRows",
    icon: "rows",
    description: t('modeDescRows'),
  },
  {
    title: t('selectTableCells'),
    pdfql: "select(tableCells)",
    key: "tableCells",
    icon: "cell",
    description: t('modeDescCells'),
  },
  {
    title: t('manualQuery'),
    pdfql: "",
    key: "manual",
    icon: "gear",
    description: t('modeDescManual'),
  },
]);

const pdfql = ref(modes.value[0]!.pdfql);

const currentModeId = ref<string | undefined>("tables");
const currentMode = computed(() => {
  return currentModeId.value ? modes.value.find(m => m.key === currentModeId.value)! : null;
})

watch(pdfql, () => {
  runSyntaxCheck();
})

watch(currentModeId, (newModeId) => {
  const mode = modes.value.find(m => m.key === newModeId);
  if (mode)
    pdfql.value = mode.pdfql;
})

const formatBytes = (b: number) => {
  if(b<1024)return b+' B';
  if(b<1024*1024)return (b/1024).toFixed(1)+' KB';
  return (b/(1024*1024)).toFixed(1)+' MB';
}

interface SelectedFile {
  size: string;
  file: File
}

const selectedFile = ref<SelectedFile>()

const handleFile = (f?: File) => {
  if (!f||f.type!=='application/pdf' && !f.name.endsWith('.pdf')){
    alert('Please select a PDF file.');return;
  }
  if (f.size>20*1024*1024){
    alert('File too large. Maximum size is 20 MB.');
    return;
  }

  selectedFile.value = {
    file: f,
    size: formatBytes(f.size)
  }
}

const clear = () => {
  result.value.result = null;
  result.value.errors = [];
}

const removeFile = () => {
  selectedFile.value = undefined;
}

useSeoMeta({
  title: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
  ogTitle: computed(() => t('seoTitle')),
  ogDescription: computed(() => t('seoDescription')),
  ogType: "website",
  twitterCard: "summary",
  twitterTitle: computed(() => t('seoTitle')),
  twitterDescription: computed(() => t('seoDescription')),
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
        description: 'Unlimited extractor usage'
      })
    ]
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: '/' },
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
</script>

<i18n lang="json">
{
  "en": {
    "bc_home": "Home",
    "bc_current": "PDF Extractor",
    "seoTitle": "Pdf Query Language Concept (Alpha)",
    "seoDescription": "Extract data from PDF with the Pdf Query language or premade snippets",
    "pageTitle": "Extract objects from PDF",
    "pageSubtitle": "Extract tables, rows, and cells from any PDF document into clean JSON — free, with no registration required. Powered by PdfQL, a declarative PDF query language.",
    "aboutLink": "About PDF query language (Concept)",
    "extractTypeLabel": "What do you want to extract?",
    "queryInputLabel": "Enter PDF query:",
    "dropzoneText": "Drop PDF here to process or",
    "dropzoneLink": "click to upload",
    "processing": "Processing",
    "start": "Start",
    "extractionResult": "Extraction Result",
    "copyToClipboard": "Copy to Clipboard",
    "copied": "Copied",
    "howItWorks": "How It Works",
    "selectTables": "Tables",
    "selectTableRows": "Table rows",
    "selectTableCells": "Table cells",
    "manualQuery": "Write query manually",
    "modeDescTables": "Full table structure with headers and rows",
    "modeDescRows": "Flat array of row arrays per table",
    "modeDescCells": "Individual cell values from all tables",
    "modeDescManual": "Custom declarative query for advanced use",
    "step1Title": "Select Extraction Type",
    "step1Description": "Choose what you want to extract from your PDF document.",
    "step2Title": "Upload PDF",
    "step2Description": "Upload your PDF document using the file browser or drag and drop.",
    "step3Title": "Get Results",
    "step3Description": "Click \"Start Extraction\" and view your extracted data in the results area.",
    "autoGenerated": "Auto-generated PdfQL query",
    "stepsTitle": "Getting started",
    "stepsDesc": "Get PDF content in 3 steps",
    "uploadPdf": "Upload your PDF",
    "extract": "Extract",
    "startExtraction": "Start Extraction",
    "extractedJson": "Extracted JSON",
    "errors": "Errors",
    "copy": "Copy",
    "downloadJson": "Download .json",
    "clear": "Clear",
    "howItWorksTitle": "How it works",
    "howStep1": "tables, rows, cells, or write a custom PdfQL query.",
    "howStep2": "Upload your PDF — drag & drop or click to browse. Files are processed on the server and not stored.",
    "howStep3": "Get JSON results — copy to clipboard or download as a .json file.",
    "extractionModes": "Extraction modes",
    "pdfqlConcept": "PdfQL — A Query Language for PDFs",
    "pdfqlConceptDesc": "Read about the design and goals of PdfQL, a declarative language for extracting structured data from PDF documents.",
    "readConcept": "Read the concept article →",
    "alphaNotice": "Alpha notice: This is an early prototype. Complex multi-column layouts and scanned PDFs may produce incomplete results. Files are not stored after processing.",
    "invalidFileType": "Please select a PDF file.",
    "fileTooLarge": "File too large. Maximum size is 20 MB.",
    "noFileSelected": "Please select a PDF file first.",
    "dropPdfHere": "Drop PDF here to process",
    "clickToUpload": "click to upload",
    "pdfOnlyMax": "PDF files only · Max 20 MB",
    "removeFile": "Remove file",
    "chooseType": "Choose extraction type",
    "faqLabel": "Questions",
    "faqHeading": "Frequently Asked Questions",
    "faq1q": "Is this PDF extractor free to use?",
    "faq1a": "Yes, completely free with no registration or account required. Upload a PDF and extract data instantly.",
    "faq2q": "Are my PDF files stored on the server?",
    "faq2a": "No. Files are processed in memory to extract the requested data and are not stored afterward.",
    "faq3q": "What is PdfQL?",
    "faq3a": "PdfQL is a declarative query language for extracting structured data — tables, rows, and cells — from PDF documents, without writing custom parsing code.",
    "faq4q": "Does it work with scanned PDFs or complex multi-column layouts?",
    "faq4a": "Not reliably yet. This is an alpha prototype — scanned (image-only) PDFs and complex multi-column layouts may produce incomplete or incorrect results.",
    "faq5q": "What's the maximum file size?",
    "faq5a": "20 MB per file."
  },
  "ru": {
    "seoTitle": "Конвертер PDF -> JSON (Альфа)",
    "bc_home": "Главная",
    "bc_current": "Извлечение данных из PDF",
    "seoDescription": "Извлекайте данные из PDF с помощью языка Pdf Query или готовых сниппетов",
    "pageTitle": "Извлечение данных из PDF",
    "pageSubtitle": "Извлекайте таблицы, их строки и ячейки из любого PDF в формате JSON — бесплатно и без регистрации. Работает на PdfQL, декларативном языке запросов PDF.",
    "aboutLink": "О языке запросов PDF (Концепт)",
    "extractTypeLabel": "Что вы хотите извлечь?",
    "queryInputLabel": "Введите PDF запрос:",
    "dropzoneText": "Перетащите PDF сюда для обработки или",
    "dropzoneLink": "нажмите для загрузки",
    "processing": "Обработка",
    "start": "Начать",
    "extractionResult": "Результат извлечения",
    "copyToClipboard": "Копировать",
    "copied": "Скопировано",
    "howItWorks": "Как это работает",
    "selectTables": "Таблицы",
    "selectTableRows": "Строки",
    "selectTableCells": "Ячейки",
    "manualQuery": "Написать запрос вручную",
    "modeDescTables": "Полная структура таблицы с заголовками и строками",
    "modeDescRows": "Плоский массив массивов строк для каждой таблицы",
    "modeDescCells": "Отдельные значения ячеек из всех таблиц",
    "modeDescManual": "Пользовательский декларативный запрос для продвинутых сценариев",
    "step1Title": "Выберите, что извлечь",
    "step1Description": "Таблицы, параграфы или что-нибудь еще.",
    "step2Title": "Выберите PDF",
    "step2Description": "Загрузите PDF документ через файловый менеджер или перетащив файл в зону загрузки контента.",
    "step3Title": "Получите результат",
    "step3Description": "Нажмите \"Старт\" и смотрите, что получилось.",
    "autoGenerated": "Сгенерированный PdfQL запрос",
    "stepsTitle": "Как начать",
    "stepsDesc": "Получите контент файла в 3 шага",
    "uploadPdf": "Выберите PDF",
    "extract": "Запуск",
    "startExtraction": "Начать извлечение",
    "extractedJson": "Извлечённый JSON",
    "errors": "Ошибки",
    "copy": "Копировать",
    "downloadJson": "Скачать .json",
    "clear": "Очистить",
    "howItWorksTitle": "Как это работает",
    "howStep1": "таблицы, строки, ячейки или напишите свой запрос PdfQL.",
    "howStep2": "Выберите PDF — перетащите файл или нажмите для выбора. Файлы обрабатываются на сервере и не хранятся.",
    "howStep3": "Получите JSON — скопируйте в буфер обмена или скачайте как .json файл.",
    "extractionModes": "Режимы извлечения",
    "pdfqlConcept": "PdfQL — язык запросов для PDF",
    "pdfqlConceptDesc": "Прочитайте о дизайне и целях PdfQL — декларативном языке для извлечения структурированных данных из PDF.",
    "readConcept": "Читать статью об языке →",
    "alphaNotice": "Альфа-версия: это ранний прототип. Сложные многоколоночные макеты и сканированные PDF могут давать некорректные результаты. Файлы не хранятся после обработки.",
    "invalidFileType": "Пожалуйста, выберите PDF файл.",
    "fileTooLarge": "Файл слишком большой. Максимальный размер 20 МБ.",
    "noFileSelected": "Сначала выберите PDF файл.",
    "dropPdfHere": "Перетащите PDF сюда для обработки",
    "clickToUpload": "нажмите для загрузки",
    "pdfOnlyMax": "Только PDF · Макс 20 МБ",
    "removeFile": "Удалить файл",
    "chooseType": "Выберите режим извлечения",
    "faqLabel": "Вопросы",
    "faqHeading": "Часто задаваемые вопросы",
    "faq1q": "Этот PDF-экстрактор бесплатный?",
    "faq1a": "Да, полностью бесплатный, без регистрации и аккаунта. Загрузите PDF и сразу получите данные.",
    "faq2q": "Хранятся ли мои PDF-файлы на сервере?",
    "faq2a": "Нет. Файлы обрабатываются в памяти для извлечения запрошенных данных и не сохраняются после этого.",
    "faq3q": "Что такое PdfQL?",
    "faq3a": "PdfQL — декларативный язык запросов для извлечения структурированных данных — таблиц, строк и ячеек — из PDF без написания собственного кода парсинга.",
    "faq4q": "Работает ли это со сканированными PDF или сложными многоколоночными макетами?",
    "faq4a": "Пока не надёжно. Это альфа-прототип — сканированные (в виде изображений) PDF и сложные многоколоночные макеты могут давать неполные или некорректные результаты.",
    "faq5q": "Какой максимальный размер файла?",
    "faq5a": "20 МБ на файл."
  }
}
</i18n>

<template>
  <LMainContent>
    <LProtoBanner :message="t('alphaNotice')" />
    <LHero :title="t('pageTitle')" :sub-title="t('pageSubtitle')" />
    <!-- TOOL BODY -->
    <div class="tool-body">

      <!-- LEFT: EXTRACTOR -->
      <div>
        <!-- Step 1: Extraction type -->
        <div class="tool-section">
          <div class="tool-section-header">
            <div class="tool-section-num">1</div>
            <h2 class="tool-section-title">{{ t('extractTypeLabel') }}</h2>
          </div>
          <div class="tool-section-body">
            <div class="ext-tabs" role="group" :aria-label="t('extractTypeLabel')">
              <button
                  v-for="mode in modes"
                  :key="mode.key"
                  class="ext-tab"
                  :class="{ active: currentModeId === mode.key }"
                  @click="currentModeId = mode.key">
                <span class="ext-tab-icon"><LNavIcon :name="mode.icon" /></span>
                <span class="ext-tab-label">{{ mode.title }}</span>
                <span class="ext-tab-sub">{{ mode.description }}</span>
              </button>
            </div>

            <!-- Query preview -->
            <div v-if="currentModeId !== 'manual'" class="query-preview">
              <span class="q-kw">{{ pdfql }}</span>
              <span class="q-cmt"> // {{ t('autoGenerated') }}</span>
            </div>

            <!-- Manual query textarea -->
            <div v-if="currentModeId === 'manual'" style="margin-top:12px">
              <textarea
                  id="manualQuery"
                  v-model="pdfql"
                  class="manual-query"
                  :placeholder="'select(tableRows)\n->filter(row => row.GetCell(1).Text() == \'Customer\')'"
                  @focus="($event.target as HTMLTextAreaElement).style.borderColor='var(--rose)'"
                  @blur="($event.target as HTMLTextAreaElement).style.borderColor='var(--border)'"
              ></textarea>

              <p style="font-size:11px;color:var(--muted);margin-top:6px">
                <nuxt-link :to="localePath('/blog/projects/pdf-query-language')" style="color:var(--accent);font-weight:600">
                  {{ t('readConcept') }}
                </nuxt-link>
              </p>
            </div>
          </div>
        </div>

        <!-- Step 2: Upload -->
        <div class="tool-section">
          <div class="tool-section-header">
            <div class="tool-section-num">2</div>
            <h2 class="tool-section-title">{{ t('uploadPdf') }}</h2>
          </div>
          <div class="tool-section-body">
            <div v-if="!selectedFile" class="dropzone" role="button" :aria-label="t('dropzoneText')" tabindex="0">
              <input
                  type="file"
                  id="fileInput"
                  accept=".pdf,application/pdf"
                  :aria-label="t('dropzoneLink')"
                  @change="handleFile(($event.target as HTMLInputElement).files?.[0])"
              >
              <span class="dropzone-icon"><LNavIcon name="file" /></span>
              <div class="dropzone-title">{{ t('dropPdfHere') }}</div>
              <div class="dropzone-sub">
                {{ t('or') }} <em>{{ t('clickToUpload') }}</em>
                <small>{{ t('pdfOnlyMax') }}</small>
              </div>
            </div>

            <div v-else class="file-info">
              <span class="file-info-icon"><LNavIcon name="file" /></span>
              <div>
                <div class="file-info-name">{{ selectedFile.file.name }}</div>
                <div class="file-info-size">{{ selectedFile.size }}</div>
              </div>
              <button class="file-info-remove" @click="removeFile" :aria-label="t('removeFile')">✕</button>
            </div>
          </div>
        </div>

        <!-- Step 3: Run + Results -->
        <div class="tool-section">
          <div class="tool-section-header">
            <div class="tool-section-num">3</div>
            <h2 class="tool-section-title">{{ t('extract') }}</h2>
          </div>
          <div class="tool-section-body">
            <div v-if="isLoading" class="loading-bar active"></div>

            <button
                class="run-btn"
                :disabled="!selectedFile || isLoading"
                @click="run"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {{ isLoading ? t('processing') : t('startExtraction') }}
            </button>

            <div v-if="result.result || result.errors.length > 0" class="results-area">
              <div class="results-header">
                <div class="results-title">{{ result.result ? t('extractedJson') : t('') }}</div>
                <div class="results-actions" v-if="result.result">
                  <button class="results-btn" :class="{ success: isCopied }" @click="copyToClipBoard">
                    {{ isCopied ? t('copied') : t('copy') }}
                  </button>
                  <button class="results-btn" @click="downloadResult">{{ t('downloadJson') }}</button>
                  <button class="results-btn" @click="clear">{{ t('clear') }}</button>
                </div>
              </div>

              <!-- Result -->
              <div class="results-output" v-if="result.result">
                {{ result.result }}
              </div>

              <!-- Syntax Errors -->
              <div v-if="result.errors.length > 0" class="results-output errors" aria-live="polite">
                <div v-for="(error, idx) in result.errors" :key="idx" class="error-item">
                  <template v-if="error.startLineNumber !== undefined">
                    Lines: [{{ error.startLineNumber }}-{{ error.endLineNumber }}]
                  </template>
                  <template v-if="error.startPosition !== undefined">
                    Position: [{{ error.startPosition }}-{{ error.endPosition }}]
                  </template>
                  {{ error.message }}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: INFO PANEL -->
      <div class="info-panel">
        <div class="info-card">
          <div class="info-card-strip"></div>
          <div class="info-card-body">
            <h2 class="info-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
              {{ t('howItWorksTitle') }}
            </h2>
            <div class="how-steps">
              <div class="how-step">
                <div class="how-step-num">1</div>
                <div class="how-step-text"><strong>{{ t('chooseType') }}</strong> — {{ t('howStep1') }}</div>
              </div>
              <div class="how-step">
                <div class="how-step-num">2</div>
                <div class="how-step-text"><strong>{{ t('uploadPdf') }}</strong> — {{ t('howStep2') }}</div>
              </div>
              <div class="how-step">
                <div class="how-step-num">3</div>
                <div class="how-step-text"><strong>{{ t('extractionResult') }}</strong> — {{ t('howStep3') }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-strip"></div>
          <div class="info-card-body">
            <h2 class="info-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M3 15h18M9 3v18"/>
              </svg>
              {{ t('extractionModes') }}
            </h2>
            <div class="type-list">
              <div class="type-item">
                <div class="type-dot"></div>
                <span class="type-name">{{ t('selectTables') }}</span>
                <span class="type-desc">{{ t('modeDescTables') }}</span>
              </div>
              <div class="type-item">
                <div class="type-dot"></div>
                <span class="type-name">{{ t('selectTableRows') }}</span>
                <span class="type-desc">{{ t('modeDescRows') }}</span>
              </div>
              <div class="type-item">
                <div class="type-dot"></div>
                <span class="type-name">{{ t('selectTableCells') }}</span>
                <span class="type-desc">{{ t('modeDescCells') }}</span>
              </div>
              <div class="type-item">
                <div class="type-dot"></div>
                <span class="type-name">PdfQL</span>
                <span class="type-desc">{{ t('modeDescManual') }}</span>
              </div>
            </div>
          </div>
        </div>

        <nuxt-link :to="localePath('/blog/projects/pdf-query-language')" class="pdfql-card">
          <div class="pdfql-label">{{ t('aboutLink') }}</div>
          <h2 class="pdfql-title">{{ t('pdfqlConcept') }}</h2>
          <div class="pdfql-sub">{{ t('pdfqlConceptDesc') }}</div>
          <div class="pdfql-read">{{ t('readConcept') }}</div>
        </nuxt-link>

        <div class="limits-note">
          <strong>{{ t('alphaNotice').split(':')[0] }}:</strong> {{ t('alphaNotice').split(':')[1] }}
        </div>
      </div>
    </div>

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
  </LMainContent>
</template>

<style scoped>

/* ══ TOOL BODY ══ */
.tool-body{padding:40px 48px;display:grid;grid-template-columns:1fr 360px;gap:32px;align-items:start;}

/* ── Left column: extractor ── */
/* Section blocks */
.tool-section{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:20px;transition:box-shadow .2s}
.tool-section:hover{box-shadow:0 4px 20px rgba(15,14,12,.06)}
.tool-section-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.tool-section-num{width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--serif)}
.tool-section-title{font-weight:700;font-size:14px;color:var(--ink)}
.tool-section-body{padding:20px}

/* Extraction type tabs */
.ext-tabs{display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;margin-bottom:10px}
.ext-tab{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:14px 10px;border-radius:10px;border:1.5px solid var(--border);
  background:#fff;cursor:pointer;text-align:center;
  transition:border-color .2s,background .2s,box-shadow .2s;
}
.ext-tab:hover{border-color:var(--accent);background:var(--accent-light)}
.ext-tab.active{border-color:var(--accent);background:var(--accent-light);box-shadow:0 0 0 2px rgba(190,18,60,.12)}
.ext-tab-icon{color:var(--accent);display:flex}
.ext-tab-icon :deep(.nav-icon-svg){width:22px;height:22px}
.ext-tab-label{font-size:12px;font-weight:700;color:var(--ink)}
.ext-tab-sub{font-size:10px;color:var(--muted);line-height:1.3}
.ext-advanced .ext-tab-icon{font-size:18px}

/* Query preview */
.query-preview{margin-top:12px;background:var(--ink);border-radius:8px;padding:14px 16px;font-family:var(--mono);font-size:12px;line-height:1.7;color:#8090a0;position:relative;overflow:hidden}
.query-preview::before{content:'query preview';position:absolute;top:8px;right:12px;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.2)}
.q-kw{color:#f59e0b}
.q-str{color:#86efac}
.q-cmt{color:#4a5568;font-style:italic}
.q-fn{color:#93c5fd}
.q-br{color:rgba(255,255,255,.4)}

/* Dropzone */
.dropzone{
  border:2px dashed var(--border);border-radius:12px;
  padding:40px 24px;text-align:center;cursor:pointer;
  transition:border-color .2s,background .2s;
  background:#fafaf8;position:relative;
}
.dropzone:hover,.dropzone.drag-over{border-color:var(--accent);background:var(--accent-light)}
.dropzone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.dropzone-icon{color:var(--muted);margin-bottom:10px;display:flex;justify-content:center}
.dropzone-icon :deep(.nav-icon-svg){width:36px;height:36px}
.dropzone-title{font-weight:700;font-size:15px;color:var(--ink);margin-bottom:4px}
.dropzone-sub{font-size:13px;color:var(--muted)}
.dropzone-sub em{color:var(--accent);font-style:normal;font-weight:600}
.dropzone-sub small{display:block;margin-top:4px;font-size:11px;opacity:.7}
.file-info{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--accent-light);border:1px solid rgba(190,18,60,.2);border-radius:10px;margin-top:12px}
.file-info-icon{color:var(--accent);flex-shrink:0;display:flex}
.file-info-icon :deep(.nav-icon-svg){width:22px;height:22px}
.file-info-name{font-weight:600;font-size:13px;color:var(--ink);word-break:break-all}
.file-info-size{font-size:11px;color:var(--muted)}
.file-info-remove{margin-left:auto;background:none;border:none;cursor:pointer;color:var(--accent);font-size:18px;padding:2px 6px;border-radius:4px;transition:background .15s}
.file-info-remove:hover{background:rgba(190,18,60,.1)}

/* Run button */
.run-btn{
  width:100%;padding:15px;border-radius:10px;border:none;
  background:var(--accent);color:#fff;
  font-family:var(--serif);font-size:15px;font-weight:700;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
  transition:background .2s,transform .15s,box-shadow .2s;
  box-shadow:0 2px 12px rgba(190,18,60,.25);
  margin-top:20px;
}
.run-btn:hover:not(:disabled){background:var(--accent-mid);transform:translateY(-2px);box-shadow:0 4px 20px rgba(190,18,60,.35)}
.run-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.run-btn svg{width:18px;height:18px;stroke:currentColor;flex-shrink:0}

/* Results */
.results-area{display:block;margin-top:20px}
.results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.results-title{font-weight:700;font-size:14px;color:var(--ink)}
.results-actions{display:flex;gap:8px}
.results-btn{padding:5px 12px;border-radius:6px;border:1px solid var(--border);background:#fff;font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:border-color .15s,color .15s}
.results-btn:hover{border-color:var(--ink);color:var(--ink)}
.results-btn.success{border-color:#43b77a;color:#43b77a}
.results-output{
  background:var(--ink);border-radius:10px;padding:18px 20px;
  font-family:var(--mono);font-size:12px;line-height:1.7;
  color:#8090a0;max-height:340px;overflow-y:auto;
  white-space:pre-wrap;word-break:break-word;
}

/* Loading state */
.loading-bar{height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);background-size:200% 100%;animation:loading 1.2s infinite;border-radius:1px;display:none}
.loading-bar.visible{display:block}
@keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ── Right column: info panel ── */
.info-panel{display:flex;flex-direction:column;gap:20px;position:sticky;top:calc(var(--nav-h) + 32px)}

.info-card{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden}
.info-card-strip{height:4px;background:linear-gradient(90deg,var(--accent),var(--accent-mid))}
.info-card-body{padding:20px}
.info-card-title{font-family:var(--serif);font-size:14px;font-weight:700;margin-bottom:12px;color:var(--ink);display:flex;align-items:center;gap:8px}
.info-card-title svg{width:16px;height:16px;stroke:var(--accent);flex-shrink:0}

/* how it works */
.how-steps{display:flex;flex-direction:column;gap:12px}
.how-step{display:flex;align-items:flex-start;gap:10px}
.how-step-num{width:22px;height:22px;border-radius:50%;background:var(--accent-light);color:var(--accent);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--serif);border:1px solid rgba(190,18,60,.2)}
.how-step-text{font-size:13px;color:var(--muted);line-height:1.5;padding-top:2px}
.how-step-text strong{color:var(--ink)}

/* supported types */
.type-list{display:flex;flex-direction:column;gap:8px}
.type-item{display:flex;align-items:center;gap:8px;font-size:12px}
.type-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);flex-shrink:0}
.type-name{font-weight:600;color:var(--ink);min-width:80px}
.type-desc{color:var(--muted)}

/* pdfql callout */
.pdfql-card{background:var(--ink);border-radius:14px;padding:20px;color:rgba(247,244,238,.7);text-decoration:none;display:block;transition:transform .2s,box-shadow .2s}
.pdfql-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(15,14,12,.2)}
.pdfql-label{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(190,18,60,.8);margin-bottom:8px;display:flex;align-items:center;gap:5px}
.pdfql-label::before{content:'';width:16px;height:1px;background:rgba(190,18,60,.5)}
.pdfql-title{font-family:var(--serif);font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;line-height:1.3}
.pdfql-sub{font-size:12px;line-height:1.6;color:rgba(247,244,238,.45)}
.pdfql-read{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:rgba(190,18,60,.9);margin-top:12px;transition:gap .15s}
.pdfql-card:hover .pdfql-read{gap:9px}

/* limits note */
.limits-note{font-size:11px;color:var(--muted);line-height:1.6;padding:12px;background:var(--cream);border-radius:8px;border:1px solid var(--border)}
.limits-note strong{color:var(--ink)}

#manualQuery {width:100%;border:1.5px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:12px;line-height:1.7;color:var(--ink);background:#fff;resize:vertical;min-height:100px;outline:none;transition:border-color .2s}

/* ══ RESPONSIVE ══ */
@media(max-width:1100px){
  .tool-body{padding-left:32px;padding-right:32px}
}
@media(max-width:900px){
  .tool-body{grid-template-columns:1fr;gap:24px}
  .info-panel{position:static}
  .ext-tabs{grid-template-columns:1fr 1fr}
}
@media(max-width:720px){
  .tool-body{padding:24px 20px}
}
@media(max-width:480px){
  .ext-tabs{grid-template-columns:1fr}
  .results-header {
    flex-flow: column;
  }
}
</style>