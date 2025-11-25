<script setup lang="ts">
  const props = defineProps({
    label: String
  })
</script>

<template>
  <el-form-item class="l-form-item" :label="props.label" label-position="left">
    <slot></slot>
  </el-form-item>
</template>

<style scoped>
  .l-form-item{
    display: flex;
    flex-flow: column;
  }
</style>