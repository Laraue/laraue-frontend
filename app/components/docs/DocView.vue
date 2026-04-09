<script setup lang="ts">

import type {ItemDetails} from "~/composables/blogApi";
import ReadTime from "~/components/docs/ReadTime.vue";
import LContentTypeBadge from "~/components/docs/LContentTypeBadge.vue";
import LMobileToc from "~/components/docs/LMobileToc.vue";

defineProps<{
  item: ItemDetails
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { localePathFromSegments } = usePathUtil()
const { getRouteSegments } = usePathUtil();
const breadCrumbs = computed(() => {
  const routeSegments = getRouteSegments();
  const breadcrumbs = [] as {href?: string, title: string}[];
  let currentPath = '/'

  routeSegments.forEach(segment => {
    breadcrumbs.push({ href: segment == 'documentation' ? undefined : localePath(currentPath + segment), title: segment })
    currentPath = currentPath + segment + '/'
  })

  return breadcrumbs
})

const backAddress = computed(() => {
  const previous = breadCrumbs.value.at(1)
  if (!previous?.href)
    return breadCrumbs.value.at(0)
  return previous;
})

</script>

<i18n lang="json">
{
  "en": {
    "onThisPage": "On this page",
    "backTo": "Back to",
    "previous": "Previous",
    "next": "Next",
    "created": "Created",
    "updated": "Updated",
    "relatedProjects": "Related projects"
  },
  "ru": {
    "onThisPage": "На этой странице",
    "backTo": "Назад к",
    "previous": "Предыдущая",
    "next": "Следующая",
    "created": "Создано",
    "updated": "Обновлено",
    "relatedProjects": "Связанные проекты"
  }
}
</i18n>

<template>
  <!-- ══ PAGE ══ -->
  <div class="page-layout">

    <!-- TOC SIDEBAR -->
    <aside class="toc-sidebar" aria-label="Table of contents">
      <nuxt-link :to="backAddress?.href" class="toc-back">
        <svg viewBox="0 0 12 12" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="8,2 4,6 8,10"/></svg>
        <span>{{ t('backTo') }} {{ backAddress?.title }}</span>
      </nuxt-link>

      <template v-if="item.innerLinks?.length > 1">
        <div class="toc-label" data-i18n="toc_label">{{ t('onThisPage') }}</div>
        <ul class="toc-list" id="tocList">
          <li v-for="link in item.innerLinks"><a :href="link.link" :id="'toc-' + link.link">{{ link.title }}</a></li>
        </ul>
      </template>

      <div class="toc-divider"></div>

      <template v-if="item.projects">
        <div class="toc-related-label" data-i18n="toc_related">{{ t('relatedProjects') }}</div>
        <nuxt-link v-for="project in item.projects" :to="localePath('/blog/projects/' + project)" class="toc-related-link">
          🚀 {{ project }}
          <span class="toc-related-badge" data-i18n="badge_project">project</span>
        </nuxt-link>
      </template>
    </aside>

    <!-- ARTICLE -->
    <main>
      <article class="article-wrap">
        <nuxt-link :to="backAddress?.href" class="toc-back mobile">
          <svg viewBox="0 0 12 12" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="8,2 4,6 8,10"/></svg>
          <span>{{ t('backTo') }} {{ backAddress?.title }}</span>
        </nuxt-link>

        <!-- mobile TOC toggle -->
        <LMobileToc :title="t('onThisPage')" v-if="item.innerLinks?.length > 1">
          <li v-for="link in item.innerLinks">
            <a :href="link.link">
              {{ link.title }}
            </a>
          </li>
        </LMobileToc>

        <!-- HEADER -->
        <nav class="article-breadcrumb" aria-label="Breadcrumb">
          <template v-for="(breadcrumb, i) in breadCrumbs">
            <router-link v-if="breadcrumb.href" :to="breadcrumb.href">{{ breadcrumb.title }}</router-link>
            <p v-else>{{ breadcrumb.title }}</p>
            <span v-if="i < breadCrumbs.length - 1" class="article-breadcrumb-sep">&#8250;</span>
          </template>
        </nav>

        <div class="article-type-badge">
          <LContentTypeBadge :content-type="item.contentType" />
        </div>

        <h1 class="article-title">{{ item.title }}</h1>

        <div class="article-meta">
          <div class="article-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <ReadTime :contentLength="item.length" />
          </div>
          <div class="article-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span data-i18n="created">Created</span> {{ item.createdAt }}
          </div>
          <div class="article-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.01-9.85"/></svg>
            <span data-i18n="updated">Updated</span> {{ item.updatedAt }}
          </div>
        </div>

        <!-- BODY -->
        <div class="article-body">
          <div v-html="item.content"></div>
        </div><!-- /article-body -->
        <!-- ARTICLE FOOTER -->
        <div class="article-footer">
          <div class="article-tags">
            <nuxt-link v-for="tag in item.tags" :to="'/blog?tag=' + tag" class="article-tag">{{ tag }}</nuxt-link>
          </div>
          <div class="article-nav">
            <nuxt-link v-if="item.previous" :to="localePathFromSegments(item.previous.path)" class="article-nav-card next">
              <div class="article-nav-direction" data-i18n="nav_next">&#8592;{{ t('previous') }}</div>
              <div class="article-nav-title">{{ item.previous.title }}</div>
            </nuxt-link>
            <nuxt-link v-if="item.next" :to="localePathFromSegments(item.next.path)" class="article-nav-card next">
              <div class="article-nav-direction" data-i18n="nav_next">{{ t('next') }} &#8594;</div>
              <div class="article-nav-title">{{ item.next.title }}</div>
            </nuxt-link>
          </div>
        </div>

      </article>
    </main>
  </div>
</template>

<style scoped>
/* ══ PAGE LAYOUT ══ */
.page-layout{
  display:grid;
  /* TOC | article | right gutter */
  grid-template-columns:var(--toc-w) 1fr;
  padding-top:var(--nav-h);
  min-height:100vh;
  max-width:1200px;
  margin:0 auto;
  gap:0;
}

/* ══ TOC SIDEBAR ══ */
.toc-sidebar{
  position:sticky;
  top:var(--nav-h);
  height:calc(100vh - var(--nav-h));
  overflow-y:auto;
  padding:40px 0 40px 0;
  border-right:1px solid var(--border);
  flex-shrink:0;
}

.toc-back{
  display:inline-flex;align-items:center;gap:6px;
  font-size:11px;font-weight:700;letter-spacing:.04em;
  color:var(--muted);text-decoration:none;
  padding:0 24px;margin-bottom:24px;
  transition:color .15s;
}
.toc-back:hover{color:var(--ink)}
.toc-back svg{width:12px;height:12px;stroke:currentColor;flex-shrink:0}

.toc-back.mobile {
  padding: 0;
  display: none;
}

.toc-label{
  font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  color:var(--muted);opacity:.6;padding:0 24px;margin-bottom:8px;
}

.toc-list{list-style:none}
.toc-list li a{
  display:block;padding:6px 24px;
  font-size:12px;font-weight:500;color:var(--muted);
  text-decoration:none;line-height:1.4;
  border-left:2px solid transparent;
  transition:color .15s,background .15s,border-color .15s;
}
.toc-list li a:hover{color:var(--ink);background:rgba(15,14,12,.04)}
.toc-list li a.active{
  color:var(--ink);font-weight:600;
  border-left-color:var(--accent);
  background:rgba(200,75,47,.05);
}

.toc-divider{height:1px;background:var(--border);margin:20px 24px}

/* related projects */
.toc-related-label{
  font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  color:var(--muted);opacity:.6;padding:0 24px;margin-bottom:8px;
}
.toc-related-link{
  display:flex;align-items:center;gap:8px;
  padding:8px 24px;font-size:12px;font-weight:600;
  color:var(--ink);text-decoration:none;
  transition:background .15s;
}
.toc-related-link:hover{background:rgba(15,14,12,.04)}
.toc-related-badge{
  font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--accent-light);color:var(--accent);
  padding:2px 6px;border-radius:4px;
}

