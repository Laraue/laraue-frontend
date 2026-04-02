<script setup lang="ts">
  defineProps({
    href: String,
  })
</script>

<template>
  <a :href="href" class="btn-primary" style="width:100%;text-align:center;display:block">
    <slot />
  </a>
</template>

<style scoped>
.btn-primary{background:var(--ink);color:var(--paper);padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;transition:background .2s,transform .15s;box-shadow:0 2px 12px rgba(15,14,12,.18)}
.btn-primary:hover{background:var(--accent);transform:translateY(-2px)}
</style>