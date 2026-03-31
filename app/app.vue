<script setup lang="ts">
import LFooter from "~/components/ui/LFooter.vue";
import LNav from "~/components/ui/LNav.vue";
</script>

<template>
  <LNav />
  <div class="page-layout">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <LFooter />
</template>

<i18n lang="json">
{
  "en": {
    "laraueDescription": "Laraue is an indie development organization focused on building reusable libraries and engaging projects. I'm driven by a passion for creating efficient open-source solutions and possible monetization of projects.",
    "feedbackTitle": "For inquiries or feedback, contact me on Telegram",
    "resources": "Resources"
  },
  "ru": {
    "laraueDescription": "Laraue - инди организация, сфокусированная на создании переиспользуемых библиотек и проектов. Мотивацией является любовь к созданию хорошего кода и возможная монетизация проектов.",
    "feedbackTitle": "По всем вопросам доступен в Telegram",
    "resources": "Ссылки"
  }
}
</i18n>

<style scoped>
.page-layout {
  padding-top: var(--nav-h);
  min-height: 100vh;
  position: relative;
}
</style>