/* progress bar */
.reading-progress{
  position:fixed;top:var(--nav-h);left:0;right:0;height:2px;
  background:var(--border);z-index:200;
}
.reading-progress-bar{
  height:100%;background:var(--accent);width:0%;
  transition:width .1s linear;
}

/* ══ ARTICLE ══ */
.article-wrap{
  padding:52px 72px 100px;
  min-width:0; /* prevent overflow */
}

/* article header */
.article-breadcrumb{
  display:flex;align-items:center;gap:6px;
  font-size:12px;color:var(--muted);margin-bottom:24px;flex-wrap:wrap;
}
.article-breadcrumb a{color:var(--muted);text-decoration:none;transition:color .15s}
.article-breadcrumb a:hover{color:var(--ink)}
.article-breadcrumb-sep{color:var(--border)}
.article-breadcrumb span{color:var(--ink);font-weight:600}

.article-type-badge{
  display:inline-flex;
  font-size:11px;
  font-weight:700;
  margin-bottom:20px;
}

.article-title{
  font-family:var(--serif);
  font-size:clamp(28px,3.5vw,46px);
  font-weight:800;line-height:1.1;
  letter-spacing:-.5px;
  color:var(--ink);
  margin-bottom:20px;
}

.article-meta{
  display:flex;align-items:center;gap:20px;flex-wrap:wrap;
  padding-bottom:28px;border-bottom:1px solid var(--border);
  margin-bottom:48px;
}
.article-meta-item{
  display:flex;align-items:center;gap:6px;
  font-size:13px;color:var(--muted);
}
.article-meta-item svg{width:14px;height:14px;stroke:currentColor;flex-shrink:0}

/* ══ ARTICLE BODY ══ */
.article-body{
  font-size:17px;line-height:1.8;color:#2a2725;
  font-weight:300;
  max-width:680px;
}

