<script setup lang="ts">
import LSidebar, {type LinksSection} from "~/components/ui/LSidebar.vue";

defineProps<{
  linksSections?: LinksSection[],
  alignItemsCenter?: false
}>()
</script>

<template>
  <LSidebar v-if="linksSections?.length" :linksSections="linksSections"/>
  <slot name="sidebar"></slot>
  <main class="main-content">
    <slot></slot>
  </main>
</template>

<style scoped>
.main-content {
  flex: 1;
  min-width: 0;
}
</style>