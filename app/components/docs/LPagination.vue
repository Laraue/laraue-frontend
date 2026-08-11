<script setup lang="ts">
const props = defineProps<{
  page: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const goPrevious = () => {
  if (props.hasPreviousPage) emit('update:page', props.page - 1)
}

const goNext = () => {
  if (props.hasNextPage) emit('update:page', props.page + 1)
}
</script>

<template>
  <div class="pagination" v-if="hasPreviousPage || hasNextPage">
    <button
        type="button"
        class="pagination-btn"
        :disabled="!hasPreviousPage"
        @click="goPrevious">
      &#8592; Prev
    </button>
    <span class="pagination-page">{{ page }}</span>
    <button
        type="button"
        class="pagination-btn"
        :disabled="!hasNextPage"
        @click="goNext">
      Next &#8594;
    </button>
  </div>
</template>

<style scoped>
.pagination{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:36px}
.pagination-btn{font-family:var(--sans);font-size:13px;font-weight:600;color:var(--ink);background:var(--paper);border:1px solid var(--border);border-radius:8px;padding:9px 16px;cursor:pointer;transition:background .15s,border-color .15s}
.pagination-btn:hover:not(:disabled){border-color:var(--ink)}
.pagination-btn:disabled{opacity:.4;cursor:default}
.pagination-page{font-size:13px;font-weight:600;color:var(--muted);min-width:20px;text-align:center}
</style>
