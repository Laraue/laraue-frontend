<script setup lang="ts">
import {ref} from "vue";

const markdown = ref('');
const transpiled = ref('')
const renderHtml = ref(false)

const { transpile } = useMarkdownApi();

const loadResponse = async() => {
  const response = await transpile({ content: markdown.value })
  transpiled.value = response.htmlContent ?? ""
}

useSeoMeta({
  title: 'Markdown to HTML Converter',
  description: 'The utility for online Markdown to HTML Converting',
})

</script>

<template>
  <div class="wrapper">
    <div class="service-container">
      <h1>Markdown to HTML Tool</h1>
      <div class="split-panel">
        <!-- left screen: markdown input -->
        <div class="card">
          <div class="card-header">
            <span>
                Markdown Source
            </span>
            <span style="color:#64748b; font-size:0.85rem;">.md</span>
          </div>
          <textarea
            id="mdInput"
            class="markdown-input"
            v-model="markdown"
            @input="loadResponse">
          </textarea>
        </div>

        <!-- right screen: output with toggle -->
        <div class="card">
          <div class="card-header">
            <span>
                HTML View
            </span>
            <!-- toggle switch -->
            <div class="toggle-container">
              <span class="toggle-label" id="toggleModeLabel">rendered</span>
              <label class="toggle-switch">
                <!-- by default unchecked -> rendered mode active -->
                <input @click="renderHtml = !renderHtml" type="checkbox" id="viewToggle" aria-label="switch between rendered html and raw text">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <!-- output container: two views, only one active at a time -->
          <div class="output-area" id="outputArea">
            <!-- rendered html view (hidden initially) -->
            <div v-if="renderHtml" id="renderedView" class="render-view active">
              <div id="renderedContent" class="rendered-html" v-html="transpiled">
              </div>
            </div>
            <!-- plain text html view (active initially) -->
            <div v-else id="textView" class="text-view">
              {{ transpiled }}
            </div>
          </div>
        </div>
      </div>

      <div class="seo-block">
        <p>
          <strong>Markdown to HTML Tool</strong> is a free online tool for writers, developers, and content creators.
          Write or paste Markdown in the left panel — see the formatted <strong>HTML output</strong> live on the right.
          Use the toggle switch to peek at the raw HTML code or switch back to the rendered view.
        </p>
        <p>
          Perfect for drafting blog posts, GitHub READMEs, documentation, or any content where you need
          both human‑friendly editing and clean HTML. The converter supports headings, lists, code blocks,
          blockquotes, bold, italic, links, and more. All generated HTML is sanitized for safe embedding.
        </p>
        <div class="seo-keywords">
          <span>markdown to html</span>
          <span>live preview</span>
          <span>html source toggle</span>
          <span>markdown editor</span>
          <span>code converter</span>
          <span>free online tool</span>
          <span>documentation helper</span>
          <span>instant render</span>
        </div>
      </div>

      <hr>
      <div class="footer-note">
        ⚡ toggle switch — show rendered HTML or plain code
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  background: linear-gradient(145deg, #f9fafc 0%, #eef1f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.service-container {
  max-width: 1440px;
  width: 100%;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(3px);
  border-radius: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.6);
  padding: 2rem;
}

h1 {
  font-weight: 500;
  font-size: 1.8rem;
  letter-spacing: -0.02em;
  color: #1e293b;
  margin-bottom: 0.25rem;
  padding-left: 0.5rem;
}
.sub {
  color: #475569;
  margin-bottom: 2rem;
  font-weight: 400;
  font-size: 1rem;
  border-left: 4px solid #818cf8;
  padding-left: 1rem;
}

/* two‑screen grid */
.split-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8rem;
}

/* shared card styles */
.card {
  background: #ffffffdd;
  backdrop-filter: blur(4px);
  border-radius: 2rem;
  box-shadow: 0 12px 30px -8px rgba(0,20,40,0.15), 0 4px 0 0 #f8fafc inset;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255,255,255,0.7);
  transition: transform 0.1s ease;
}

