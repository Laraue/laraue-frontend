<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <div class="proto-banner" role="alert">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <span>{{ message }}</span>
  </div>
</template>

<style scoped>
.proto-banner{
  background:#fef3c7;
  border-bottom:1px solid rgba(180,83,9,.2);
  padding:10px 60px;
  display:flex;align-items:center;gap:10px;
  font-size:13px;color:#b45309;font-weight:500;
}
.proto-banner svg{width:15px;height:15px;stroke:currentColor;flex-shrink:0}
.proto-banner a{color:#b45309;font-weight:700;text-underline-offset:2px}

@media(max-width:1100px){
  .proto-banner{padding:10px 32px}
}
@media(max-width:720px){
  .proto-banner{padding:10px 20px;font-size:12px}
}
</style>