.article-body :deep(h2){
  font-family:var(--serif);
  font-size:clamp(20px,2.5vw,28px);
  font-weight:700;line-height:1.2;
  letter-spacing:-.3px;
  color:var(--ink);
  margin:56px 0 18px;
  padding-top:8px; /* scroll-margin compensation */
  scroll-margin-top:calc(var(--nav-h) + 24px);
}
/* first h2 no top margin */
.article-body :deep(h2:first-child){margin-top:0}

.article-body :deep(h3),.article-body :deep(h4){
  font-family:var(--serif);
  font-size:18px;font-weight:700;
  color:var(--ink);letter-spacing:-.2px;
  margin:36px 0 12px;
  scroll-margin-top:calc(var(--nav-h) + 24px);
}
.article-body :deep(h4){font-size:15px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}

.article-body :deep(p){margin-bottom:22px}
.article-body :deep(p:last-child){margin-bottom:0}

.article-body :deep(strong){font-weight:600;color:var(--ink)}
.article-body :deep(em){font-style:italic}
.article-body :deep(a){color:var(--accent);text-decoration:underline;text-decoration-color:rgba(200,75,47,.3);text-underline-offset:3px;transition:text-decoration-color .15s}
.article-body :deep(a:hover){text-decoration-color:var(--accent)}

/* ordered/unordered lists */
.article-body :deep(ol),.article-body :deep(ul){
  padding-left:28px;margin-bottom:22px;
}
.article-body :deep(li){margin-bottom:8px;line-height:1.7}
.article-body :deep(ol){counter-reset:item}
.article-body :deep(ol>li){display:block;position:relative;padding-left:8px}
.article-body :deep(ol>li::before){
  content:counter(item,decimal)".";
  counter-increment:item;
  position:absolute;left:-28px;
  font-weight:700;color:var(--accent);font-size:14px;
}

/* inline code */
.article-body :deep(code){
  font-family:var(--mono);font-size:.85em;
  background:var(--cream);border:1px solid var(--border);
  padding:1px 5px;border-radius:4px;color:var(--ink);
}

/* code blocks */
.article-body :deep(pre){
  background:var(--ink);
  border-radius:12px;
  padding:28px 32px;
  margin:28px 0;
  overflow-x:auto;
  position:relative;
}
.article-body :deep(pre code){
  font-family:var(--mono);font-size:13px;line-height:1.75;
  background:none;border:none;padding:0;
  color:#d4cfca;white-space:pre;
}

/* images */
.article-body :deep(img){
  max-width:100%;
  border-radius:10px;
  border:1px solid var(--border);
  display:block;
}
.article-body :deep(figure){margin:32px 0}
.article-body :deep(figcaption){
  font-size:13px;color:var(--muted);text-align:center;
  margin-top:10px;font-style:italic;
}

/* step heading callout */
.article-body :deep(h4.step){
  display:flex;align-items:center;gap:10px;
  font-size:14px;font-weight:700;text-transform:none;
  letter-spacing:0;color:var(--ink);
  background:var(--cream);border:1px solid var(--border);
  border-left:4px solid var(--accent);
  border-radius:0 8px 8px 0;
  padding:10px 16px;margin:28px 0 16px;
}

/* blockquote */
.article-body :deep(blockquote){
  border-left:3px solid var(--accent);
  padding:16px 20px;margin:28px 0;
  background:var(--accent-light);border-radius:0 8px 8px 0;
  font-style:italic;color:var(--muted);
}

/* ══ ARTICLE FOOTER ══ */
.article-footer{
  max-width:680px;
  margin-top:64px;
  padding-top:40px;
  border-top:1px solid var(--border);
}

.article-tags{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:36px}
.article-tag{
  font-size:12px;font-weight:600;
  background:var(--cream);color:var(--muted);
  border:1px solid var(--border);
  padding:4px 12px;border-radius:6px;
  text-decoration:none;
  transition:background .15s,color .15s,border-color .15s;
}
.article-tag:hover{background:var(--ink);color:var(--paper);border-color:var(--ink)}

.article-nav{
  display:grid;grid-template-columns:1fr 1fr;gap:16px;
}
.article-nav-card{
  border:1px solid var(--border);border-radius:12px;
  padding:18px 20px;text-decoration:none;color:inherit;
  transition:border-color .2s,box-shadow .2s,transform .15s;
  background:#fff;
}
.article-nav-card:hover{border-color:var(--ink);box-shadow:0 4px 20px rgba(15,14,12,.09);transform:translateY(-2px)}
.article-nav-direction{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.article-nav-title{font-size:14px;font-weight:600;color:var(--ink);line-height:1.35}
.article-nav-card.next{text-align:right}

@media(max-width:1000px){
  .article-wrap{padding:44px 48px 80px}
}

@media(max-width:760px){
  .toc-back.mobile { display:inline-flex; }
  .page-layout{display: block;padding-top: 0;}
  .toc-sidebar{display:none}
  .article-wrap{padding:32px 22px 60px}
  .article-body{font-size:16px}
  .article-nav{grid-template-columns:1fr}
}
</style>