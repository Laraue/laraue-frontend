<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'markdown'">
      <rect x="3" y="5" width="18" height="14" rx="2.5"/>
      <path d="M6.5 15V9l2.75 3 2.75-3v6"/>
      <path d="M15.5 9.5v5M13.5 12.5l2 2.5 2-2.5"/>
    </template>
    <template v-else-if="name === 'apartments'">
      <path d="M4 21V10.2L12 4l8 6.2V21"/>
      <path d="M9.5 21v-6h5v6"/>
      <path d="M9.5 12.2h.01M14.5 12.2h.01"/>
    </template>
    <template v-else-if="name === 'board'">
      <rect x="4.5" y="4" width="15" height="17" rx="2.5"/>
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z"/>
      <path d="M8 11.5h8M8 15h8M8 18.5h4.5"/>
    </template>
    <template v-else-if="name === 'translate'">
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M3.5 12h17"/>
      <path d="M12 3.5c2.25 2.4 3.4 5.3 3.4 8.5s-1.15 6.1-3.4 8.5c-2.25-2.4-3.4-5.3-3.4-8.5S9.75 5.9 12 3.5Z"/>
    </template>
    <template v-else-if="name === 'bot'">
      <rect x="5" y="8.5" width="14" height="10.5" rx="3"/>
      <path d="M12 8.5V5.3"/>
      <circle cx="12" cy="4.2" r="1.05" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="13.5" r="1.05" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="13.5" r="1.05" fill="currentColor" stroke="none"/>
      <path d="M9 16.8h6"/>
      <path d="M2.7 13v3M21.3 13v3"/>
    </template>
    <template v-else-if="name === 'pdf'">
      <path d="M7 3h6.5L18 7.5V21H7Z"/>
      <path d="M13.5 3v4.5H18"/>
      <path d="M12 12v5.2M9.7 14.7 12 17l2.3-2.3"/>
    </template>
    <template v-else-if="name === 'lock'">
      <rect x="5" y="11" width="14" height="9" rx="2.2"/>
      <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
      <circle cx="12" cy="15.2" r="1.15" fill="currentColor" stroke="none"/>
    </template>
    <template v-else-if="name === 'tools'">
      <path d="M4 7h10M17 7h3M4 12h4M11 12h9M4 17h13"/>
      <circle cx="14" cy="7" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="7" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="16.5" cy="17" r="1.5" fill="currentColor" stroke="none"/>
    </template>
    <template v-else-if="name === 'chat'">
      <path d="M4 5h16v11H9l-4 4v-4H4Z"/>
      <path d="M8 9h8M8 12.5h5"/>
    </template>
    <template v-else-if="name === 'tag'">
      <path d="M12.6 3H5a2 2 0 0 0-2 2v7.6a2 2 0 0 0 .59 1.41l8 8a2 2 0 0 0 2.82 0l6.6-6.6a2 2 0 0 0 0-2.82l-8-8A2 2 0 0 0 12.6 3Z"/>
      <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/>
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21Z"/>
      <circle cx="12" cy="9.5" r="2.4"/>
    </template>
    <template v-else-if="name === 'gear'">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/>
    </template>
    <template v-else-if="name === 'partners'">
      <circle cx="9" cy="12" r="5"/>
      <circle cx="15" cy="12" r="5"/>
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="10.5" cy="10.5" r="6.5"/>
      <path d="M15.5 15.5 21 21"/>
    </template>
    <template v-else-if="name === 'leaf'">
      <path d="M20 4S13 3 8 8s-4 12-4 12 9 1 12-4 4-12 4-12Z"/>
      <path d="M5 19 12 12"/>
    </template>
    <template v-else-if="name === 'mail'">
      <rect x="3" y="6" width="18" height="13" rx="2.2"/>
      <path d="M4 7.5 12 13l8-5.5"/>
    </template>
    <template v-else-if="name === 'folder'">
      <path d="M4 7.2A2.2 2.2 0 0 1 6.2 5h3.6l2 2.5h6a2.2 2.2 0 0 1 2.2 2.2V17a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 17Z"/>
    </template>
    <template v-else-if="name === 'sparkle'">
      <path d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2Z"/>
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z"/>
    </template>
    <template v-else-if="name === 'phone'">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5"/>
      <path d="M11 19h2"/>
    </template>
    <template v-else-if="name === 'dollar'">
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M12 7.5v9M15 9.7c0-1.2-1.3-2.2-3-2.2s-3 .9-3 2.1c0 1.3 1.2 1.8 3 2.1 1.9.3 3 .9 3 2.2 0 1.2-1.3 2.1-3 2.1s-3-1-3-2.2"/>
    </template>
    <template v-else-if="name === 'check'">
      <path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>
    </template>
  </svg>
</template>

<style scoped>
.nav-icon-svg{width:16px;height:16px;flex-shrink:0}
</style>
