<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import LSelect, {type ISelectOption} from "./LSelect.vue";
import {type SelectItem, useBlogApi} from "~/composables/blogApi";

const projectOptions = ref<SelectItem[]>([])

const props = defineProps({
  modelValue: Boolean,
})

const { loadSelectOptions } = useBlogApi()

const emit = defineEmits(["update:modelValue"])
const update = (state: string) => {
  emit('update:modelValue', state)
}

const computedProjects = computed(() => {
  const options = projectOptions.value.map(x => { return { title: x.title ?? x.fileName, key: x.fileName } as ISelectOption });
  options.unshift({ title: "Project", key: "" });
  return options;
})

onMounted(async () => {
  projectOptions.value = await loadSelectOptions("project", 0, 8)
})

</script>

<template>
  <l-select
      @update:modelValue="update"
      :options="computedProjects"
      :value="props.modelValue"
  ></l-select>
</template>

<style scoped>

</style>