<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {ref, onMounted, watch} from 'vue'
import {pdfql} from "~/components/pdfql";
import {editor} from "monaco-editor/esm/vs/editor/editor.api";
import './../monaco-worker';

monaco.languages.register({ id: 'Pdfql' })
monaco.languages.setMonarchTokensProvider('Pdfql', pdfql)

monaco.editor.defineTheme("PdfqlTheme", {
  base: "vs",
  inherit: false,
  rules: [
    { token: "stage.selectType", foreground: "#35c33b" },
    { token: "stage.name", foreground: "#4049dc" },
    { token: "delimiter.curly", foreground: "#D2D5B4" },
    { token: "delimiter.parenthesis", foreground: "#D2D5B4" },
    { token: "method.name", foreground: "#16f4b0" },
    { token: "token.number", foreground: "#e046f3" },
    { token: "token.identifier", foreground: "#D2D5B4" },
    { token: "token.operator", foreground: "#784b78" },
    { token: "dot", foreground: "#D2D5B4" },
    { token: "string", foreground: "#848826FF" },
  ],
  colors: {
    "editor.background": "#2D1639",
    "editorLineNumber.foreground": "#e5d2f3",
    "editorLineNumber.activeForeground": "#D2D5B4",
    "editorCursor.foreground": "#ecdfdf",
    "editor.lineHighlightBackground": "#2D1639",
    "editor.selectionBackground": "#471561",
  },
});

monaco.languages.registerCompletionItemProvider("Pdfql", {
  provideCompletionItems: (model, position) => {
    const word = model.getWordUntilPosition(position);

    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    const suggestions = [
      {
        label: "select",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "select(tables)",
        range: range,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: "Select Stage",
      }
    ]

    return { suggestions: suggestions };
  }
})

const props = defineProps({
  modelValue: String,
  errors: Array<PdfqlError>
})

const emit = defineEmits(["update:modelValue", "change"])

const editorRef = ref()
let editorInstance: editor.IStandaloneCodeEditor;

const decorationsIds = ref<string[]>([]);

watch(() => props.errors, (newValue) => {
  const model = editorInstance?.getModel()
  if (!model) return

  const newDecorations = getDecorations(newValue ?? []);

  decorationsIds.value = model.deltaDecorations(decorationsIds.value, newDecorations);
})

watch(() => props.modelValue, (newValue) => {
  if (newValue !== actualValue.value)
    editorInstance?.setValue(newValue ?? "")
})

const getDecorations = (errors: PdfqlError[]) : editor.IModelDeltaDecoration[] => {
  const positions = errors ?? []
  return positions.map(v => {
    return {
      range: new monaco.Range(v.startLineNumber + 1, v.startPosition + 1, v.endLineNumber + 1, v.endPosition + 1),
      options: {
        inlineClassName: "pdfql-error",
      },
    }
  })
}

const actualValue = ref(props.modelValue)

onMounted(() => {
  editorInstance = monaco.editor.create(editorRef.value, {
    value: actualValue.value,
    language: 'Pdfql',
    theme: 'PdfqlTheme',
    minimap: { enabled: false },
    scrollbar: { vertical: "hidden", horizontal: "hidden", handleMouseWheel: false },
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false
  })

  editorInstance.onDidChangeModelContent(() => {
    actualValue.value = editorInstance.getValue();
    emit("update:modelValue", actualValue.value)
    emit("change")
  })
})
</script>

<template>
  <div id="editor" ref="editorRef"></div>
</template>

<style scoped>
#editor {
  height: 20vh;
  text-align: left;
}
</style>
<style>
.monaco-editor{
  outline:none;
  box-shadow: none;
}
.pdfql-error{
  background: #9081c3;
}
</style>