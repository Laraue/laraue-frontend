<script setup lang="ts">
import LMobileToc from "~/components/docs/LMobileToc.vue";

const { localePathFromSegments } = usePathUtil()
const { loadMenu, getItemMeta } = useBlogApi()
const { locale } = useI18n();
const route = useRoute();
const segments = route.params.id as string[]
const rootPath = ["blog", "documentation", segments[0]!]
const menuItems = await loadMenu(locale.value, rootPath);
const item = await getItemMeta(locale.value, rootPath);
</script>

<template>
  <NuxtLayout name="default">
    <DocsSidebar :rootPath="rootPath" :menuItems="menuItems" :title="item.title" :icon="item.icon" />
    <div class="mobile-toc">
      <LMobileToc full-width-button title="Documentation Navigation" style="">
        <li class="mobile-toc-li" v-for="menuItem in menuItems">
          <span class="doc-section-header">{{ menuItem.title }}</span>
          <ul class="doc-section-items">
            <li class="doc-item" v-for="link in menuItem.children">
              <nuxt-link :to="localePathFromSegments(link.path)" active-class="active">
                <span>{{ link.title }}</span>
              </nuxt-link>
            </li>
          </ul>
        </li>
      </LMobileToc>
    </div>
    <slot />
  </NuxtLayout>
</template>

<style scoped>
  .mobile-toc { padding: 32px 22px 0 22px;}
  .mobile-toc-li { margin-bottom: 5px;}
  .doc-section-items { list-style: none;overflow: hidden;}
  .doc-section-header { padding: 8px 16px;font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); display: inline-block;}
  .doc-item a { padding: 7px 16px 7px 28px; font-weight: 500; font-size: 13px;text-decoration: none;gap: 8px; color: var(--muted); }
  .doc-item a.active {
    color: var(--ink);
    font-weight: 600;
    background: var(--accent-light);
    border-left-color: var(--accent);
  }
</style>