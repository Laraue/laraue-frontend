<script setup lang="ts">
  defineProps<{
    menuItems: Array<HierarchicalMenuSection>,
    rootPath: string[]
  }>()

  const { localePathFromSegments } = usePathUtil()
</script>

<template>
  <!-- DOC TREE SIDEBAR -->
  <aside class="doc-sidebar" id="docSidebar" aria-label="Documentation navigation">

    <div class="doc-sidebar-header">
      <div class="doc-set-name">
        &#128196; PdfQL
        <span class="doc-set-version">v1</span>
      </div>
    </div>

    <nav class="doc-tree" aria-label="Doc sections">

      <!-- Overview (no section, direct link) -->
      <ul class="site-sidebar-links" style="list-style:none;padding:8px 0 4px">
        <li class="doc-item">
          <nuxt-link :to="localePathFromSegments(rootPath)" id="link-overview" active-class="active">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          <span data-i18n="doc_overview">Overview</span>
        </nuxt-link></li>
      </ul>

      <div v-for="menuItem in menuItems" class="doc-section" id="sec-stages">
        <button class="doc-section-header">
          <span data-i18n="sec_stages">{{ menuItem.title }}</span>
          <span class="section-badge">{{ menuItem.children.length }}</span>
          <svg viewBox="0 0 12 12" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,4 6,8 10,4"/></svg>
        </button>
        <ul class="doc-section-items">
          <li class="doc-item" v-for="link in menuItem.children">
            <nuxt-link :to="localePathFromSegments(link.path)" active-class="active">
              <span>{{ link.title }}</span>
            </nuxt-link>
          </li>
        </ul>
      </div>

    </nav>
  </aside>
</template>

<style scoped>
aside{
  --doc-sidebar-w:260px;  /* doc tree nav width */
}
/* ══ DOC TREE SIDEBAR ══ */
.doc-sidebar{
  position:fixed;
  top:var(--nav-h);bottom:0;
  left:var(--sidebar-w);
  width:var(--doc-sidebar-w);
  z-index:90;
  background:rgba(247, 244, 238, .72);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  overflow-y:auto;
  /* subtle */
  box-shadow:2px 0 12px rgba(15,14,12,.04);
}

/* doc set header */
.doc-sidebar-header{
  padding:20px 20px 14px;
  border-bottom:1px solid var(--border);
  flex-shrink:0;
}
.doc-set-back{
  display:inline-flex;align-items:center;gap:5px;
  font-size:11px;font-weight:600;color:var(--muted);
  text-decoration:none;margin-bottom:10px;
  transition:color .15s;
}
.doc-set-back:hover{color:var(--ink)}
.doc-set-back svg{width:12px;height:12px;stroke:currentColor;flex-shrink:0}
.doc-set-name{
  font-family:var(--serif);font-size:14px;font-weight:700;
  color:var(--ink);letter-spacing:-.1px;
  display:flex;align-items:center;gap:8px;
}
.doc-set-version{
  font-size:10px;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;background:var(--cream);
  color:var(--muted);padding:2px 7px;border-radius:4px;
}

/* search within docs */
.doc-search{
  padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0;
}
.doc-search-input{
  width:100%;padding:7px 10px 7px 30px;
  border:1px solid var(--border);border-radius:7px;
  background:var(--paper);font-family:var(--sans);font-size:12px;
  color:var(--ink);outline:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%237a7469' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:9px center;
  transition:border-color .15s;
}
.doc-search-input:focus{border-color:var(--accent)}
.doc-search-input::placeholder{color:var(--muted)}

/* tree navigation */
.doc-tree{flex:1;padding:12px 0 32px;overflow-y:auto}

.doc-section{margin-bottom:2px}

.doc-section-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 16px;
  font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  color:var(--muted);cursor:pointer;
  user-select:none;
  transition:color .15s;
  border:none;background:none;width:100%;text-align:left;
  font-family:var(--sans);
}
.doc-section-header:hover{color:var(--ink)}
.doc-section-header svg{width:12px;height:12px;stroke:currentColor;transition:transform .2s;flex-shrink:0}
.doc-section.collapsed .doc-section-header svg{transform:rotate(-90deg)}

.doc-section-items{
  list-style:none;
  overflow:hidden;
  transition:max-height .22s ease;
  max-height:800px; /* open by default */
}
.doc-section.collapsed .doc-section-items{max-height:0}

.doc-item a{
  display:flex;align-items:center;gap:8px;
  padding:7px 16px 7px 28px;
  font-size:13px;font-weight:500;color:var(--muted);
  text-decoration:none;
  border-left:2px solid transparent;
  transition:color .12s,background .12s,border-color .12s;
  position:relative;
}
.doc-item a:hover{color:var(--ink);background:var(--paper)}
.doc-item a.active{
  color:var(--ink);font-weight:600;
  background:var(--accent-light);
  border-left-color:var(--accent);
}
.doc-item a .item-badge{
  margin-left:auto;font-size:9px;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;padding:1px 5px;border-radius:3px;
  background:var(--cream);color:var(--muted);flex-shrink:0;
}

/* version indicator on section header */
.section-badge{
  font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--cream);color:var(--muted);
  padding:2px 6px;border-radius:4px;margin-right:auto;margin-left:8px;
}
</style>