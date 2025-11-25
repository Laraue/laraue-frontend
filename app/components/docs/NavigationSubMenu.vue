<script setup lang="ts">

  defineProps({
    menuItems: Array<MenuItem>,
    relativePath: Array<string>,
  })
</script>

<template>
  <ul v-for="item in menuItems">
    <li>
      <template v-if="item.hasContent">
        <nuxt-link :to="PathUtil.getAbsolutePathString(item.fullPath)">
          {{ item.title ?? item.fileName }}
        </nuxt-link>
      </template>
      <template v-else>
        {{ item.title ?? item.fileName }}
      </template>
      <navigation-sub-menu v-if="item.children.length > 0" :menuItems="item.children" :relative-path="relativePath" />
    </li>
  </ul>
</template>

<style scoped>

</style>