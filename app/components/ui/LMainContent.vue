<script setup lang="ts">
import LSidebar, {type LinksSection} from "~/components/ui/LSidebar.vue";

defineProps<{
  linksSections?: LinksSection[]
}>()
</script>

<template>
  <LSidebar :linksSections="linksSections"/>
  <main class="main-content">
    <slot></slot>
  </main>
</template>

<style scoped>
.main-content {
  margin-left:calc(var(--sidebar-w) + var(--doc-sidebar-w));
  flex: 1;
  min-width: 0;
}
</style>