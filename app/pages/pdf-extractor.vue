<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import type {UploadFile, UploadProps} from "element-plus";
import {type PsqlExecutionResult, usePdfExtractorApi} from "~/composables/pdfExtractorApi";
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import LSelect from "~/components/docs/LSelect.vue";

const { runQuery, checkSyntax } = usePdfExtractorApi();

const defaultPsql = `select(tables)`;
const file = ref<UploadFile | null>(null);
const pdfql = ref(defaultPsql);
const isLoading = ref(false);
const result = ref<PsqlExecutionResult>({ result: null, errors: [] });
const isSnippetWindowOpened = ref(false);

const { t } = useI18n();

const isCopied = ref(false);
const copyToClipBoard = () => {
  const copyText = JSON.stringify(result.value.result);
  navigator.clipboard.writeText(copyText);
  isCopied.value = true;
}

const run = async () => {
  isCopied.value = false;
  try {
    const bytes = await getBase64(file.value);
    result.value = await withLoader(() => runQuery(pdfql.value, bytes));
  }
  catch (e) {
    result.value.result = null;
    if (e instanceof Error) {
      result.value.errors.push({startPosition: 1, endPosition: 2, startLineNumber: 1, endLineNumber: 1, message: e.message});
    }
    else {
      throw e;
    }
  }
}

const runSyntaxCheck = async () => {
  result.value.result = null;
  result.value.errors = (await checkSyntax(pdfql.value)).errors;
}

const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  if (uploadFiles.length > 1)
    uploadFiles.shift();
  file.value = uploadFile
}

const getBase64 = (file: any) : Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.raw);
    reader.onload = () => resolve(reader.result?.slice(28) as string);
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
    key: "tables"
  },
  {
    title: t('selectTableRows'),
    pdfql: "select(tableRows)",
    key: "tableRows"
  },
  {
    title: t('selectTableCells'),
    pdfql: "select(tableCells)",
    key: "tableCells"
  },
  {
    title: t('manualQuery'),
    pdfql: "",
    key: "manual"
  },
])

const snippets = [
  {
    title: t('snippetFirstThreeTables'),
    pdfql: "select(tables)\r->take(3)",
  },
  {
    title: t('snippetFilterRows'),
    pdfql: "select(tableRows)\r->filter(row => row.GetCell(1).Text() == 'Customer')"
  },
]

const chooseSnippet = (value: string) => {
  pdfql.value = value;
  isSnippetWindowOpened.value = false;
}

const chooseSuggestion = (id: string) => {
  currentModeId.value = id;
  pdfql.value = currentMode.value!.pdfql;
}

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

useSeoMeta({
  title: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
})
</script>

<i18n lang="json">
{
  "en": {
    "seoTitle": "Pdf Query Language Concept (Alpha)",
    "seoDescription": "Extract data from PDF with the Pdf Query language or premade snippets",
    "pageTitle": "Extract objects from PDF",
    "pageSubtitle": "The service helps to extract PDF parts in the popular formats for free. Registration is not required.",
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
    "manualQuery": "Write query manually (advanced)",
    "snippetFirstThreeTables": "Select 3 first tables",
    "snippetFilterRows": "Select table rows where first cell equals 'Customer'",
    "step1Title": "Select Extraction Type",
    "step1Description": "Choose what you want to extract from your PDF document.",
    "step2Title": "Upload PDF",
    "step2Description": "Upload your PDF document using the file browser or drag and drop.",
    "step3Title": "Get Results",
    "step3Description": "Click \"Start Extraction\" and view your extracted data in the results area."
  },
  "ru": {
    "seoTitle": "Pdf Query Language Concept (Alpha)",
    "seoDescription": "Извлекайте данные из PDF с помощью языка Pdf Query или готовых сниппетов",
    "pageTitle": "Извлечение структурированных данных из PDF",
    "pageSubtitle": "Сервис помогает бесплатно извлекать данные из PDF, используя специализированный запрос",
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
    "selectTableRows": "Строки таблиц",
    "selectTableCells": "Ячейки таблиц",
    "manualQuery": "Написать запрос вручную (продвинутый уровень)",
    "snippetFirstThreeTables": "Выбрать 3 первые таблицы",
    "snippetFilterRows": "Выбрать строки таблиц, где первая ячейка равна 'Customer'",
    "step1Title": "Выберите, что извлечь",
    "step1Description": "Таблицы, параграфы или что-нибудь еще.",
    "step2Title": "Загрузите PDF",
    "step2Description": "Загрузите PDF документ через файловый менеджер или перетащив файл в зону загрузки контента.",
    "step3Title": "Получите результат",
    "step3Description": "Нажмите \"Старт\" и смотрите, что получилось."
  }
}
</i18n>

