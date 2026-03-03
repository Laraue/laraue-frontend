<script setup lang="ts">

import LSelect, {type ISelectOption} from "./LSelect.vue";
import {computed, ref} from "vue";
import {useBlogApi} from "~/composables/blogApi";

const tagsCount = ref<CountPropertyRow[]>([])

const { countPropertyValues } = useBlogApi();
const { t, locale } = useI18n();

const computedTags = computed(() => {
  const options = tagsCount.value.map(x => { return { title: x.key, key: x.key } as ISelectOption })
  options.unshift({ title: t("tag"), key: "" });
  return options;
})

const props = defineProps({
  modelValue: Boolean,
  fromPath: Array<string>,
})

const emit = defineEmits(["update:modelValue"])
const update = (state: string) => {
  emit('update:modelValue', state)
}

tagsCount.value = await countPropertyValues(locale.value, "tags", props.fromPath);

</script>

<i18n lang="json">
{
  "en": {
    "tag": "Tag"
  },
  "ru": {
    "tag": "Тег"
  }
}
</i18n>

<template>
  <l-select
    @update:modelValue="update"
    :options="computedTags"
    :value="props.modelValue"
  ></l-select>
</template>

<style scoped>

</style>