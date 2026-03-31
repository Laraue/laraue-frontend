<script setup lang="ts">
</script>

<template>
  <header>
    <h1>
      <slot name="title"></slot>
    </h1>
    <p class="subtitle">
      <slot name="subtitle"></slot>
    </p>
    <slot></slot>
  </header>
</template>

<style scoped>
header {
  background: #f8f9fa;
  color: #343a40;
  padding: 80px 20px;
  text-align: center;
  border-bottom: 1px solid #dee2e6;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 15px;
}

</style>