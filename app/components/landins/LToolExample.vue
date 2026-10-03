<script setup lang="ts">
import LSection from "~/components/landins/LSection.vue";

// An example of the tool: the input and the result side by side, and the limits of the tool below.
defineProps<{
  preTitle?: string,
  title?: string,
  postTitle?: string,
  sourceLabel: string,
  source: string,
  resultLabel: string,
  result: string,
  limitsTitle?: string,
  limits?: string[],
}>()
</script>

<template>
  <LSection type="cream" :pre-title="preTitle" :title="title" :post-title="postTitle">
    <div class="example">
      <figure class="example-pane">
        <figcaption class="example-label">{{ sourceLabel }}</figcaption>
        <pre class="example-code"><code>{{ source }}</code></pre>
      </figure>
      <figure class="example-pane">
        <figcaption class="example-label">{{ resultLabel }}</figcaption>
        <pre class="example-code"><code>{{ result }}</code></pre>
      </figure>
    </div>
    <template v-if="limits?.length">
      <h3 class="limits-title">{{ limitsTitle }}</h3>
      <ul class="limits">
        <li v-for="limit in limits" :key="limit">{{ limit }}</li>
      </ul>
    </template>
  </LSection>
</template>

<style scoped>
.example{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:32px}
.example-pane{margin:0;min-width:0}
.example-label{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.example-code{margin:0;padding:16px 18px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-card);font-family:var(--font-family-mono);font-size:13px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere}
.limits-title{font-size:17px;font-weight:700;margin:36px 0 12px}
.limits{margin:0;padding-left:20px;color:var(--muted);font-size:15px;line-height:1.7}
@media(max-width:720px){
  .example{grid-template-columns:1fr}
}
</style>
