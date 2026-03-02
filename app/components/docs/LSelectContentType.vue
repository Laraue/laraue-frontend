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

const { t } = useI18n();

const contentTypeOptions = ref<ISelectOption[]>([
  { title: t('contentType'), key: "" },
  { title: t('documentation'), key: "documentation" },
  { title: t('project'), key: "project" },
  { title: t('article'), key: "article" },
])

</script>

<i18n lang="json">
{
  "en": {
    "contentType": "Content type",
    "documentation": "Documentation",
    "project": "Projects",
    "article": "Articles"
  },
  "ru": {
    "contentType": "Тип контента",
    "documentation": "Документация",
    "project": "Проекты",
    "article": "Статьи"
  }
}
</i18n>

<template>
  <l-select
      @update:modelValue="update"
      :options="contentTypeOptions"
      :value="props.modelValue"
  ></l-select>
</template>

<style scoped>

</style>