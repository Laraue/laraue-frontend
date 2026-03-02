<script setup lang="ts">
import {computed} from "vue";

  const props = defineProps<{
    minDate: Date | null
    maxDate: Date | null
  }>()

  const emit = defineEmits(["update:minDate", "update:maxDate"])
  const { t } = useI18n()

  const computedValue = computed({
    get() {
      return [props.minDate, props.maxDate]
    },
    set(newValue) {
      emit("update:minDate", newValue ? newValue[0] : null);
      emit("update:maxDate", newValue ? newValue[1] : null);
    }
  })

  const shortcuts = ref([
    {
      text: t('lastWeek'),
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        return [start, end]
      },
    },
    {
      text: t('lastMonth'),
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        return [start, end]
      },
    },
    {
      text: t('lastThreeMonths'),
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        return [start, end]
      },
    },
  ])

</script>

<i18n lang="json">
{
  "en": {
    "lastWeek": "Last week",
    "lastMonth": "Last Month",
    "lastThreeMonths": "Last 3 Months",
    "startDate": "Start Date",
    "endDate": "End Date",
    "rangeSeparator": "To"
  },
  "ru": {
    "lastWeek": "Последняя неделя",
    "lastMonth": "Последний месяц",
    "lastThreeMonths": "Последние три месяца",
    "startDate": "Начальная дата",
    "endDate": "Конечная дата",
    "rangeSeparator": "до"
  }
}
</i18n>

<template>
  <el-date-picker
    class="date-picker"
    v-model="computedValue"
    type="daterange"
    unlink-panels
    :range-separator="t('rangeSeparator')"
    :start-placeholder="t('startDate')"
    :end-placeholder="t('endDate')"
    :shortcuts="shortcuts"
  />
</template>

<style>
@media (max-width: 768px) {
  .el-picker-panel__sidebar + .el-picker-panel__body {
    margin-left: 0;
    display: flex;
    flex-flow: column;
  }

  .el-picker-panel__sidebar {
    position: inherit;
    width: auto;
    display: flex;
  }

  .el-picker-panel__body-wrapper {
    width: 100vw;
  }

  .el-picker-panel__content {
    width: 100%;
  }

  .el-date-range-picker .el-picker-panel__body {
    min-width: 100%;
  }
}
</style>