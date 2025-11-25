<script setup lang="ts">
if (import.meta.server) {
  useSeoMeta({
    title: 'Laraue Blog and Demonstrations',
    description: 'The blog of .NET developer that like to write different libraries and check concepts',
  })
}
</script>

<template>
  <header>
    <h1>Laraue</h1>
    <p>Discover innovative projects designed to simplify learning, productivity, and creativity with seamless and accessible solutions.</p>
  </header>
  <main>
    <section class="projects">
      <h2 >Applications</h2>
      <div class="card-container">
        <div class="card">
          <h3>PDF Extractor</h3>
          <p>Easily extract text, images, and data from PDF files with a fast, user-friendly tool. Simplify document processing on any device.</p>
          <nuxt-link to="/pdf-extractor" index="0" class="main-page-link">
            Learn More
          </nuxt-link>
        </div>
        <div class="card">
          <h3>Language Learning Platform</h3>
          <p>Master languages (RU-EN, JA-EN, FR-EN) with quiz and view modes. Track progress and learn anywhere via Telegram.</p>
          <router-link to="/learn-language-bot" index="0" class="main-page-link">
            Learn More
          </router-link>
        </div>
      </div>
    </section>

    <section class="libraries">
      <h2>Libraries</h2>
      <div class="card-container">
        <div class="card">
          <h3>Laraue.EfCoreTriggers</h3>
          <p>Allows to work with triggers via C# code.</p>
          <div class="tags">
            <span class="tag">.NET</span>
            <span class="tag">EF Core</span>
            <span class="tag">Database Triggers</span>
          </div>
          <router-link to="/blog/projects/ef-core-triggers" class="main-page-link">
            Learn More
          </router-link>
        </div>
        <div class="card">
          <h3>Laraue.PdfQL</h3>
          <p>PDF Query Language - A powerful language for querying and manipulating PDF documents.</p>
          <div class="tags">
            <span class="tag">.NET</span>
            <span class="tag">PDF</span>
            <span class="tag">Interpreter</span>
            <span class="tag">Query Language</span>
          </div>
          <router-link to="/blog/projects/pdf-query-language" class="main-page-link">
            Learn More
          </router-link>
        </div>
        <div class="card">
          <h3>Laraue.Crawling</h3>
          <p>A robust and flexible web crawling library for .NET.</p>
          <div class="tags">
            <span class="tag">.NET</span>
            <span class="tag">Web Crawling</span>
            <span class="tag">Scraping</span>
          </div>
          <router-link to="/blog/projects/crawler" class="main-page-link">
            Learn More
          </router-link>
        </div>
        <div class="card">
          <h3>Laraue.Telegram.NET</h3>
          <p>Work with telegram via Telegram controllers.</p>
          <div class="tags">
            <span class="tag">.NET</span>
            <span class="tag">Telegram Bot API</span>
          </div>
          <router-link to="/blog/projects/telegram-net" class="main-page-link">
            Learn More
          </router-link>
        </div>
      </div>
    </section>

    <section class="demonstration">
      <h2>Demonstrations</h2>
      <div class="card-container">
        <div class="card">
          <h3>Advertisements Collector</h3>
          <p>This application collects and displays advertisements from various sources and ranking them with AI.</p>
          <div class="tags">
            <span class="tag">Laraue.Crawling</span>
            <span class="tag">Laraue.Telegram.NET</span>
          </div>
          <nuxt-link to="/crawled-apartments" class="main-page-link">
            View Demonstration
          </nuxt-link>
        </div>
      </div>
    </section>

  </main>
</template>

<style scoped>
header {
  background: #f8f9fa;
  padding: 80px 20px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

header h1 {
  font-size: 2.8em;
  margin: 0;
  font-weight: 700;
  color: #1e293b;
}

header p {
  font-size: 1.25em;
  color: #475569;
  max-width: 600px;
  margin: 15px auto;
}

main {
  padding: 60px 20px;
}

section {
  text-align: center;
  margin: 60px auto;
  max-width: 1300px;
}

section h2 {
  font-size: 2.2em;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 40px;
}

.projects h2 {
  font-size: 2.2em;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 40px;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  justify-content: center;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 32px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #e5e7eb;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(107, 114, 128, 0.15);
}

.card h3 {
  font-size: 1.5em;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px;
}

.card p {
  font-size: 1em;
  color: #64748b;
  margin: 0 0 20px;
  line-height: 1.6;
}

.card a {
  color: #6b7280;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1em;
  border: 2px solid #6b7280;
  padding: 12px 24px;
  border-radius: 8px;
  display: inline-block;
  transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
}

.card a:hover {
  background-color: #6b7280;
  color: white;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.libraries {
  margin-top: 60px;
}

.libraries .card-container {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2vh;
  margin-bottom: 2vh;
}

.tag {
  margin: 3px 5px;
  background-color: #eee;
  color: #333;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8em;
}
</style>