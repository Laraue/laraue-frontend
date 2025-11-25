<script setup lang="ts">
const emit = defineEmits(["update:modelValue"])
const updateState = (state: string) => {
  emit('update:modelValue', state)
}
const props = defineProps({
  modelValue: String,
  options: Array<ISelectOption>,
})

export interface ISelectOption{
  title: string;
  key: string;
}

</script>

<template>
  <select @input="($event) => updateState(($event.target as any).value)" :value="props.modelValue">
    <option v-for="option in options" :value="option.key" :key="option.key">
      {{ option.title }}
    </option>
  </select>
</template>

<style scoped>
select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-right: 10px;
  width: 200px;
}

@media screen and (max-width: 1024px) {
  select {
    width: 100%;
  }
}
</style>