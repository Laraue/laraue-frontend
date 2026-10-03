<script setup lang="ts">

import ReadTime from "~/components/docs/ReadTime.vue";
import LContentTypeBadge from "~/components/docs/LContentTypeBadge.vue";

const props = defineProps<{
  item: ItemDetails
}>()

const { t, locale } = useI18n()
const tagLabel = useTagLabel()

// "2 октября 2026" / "October 2, 2026": the date of the file is a wall clock time, shown as it is.
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}Z`))
const localePath = useLocalePath()
const { localePathFromSegments } = usePathUtil()
const { getRouteSegments } = usePathUtil();
const breadCrumbs = computed(() => {
  const routeSegments = getRouteSegments();
  const breadcrumbs = [] as {href?: string, title: string}[];
  let currentPath = '/'

  const names: Record<string, string> = { blog: t('blog'), articles: t('articles'), projects: t('projects') }

  // The page itself is not in the trail: its title is right below.
  routeSegments.slice(0, -1).forEach((segment) => {
    breadcrumbs.push({ href: localePath(currentPath + segment), title: names[segment] ?? segment })
    currentPath = currentPath + segment + '/'
  })

  return breadcrumbs
})

// The two buttons of a phone (the left menu is not shown there): the contents and the series.
const openedPanel = ref<'toc' | 'series' | null>(null)
const togglePanel = (panel: 'toc' | 'series') => {
  openedPanel.value = openedPanel.value === panel ? null : panel
}

const seriesProgress = computed(() =>
  props.item.series
    ? t('partOf', { number: props.item.series.parts.find((part) => part.current)?.part, total: props.item.series.parts.length })
    : '')

// "Back to articles", with the word in the form the phrase needs.
const backLabel = computed(() => {
  const section = getRouteSegments()[1]
  return section === 'articles' ? t('backToArticles') : section === 'projects' ? t('backToProjects') : t('backToBlog')
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
    "series": "Series",
    "part": "Part {number}",
    "partOf": "Part {number} of {total}",
    "projectArticles": "Articles about this project",
    "readAlso": "Read also",
    "backToArticles": "Back to articles",
    "backToProjects": "Back to projects",
    "backToBlog": "Back to the blog",
    "previous": "Previous",
    "next": "Next",
    "created": "Created",
    "updated": "Updated",
    "relatedProjects": "Related projects",
    "blog": "Blog",
    "articles": "Articles",
    "projects": "Projects"
  },
  "ru": {
    "onThisPage": "На этой странице",
    "series": "Серия статей",
    "part": "Часть {number}",
    "partOf": "Часть {number} из {total}",
    "projectArticles": "Статьи об этом проекте",
    "readAlso": "Читайте также",
    "backToArticles": "Назад к статьям",
    "backToProjects": "Назад к проектам",
    "backToBlog": "Назад в блог",
    "previous": "Предыдущая",
    "next": "Следующая",
    "created": "Создано",
    "updated": "Обновлено",
    "relatedProjects": "Связанные проекты",
    "blog": "Блог",
    "articles": "Статьи",
    "projects": "Проекты"
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
        <span>{{ backLabel }}</span>
      </nuxt-link>

      <template v-if="item.innerLinks?.length > 1">
        <div class="toc-label" data-i18n="toc_label">{{ t('onThisPage') }}</div>
        <ul class="toc-list" id="tocList">
          <li v-for="link in item.innerLinks"><a :href="link.link" :id="'toc-' + link.link">{{ link.title }}</a></li>
        </ul>
      </template>

      <template v-if="item.series">
        <div class="toc-divider"></div>
        <details class="toc-series-box">
          <summary class="toc-label">{{ t('series') }} · {{ seriesProgress }}</summary>
          <div class="toc-series-title">{{ item.series.title }}</div>
          <ol class="toc-series">
            <li v-for="part in item.series.parts" :class="{ current: part.current }">
              <span v-if="part.current" aria-current="page"><b>{{ part.part }}</b>{{ part.title }}</span>
              <nuxt-link v-else :to="localePathFromSegments(part.path)"><b>{{ part.part }}</b>{{ part.title }}</nuxt-link>
            </li>
          </ol>
        </details>
      </template>

      <div class="toc-divider"></div>

      <template v-if="item.relatedProjects?.length">
        <div class="toc-related-label" data-i18n="toc_related">{{ t('relatedProjects') }}</div>
        <nuxt-link v-for="project in item.relatedProjects" :to="localePathFromSegments(project.path)" class="toc-related-link">
          <span class="toc-related-icon" aria-hidden="true">🚀</span>
          <span class="toc-related-name">{{ project.title }}</span>
        </nuxt-link>
      </template>
    </aside>

    <!-- ARTICLE -->
    <main>
      <article class="article-wrap">
        <nuxt-link :to="backAddress?.href" class="toc-back mobile">
          <svg viewBox="0 0 12 12" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="8,2 4,6 8,10"/></svg>
          <span>{{ backLabel }}</span>
        </nuxt-link>

        <!-- the contents and the series on a phone -->
        <div class="mobile-nav">
          <div class="mobile-nav-buttons">
            <button v-if="item.innerLinks?.length > 1" type="button" class="mobile-nav-button" :class="{ open: openedPanel === 'toc' }" @click="togglePanel('toc')">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
              <span>{{ t('onThisPage') }}</span>
            </button>
            <button v-if="item.series" type="button" class="mobile-nav-button series" :class="{ open: openedPanel === 'series' }" @click="togglePanel('series')">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>
              <span>{{ t('series') }} · {{ seriesProgress }}</span>
            </button>
          </div>
          <div v-if="openedPanel === 'toc' && item.innerLinks?.length > 1" class="mobile-nav-panel">
            <ul class="toc-list">
              <li v-for="link in item.innerLinks"><a :href="link.link" @click="openedPanel = null">{{ link.title }}</a></li>
            </ul>
          </div>
          <div v-if="openedPanel === 'series' && item.series" class="mobile-nav-panel">
            <div class="toc-series-title">{{ item.series.title }}</div>
            <ol class="toc-series">
              <li v-for="part in item.series.parts" :class="{ current: part.current }">
                <span v-if="part.current" aria-current="page"><b>{{ part.part }}</b>{{ part.title }}</span>
                <nuxt-link v-else :to="localePathFromSegments(part.path)"><b>{{ part.part }}</b>{{ part.title }}</nuxt-link>
              </li>
            </ol>
          </div>
        </div>

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
            <span>{{ t('created') }}</span> {{ formatDate(item.createdAtIso) }}
          </div>
          <div class="article-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.01-9.85"/></svg>
            <span>{{ t('updated') }}</span> {{ formatDate(item.updatedAtIso) }}
          </div>
        </div>


        <!-- BODY -->
        <div class="article-body">
          <div v-html="item.content"></div>
        </div><!-- /article-body -->
        <!-- ARTICLE FOOTER -->
        <div class="article-footer">
          <section v-if="item.projectArticles?.length" class="more-links">
            <h2>{{ t('projectArticles') }}</h2>
            <ul>
              <li v-for="page in item.projectArticles"><nuxt-link :to="localePathFromSegments(page.path)">{{ page.title }}</nuxt-link></li>
            </ul>
          </section>
          <section v-if="item.relatedPages?.length" class="more-links">
            <h2>{{ t('readAlso') }}</h2>
            <ul>
              <li v-for="page in item.relatedPages">
                <nuxt-link :to="localePathFromSegments(page.path)">{{ page.title }}</nuxt-link>
                <LContentTypeBadge :content-type="page.contentType" />
              </li>
            </ul>
          </section>
          <div class="article-tags">
            <nuxt-link v-for="tag in item.tags" :to="localePath({ name: 'blog', query: { tag } })" class="article-tag">{{ tagLabel(tag) }}</nuxt-link>
          </div>
          <div class="article-nav">
            <nuxt-link v-if="item.previousLink" :to="localePathFromSegments(item.previousLink.path)" class="article-nav-card previous">
              <div class="article-nav-direction" data-i18n="nav_next">&#8592;{{ t('previous') }}</div>
              <div class="article-nav-title">{{ item.previousLink.title }}</div>
            </nuxt-link>
            <nuxt-link v-if="item.nextLink" :to="localePathFromSegments(item.nextLink.path)" class="article-nav-card next">
              <div class="article-nav-direction" data-i18n="nav_next">{{ t('next') }} &#8594;</div>
              <div class="article-nav-title">{{ item.nextLink.title }}</div>
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
.toc-list li a:hover{color:var(--ink);background:rgba(16,24,40,.04)}
.toc-list li a.active{
  color:var(--ink);font-weight:600;
  border-left-color:var(--accent);
  background:rgba(53,104,212,.05);
}

.toc-divider{height:1px;background:var(--border);margin:20px 24px}

/* the contents and the series on a phone */
.mobile-nav{display:none;margin-bottom:28px}
.mobile-nav-buttons{display:flex;flex-wrap:wrap;gap:8px}
.mobile-nav-button{display:flex;align-items:center;gap:8px;background:none;border:1px solid var(--border);border-radius:6px;padding:7px 14px;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:600;color:var(--muted);transition:border-color .15s,color .15s,background .15s}
.mobile-nav-button svg{width:14px;height:14px;stroke:currentColor}
.mobile-nav-button:hover,.mobile-nav-button.open{border-color:var(--ink);color:var(--ink)}
.mobile-nav-button.series{color:var(--accent);border-color:rgba(53,104,212,.3);background:var(--accent-light)}
.mobile-nav-button.series.open{border-color:var(--accent)}
.mobile-nav-panel{margin-top:12px;background:var(--cream);border:1px solid var(--border);border-radius:10px;padding:14px 0}
.mobile-nav-panel .toc-list li a{padding:7px 20px;font-size:13px}
.mobile-nav-panel .toc-series li a,.mobile-nav-panel .toc-series li > span{padding:6px 20px;font-size:13px}
.mobile-nav-panel .toc-series-title{padding:0 20px;margin-bottom:8px}

/* series in the menu: a closed block with the progress, opened on a click */
.toc-series-box summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;color:var(--accent);opacity:1;margin-bottom:0}
.toc-series-box summary::-webkit-details-marker{display:none}
.toc-series-box summary::after{content:'';flex:none;width:6px;height:6px;margin-right:2px;border-right:1.8px solid currentColor;border-bottom:1.8px solid currentColor;transform:translateY(-2px) rotate(45deg);transition:transform .15s}
.toc-series-box[open] summary{margin-bottom:8px}
.toc-series-box[open] summary::after{transform:translateY(1px) rotate(-135deg)}
.toc-series-title{font-size:12px;font-weight:700;line-height:1.35;color:var(--ink);padding:0 24px;margin-bottom:8px}
.toc-series{list-style:none;margin:0;padding:0}
.toc-series li a,.toc-series li > span{display:flex;align-items:flex-start;gap:8px;padding:5px 24px;font-size:12px;line-height:1.4;color:var(--muted);text-decoration:none;border-left:2px solid transparent;transition:color .15s,background .15s}
.toc-series li a:hover{color:var(--ink);background:rgba(16,24,40,.04)}
.toc-series b{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-top:-1px;border-radius:50%;border:1px solid rgba(53,104,212,.3);background:var(--color-surface);color:var(--accent);font-size:10px;font-weight:700}
.toc-series .current > span{color:var(--ink);font-weight:700;border-left-color:var(--accent);background:rgba(53,104,212,.05)}
.toc-series .current b{background:var(--accent);border-color:var(--accent);color:#fff}

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
.toc-related-link:hover{background:rgba(16,24,40,.04)}
.toc-related-icon{flex:none}
.toc-related-name{min-width:0;overflow-wrap:anywhere}

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
/* the series of articles: the brand blue, the same accent bar as a quote */
.series-box{margin:0 0 40px;padding:20px 24px 14px;border:1px solid rgba(53,104,212,.18);border-left:4px solid var(--accent);border-radius:0 12px 12px 0;background:var(--accent-light);max-width:680px}
.series-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
.series-label{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.series-label::after{content:'';width:32px;height:1px;background:var(--accent);opacity:.5}
.series-progress{font-size:11px;font-weight:700;color:var(--accent);background:var(--color-surface);border:1px solid rgba(53,104,212,.2);padding:2px 9px;border-radius:999px;white-space:nowrap}
.series-title{font-family:var(--serif);font-size:17px;font-weight:800;line-height:1.3;letter-spacing:-.2px;color:var(--ink);margin-bottom:14px}
.series-list{list-style:none;margin:0;padding:0;font-size:13.5px;line-height:1.45}
.series-list li{display:flex;align-items:flex-start;gap:12px;padding:6px 0}
.series-part{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(--color-surface);border:1px solid rgba(53,104,212,.25);color:var(--accent);font-size:11px;font-weight:700;margin-top:-1px}
.series-name{color:var(--ink);text-decoration:none;font-weight:500}
a.series-name:hover{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.series-list .current .series-part{background:var(--accent);border-color:var(--accent);color:#fff}
.series-list .current .series-name{color:var(--accent);font-weight:700}
.more-links{margin-bottom:32px}
.more-links h2{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
.more-links ul{list-style:none;margin:0;padding:0}
/* the title takes the room, the label of the type stays in its own column */
.more-links li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px 16px;padding:5px 0;font-size:14px;line-height:1.4}
.more-links a{color:var(--ink);font-weight:600;text-decoration:none}
.more-links a:hover{color:var(--accent)}
.article-body{
  font-size:17px;line-height:1.8;color:var(--color-text);
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

.article-body :deep(p){margin-bottom:16px}
.article-body :deep(p:last-child){margin-bottom:0}

.article-body :deep(strong){font-weight:600;color:var(--ink)}
.article-body :deep(em){font-style:italic}
.article-body :deep(a){color:var(--accent);text-decoration:underline;text-decoration-color:rgba(53,104,212,.3);text-underline-offset:3px;transition:text-decoration-color .15s}
.article-body :deep(a:hover){text-decoration-color:var(--accent)}

/* ordered/unordered lists */
.article-body :deep(ol),.article-body :deep(ul){
  padding-left:28px;margin-bottom:16px;
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
/* status badges (version, downloads, license) in a row */
.article-body :deep(img.badge){
  display:inline-block;height:20px;border:0;border-radius:4px;
  margin:0 6px 6px 0;vertical-align:middle;
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

.article-body :deep(table) {
  border-collapse: separate;
  border-spacing: 0;
  margin: 28px 0 16px;
  text-align: left;
}

.article-body :deep(th),
.article-body :deep(td) {
  padding: 3px;
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
.article-tag:hover{background:var(--color-accent);color:#fff;border-color:var(--color-accent)}

.article-nav{
  display:grid;grid-template-columns:1fr 1fr;gap:16px;
}
.article-nav-card{
  border:1px solid var(--border);border-radius:12px;
  padding:18px 20px;text-decoration:none;color:inherit;
  transition:border-color .2s,box-shadow .2s,transform .15s;
  background:var(--color-surface);
}
.article-nav-card:hover{border-color:var(--ink);box-shadow:0 4px 20px rgba(16,24,40,.09);transform:translateY(-2px)}
.article-nav-direction{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.article-nav-title{font-size:14px;font-weight:600;color:var(--ink);line-height:1.35}
.article-nav-card.previous{grid-column:1}
.article-nav-card.next{grid-column:2;text-align:right}

@media(max-width:1000px){
  .article-wrap{padding:44px 48px 80px}
}

@media(max-width:760px){
  .mobile-nav{display:block}
  .toc-back.mobile { display:inline-flex; }
  .page-layout{display: block;padding-top: 0;}
  .toc-sidebar{display:none}
  .article-wrap{padding:32px 22px 60px}
  .article-body{font-size:16px}
  .article-nav{grid-template-columns:1fr}
}
</style>