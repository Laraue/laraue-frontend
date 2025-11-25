<script setup lang="ts">

const props = defineProps({
  modelValue: Boolean,
  title: String,
  primaryButtonText: String,
  secondaryButtonText: String,
  primaryClickAction: Function
})

const emit = defineEmits(["update:modelValue"])

const changeModalState = (state: Boolean) => {
  emit('update:modelValue', state)
}

const clickPrimary = async () => {
  if (props.primaryClickAction){
    await props.primaryClickAction();
  }
  changeModalState(false);
}

</script>

<template>
  <el-dialog
    :model-value="props.modelValue"
    :title="title"
    width="500"
    @close="changeModalState(false)"
    center
  >
    <slot></slot>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="changeModalState(false)" v-if="secondaryButtonText">
          {{ secondaryButtonText }}
        </el-button>
        <el-button type="primary" @click="clickPrimary" v-if="primaryButtonText">
          {{ primaryButtonText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
</style>