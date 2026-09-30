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
.btn-primary{background:var(--color-accent);color:#fff;padding:12px 24px;border-radius:var(--radius-control);text-decoration:none;font-weight:600;font-size:14px;display:inline-block;transition:background .2s,transform .15s}
.btn-primary:hover{background:var(--accent-mid);transform:translateY(-1px)}
</style>