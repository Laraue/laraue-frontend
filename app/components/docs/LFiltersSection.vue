<script setup lang="ts">

</script>

<template>
  <div class="filter-section">
    <slot></slot>
  </div>
</template>

<style scoped>
.filter-section {
  margin-bottom: 30px;
  padding: 15px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.filter-section * {
  margin: 5px 0;
}
</style>