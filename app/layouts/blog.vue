<script setup lang="ts">
import {onMounted, ref} from "vue";
import {PathUtil} from "~/utils/PathUtil";
import {type SidebarItemRow, useBlogApi} from "~/composables/blogApi";

const sidebarArticles = ref<SidebarItemRow[]>([]);
const sidebarProjects = ref<SidebarItemRow[]>([]);
const tags = ref<CountPropertyRow[]>([]);
const documentationMenuItems = ref<MenuItem[]>([]);

const { countPropertyValues, loadMenu, loadSidebarItems } = useBlogApi();
const { locale } = useI18n()

watch(locale, () => {
  loadData();
})

onMounted(() => {
  loadData();
})

const loadData = () => {
  loadArticlesData();
  loadSidebarProjectsData();
  loadTagsData();
  loadDocumentationData();
}

const loadArticlesData = async () => {
  sidebarArticles.value = await loadSidebarItems(locale.value, "article", 3)
}

const loadSidebarProjectsData = async () => {
  sidebarProjects.value = await loadSidebarItems(locale.value,"project", 10)
}

const loadTagsData = async () => {
  tags.value = await countPropertyValues(locale.value, "tags")
}

const loadDocumentationData = async () => {
  documentationMenuItems.value = await loadMenu(locale.value, PathUtil.getPath("documentation"), 1)
}

const { t } = useI18n();
const localePath = useLocalePath();

</script>

<i18n lang="json">
{
  "en": {
    "projects": "Projects",
    "articles": "Articles",
    "documentation": "Documentation"
  },
  "ru": {
    "projects": "Проекты",
    "articles": "Статьи",
    "documentation": "Документация"
  }
}
</i18n>

<template>
  <div class="docs">
    <div class="docs-container">
      <div class="sidebar">
        <h2>
          <nuxt-link :to="localePath('/blog/projects')">{{ t('projects') }}</nuxt-link>
        </h2>
        <ul>
          <li v-for="project in sidebarProjects">
            <nuxt-link :to="localePath(`/blog/projects/${project.fileName}`)">
              {{ project.title }}
            </nuxt-link>
          </li>
        </ul>

        <h2>
          <nuxt-link :to="localePath('/blog/articles')">{{ t('articles') }}</nuxt-link>
        </h2>
        <ul>
          <li v-for="article in sidebarArticles">
            <nuxt-link :to="localePath(`/blog/articles/${article.fileName}`)">
              {{ article.title }}
            </nuxt-link>
          </li>
        </ul>

        <h2>
          <nuxt-link :to="localePath('/blog/documentation')">{{ t('documentation') }}</nuxt-link>
        </h2>
        <ul>
          <li v-for="menuItem in documentationMenuItems">
            <nuxt-link :to="localePath(`/blog/documentation/${menuItem.fileName}`)">
              {{ menuItem.title ?? menuItem.relativePath }}
            </nuxt-link>
          </li>
        </ul>
      </div>

      <div class="main-content">
        <slot />
      </div>

      <div class="right-sidebar">
        <h2>All Tags</h2>
        <div class="tag-cloud">
          <span class="tag" v-for="tag in tags" :key="tag.key">
            <nuxt-link :to="'/blog?tag=' + tag.key">
              {{ tag.key }}
              <span class="tag-count">
                {{ tag.count }}
              </span>
            </nuxt-link>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.docs {
  height: 100%;
}

.sidebar {
  background-color: #ecf0f1;
  color: white;
  padding: 20px;
}

.sidebar h2 {
  margin-bottom: 20px;
  font-size: 1.3em;
  border-bottom: 1px solid #34495e;
  padding-bottom: 10px;
}

.sidebar ul {
  list-style: none;
  margin-bottom: 30px;
}

.sidebar a:hover, .sidebar a.router-link-active{
  color: #3498db;
}

.sidebar a{
  color: #000;
}

.sidebar ul li {
  line-height: 1.0;
}

.sidebar ul li:last-child {
  border-bottom: none;
}

.sidebar ul li a {
  color: #242526;
  text-decoration: none;
  transition: color 0.3s;
}

.tag a {
  color: white;
}

.main-content {
  width: 800px;
  margin: 0 auto;
  background-color: #fff;
  padding: 30px;
}

.tag {
  background-color: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  position: relative;
}

.tag-count {
  margin-left: 5px;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 1px 5px;
  border-radius: 10px;
  font-size: 0.7em;
}

.right-sidebar {
  background-color: #ecf0f1;
  padding: 20px;
}

.right-sidebar h2 {
  margin-bottom: 20px;
  font-size: 1.3em;
  border-bottom: 1px solid #bdc3c7;
  padding-bottom: 10px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-cloud .tag {
  background-color: #3498db;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tag-cloud .tag:hover {
  background-color: #2980b9;
}

.docs-container{
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  grid-template-areas: "sidebar main tags";
  min-height: 100vh;
  grid-template-rows: auto;
}

@media screen and (max-width: 1024px) {
  .main-content {
    width: fit-content;
  }

  .docs-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto; /* Three rows */
  }

  .sidebar,
  .main-content,
  .right-sidebar {
    grid-column: 1; /* All items in first column */
    margin: 0;
    padding: 3vw;
    max-width: 94vw;
  }

  .sidebar {
    padding-top: 30px;
    order: 1; /* Top */
  }

  .main-content {
    order: 2; /* Middle */
  }

  .right-sidebar {
    order: 3; /* Bottom */
    padding-top: 30px;
    padding-bottom: 30px;
  }

  .sidebar h2 {
    border: none;
    padding-bottom: 0;
  }

  .sidebar h2,
  .sidebar ul,
  .right-sidebar{
    text-align: center;
  }

  .sidebar ul {
    text-align: center;
    margin-bottom: 30px;
  }

  .sidebar ul li {
    border: none;
    padding: 6px 0;
    text-align: center;
    margin: 0;
  }
}
</style>