<script setup lang="ts">

const props = defineProps({
  modelValue: Object
})

const emit = defineEmits(["update:modelValue"])
</script>

<template>
  <el-form :model-value="props.modelValue" @update.modelValue="emit('update:modelValue')">
    <slot></slot>
  </el-form>
</template>

<style scoped>

</style>