<script setup lang="ts">
  interface Option {
    key: string,
    title: string,
  }

  defineProps<{
    label: string;
    options: Option[];
    modelValue: string;
  }>()

  const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void,
  }>()
</script>

<template>
  <div class="lang-select-wrap">
    <div class="lang-select-label">{{ label }}</div>
    <select
      class="lang-select"
      @change="emits('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option
        v-for="option in options"
        :value="option.key"
        :selected="option.key === modelValue">
          {{ option.title }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.lang-select-wrap{flex:1;min-width:160px;max-width:260px}
.lang-select-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.lang-select{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:8px;
  font-family:var(--sans);font-size:14px;font-weight:600;color:var(--ink);cursor:pointer;appearance:none;-webkit-appearance:none;
  padding-right:34px;transition:border-color .2s,box-shadow .2s;outline:none;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpolyline points='2,4 6,8 10,4' fill='none' stroke='%237a7469' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 12px center;
}
.lang-select:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(15,118,110,.12)}
</style>