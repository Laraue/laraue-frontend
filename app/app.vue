<script setup lang="ts">
import LMenu from "~/components/ui/LMenu.vue";
const { t } = useI18n()
</script>

<template>
  <div class="layout">
    <div class="container">
      <div class="header">
        <div class="header-left">
          <l-menu />
        </div>
      </div>
      <div class="content">
        <NuxtLayout>
        <NuxtPage />
        </NuxtLayout>
      </div>
      <footer class="footer">
        <div class="footer-about">
          <p>{{ t("laraueDescription") }}</p>
        </div>
        <div class="footer-resources">
          <p>{{ t("resources") }}</p>
          <a href="https://github.com/win7user10">GitHub</a>
        </div>
        <div class="footer-copyright">
          <p>{{ t("feedbackTitle") }}: <a href="https://t.me/win7user10">@win7user10</a></p>
          <p>2026 Laraue</p>
        </div>
      </footer>
    </div>
  </div>
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
.layout{
  display: flex;
  justify-content: center;
}
.container{
  max-width: 100%;
  background: #FBF8FD;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-flow: column;
}
.content{
  flex: 1 1 auto;
  height: auto;
}
.menu-links li{
  margin: 0;
}
.footer {
  background-color: #25003a;
  color: #ddd;
  padding: 30px 10px;
  font-size: 0.9rem;
  text-align: center;
  border-top: 2px solid #3e255e;
}

.footer-resources,
.footer-copyright{
  margin-top: 3vh;
}

.footer-resources ul {
  list-style: none;
  padding: 0;
}

.footer-resources p {
  margin: 0.1vh;
  text-align: center;
}

.footer-resources li {
  margin-bottom: 5px;
}

.footer-copyright {
  margin-top: 20px;
  font-size: 0.8rem;
  align-items: center;
}

.footer-copyright p {
  text-align: center;
}
</style>