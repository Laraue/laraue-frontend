<script setup lang="ts">
import LMainContent from "~/components/ui/LMainContent.vue";
import LLandingIntro from "~/components/landins/LLandingIntro.vue";
import LActionButton from "~/components/landins/LActionButton.vue";
import LPlatformBadge from "~/components/landins/LPlatformBadge.vue";
import LSteps from "~/components/landins/LSteps.vue";
import LSection from "~/components/landins/LSection.vue";
import LCallToAction from "~/components/landins/LCallToAction.vue";
import {defineAggregateRating, defineOffer, defineSoftwareApp, useSchemaOrg} from "@unhead/schema-org/vue";

const { t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: t('seoTitle'),
  ogTitle: t('seoTitle'),
  description: t('seoDescription'),
  ogType: "website",
})

useSchemaOrg([
  defineSoftwareApp({
    name: t('seoTitle'),
    description: t('seoDescription'),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Browser",
    offers: [
      defineOffer({
        price: 0,
        priceCurrency: "USD",
        description: 'Unlimited application usage'
      })
    ],
  })
])
</script>

<i18n lang="json">
{
  "en": {
    "seoTitle": "AI-Ranked SPB Apartments",
    "seoDescription": "The Cian and Avito advertisements aggregator that automatically rank renovations",
    "sec_overview": "Overview",
    "sec_how": "How it works",
    "sec_tech": "Tech stack",
    "sec_article": "Article",
    "proto_banner": "This is a prototype / experiment — a personal project built to explore AI-powered apartment search. Data is for Saint Petersburg, Russia.",
    "hero_eyebrow": "AI Apartments Aggregator",
    "hero_title": "Find apartments\nranked by AI photo quality",
    "hero_sub": "An experimental tool that crawls real estate listings, aggregates them in one place, and uses a local AI model to rank apartments by how good their photos look — saving hours of manual browsing.",
    "hero_cta_open": "Open App →",
    "hero_cta_read": "Read the story",
    "mockup_title": "AI Apartments — St. Petersburg",
    "mockup_search": "Search listings…",
    "f_all": "All",
    "f_1room": "1 room",
    "f_2room": "2 rooms",
    "f_sort": "▼ AI Score",
    "lm1": "Nevsky, 2 rooms, 54 m²",
    "lm2": "Vasileostrovsk, 1 room",
    "lm3": "Primorsky, 1 room",
    "lm4": "Kolpino, 2 rooms",
    "lm_ai_note": "Ranked by Ollama vision model — photo quality score 0–10",
    "how_label": "Under the hood",
    "how_title": "How the pipeline works",
    "how_sub": "Four automated stages from crawl to ranked results, running locally with no external API dependencies.",
    "step1t": "Crawl listings",
    "step1d": "The Laraue.Crawler library scrapes real estate sites, handles JS rendering, and stores raw listing data into PostgreSQL.",
    "step2t": "Download photos",
    "step2d": "For each listing, all available photos are fetched and stored locally, ready for AI analysis.",
    "step3t": "AI photo scoring",
    "step3d": "A local Ollama vision model analyzes each photo and rates it 0–10. The listing score is averaged across all its photos.",
    "step4t": "Browse & filter",
    "step4d": "Results surface in the web UI — sort by AI score, filter by rooms, price, district. Skip past badly photographed listings instantly.",
    "tech_label": "Tech stack",
    "tech_title": "Built with open-source tools",
    "tech_sub": "Everything runs locally — no paid APIs, no cloud dependencies.",
    "tc1": "Locally-hosted LLM runner. The project uses a vision model to evaluate apartment photo quality and return a numeric score without sending data to the cloud.",
    "tc2": "The in-house C# crawler library powering the data collection. Supports static HTML and JavaScript-rendered pages via PuppeteerSharp.",
    "tc3": "Backend API written in C# with ASP.NET Core. Listing data and AI scores are persisted in PostgreSQL, served to the React frontend.",
    "tc_learn": "Learn more →",
    "tc_project": "View project →",
    "tc_article": "Read the article →",
    "art_label": "The full story",
    "art_title": "36 minutes of reading,\nmonths of building",
    "art_sub": "The blog article covers every mistake, dead end, and breakthrough — from the initial idea to a working AI photo-ranking pipeline.",
    "art_cta": "Read the article",
    "art_card_title": "How I tried to rank apartments based on their photos",
    "art_card_excerpt": "A story about how a system for finding the perfect apartment was created — from a simple idea through crawling, photo storage, and local AI scoring with Ollama.",
    "art_read": "Read full article →",
    "type_article": "Article",
    "oss_label": "Open source",
    "oss_title": "The crawler library is public",
    "oss_sub": "The Laraue.Crawler library used to build this project is open-source on GitHub — reusable for any web scraping project in .NET.",
    "oss_card_desc": "A highly customizable C# crawler library with support for static HTML (AngleSharp) and JavaScript-rendered pages (PuppeteerSharp). Schema-based extraction, async pipelines, and proxy support.",
    "view_github": "View on GitHub",
    "cta_label": "Experiment in progress",
    "cta_title": "See AI-ranked\napartments live",
    "cta_sub": "Browse the current snapshot of Saint Petersburg listings, sorted by AI photo quality. A prototype — but a working one."
  },
  "ru": {
    "seoTitle": "AI-ранжированные квартиры в СПБ",
    "seoDescription": "Агрегатор объявлений с Cian и Avito с автоматической оценкой ремонта",
    "sec_overview": "Обзор",
    "sec_how": "Как это работает",
    "sec_tech": "Технологии",
    "sec_article": "Статья",
    "proto_banner": "Это прототип / эксперимент — пет проект для изучения АИ-поиска квартир. Данные по Санкт-Петербургу.",
    "hero_eyebrow": "AI-агрегатор квартир",
    "hero_title": "Находите квартиры,\nоценённые AI по фото",
    "hero_sub": "Экспериментальный инструмент: автоматически собирает объявления с сайтов недвижимости, оценивает фото локальной AI-моделью и ранжирует результаты.",
    "hero_cta_open": "Открыть приложение →",
    "hero_cta_read": "Читать статью",
    "mockup_title": "AI квартиры — Санкт-Петербург",
    "mockup_search": "Поиск…",
    "f_all": "Все",
    "f_1room": "1 комн.",
    "f_2room": "2 комн.",
    "f_sort": "▼ AI балл",
    "lm1": "Невский, 2-к, 54 м²",
    "lm2": "Василеостров, 1-к",
    "lm3": "Приморский, 1-к",
    "lm4": "Колпино, 2-к",
    "lm_ai_note": "AI-ранжирование через Ollama — оценка фото 0–10",
    "how_label": "Открытый экспиремент",
    "how_title": "Как работает система",
    "how_sub": "Четыре автоматизированных этапа — без использования внешних API.",
    "step1t": "Сбор объявлений",
    "step1d": "Библиотека Laraue.Crawler скрейпит сайты недвижимости и сохраняет данные в PostgreSQL.",
    "step2t": "Загрузка фото",
    "step2d": "Для каждого объявления загружаются все доступные фотографии для дальнейшего анализа.",
    "step3t": "AI-оценка фото",
    "step3d": "Локальная vision-модель Ollama анализирует каждое фото и выставляет оценку 0–10.",
    "step4t": "Просмотр и фильтр",
    "step4d": "Результаты в UI — сортировка по AI-лценке ремонта, фильтры по комнатности, цене, району.",
    "tech_label": "Технологии",
    "tech_title": "Собрано на open-source библиотеках",
    "tech_sub": "Запускается локально — без платных API.",
    "tc1": "Локальный запуск языковых моделей. Vision-модель оценивает фото без отправки данных в облако.",
    "tc2": "Собственная C#-библиотека для сбора данных. Поддерживает статические и JS-страницы через PuppeteerSharp.",
    "tc3": "Backend на ASP.NET Core. Данные хранятся в PostgreSQL, отдаются через REST API.",
    "tc_learn": "Узнать больше →",
    "tc_project": "Смотреть проект →",
    "tc_article": "Читать статью →",
    "art_label": "Полная история",
    "art_title": "36 минут чтения,\nмесяцы разработки",
    "art_sub": "Статья охватывает каждую ошибку и открытие — от идеи до работающего AI-ранжирования.",
    "art_cta": "Читать статью",
    "art_card_title": "Как я пытался ранжировать квартиры по фотографиям",
    "art_card_excerpt": "История создания системы поиска идеальной квартиры — от идеи до локального AI-скоринга через Ollama.",
    "art_read": "Читать статью целиком →",
    "type_article": "Статья",
    "oss_label": "Open source",
    "oss_title": "Библиотека краулера открыта",
    "oss_sub": "Библиотека Laraue.Crawler, использованная в этом проекте, опубликована на GitHub.",
    "oss_card_desc": "Высоконастраиваемая C#-библиотека с поддержкой AngleSharp и PuppeteerSharp. Схемное извлечение, async-пайплайны, поддержка прокси.",
    "view_github": "Открыть на GitHub",
    "cta_label": "Эксперимент в процессе",
    "cta_title": "Смотрите AI-ранжированные\nквартиры в живую",
    "cta_sub": "Браузите объявления Санкт-Петербурга, отсортированные по AI-баллу. Прототип — но рабочий."
  }
}
</i18n>

