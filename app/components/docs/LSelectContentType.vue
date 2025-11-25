<script setup lang="ts">
import {ref} from "vue";
import LSelect, {type ISelectOption} from "./LSelect.vue";

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(["update:modelValue"])
const update = (state: string) => {
  emit('update:modelValue', state)
}

const contentTypeOptions = ref<ISelectOption[]>([
  { title: "Content type", key: "" },
  { title: "Documentation", key: "documentation" },
  { title: "Project", key: "project" },
  { title: "Article", key: "article" },
])

</script>

<template>
  <l-select
      @update:modelValue="update"
      :options="contentTypeOptions"
      :value="props.modelValue"
  ></l-select>
</template>

<style scoped>

</style>