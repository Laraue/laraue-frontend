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
  image?: string;
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
        image: '/images/pdf-extractor.jfif',
      },
      {
        title: "Language Learning Platform",
        description: "Master languages (RU-EN, JA-EN, FR-EN) with quiz and view modes. Track progress and learn anywhere via Telegram.",
        link: '/learn-language-bot',
        image: '/images/learn-language.jpg',
      },
      {
        title: "Advertisements Collector",
        description: "This application collects and displays advertisements from various sources and ranking them with AI.",
        link: '/crawled-apartments',
        image: '/images/crawled-advertisements.png',
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
    <header class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Ilya Belyansky</h1>
        <p class="hero-subtitle">Backend Developer</p>
        <div class="hero-decorator"></div>
      </div>
    </header>

    <main class="main-content">
      <section class="about-section">
        <div class="section-header">
          <h2 class="section-title">About Resource</h2>
          <div class="section-divider"></div>
        </div>
        <div class="about-text">
          <p>Hello. I am a software developer from Russia. I like to explore different concepts and technologies, and this site serves as a platform where I share my ideas and projects.</p>
          <p>The site contains my thoughts, tutorials, and the development journey of various projects I've worked on in the <nuxt-link to="/blog" class="link-highlight">Blog section</nuxt-link>. I made this resource to structure my thoughts and provide a reference for other developers who want to create something meaningful.</p>
          <p>You can also find applications described in the blog. For this, I suggest exploring the links above.</p>
        </div>
      </section>

      <div class="section-wrapper">
        <section v-for="section in sections" :key="section.title" class="content-section">
          <div class="section-header">
            <h2 class="section-title">{{ section.title }}</h2>
            <div class="section-divider"></div>
          </div>
          <p class="section-description">{{ section.description }}</p>

          <div class="card-container">
            <nuxt-link
                class="card"
                :to="item.link"
                v-for="item in section.items"
                :key="item.title"
            >
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon" v-if="item.image">
                    <img :src="item.image" :alt="item.title" loading="lazy">
                  </div>
                  <h3 class="card-title">{{ item.title }}</h3>
                </div>
                <p class="card-description">{{ item.description }}</p>
                <div class="tags" v-if="(item.tags?.length ?? 0) > 0">
                  <div class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</div>
                </div>
              </div>
              <div class="card-hover">
                <div class="card-arrow">→</div>
              </div>
            </nuxt-link>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  min-height: 100vh;
  padding: 0;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 5rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  transform: rotate(30deg);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.hero-decorator {
  width: 80px;
  height: 4px;
  background: white;
  margin: 2rem auto;
  border-radius: 2px;
}

.main-content {
  padding: 3rem 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  position: relative;
  display: inline-block;
  padding-bottom: 15px;
}

.section-divider {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  margin: 1rem auto;
  border-radius: 2px;
}

.about-section {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 3rem;
  border: 1px solid #f1f5f9;
}

.about-text {
  line-height: 1.8;
  color: #334155;
  font-size: 1.1rem;
}

.about-text p {
  margin-bottom: 1.5rem;
}

.link-highlight {
  color: #667eea;
  text-decoration: none;
  position: relative;
  padding-bottom: 3px;
}

.link-highlight::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.link-highlight:hover::after {
  transform: scaleX(1);
}

.content-section {
  margin-bottom: 4rem;
}

.section-description {
  text-align: center;
  color: #64748b;
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 2rem;
  flex-grow: 1;
}

.card-header {
  align-items: center;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: 60px auto;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
  margin-right: 1rem;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
}

.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.card-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  background: linear-gradient(135deg, #8594dc 0%, #9a6ac5 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-hover {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-top: 1px solid #e2e8f0;
}

.card-arrow {
  font-size: 1.5rem;
  color: #667eea;
  transition: transform 0.3s ease;
}

.card:hover .card-arrow {
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .container {
    margin: 1rem;
    border-radius: 8px;
  }

  .hero {
    padding: 3rem 1rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .main-content {
    padding: 2rem 1rem;
  }

  .about-section {
    padding: 1.5rem;
  }

  .card-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  .section-description {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.8rem;
  }
}
</style>