.card:hover {
  box-shadow: 0 20px 35px -12px rgba(79, 70, 229, 0.2);
}

.card-header {
  padding: 1.2rem 1.8rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  color: #0f172a;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background: #e0e7ff;
  color: #4338ca;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.7rem;
  border-radius: 40px;
  letter-spacing: 0.3px;
}

/* input area */
.markdown-input {
  width: 100%;
  min-height: 460px;
  padding: 1.5rem;
  border: none;
  resize: vertical;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1rem;
  line-height: 1.6;
  background: #ffffff;
  color: #1e293b;
  caret-color: #6366f1;
  outline: none;
}

.markdown-input::placeholder {
  color: #94a3b8;
  font-style: italic;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
}

/* output panel */
.output-area {
  flex: 1;
  background: #ffffff;
  min-height: 460px;
}

/* toggle switch (clean, modern) */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 28px;
  background: #cbd5e1;
  border-radius: 40px;
  transition: background 0.2s;
  cursor: pointer;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
}

.toggle-switch:has(input:checked) {
  background: #6366f1;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
}

.toggle-switch input:checked + .slider {
  transform: translateX(28px);
}

.toggle-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
  user-select: none;
}

.toggle-label .mode-text {
  background: #f1f5f9;
  padding: 0.2rem 0.7rem;
  border-radius: 30px;
  color: #1e293b;
}

/* rendered html — style reset inside container */
.rendered-html {
  padding: 1.8rem;
  height: 100%;
  overflow-y: auto;
  line-height: 1.6;
  color: #1e293b;
}

.rendered-html h1,
.rendered-html h2,
.rendered-html h3,
.rendered-html h4,
.rendered-html p,
.rendered-html ul,
.rendered-html ol,
.rendered-html blockquote,
.rendered-html pre {
  margin-bottom: 1rem;
}

.rendered-html h1 { font-size: 2em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; }
.rendered-html h2 { font-size: 1.5em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.2rem; }
.rendered-html code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 6px; font-family: monospace; }
.rendered-html pre { background: #f1f5f9; padding: 1rem; border-radius: 12px; overflow-x: auto; }
.rendered-html blockquote { border-left: 4px solid #a5b4fc; padding-left: 1rem; color: #334155; }
.rendered-html table { border-collapse: collapse; width: 100%; }
.rendered-html th, .rendered-html td { border: 1px solid #cbd5e1; padding: 0.5rem; }

/* plain text area (inside output) */
.plain-text-output {
  padding: 1.8rem;
  margin: 0;
  height: 100%;
  overflow-y: auto;
  background: #fcfcfd;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #0f172a;
  border: none;
  resize: none;
  width: 100%;
  min-height: 460px;
}

/* toggle visibility */
.render-view, .text-view {
  height: 100%;
}

.render-view.active, .text-view.active {
  display: block;
}

/* --- SEO BLOCK (new) --- */
.seo-block {
  margin-top: 2.5rem;
  padding: 1.5rem 2rem;
  background: #eef2ff66;  /* soft indigo tint */
  border-radius: 2rem;
  border: 1px solid #ffffff;
  backdrop-filter: blur(2px);
  color: #1e293b;
  box-shadow: 0 8px 20px -12px #1e293b40;
}

.seo-block p {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  font-size: 1rem;
}

.seo-block strong {
  color: #4338ca;
  font-weight: 600;
}

.seo-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #334155;
}

.seo-keywords span {
  background: white;
  padding: 0.2rem 1rem;
  border-radius: 40px;
  border: 1px solid #c7d2fe;
  font-weight: 400;
}

.footer-note {
  margin-top: 1.2rem;
  text-align: right;
  color: #64748b;
  font-size: 0.85rem;
}

hr {
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0 0.5rem 0;
  opacity: 0.5;
}

/* mobile adaptation */
@media (max-width: 800px) {
  .split-panel {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  .service-container {
    padding: 1rem;
  }
  .seo-block {
    padding: 1.2rem;
  }
}
</style>