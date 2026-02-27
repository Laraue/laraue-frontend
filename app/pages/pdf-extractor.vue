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

const modes = [
  {
    title: "Select tables",
    pdfql: "select(tables)",
    key: "tables"
  },
  {
    title: "Select table rows",
    pdfql: "select(tableRows)",
    key: "tableRows"
  },
  {
    title: "Select table cells",
    pdfql: "select(tableCells)",
    key: "tableCells"
  },
  {
    title: "Write query manually (advanced)",
    pdfql: "",
    key: "manual"
  },
]

const snippets = [
  {
    title: "Select 3 first tables",
    pdfql: "select(tables)\r->take(3)",
  },
  {
    title: "Select table rows where first cell equals 'Customer'",
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
  return currentModeId.value ? modes.find(m => m.key === currentModeId.value)! : null;
})

watch(pdfql, () => {
  runSyntaxCheck();
})

watch(currentModeId, (newModeId) => {
  const mode = modes.find(m => m.key === newModeId);
  if (mode)
    pdfql.value = mode.pdfql;
})

useSeoMeta({
  title: 'Pdf Query Language Concept (Alpha)',
  description: 'Extract data from PDF with the Pdf Query language or premade snippets',
})
</script>

<template>
  <div class="container">
    <header>
      <h1>Extract objects from PDF</h1>
      <p class="subtitle">The service helps to extract PDF parts in the popular formats for free. Registration is not required.</p>
      <nuxt-link class="doc-link" to="blog/projects/pdf-query-language">About PDF query language</nuxt-link>
    </header>

    <div class="content">
      <div class="form-group">
        <label for="extract-type">What do you want to extract?</label>
        <l-select
            :options="modes"
            v-model="currentModeId">
        </l-select>
      </div>

      <div  v-if="currentMode?.key === 'manual'" class="form-group">
        <label for="query-input">Enter PDF query:</label>
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
            Drop PDF here to process or <em>click to upload</em>
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
        {{ isLoading ? 'Processing' : 'Start' }}
      </button>

      <div id="result-container" class="result-container" v-if="result.errors.length > 0 || result.result">
        <div class="result-header">
          <h3>Extraction Result</h3>
          <button
            @click="copyToClipBoard"
            class="copy-btn"
            v-if="result.result"
            :class="{copied: isCopied}">
            {{ isCopied ? 'Copied' : 'Copy to Clipboard' }}
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
        <h3>How It Works</h3>
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>Select Extraction Type</h4>
            <p>Choose what you want to extract from your PDF document.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Upload PDF</h4>
            <p>Upload your PDF document using the file browser or drag and drop.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>Get Results</h4>
            <p>Click "Start Extraction" and view your extracted data in the results area.</p>
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
