<script setup lang="ts">
import LSection from "~/components/landins/LSection.vue";
interface FaqItem {
  question: string;
  answer: string;
}
defineProps({
  items: Array<FaqItem>
})

const opened = ref<number[]>([]);
const toggleFaq = (index: number) => {
  if (opened.value.includes(index)) {
    const toRemove = opened.value.indexOf(index);
    opened.value.splice(toRemove, 1)
  } else
    opened.value.push(index);
}
</script>

<template>
  <LSection
    type="light"
    pre-title="Questions"
    title="Frequently Asked Questions">
    <div class="faq-list">
      <div v-for="(item, i) in items" class="faq-item" :class="{open: opened.includes(i)}">
        <button class="faq-btn" @click="toggleFaq(i)">
          {{ item.question }}
          <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="faq-body">
          <p class="faq-content">{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </LSection>
</template>

<style scoped>
/* ══ FAQ ══ */
.faq-list{max-width:820px;display:flex;flex-direction:column;gap:0}
.faq-item{border-bottom:1px solid var(--border)}
.faq-item:first-child{border-top:1px solid var(--border)}
.faq-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 0;background:none;border:none;cursor:pointer;text-align:left;font-family:var(--sans);font-size:15px;font-weight:700;color:var(--ink);transition:color .15s}
.faq-btn:hover{color:var(--accent)}
.faq-chevron{width:18px;height:18px;stroke:currentColor;flex-shrink:0;transition:transform .25s;color:var(--muted)}
.faq-item.open .faq-chevron{transform:rotate(180deg);color:var(--accent)}
.faq-item.open .faq-btn{color:var(--accent)}
.faq-body{max-height:0;overflow:hidden;transition:max-height .3s ease}
.faq-item.open .faq-body{max-height:400px}
.faq-content{padding:0 0 18px;font-size:14px;color:var(--muted);line-height:1.7;font-weight:300}
.faq-content strong{color:var(--ink);font-weight:600}
</style>