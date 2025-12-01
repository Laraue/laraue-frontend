<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <div class="layout">
    <div class="container">
      <div class="header">
        <div class="header-left">
          <el-menu
              class="menu"
              mode="horizontal"
              router
              :default-active="route.path">
            <el-menu-item index="/">
              Laraue Tools
            </el-menu-item>
            <el-sub-menu index="1" class="menu-links">
              <template #title>Projects</template>
              <el-sub-menu index="1-1" class="menu-links">
                <template #title>Apps</template>
                <el-menu-item index="/pdf-extractor">
                  PDF extractor
                </el-menu-item>
                <el-menu-item index="/learn-language-bot">
                  Learn Top 5k Words Bot
                </el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="1-2" class="menu-links">
                <template #title>Demonstrations</template>
                <el-menu-item index="/crawled-apartments">
                  View SPB apartments
                </el-menu-item>
              </el-sub-menu>
            </el-sub-menu>
            <el-menu-item index="/blog">
              Blog
            </el-menu-item>
          </el-menu>
        </div>
      </div>
      <div class="content">
        <NuxtLayout>
        <NuxtPage />
        </NuxtLayout>
      </div>
      <footer class="footer">
        <div class="footer-about">
          <p>Laraue is a development organization focused on building reusable libraries and engaging projects. We're driven by a passion for creating efficient open-source solutions.
            Discover the repositories and projects that showcase our dedication to innovation.
          </p>
        </div>
        <div class="footer-resources">
          <p>Resources</p>
          <a href="https://github.com/win7user10">GitHub</a>
        </div>
        <div class="footer-copyright">
          <p>For inquiries or feedback, contact the developer on Telegram: <a href="https://t.me/win7user10">@win7user10</a></p>
          <p>2025 Laraue. All rights reserved.</p>
        </div>
      </footer>
    </div>
  </div>
</template>

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
.main-page-link{
  font-size: 1.5rem;
  font-weight: 500;
}
.user-button{
  grid-column-start: 20;
}
.menu{
  display: grid;
  grid-template-columns: repeat(20, 1fr);
}
.menu-links{
  grid-column-start: 3;
  display: flex;
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