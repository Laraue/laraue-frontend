<script setup lang="ts">
import LMainContent from "~/components/ui/LMainContent.vue";
import LNavIcon from "~/components/ui/LNavIcon.vue";
import LLandingIntro from "~/components/landins/LLandingIntro.vue";
import LActionButton from "~/components/landins/LActionButton.vue";
import LPlatformBadge from "~/components/landins/LPlatformBadge.vue";
import LSteps from "~/components/landins/LSteps.vue";
import LSection from "~/components/landins/LSection.vue";
import LFaqSection from "~/components/landins/LFaqSection.vue";
import LCallToAction from "~/components/landins/LCallToAction.vue";
import {defineOffer, defineSoftwareApp, defineBreadcrumb, useSchemaOrg} from "@unhead/schema-org/vue";

const { t } = useI18n();
const localePath = useLocalePath();
const { getStaticOgImageUrl } = usePathUtil();

const ogImageUrl = getStaticOgImageUrl('crawled-apartments-og');

useSeoMeta({
  title: t('seoTitle'),
  description: t('seoDescription'),
  ogTitle: t('seoTitle'),
  ogDescription: t('seoDescription'),
  ogImage: ogImageUrl,
  ogImageWidth: "1200",
  ogImageHeight: "630",
  ogImageType: "image/png",
  ogImageAlt: t('seoTitle'),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: t('seoTitle'),
  twitterDescription: t('seoDescription'),
  twitterImage: ogImageUrl,
  twitterImageAlt: t('seoTitle'),
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
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_current') },
    ]
  }),
  {
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: t('faq1q'), acceptedAnswer: { '@type': 'Answer', text: t('faq1a') } },
      { '@type': 'Question', name: t('faq2q'), acceptedAnswer: { '@type': 'Answer', text: t('faq2a') } },
      { '@type': 'Question', name: t('faq3q'), acceptedAnswer: { '@type': 'Answer', text: t('faq3a') } },
      { '@type': 'Question', name: t('faq4q'), acceptedAnswer: { '@type': 'Answer', text: t('faq4a') } },
    ]
  },
])
</script>

