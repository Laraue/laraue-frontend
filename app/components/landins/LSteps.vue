<script setup lang="ts">
import LSection from "~/components/landins/LSection.vue";

export interface Step {
  title: string,
  description: string,
  icon?: string,
}

defineProps<{
  preTitle?: string,
  title?: string,
  postTitle?: string,
  steps: Step[],
}>()
</script>

<template>
  <LSection class="how" :pre-title="preTitle" :title="title" :post-title="postTitle" type="light">
    <div class="how-inner" :style="{ '--steps-count': steps.length }">
      <div class="how-steps">
        <div v-for="(step, i) in steps" class="how-step reveal">
          <div class="how-step-num">{{ i + 1 }}</div>
          <div class="how-step-icon" v-if="step.icon">{{ step.icon }}</div>
          <div>
            <div class="how-step-title">{{ step.title }}</div>
            <div class="how-step-desc">{{ step.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </LSection>
</template>

<style scoped>
/* ══ HOW IT WORKS ══ */
.how{padding:80px 60px;border-bottom:1px solid var(--border)}
.how-inner{max-width:1060px;margin:0 auto;--steps-count: 1}
.how-steps{display:grid;gap:0;margin-top:52px;position:relative;grid-template-columns: repeat(var(--steps-count), 1fr);}
.how-steps::before{content:'';position:absolute;top:20px;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,var(--border),var(--border),var(--border),transparent);z-index:0}
.how-step{display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 12px;position:relative;z-index:1}
.how-step-num{width:40px;height:40px;border-radius:50%;background:var(--ink);color:#fff;font-family:var(--serif);font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:14px;border:3px solid var(--paper);box-shadow:0 0 0 1px var(--border);flex-shrink:0}
.how-step-title{font-weight:700;font-size:13px;margin-bottom:6px;color:var(--ink)}
.how-step-desc{font-size:12px;color:var(--muted);line-height:1.5}
.how-step-icon{font-size: 24px;margin-bottom: 10px;}

@media(max-width:900px){
  .how-steps{grid-template-columns:1fr;gap:24px}
  .how-steps::before{display:none}
  .how-step{flex-direction:row;text-align:left;gap:16px;align-items:flex-start}
}
@media(max-width:720px){
  .how{padding:60px 22px}
}
@media(max-width:900px){
  .how-steps{grid-template-columns:1fr;gap:24px}
  .how-steps::before{display:none}
  .how-step{flex-direction:row;text-align:left;gap:16px;align-items:flex-start}
}
</style>