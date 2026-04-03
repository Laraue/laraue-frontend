<script setup lang="ts">

import LHero from "~/components/ui/LHero.vue";
import LBlogSidebar from "~/components/docs/LBlogSidebar.vue";
import ReadTime from "~/components/docs/ReadTime.vue";
const { blogState } = useBlogState()
const { localePathFromSegments } = usePathUtil()

defineProps({
  articles: Array<Article>,
  tags: Array<Tag>,
  title: String,
  subTitle: String
})

export interface Article {
  fileName: string;
  title: string;
  description: string;
  tags: string[] | undefined;
  contentLength: number;
  path: string[] | undefined;
  contentType: string;
}

</script>

<template>
  <LHero :title="title" :subTitle="subTitle" />
  <div class="blog-tabs" role="tablist">
    <router-link :to="localePathFromSegments(item.path)" v-for="item in blogState.otherItems" active-class="active" class="blog-tab">
      {{ item.title }}
      <span class="blog-tab-count">
        {{ item.count }}
      </span>
    </router-link>
  </div>
  <!-- BLOG BODY -->
  <div class="blog-body">
    <!-- POSTS -->
    <div class="post-grid" id="postGrid" aria-live="polite">
      <nuxt-link
          v-for="article in articles"
          :to="localePathFromSegments(article.path)" class="post-card reveal">
        <div class="post-thumb type-article"></div>
        <div class="post-body">
          <div class="post-meta">
            <span class="post-type-badge" :class="[article.contentType]" data-i18n="type_article">
              {{ article.contentType }}
            </span>
            <ReadTime class="post-read-time" :content-length="article.contentLength" />
          </div>
          <div class="post-title">{{ article.title }}</div>
          <div class="post-excerpt">{{ article.description }}</div>
          <div class="post-tags">
            <span v-for="tag in article.tags" class="post-tag-chip">{{ tag }}</span>
          </div>
          <span class="post-read-link">Read &#8594;</span>
        </div>
      </nuxt-link>
    </div>
    <LBlogSidebar />
  </div>

</template>

<style scoped>
.blog-tabs{display:flex;align-items:center;gap:0;padding:0 60px;border-bottom:1px solid var(--border);background:var(--paper);position:sticky;top:var(--nav-h);z-index:50;overflow-x:auto}
.blog-tab{padding:14px 18px;font-size:13px;font-weight:600;color:var(--muted);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:var(--sans);white-space:nowrap;transition:color .15s,border-color .15s;text-decoration: none}
.blog-tab:hover{color:var(--ink)}
.blog-tab.active{color:var(--ink);border-bottom-color:var(--accent)}
.blog-tab-count{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:var(--cream);color:var(--muted);font-size:10px;font-weight:700;margin-left:6px;transition:background .15s,color .15s}
.blog-tab.active .blog-tab-count{background:var(--accent);color:#fff}
.blog-body{max-width:1060px;margin:0 auto;padding:44px 60px 80px;display:grid;grid-template-columns:1fr 210px;gap:48px;align-items:start}

.post-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}

.post-card{border:1px solid var(--border);border-radius:14px;background:#fff;overflow:hidden;text-decoration:none;color:inherit;display:flex;flex-direction:column;transition:box-shadow .2s,transform .2s,border-color .2s}
.post-card:hover{box-shadow:0 8px 32px rgba(15,14,12,.1);transform:translateY(-3px);border-color:var(--ink)}
.post-card[hidden]{display:none!important}

.post-thumb{height:5px;flex-shrink:0}
.post-thumb.type-article{background:linear-gradient(90deg,#4a7fcc,#6fa3e0)}
.post-thumb.type-project{background:linear-gradient(90deg,var(--accent),#e0572e)}
.post-thumb.type-documentation{background:linear-gradient(90deg,#43b77a,#5ed490)}

.post-body{padding:18px;flex:1;display:flex;flex-direction:column}
.post-meta{display:flex;align-items:center;gap:8px;margin-bottom:9px}
.post-type-badge{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 7px;border-radius:4px}
.post-type-badge.article{background:#e8f0fb;color:#4a7fcc}
.post-type-badge.project{background:var(--accent-light);color:var(--accent)}
.post-type-badge.documentation{background:#e6f7ee;color:#2d8a55}
.post-title{font-family:var(--serif);font-size:14px;font-weight:700;line-height:1.35;letter-spacing:-.1px;margin-bottom:7px;color:var(--ink);flex:1}
.post-excerpt{font-size:12px;color:var(--muted);line-height:1.55;margin-bottom:12px}
.post-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px}
.post-tag-chip{font-size:10px;font-weight:600;background:var(--cream);color:var(--muted);padding:2px 7px;border-radius:4px;transition:background .15s}
.post-card:hover .post-tag-chip{background:var(--border)}
.post-read-link{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--accent);transition:gap .15s;margin-top:auto}
.post-card:hover .post-read-link{gap:7px}

.post-read-time{font-size:11px;color:var(--muted)};
</style>