<i18n lang="json">
{
  "en": {
    "bc_home": "Home",
    "bc_current": "AI Apartments Aggregator",
    "seoTitle": "AI-Ranked Saint Petersburg Apartments",
    "seoDescription": "A snapshot of Cian and Avito apartment listings in Saint Petersburg, ranked by AI photo quality.",
    "sec_overview": "Overview",
    "sec_how": "How it works",
    "sec_tech": "Tech stack",
    "sec_article": "Article",
    "proto_banner": "This is a prototype / experiment — a personal project built to explore AI-powered apartment search. Data is for Saint Petersburg, Russia. The data is a snapshot: no new listings are collected now.",
    "hero_eyebrow": "AI Apartments Aggregator",
    "hero_title": "Find apartments\nranked by AI photo quality",
    "hero_sub": "An experimental tool that collected real estate listings in one place and used a local AI model to rank apartments by how good their photos look — saving hours of manual browsing. The app shows the listings collected so far.",
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
    "lm_ai_note": "Ranked by an Ollama vision model — renovation rating 0–10 from the flat's photos",
    "how_label": "Under the hood",
    "how_title": "How the pipeline works",
    "how_sub": "Four automated stages from crawl to ranked results, running locally with no external API dependencies.",
    "step1t": "Crawl listings",
    "step1d": "The Laraue.Crawling library scrapes real estate sites, handles JS rendering, and stores raw listing data into PostgreSQL.",
    "step2t": "Download photos",
    "step2d": "For each listing, the available photos are fetched, ready for AI analysis.",
    "step3t": "AI renovation rating",
    "step3d": "A local Ollama vision model looks at all the photos of a flat together, as one collage, and rates its renovation from 0 to 10.",
    "step4t": "Browse & filter",
    "step4d": "Results surface in the web UI — sort by AI score, filter by rooms and price. Skip past badly photographed listings instantly.",
    "tech_label": "Tech stack",
    "tech_title": "Built with open-source tools",
    "tech_sub": "Everything runs locally — no paid APIs, no cloud dependencies.",
    "tc1": "Locally-hosted LLM runner. The project uses a vision model to evaluate apartment photo quality and return a numeric score without sending data to the cloud.",
    "tc2": "The in-house C# crawler library powering the data collection. Supports static HTML and JavaScript-rendered pages via PuppeteerSharp.",
    "tc3": "Backend API written in C# with ASP.NET Core. Listing data and AI scores are persisted in PostgreSQL, served to the web frontend.",
    "tc_learn": "Learn more →",
    "tc_project": "View project →",
    "tc_article": "Read the article →",
    "art_label": "The full story",
    "art_title": "A detailed technical read,\nmonths of building",
    "art_sub": "The article covers the crawler, the vision model integration and the ranking formula in detail.",
    "art_cta": "Read the article",
    "art_card_title": "Building an AI-Powered Real Estate Ranking System with C#, Ollama, and a Custom Crawler",
    "art_meta": "Technical deep dive · C#, Ollama, PuppeteerSharp",
    "art_card_excerpt": "The five hosts, the PuppeteerSharp crawler, rating a flat from one photo collage with a local Ollama vision model, and the ideality formula.",
    "art_read": "Read full article →",
    "type_article": "Article",
    "oss_label": "Open source",
    "oss_title": "The crawler library is public",
    "oss_sub": "The Laraue.Crawling library used to build this project is open-source on GitHub — reusable for any web scraping project in .NET.",
    "oss_card_desc": "A highly customizable C# crawler library with support for static HTML (AngleSharp) and JavaScript-rendered pages (PuppeteerSharp). Schema-based extraction and a base class for scheduled crawler jobs.",
    "view_github": "View on GitHub",
    "faqLabel": "Questions",
    "faqHeading": "Frequently Asked Questions",
    "faq1q": "Is this a finished product or a prototype?",
    "faq1a": "It's an experiment — a personal project built to explore AI-powered apartment search. It works and you can browse the collected listings, but expect rough edges rather than a polished product.",
    "faq2q": "What cities and listing sources does it cover?",
    "faq2a": "Saint Petersburg, Russia, with listings from Cian and Avito. No new listings are collected now, so the app shows a snapshot.",
    "faq3q": "How is the AI rating calculated?",
    "faq3a": "All the photos of a listing are merged into one collage, and a local Ollama vision model rates the renovation of the whole flat from 0 to 10. Separately, an ideality score combines that rating with the floor and the distance to the metro.",
    "faq4q": "Is any listing data sent to the cloud?",
    "faq4a": "No. Crawling, storage, and AI scoring all run locally — there are no paid APIs or cloud dependencies involved.",
    "cta_label": "An experiment",
    "cta_title": "Browse AI-ranked\napartments",
    "cta_sub": "Browse the snapshot of Saint Petersburg listings collected so far, sorted by AI photo quality. A prototype — but a working one."
  },
  "ru": {
    "bc_home": "Главная",
    "bc_current": "AI-агрегатор квартир",
    "seoTitle": "AI-ранжированные квартиры в Санкт-Петербурге",
    "seoDescription": "Снимок объявлений Cian и Avito по Санкт-Петербургу, ранжированных по качеству фото с помощью AI.",
    "sec_overview": "Обзор",
    "sec_how": "Как это работает",
    "sec_tech": "Технологии",
    "sec_article": "Статья",
    "proto_banner": "Это прототип / эксперимент — пет проект для изучения АИ-поиска квартир. Данные по Санкт-Петербургу. Данные — снимок: новые объявления сейчас не собираются.",
    "hero_eyebrow": "AI-агрегатор квартир",
    "hero_title": "Находите квартиры,\nоценённые AI по фото",
    "hero_sub": "Экспериментальный инструмент: собирал объявления с сайтов недвижимости, оценивал фото локальной AI-моделью и ранжировал результаты. Приложение показывает собранные на данный момент объявления.",
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
    "lm_ai_note": "AI-ранжирование через Ollama — оценка ремонта 0–10 по фото квартиры",
    "how_label": "Открытый эксперимент",
    "how_title": "Как работает система",
    "how_sub": "Четыре автоматизированных этапа — без использования внешних API.",
    "step1t": "Сбор объявлений",
    "step1d": "Библиотека Laraue.Crawling скрейпит сайты недвижимости и сохраняет данные в PostgreSQL.",
    "step2t": "Загрузка фото",
    "step2d": "Для каждого объявления загружаются доступные фотографии для дальнейшего анализа.",
    "step3t": "AI-оценка ремонта",
    "step3d": "Локальная vision-модель Ollama смотрит на все фото квартиры вместе, как на один коллаж, и оценивает ремонт от 0 до 10.",
    "step4t": "Просмотр и фильтр",
    "step4d": "Результаты в UI — сортировка по AI-лценке ремонта, фильтры по комнатности и цене.",
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
    "art_title": "Подробный технический разбор,\nмесяцы разработки",
    "art_sub": "Статья подробно разбирает краулер, интеграцию vision-модели и формулу ранжирования.",
    "art_cta": "Читать статью",
    "art_card_title": "Парсинг JavaScript-сайтов недвижимости и оценка фото с Ollama на C#",
    "art_meta": "Технический разбор · C#, Ollama, PuppeteerSharp",
    "art_card_excerpt": "Пять хостов, краулер на PuppeteerSharp, оценка квартиры по одному коллажу из фото локальной vision-моделью Ollama и формула идеальности.",
    "art_read": "Читать статью целиком →",
    "type_article": "Статья",
    "oss_label": "Open source",
    "oss_title": "Библиотека краулера открыта",
    "oss_sub": "Библиотека Laraue.Crawling, использованная в этом проекте, опубликована на GitHub.",
    "oss_card_desc": "Высоконастраиваемая C#-библиотека с поддержкой AngleSharp и PuppeteerSharp. Схемное извлечение и базовый класс для задач краулера по расписанию.",
    "view_github": "Открыть на GitHub",
    "faqLabel": "Вопросы",
    "faqHeading": "Часто задаваемые вопросы",
    "faq1q": "Это готовый продукт или прототип?",
    "faq1a": "Это эксперимент — пет-проект для изучения AI-поиска квартир. Он работает, и можно посмотреть собранные объявления, но это не отполированный продукт, а рабочий прототип.",
    "faq2q": "Какие города и источники объявлений охвачены?",
    "faq2a": "Санкт-Петербург, с объявлениями от Cian и Avito. Новые объявления сейчас не собираются, поэтому приложение показывает снимок данных.",
    "faq3q": "Как рассчитывается AI-оценка?",
    "faq3a": "Все фото объявления склеиваются в один коллаж, и локальная vision-модель Ollama оценивает ремонт квартиры целиком от 0 до 10. Отдельно считается идеальность: она сочетает эту оценку с этажом и расстоянием до метро.",
    "faq4q": "Отправляются ли данные объявлений в облако?",
    "faq4a": "Нет. Сбор данных, хранение и AI-оценка полностью локальны — никаких платных API или облачных зависимостей.",
    "cta_label": "Эксперимент",
    "cta_title": "Смотрите AI-ранжированные\nквартиры",
    "cta_sub": "Браузите собранные объявления Санкт-Петербурга, отсортированные по AI-баллу. Прототип — но рабочий."
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
                <div class="lm-card-img">&#127968;<span class="lm-card-img-label" style="background:var(--amber-light);color:var(--amber)">AI &#9733; 6.1</span></div>
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
              <LNavIcon name="bot" />
              <span data-i18n="lm_ai_note">Ranked by an Ollama vision model &#8212; renovation rating 0&#8211;10 from the flat's photos</span>
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
          icon: 'search',
        },
        {
          title: t('step2t'),
          description: t('step2d'),
          icon: 'camera',
        },
        {
          title: t('step3t'),
          description: t('step3d'),
          icon: 'bot',
        },
        {
          title: t('step4t'),
          description: t('step4d'),
          icon: 'chart',
        }
      ]" />

    <!-- TECH STACK -->
    <LSection type="cream" :pre-title="t('tech_label')"  :title="t('tech_title')" :post-title="t('tech_sub')">
      <div class="tech-grid">
        <div class="tech-card">
          <div class="tech-card-icon"><LNavIcon name="bot" /></div>
          <h3 class="tech-card-name">Ollama</h3>
          <p class="tech-card-desc">{{ t('tc1') }}</p>
          <nuxt-link to="https://ollama.ai" class="tech-card-link" target="_blank" rel="noopener">{{ t('tc_learn') }}</nuxt-link>
        </div>
        <div class="tech-card">
          <div class="tech-card-icon"><LNavIcon name="globe" /></div>
          <h3 class="tech-card-name">Laraue.Crawling</h3>
          <p class="tech-card-desc">{{ t('tc2') }}</p>
          <nuxt-link :to="localePath('/blog/projects/crawler')" class="tech-card-link">{{ t('tc_project') }}</nuxt-link>
        </div>
        <div class="tech-card">
          <div class="tech-card-icon"><LNavIcon name="code" /></div>
          <h3 class="tech-card-name">ASP.NET Core + PostgreSQL</h3>
          <p class="tech-card-desc">{{ t('tc3') }}</p>
          <nuxt-link :to="localePath('/blog/articles/building-ai-real-estate-system')" class="tech-card-link">{{ t('tc_article') }}</nuxt-link>
        </div>
      </div>
    </LSection>

    <!-- ARTICLE CALLOUT -->
    <LSection type="light" :pre-title="t('art_label')" :title="t('art_title')" :post-title="t('art_sub')" horizontal>
      <div>
        <nuxt-link :to="localePath('/blog/articles/building-ai-real-estate-system')" class="article-card">
          <div class="article-card-strip"></div>
          <div class="article-card-body">
            <div class="article-card-type">{{ t('type_article') }}</div>
            <h3 class="article-card-title">{{ t('art_card_title') }}</h3>
            <p class="article-card-excerpt">{{ t('art_card_excerpt') }}</p>
            <div class="article-card-meta">
              <span>{{ t('art_meta') }}</span>
            </div>
            <div class="article-card-read">{{ t('art_read') }}</div>
          </div>
        </nuxt-link>
      </div>
    </LSection>

    <!-- OSS -->
    <LSection type="cream" :pre-title="t('oss_label')" :title="t('oss_title')" :post-title="t('oss_sub')" horizontal>
      <div class="oss-card">
        <div class="oss-icon"><LNavIcon name="code" /></div>
        <h3 class="oss-title">Laraue.Crawling</h3>
        <p class="oss-desc">{{ t('oss_card_desc') }}</p>
        <LActionButton :title="t('view_github')" link="https://github.com/win7user10/Laraue.Crawling" type="github"/>
      </div>
    </LSection>

    <!-- FAQ -->
    <LFaqSection
        :pre-title="t('faqLabel')"
        :title="t('faqHeading')"
        :items="[
        { question: t('faq1q'), answer: t('faq1a') },
        { question: t('faq2q'), answer: t('faq2a') },
        { question: t('faq3q'), answer: t('faq3a') },
        { question: t('faq4q'), answer: t('faq4a') }
      ]"
    />

    <!-- CTA -->
    <LCallToAction type="light" :pre-title="t('cta_label')" :title="t('cta_title')" :post-title="t('cta_sub')" horizontal>
      <LActionButton :title="t('hero_cta_open')" link="https://apartments.laraue.com" type="site"/>
      <LActionButton :title="t('hero_cta_read')" :link="localePath('/blog/articles/building-ai-real-estate-system')" type="github"/>
    </LCallToAction>

  </LMainContent>
