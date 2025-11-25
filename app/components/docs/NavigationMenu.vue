<script setup lang="ts">
  import NavigationSubMenu from "./NavigationSubMenu.vue";

  defineProps({
    menuItems: Array<MenuItem>,
    title: String,
  })
</script>

<template>
  <div class="submenu">
    <h4>{{ title }} Navigation</h4>
    <navigation-sub-menu :menuItems="menuItems" />
  </div>
</template>

<style scoped>
  .submenu {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 5px;
    margin: 20px 0;
    line-height: 1.3;
  }

  .submenu h4 {
    margin-bottom: 15px;
    font-weight: bold;
    font-size: 1.17em;
  }

  .submenu :deep(ul) {
    list-style: none;
    padding-left: 20px;
  }

  .submenu :deep(ul li ul) {
    list-style: none;
    padding-left: 20px;
    margin: 5px 0;
  }

  .submenu :deep(a) {
    text-decoration: none;
    color: #007bff;
  }

  .submenu :deep(a.router-link-active) {
    color: #2980b9;
    font-weight: bold;
  }

  .submenu :deep(a:hover) {
    color: #2980b9;
  }
</style>