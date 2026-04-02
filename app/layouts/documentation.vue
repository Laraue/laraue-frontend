<script setup lang="ts">
const { loadMenu } = useBlogApi()
const { locale } = useI18n();
const route = useRoute();
const segments = route.params.id as string[]
const rootPath = ["blog", "documentation", segments[0]!]
const menuItems = await loadMenu(locale.value, rootPath);
</script>

<template>
  <DocsSidebar :rootPath="rootPath" :menuItems="menuItems" />
  <slot />
</template>

<style scoped>
</style>