<template>
  <LMainContent>
    <LLandingIntro
      :alert="t('proto_banner')"
      :pre-title="t('hero_eyebrow')"
      :title="t('hero_title')"
      :post-title="t('hero_sub')">
      <template #actions>
        <LActionButton :title="t('hero_cta_open')" link="https://apartments.laraue.com" type="site" />
        <LActionButton :title="t('hero_cta_read')" :link="localePath('/blog/articles/building-ai-real-estate-system')" type="github" />
      </template>
      <template #visual>
        <div class="listing-mockup">
          <div class="lm-header">
            <div class="lm-dots"><span></span><span></span><span></span></div>
            <span class="lm-title" data-i18n="mockup_title">AI Apartments &#8212; St. Petersburg</span>
          </div>
          <div class="lm-body">
            <div class="lm-search">
              <span class="lm-search-icon">&#128269;</span>
              <span class="lm-search-text" data-i18n="mockup_search">Search listings&#8230;</span>
            </div>
            <div class="lm-filters lm-filter-row">
              <span class="lm-filter active" data-i18n="f_all">All</span>
              <span class="lm-filter" data-i18n="f_1room">1 room</span>
              <span class="lm-filter" data-i18n="f_2room">2 rooms</span>
              <span class="lm-filter" data-i18n="f_sort">&#9660; AI Score</span>
            </div>
            <div class="lm-cards">
              <div class="lm-card">
                <div class="lm-card-img">&#127968;<span class="lm-card-img-label high">AI &#9733; 9.2</span></div>
                <div class="lm-card-info">
                  <div class="lm-card-price">32 000 &#x20BD;</div>
                  <div class="lm-card-meta" data-i18n="lm1">Nevsky, 2 rooms, 54 m&#178;</div>
                  <div class="lm-card-score">
                    <span>Score</span>
                    <div class="lm-card-score-bar"><div class="lm-card-score-fill score-high" style="width:92%"></div></div>
                    <span>9.2</span>
                  </div>
                </div>
              </div>
              <div class="lm-card">
                <div class="lm-card-img">&#127968;<span class="lm-card-img-label high">AI &#9733; 8.7</span></div>
                <div class="lm-card-info">
                  <div class="lm-card-price">28 500 &#x20BD;</div>
                  <div class="lm-card-meta" data-i18n="lm2">Vasileostrovsk, 1 room</div>
                  <div class="lm-card-score">
                    <span>Score</span>
                    <div class="lm-card-score-bar"><div class="lm-card-score-fill score-high" style="width:87%"></div></div>
                    <span>8.7</span>
                  </div>
                </div>
              </div>
              <div class="lm-card">
                <div class="lm-card-img">&#127968;<span class="lm-card-img-label" style="background:rgba(245,158,11,.25);color:#f59e0b">AI &#9733; 6.1</span></div>
                <div class="lm-card-info">
                  <div class="lm-card-price">21 000 &#x20BD;</div>
                  <div class="lm-card-meta" data-i18n="lm3">Primorsky, 1 room</div>
                  <div class="lm-card-score">
                    <span>Score</span>
                    <div class="lm-card-score-bar"><div class="lm-card-score-fill score-mid" style="width:61%"></div></div>
                    <span>6.1</span>
                  </div>
                </div>
              </div>
              <div class="lm-card">
                <div class="lm-card-img">&#127968;<span class="lm-card-img-label low">AI &#9733; 3.4</span></div>
                <div class="lm-card-info">
                  <div class="lm-card-price">18 000 &#x20BD;</div>
                  <div class="lm-card-meta" data-i18n="lm4">Kolpino, 2 rooms</div>
                  <div class="lm-card-score">
                    <span>Score</span>
                    <div class="lm-card-score-bar"><div class="lm-card-score-fill score-low" style="width:34%"></div></div>
                    <span>3.4</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="lm-ai-note">
              <span>&#129302;</span>
              <span data-i18n="lm_ai_note">Ranked by Ollama vision model &#8212; photo quality score 0&#8211;10</span>
            </div>
          </div>
        </div>
      </template>
      <template #badges>
        <LPlatformBadge type="proto" title="Prototype" />
      </template>
    </LLandingIntro>

    <!-- ══ HOW IT WORKS ══ -->
    <LSteps
        :title="t('how_title')"
        :pre-title="t('how_label')"
        :post-title="t('how_sub')"
        :steps="[
        {
          title: t('step1t'),
          description: t('step1d'),
          icon: '🕷',
        },
        {
          title: t('step2t'),
          description: t('step2d'),
          icon: '📷',
        },
        {
          title: t('step3t'),
          description: t('step3d'),
          icon: '🤖',
        },
        {
          title: t('step4t'),
          description: t('step4d'),
          icon: '📊',
        }
      ]" />

    <!-- TECH STACK -->
    <LSection type="cream" :pre-title="t('tech_label')"  :title="t('tech_title')" :post-title="t('tech_sub')">
      <div class="tech-grid">
        <div class="tech-card reveal">
          <div class="tech-card-icon">&#129302;</div>
          <div class="tech-card-name">Ollama</div>
          <p class="tech-card-desc">{{ t('tc1') }}</p>
          <nuxt-link to="https://ollama.ai" class="tech-card-link" target="_blank" rel="noopener">{{ t('tc_learn') }}</nuxt-link>
        </div>
        <div class="tech-card reveal">
          <div class="tech-card-icon">&#128375;</div>
          <div class="tech-card-name">Laraue.Crawler</div>
          <p class="tech-card-desc">{{ t('tc2') }}</p>
          <nuxt-link :to="localePath('/blog/projects/crawler')" class="tech-card-link">{{ t('tc_project') }}</nuxt-link>
        </div>
        <div class="tech-card reveal">
          <div class="tech-card-icon">&#128200;</div>
          <div class="tech-card-name">ASP.NET Core + PostgreSQL</div>
          <p class="tech-card-desc">{{ t('tc3') }}</p>
          <nuxt-link :to="localePath('/blog/projects/real-estate')" class="tech-card-link">{{ t('tc_article') }}</nuxt-link>
        </div>
      </div>
    </LSection>

    <!-- ARTICLE CALLOUT -->
    <LSection type="light" :pre-title="t('art_label')" :title="t('art_title')" :post-title="t('art_sub')" horizontal>
      <div class="reveal">
        <nuxt-link :to="localePath('/blog/projects/real-estate')" class="article-card">
          <div class="article-card-strip"></div>
          <div class="article-card-body">
            <div class="article-card-type">{{ t('type_article') }}</div>
            <div class="article-card-title">{{ t('art_card_title') }}</div>
            <p class="article-card-excerpt">{{ t('art_card_excerpt') }}</p>
            <div class="article-card-meta">
              <span>&#128336; 36 min read</span>
              <span>&#183;</span>
              <span>Oct 2025</span>
            </div>
            <div class="article-card-read">{{ t('art_read') }}</div>
          </div>
        </nuxt-link>
      </div>
    </LSection>

    <!-- OSS -->
    <LSection type="cream" :pre-title="t('oss_label')" :title="t('oss_title')" :post-title="t('oss_sub')" horizontal>
      <div class="oss-card">
        <div class="oss-icon">&#11088;</div>
        <div class="oss-title">Laraue.Crawler</div>
        <p class="oss-desc">{{ t('oss_card_desc') }}</p>
        <LActionButton :title="t('view_github')" link="https://github.com/win7user10/Laraue.Crawling" type="github"/>
      </div>
    </LSection>

    <!-- CTA -->
    <LCallToAction type="light" :pre-title="t('cta_label')" :title="t('cta_title')" :post-title="t('cta_sub')" horizontal>
      <LActionButton :title="t('hero_cta_open')" link="https://apartments.laraue.com" type="site"/>
      <LActionButton :title="t('hero_cta_read')" link="/blog/articles/how-i-tried-to-rank-flats-by-photos" type="github"/>
    </LCallToAction>

  </LMainContent>
