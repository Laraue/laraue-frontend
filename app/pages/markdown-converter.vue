<script setup lang="ts">
import {ref} from "vue";

const markdown = ref('');
const transpiled = ref('')
const renderHtml = ref(true)

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

const templates: Template[] = [
  {
    data: "# Heading 1",
    text: "Heading 1",
    inlineElement: false,
    hint: "#",
  },
  {
    data: "# Heading 2",
    text: "Heading 2",
    inlineElement: false,
    hint: "##",
  },
  {
    data: "# Heading 3",
    text: "Heading 3",
    inlineElement: false,
    hint: "###",
  },
  {
    data: "**bold text**",
    text: "Bold",
    inlineElement: true,
    hint: "** **",
  },
  {
    data: "*italic text*",
    text: "Italic",
    inlineElement: true,
    hint: "* *",
  },
  {
    data: "- List item 1\r\n- List item 2",
    text: "Unordered List",
    inlineElement: false,
    hint: "-",
  },
  {
    data: "1. First\r\n2. Second",
    text: "Ordered List",
    inlineElement: false,
    hint: "1.",
  },
  {
    data: "[link text](https://example.com)",
    text: "Link",
    inlineElement: true,
    hint: "[]()",
  },
  {
    data: "![alt text](https://picsum.photos/200/300)",
    text: "Image",
    inlineElement: true,
    hint: "![]()",
  },
  {
    data: "`inline code`",
    text: "Inline code",
    inlineElement: true,
    hint: "` `",
  },
  {
    data: "```code block```",
    text: "Code block",
    inlineElement: true,
    hint: "``` ```",
  }
]

useSeoMeta({
  title: 'Markdown to HTML Converter',
  description: 'The utility for online Markdown to HTML Converting',
})

</script>

<template>
  <div class="wrapper">
    <div class="service-container">
      <h1>Markdown to HTML Converter</h1>
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
            v-model="markdown">
          </textarea>

          <!-- **********  CLICKABLE CHEAT SHEET (right under editor)  ********** -->
          <div class="cheat-sheet">
            <h3>
              📋 Markdown cheat sheet
            </h3>
            <div class="rules-grid" id="markdownRules">
              <!-- data-template holds the exact markdown snippet to insert -->
              <div v-for="template in templates" class="rule-chip" @click="addToMarkdown(template)">
                <code>{{ template.hint }}</code> <span class="rule-desc">{{ template.text }}</span>
              </div>
            </div>
            <div class="insert-hint">
              ⚡ click on any chip – inserts template at the end of your markdown
            </div>
          </div>

        </div>

        <!-- right screen: output with toggle -->
        <div class="card">
          <div class="card-header">
            <span>
                HTML View
            </span>
            <!-- toggle switch -->
            <div class="toggle-container">
              <span class="toggle-label" id="toggleModeLabel">Rendered</span>
              <label class="toggle-switch">
                <!-- by default unchecked -> rendered mode active -->
                <input v-model="renderHtml" type="checkbox" id="viewToggle" aria-label="switch between rendered html and raw text">
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
              <div class="plain-text-output">
                {{ transpiled }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="seo-block">
        <p>
          <strong>Markdown to HTML Converter</strong> is a free online tool for writers, developers, and content creators.
          Write or paste Markdown in the left panel — see the formatted <strong>HTML output</strong> live on the right.
          Use the toggle switch to peek at the raw HTML code or switch back to the rendered view.
        </p>
        <p>
          Perfect for drafting blog posts, GitHub READMEs, documentation, or any content where you need
          both human‑friendly editing and clean HTML. The converter supports headings, lists, code blocks,
          blockquotes, bold, italic, links, and more. All generated HTML is sanitized for safe embedding.
        </p>
        <p>
          The Converter is based on Open Source
          <a href="https://github.com/win7user10/Laraue.Interpreter">Laraue.Interpreter.Markdown</a> library
          which is also used as Markdown to HTML generator of the <a href="/blog">Laraue Blog</a>.
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
        ⚡ Toggle switch — show rendered HTML or plain code
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
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.6);
  padding: 2rem;
}

h1 {
  font-weight: 500;
  font-size: 1.8rem;
  letter-spacing: -0.02em;
  color: #1e293b;
  margin-bottom: 1rem;
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
  border-radius: 15px;
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

.rendered-html :deep(h1),
.rendered-html :deep(h2),
.rendered-html :deep(h3),
.rendered-html :deep(h4),
.rendered-html :deep(p),
.rendered-html :deep(ul),
.rendered-html :deep(ol),
.rendered-html :deep(blockquote),
.rendered-html :deep(pre) {
  margin-bottom: 1rem;
}

.rendered-html :deep(h1) { font-size: 2em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; }
.rendered-html :deep(h2) { font-size: 1.5em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.2rem; }
.rendered-html :deep(code) { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 6px; font-family: monospace; }
.rendered-html :deep(pre) { background: #f1f5f9; padding: 1rem; border-radius: 12px; overflow-x: auto; }
.rendered-html :deep(blockquote) { border-left: 4px solid #a5b4fc; padding-left: 1rem; color: #334155; }
.rendered-html :deep(table) { border-collapse: collapse; width: 100%; }
.rendered-html :deep(th), .rendered-html :deep(td) { border: 1px solid #cbd5e1; padding: 0.5rem; }
.rendered-html :deep(ul) { list-style: disc; margin-left: 20px; }
.rendered-html :deep(ol) { list-style: decimal; margin-left: 20px; }

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

/* --- MARKDOWN CHEAT SHEET (clickable blocks) --- */
.cheat-sheet {
  margin-top: 1.8rem;
  background: #ffffffd9;
  backdrop-filter: blur(4px);
  border-radius: 2rem;
  padding: 1.5rem 2rem;
  border: 1px solid #ffffff;
  box-shadow: 0 12px 25px -16px #1e293b;
}

.cheat-sheet h3 {
  font-weight: 500;
  font-size: 1.3rem;
  color: #0f172a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.cheat-sheet h3 span {
  background: #c7d2fe;
  color: #1e1b4b;
  padding: 0.2rem 0.9rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
}

.rules-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1.2rem;
  align-items: center;
}

.rule-chip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.7rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 6px #00000008;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.rule-chip:hover {
  background: #e0e7ff;
  border-color: #818cf8;
  transform: translateY(-2px);
  box-shadow: 0 12px 18px -10px #a5b4fc;
}

.rule-chip:active {
  transform: translateY(1px);
  background: #cbd5e1;
}

.rule-chip code {
  background: #ffffffb0;
  padding: 0.2rem 0.7rem;
  border-radius: 40px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: #4338ca;
  border: 1px solid #cbd5e1;
}

.rule-desc {
  font-size: 0.9rem;
  color: #334155;
}

.insert-hint {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #475569;
  background: #f1f4f9;
  padding: 0.4rem 1.2rem;
  border-radius: 5px;
  display: inline-block;
}
/* --- end cheat sheet --- */

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
  border-radius: 5px;
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
  .rules-grid {
    gap: 0.6rem;
  }
  .rule-chip {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
}
</style>