</template>

<style scoped>
.listing-mockup{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-dialog);box-shadow:var(--shadow-popover);overflow:hidden}
.lm-header{background:var(--color-workspace);padding:12px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--color-divider)}
.lm-dots{display:flex;gap:5px}
.lm-dots span{width:8px;height:8px;border-radius:50%}
.lm-dots span:nth-child(1){background:var(--color-danger)}
.lm-dots span:nth-child(2){background:var(--color-chart-2)}
.lm-dots span:nth-child(3){background:var(--color-success)}
.lm-title{font-size:11px;color:var(--color-muted);margin:0 auto;letter-spacing:.04em;font-weight:600}
.lm-body{padding:16px}
.lm-search{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-control);padding:8px 12px;display:flex;align-items:center;gap:8px;margin-bottom:14px}
.lm-search-icon{opacity:.35;font-size:13px}
.lm-search-text{font-size:11px;color:var(--color-muted)}
.lm-filters{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
.lm-filter{font-size:10px;font-weight:700;padding:3px 9px;border-radius:5px;border:1px solid var(--color-border);color:var(--color-muted)}
.lm-filter.active{background:var(--amber-light);border-color:color-mix(in srgb,var(--amber) 40%,transparent);color:var(--amber)}
/* listing cards */
.lm-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lm-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-control);overflow:hidden}
.lm-card-img{height:64px;background:var(--color-soft);display:flex;align-items:center;justify-content:center;font-size:22px;position:relative}
.lm-card-img-label{position:absolute;top:5px;right:6px;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:.04em}
.lm-card-img-label.high{background:color-mix(in srgb,var(--color-success) 16%,var(--color-surface));color:var(--color-success)}
.lm-card-img-label.low{background:color-mix(in srgb,var(--color-danger) 14%,var(--color-surface));color:var(--color-danger)}
.lm-card-info{padding:8px 10px}
.lm-card-price{font-family:var(--serif);font-size:14px;font-weight:700;color:var(--color-text);margin-bottom:2px}
.lm-card-meta{font-size:10px;color:var(--color-muted)}
.lm-card-score{display:flex;align-items:center;gap:4px;margin-top:5px;font-size:10px;color:var(--color-muted)}
.lm-card-score-bar{flex:1;height:3px;background:var(--color-divider);border-radius:2px;overflow:hidden}
.lm-card-score-fill{height:100%;border-radius:2px}
.score-high{background:var(--color-success)}
.score-mid{background:var(--color-chart-2)}
.score-low{background:var(--color-danger)}
/* ai badge below cards */
.lm-ai-note{margin-top:10px;padding:8px 10px;background:var(--amber-light);border:1px solid color-mix(in srgb,var(--amber) 25%,transparent);border-radius:var(--radius-control);font-size:10px;color:var(--color-muted);display:flex;align-items:center;gap:6px}
.lm-ai-note :deep(.nav-icon-svg){width:13px;height:13px;color:var(--amber);flex-shrink:0}