</template>

<style scoped>
div {
  --amber:#b45309; --amber-light:#fef3c7; --amber-mid:#d97706;
}

.listing-mockup{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);border-radius:16px;overflow:hidden}
.lm-header{background:rgba(255,255,255,.08);padding:12px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.08)}
.lm-dots{display:flex;gap:5px}
.lm-dots span{width:8px;height:8px;border-radius:50%}
.lm-dots span:nth-child(1){background:#e05353}
.lm-dots span:nth-child(2){background:#e0a653}
.lm-dots span:nth-child(3){background:#53e07a}
.lm-title{font-size:11px;color:rgba(255,255,255,.35);margin:0 auto;letter-spacing:.04em;font-weight:600}
.lm-body{padding:16px}
.lm-search{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:8px 12px;display:flex;align-items:center;gap:8px;margin-bottom:14px}
.lm-search-icon{opacity:.35;font-size:13px}
.lm-search-text{font-size:11px;color:rgba(255,255,255,.3)}
.lm-filters{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
.lm-filter{font-size:10px;font-weight:700;padding:3px 9px;border-radius:5px;border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.5)}
.lm-filter.active{background:rgba(180,83,9,.3);border-color:rgba(245,158,11,.4);color:#f59e0b}
/* listing cards */
.lm-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lm-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);border-radius:10px;overflow:hidden}
.lm-card-img{height:64px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-size:22px;position:relative}
.lm-card-img-label{position:absolute;top:5px;right:6px;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:.04em}
.lm-card-img-label.high{background:rgba(110,221,154,.25);color:#6edd9a}
.lm-card-img-label.low{background:rgba(224,83,83,.2);color:#e05353}
.lm-card-info{padding:8px 10px}
.lm-card-price{font-family:var(--serif);font-size:14px;font-weight:700;color:#fff;margin-bottom:2px}
.lm-card-meta{font-size:10px;color:rgba(255,255,255,.4)}
.lm-card-score{display:flex;align-items:center;gap:4px;margin-top:5px;font-size:10px;color:rgba(255,255,255,.5)}
.lm-card-score-bar{flex:1;height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden}
.lm-card-score-fill{height:100%;border-radius:2px}
.score-high{background:#6edd9a}
.score-mid{background:#f59e0b}
.score-low{background:#e05353}
/* ai badge below cards */
.lm-ai-note{margin-top:10px;padding:8px 10px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);border-radius:7px;font-size:10px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:6px}
.lm-ai-note span{font-size:13px}

/* ══ TECH STACK ══ */
.tech-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px}
.tech-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:26px;transition:box-shadow .2s,transform .15s,border-color .2s}
.tech-card:hover{box-shadow:0 6px 24px rgba(15,14,12,.08);transform:translateY(-2px);border-color:var(--amber)}
.tech-card-icon{width:44px;height:44px;border-radius:10px;background:var(--amber-light);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px}
.tech-card-name{font-family:var(--serif);font-size:16px;font-weight:700;margin-bottom:8px;letter-spacing:-.1px}
.tech-card-desc{font-size:13px;color:var(--muted);line-height:1.6}
.tech-card-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--amber);margin-top:12px;text-decoration:none;transition:gap .15s}
.tech-card:hover .tech-card-link{gap:9px}

/* ══ ARTICLE CALLOUT ══ */
.article-card{
  background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;
  transition:box-shadow .2s,transform .2s;text-decoration:none;color:inherit;display:block;
}
.article-card:hover{box-shadow:0 8px 32px rgba(15,14,12,.1);transform:translateY(-3px)}
.article-card-strip{height:5px;background:linear-gradient(90deg,var(--amber),var(--amber-mid))}
.article-card-body{padding:24px}
.article-card-type{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--amber);margin-bottom:10px}
.article-card-title{font-family:var(--serif);font-size:18px;font-weight:700;line-height:1.3;margin-bottom:10px;letter-spacing:-.1px;color:var(--ink)}
.article-card-excerpt{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:16px}
.article-card-meta{display:flex;align-items:center;gap:12px;font-size:11px;color:var(--muted)}
.article-card-read{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--amber);margin-top:14px;transition:gap .15s}
.article-card:hover .article-card-read{gap:9px}

/* ══ OSS ══ */
.oss-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(15,14,12,.06)}
.oss-icon{font-size:40px;margin-bottom:16px}
.oss-title{font-family:var(--serif);font-size:20px;font-weight:700;margin-bottom:10px;letter-spacing:-.2px}
.oss-desc{font-size:14px;color:var(--muted);line-height:1.65;margin-bottom:24px;font-weight:300}
.oss-link svg{width:15px;height:15px;fill:currentColor;flex-shrink:0}

/* ══ RESPONSIVE ══ */
@media(max-width:900px){
  .tech-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:720px){
  .lm-cards{grid-template-columns:1fr}
  .tech-grid{grid-template-columns:1fr}
  footer{padding:40px 22px}
}
@media(max-width:420px){
  .lm-filter-row{display:none}
}

</style>