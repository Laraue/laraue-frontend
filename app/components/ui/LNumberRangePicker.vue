<script setup lang="ts">
  const props = defineProps<{
    minValue: number | null
    maxValue: number | null
    minValuePlaceholder: string
    maxValuePlaceholder: string
    postfixText: string | undefined
    step: number,
    min: number,
    max: number,
  }>()

  const emit = defineEmits<{
    (e: 'update:minValue', value: null | number): void
    (e: 'update:maxValue', value: null | number): void
  }>()

  const updateMinValue = (value: null | string) => {
    if (!value) {
      emit("update:minValue", null)
      return
    }

    const numberValue = Number.parseFloat(value)
    emit("update:minValue", numberValue)
    if (props.maxValue != null && props.maxValue <= numberValue) {
      emit("update:maxValue", props.step + numberValue)
    }
  }

  const updateMaxValue = (value: null | string) => {
    if (!value) {
      emit("update:maxValue", null)
      return
    }

    const numberValue = Number.parseFloat(value)
    emit("update:maxValue", numberValue)
    if (props.minValue != null && props.minValue >= numberValue) {
      const diff = numberValue - props.step;
      const emitValue = diff <= 0 ? null : diff;
      emit("update:minValue", emitValue)
    }
  }
</script>

<template>
  <div class="el-input__wrapper number-range-input__wrapper">
    <el-input
      type="number"
      class="number-range-input"
      clearable
      :min="props.min"
      :max="props.max - props.step"
      :step="props.step"
      :placeholder="minValuePlaceholder"
      :model-value="props.minValue"
      @input="updateMinValue"/>
    <el-input
      type="number"
      class="number-range-input"
      clearable
      :min="props.step"
      :max="props.max"
      :step="props.step"
      :placeholder="maxValuePlaceholder"
      :model-value="props.maxValue"
      @input="updateMaxValue" />
    <span class="postfix">
      {{ postfixText }}
    </span>
  </div>
</template>

<style scoped>
  .number-range-input :deep(.el-input__wrapper) {
    box-shadow: none;
  }
  .number-range-input__wrapper{
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
  }
  .postfix {
    text-align: right;
    color: var(--el-input-icon-color, var(--el-text-color-placeholder));
    font-size: 12px;
  }
</style>