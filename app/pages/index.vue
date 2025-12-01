<script setup lang="ts">
useSeoMeta({
  title: 'Laraue Blog and Demonstrations',
  description: 'The blog of a .NET developer who likes to write different libraries and test concepts.',
})
interface Item{
  title: string;
  description: string;
  link: string;
  tags?: string[];
}
interface Section{
  title: string;
  description: string;
  items: Item[];
}
const sections: Section[] = [
  {
    title: "Applications",
    description: "The list of currently deployed applications on the domain.",
    items: [
      {
        title: "PDF Extractor",
        description: "Easily extract text, images, and data from PDF files with a fast, user-friendly tool. Simplify document processing on any device.",
        link: '/pdf-extractor',
      },
      {
        title: "Language Learning Platform",
        description: "Master languages (RU-EN, JA-EN, FR-EN) with quiz and view modes. Track progress and learn anywhere via Telegram.",
        link: '/learn-language-bot',
      },
      {
        title: "Advertisements Collector",
        description: "This application collects and displays advertisements from various sources and ranking them with AI.",
        link: '/crawled-apartments',
      }
    ]
  },
  {
    title: "Libraries",
    description: "Open-source modules that can be used in real applications.",
    items: [
      {
        title: "Laraue.EfCoreTriggers",
        description: "Allows to work with triggers via C# code.",
        link: '/blog/projects/ef-core-triggers',
        tags: [".NET", "EF Core", "Database Triggers"]
      },
      {
        title: "Laraue.PdfQL",
        description: "PDF Query Language - A powerful language for querying and manipulating PDF documents.",
        link: '/blog/projects/pdf-query-language',
        tags: [".NET", "PDF", "Interpreter", "Query language"]
      },
      {
        title: "Laraue.Crawling",
        description: "A robust and flexible web crawling library for .NET.",
        link: '/blog/projects/crawler',
        tags: [".NET", "Web Crawling", "Scraping"]
      },
      {
        title: "Laraue.Telegram.NET",
        description: "Work with telegram via Telegram controllers.",
        link: '/blog/projects/telegram-net',
        tags: [".NET", "Telegram Bot API"]
      }
    ]
  }
]
</script>

<template>
  <div class="container">
    <header>
      <h1>Ilya Belyansky</h1>
      <p>Yet Another One Software Developer</p>
    </header>
    <main>
      <section class="about-section">
        <h2 class="section-title">About Resource</h2>
        <p class="about-text">
          Hello. I am a software developer with a passion for creating innovative solutions.
          I like to explore different concepts and technologies, and this site serves as a platform where I share my ideas and projects.
        </p>
        <p>
          The site uses the domain <b>Laraue</b> just because this word was used as a namespace in each of my pet projects.
          I needed a unique identifier, and decided to combine technologies I used this moment.
          The formula is simple: <b>Laravel + Vue js = Laraue</b>. Now it's too late to change that.
        </p>
        <p>
          The site contains my thoughts, tutorials, and the development journey of various projects I've worked on in the <nuxt-link to="/blog">Blog section</nuxt-link>. I made
          this resource to structure my thoughts and provide a reference for other developers who want to create something meaningful.
        </p>
        <p>
          You can also find applications described in the blog. For this, I suggest exploring the links above.
        </p>
      </section>

      <section v-for="section in sections">
        <h2>{{ section.title }}</h2>
        <p class="about-text">
          {{ section.description }}
        </p>
        <div class="card-container">
          <nuxt-link class="card" :to="item.link" v-for="item in section.items">
            <div class="description">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <div class="tags" v-if="(item.tags?.length ?? 0) > 0">
              <div class="tag" v-for="tag in item.tags">{{ tag }}</div>
            </div>
          </nuxt-link>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 1500px;
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 2vw;
}

header {
  padding: 5vh 1vw;
  border-bottom: 1px solid #e5e7eb;
}

main {
  max-width: 960px;
  margin: 0 auto;
}

header h1 {
  font-size: 2.8em;
  margin: 0;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
}

header p {
  font-size: 1.25em;
  color: #475569;
  max-width: 600px;
  margin: 15px auto;
  text-align: center;
}

main {
  padding-top: 20px;
}

section {
  text-align: left;
  max-width: 1200px;
  padding: 2vw;
  background-color: #f8f9fa;
  margin: 20px auto;
}

section h2, .projects h2 {
  font-size: 2em;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 3vh;
}

.description {
  display: flex;
  flex-flow: column;
}

.card {
  justify-content: space-between;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #e5e7eb;
  margin: 10px 0;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(107, 114, 128, 0.15);
}

.card h3 {
  font-size: 1.5em;
  font-weight: 600;
  color: #1e293b;
}

.card p {
  font-size: 1em;
  color: #64748b;
  margin: 0.2vh 0;
  line-height: 1.6;
}

.card a:hover {
  background-color: #6b7280;
  color: white;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.tags {
  display: flex;
  height: max-content;
}

.tag {
  margin: 3px 5px;
  background-color: #eee;
  color: #333;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8em;
}
@media (max-width: 768px) {
  .card {
    flex-flow: column;
  }
}

</style>