<template>
  <div class="container">
    <header>
      <h1>{{ t('pageTitle') }}</h1>
      <p class="subtitle">{{ t('pageSubtitle') }}</p>
      <nuxt-link class="doc-link" to="blog/projects/pdf-query-language">{{ t('aboutLink') }}</nuxt-link>
    </header>

    <div class="content">
      <div class="form-group">
        <label for="extract-type">{{ t('extractTypeLabel') }}</label>
        <l-select
            :options="modes"
            v-model="currentModeId">
        </l-select>
      </div>

      <div  v-if="currentMode?.key === 'manual'" class="form-group">
        <label for="query-input">{{ t('queryInputLabel') }}</label>
        <textarea id="query-input" v-model="pdfql"></textarea>
      </div>

      <div class="form-group">
        <el-upload
            class="pdf-uploader"
            :on-change="handleChange"
            :auto-upload="false"
            accept="application/pdf"
            drag
            :limit="2">
          <el-icon class="el-icon--upload">
            <font-awesome :icon="faUpload" />
          </el-icon>
          <div class="el-upload__text">
            {{ t('dropzoneText') }} <em>{{ t('dropzoneLink') }}</em>
          </div>
        </el-upload>
      </div>

      <div id="error-message" class="error"></div>

      <button
          :disabled="isLoading"
          v-if="pdfql.length > 0 && file"
          class="btn"
          @click="run"
          v-loading="isLoading">
        {{ isLoading ? t('processing') : t('start') }}
      </button>

      <div id="result-container" class="result-container" v-if="result.errors.length > 0 || result.result">
        <div class="result-header">
          <h3>{{ t('extractionResult') }}</h3>
          <button
              @click="copyToClipBoard"
              class="copy-btn"
              v-if="result.result"
              :class="{copied: isCopied}">
            {{ isCopied ? t('copied') : t('copyToClipboard') }}
          </button>
        </div>
        <div class="result-content">
          <div v-for="error in result.errors" class="execution-result__item">
            <p class="execution-result__error-line">
              {{error.startLineNumber}}:{{error.startPosition}}
            </p>
            <p class="execution-result__error-description">
              {{error.message}}
            </p>
          </div>
          <div>
            <div v-if="result.result" class="execution-result__result">
              <vue-json-pretty
                  :data="result.result"
                  :deep="1"
                  :collapsed-node-length="20" />
            </div>
          </div>
        </div>
      </div>

      <div class="steps">
        <h3>{{ t('howItWorks') }}</h3>
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>{{ t('step1Title') }}</h4>
            <p>{{ t('step1Description') }}</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>{{ t('step2Title') }}</h4>
            <p>{{ t('step2Description') }}</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>{{ t('step3Title') }}</h4>
            <p>{{ t('step3Description') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

header {
  background: #f8f9fa;
  color: #343a40;
  padding: 120px 20px;
  text-align: center;
  border-bottom: 1px solid #dee2e6;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 15px;
}

.doc-link {
  background: linear-gradient(135deg, #8c2abf, #a489c3);
  color: white;
  padding: 15px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  display: inline-block;
  margin-top: 20px;
  transition: opacity 0.3s;
}

.doc-link:hover {
  opacity: 0.9;
}

.content {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #444;
}

select, textarea, .upload-area {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

select:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 25px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.result-container {
  margin-top: 30px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  padding: 20px;
  font-family: monospace;
  white-space: pre-wrap;
  max-height: 300px;
  overflow: auto;
  position: relative;
}

.copy-btn {
  min-width: 140px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:not(.copied):hover {
  background: #b8d6c6;
}

.steps {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  margin-top: 30px;
}

.steps h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #444;
}

.step {
  display: flex;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.step-number {
  background: #667eea;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
}

.step-content h4 {
  margin-bottom: 5px;
  color: #444;
}

.step-content p {
  color: #666;
  font-size: 0.95rem;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  padding: 15px;
  border-radius: 5px;
  margin-top: 15px;
  display: none;
}

@media (max-width: 600px) {
  .content {
    padding: 20px;
  }

  h1 {
    font-size: 1.8rem;
  }
}
</style>