/* ══ TECH STACK ══ */
.tech-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px}
.tech-card{background:var(--color-surface);border:1px solid var(--border);border-radius:14px;padding:26px;transition:box-shadow .2s,transform .15s,border-color .2s}
.tech-card:hover{box-shadow:0 6px 24px rgba(16,24,40,.08);transform:translateY(-2px);border-color:var(--amber)}
.tech-card-icon{width:44px;height:44px;border-radius:10px;background:var(--amber-light);color:var(--amber);display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.tech-card-icon :deep(.nav-icon-svg){width:22px;height:22px}
.tech-card-name{font-family:var(--serif);font-size:16px;font-weight:700;margin-bottom:8px;letter-spacing:-.1px}
.tech-card-desc{font-size:13px;color:var(--muted);line-height:1.6}
.tech-card-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--amber);margin-top:12px;text-decoration:none;transition:gap .15s}
.tech-card:hover .tech-card-link{gap:9px}

/* ══ ARTICLE CALLOUT ══ */
.article-card{
  background:var(--color-surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;
  transition:box-shadow .2s,transform .2s;text-decoration:none;color:inherit;display:block;
}
.article-card:hover{box-shadow:0 8px 32px rgba(16,24,40,.1);transform:translateY(-3px)}
.article-card-strip{height:5px;background:linear-gradient(90deg,var(--amber),var(--amber-mid))}
.article-card-body{padding:24px}
.article-card-type{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--amber);margin-bottom:10px}
.article-card-title{font-family:var(--serif);font-size:18px;font-weight:700;line-height:1.3;margin-bottom:10px;letter-spacing:-.1px;color:var(--ink)}
.article-card-excerpt{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:16px}
.article-card-meta{display:flex;align-items:center;gap:12px;font-size:11px;color:var(--muted)}
.article-card-read{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--amber);margin-top:14px;transition:gap .15s}
.article-card:hover .article-card-read{gap:9px}

/* ══ OSS ══ */
.oss-card{background:var(--color-surface);border:1px solid var(--border);border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(16,24,40,.06)}
.oss-icon{width:44px;height:44px;border-radius:11px;background:var(--amber-light);color:var(--amber);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.oss-icon :deep(.nav-icon-svg){width:22px;height:22px}
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