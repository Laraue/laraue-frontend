<script setup lang="ts">
if (import.meta.server) {
  useSeoMeta({
    title: 'Laraue App: Learn Language Bot',
    description: 'The telegram bot that helps to learn top 5k used words of English, Japanese, Russian and French languages',
  })
}
</script>

<template>
  <header>
    <h1>Laraue's Language Learning Platform</h1>
    <p>Master languages with multiple ways to study vocabulary. Learn anytime, anywhere without installing any app!</p>
    <a href="https://t.me/learn_lang_bot" class="btn-start">Start Learning Now</a>
  </header>
  <main>
    <section class="features">
      <h2>Why You Should Use This Bot?</h2>
      <div class="card-container">
        <div class="card">
          <h3>Quiz Mode</h3>
          <p>Engage in interactive, gamified quizzes designed to boost retention and make learning vocabulary fun and effective.</p>
        </div>
        <div class="card">
          <h3>View Mode</h3>
          <p>Organize and explore words by CEFR level (A1-C2), topic (e.g., travel, business), or alphabetically for tailored learning.</p>
        </div>
        <div class="card">
          <h3>Progress Stats</h3>
          <p>Monitor your learning streak, quiz scores, and word mastery to stay motivated and track your improvement over time.</p>
        </div>
        <div class="card">
          <h3>Seamless Access</h3>
          <p>Access the platform instantly on Telegram, compatible with smartphones, tablets, or desktops without downloading apps.</p>
        </div>
        <div class="card">
          <h3>Personalized Learning</h3>
          <p>Customize your study sessions to focus on specific language pairs or difficulty levels that suit your goals.</p>
        </div>
      </div>
    </section>
    <section class="languages">
      <h2>Supported Language Pairs</h2>
      <div class="card-container">
        <div class="card">
          <h3>Russian-English</h3>
          <p>(ru-en)</p>
        </div>
        <div class="card">
          <h3>Japanese-English</h3>
          <p>(ja-en)</p>
        </div>
        <div class="card">
          <h3>French-English</h3>
          <p>(fr-en)</p>
        </div>
      </div>
    </section>
    <section class="project">
      <h3 class="project-title">Source Code & Contributions</h3>
      <div class="project-content">
        <p>Explore the project's architecture, contribute to development, and report issues on GitHub.</p>
        <a href="https://github.com/win7user10/Laraue.Apps.LearnLanguage" target="_blank" class="github-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-1.5 0-3 .5-4 1.4L6 6.2V22h2l3-3a5.5 5.5 0 0 0 0-3.4L11 5.5a5.5 5.5 0 0 0-3.5 3.5L5 15h2v4a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-4l3-3a5.5 5.5 0 0 0-1.3 1.3z"></path>
          </svg>
          View on GitHub
        </a>
      </div>
    </section>
  </main>
</template>

<style scoped>
header {
  background: #f8f9fa;
  color: #343a40;
  padding: 120px 20px;
  text-align: center;
  border-bottom: 1px solid #dee2e6;
}

header h1 {
  font-size: 2.5em;
  font-weight: 700;
  margin: 0;
}

header p {
  font-size: 1.2em;
  margin: 10px 0;
}

.btn-start {
  background: linear-gradient(135deg, #8c2abf, #a489c3);
  color: white;
  padding: 15px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  display: inline-block;
  margin-top: 20px;
  transition: opacity 0.3s;
}

.btn-start:hover {
  opacity: 0.9;
}

main {
  background: url("/images/learn-words-background.png") no-repeat center center/cover;
}

section {
  text-align: center;
  margin: 40px auto;
  max-width: 1000px;
}

.features h2,
.languages h2 {
  color: #7437ae;
  font-size: 20px;
  font-weight: 500;
  margin: 5vh 0;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 280px;
  text-align: left;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.card h3 {
  margin: 0 0 10px;
  color: #343a40;
}

.card p {
  margin: 0;
  font-size: 1em;
  color: #6c757d;
}

.languages .card {
  text-align: center;
}

footer {
  background-color: #f8f9fa;
  color: #343a40;
  padding: 20px;
  text-align: center;
  border-top: 1px solid #dee2e6;
}

footer a {
  color: #00b4d8;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

.project {
  background-color: #3a353c;
  padding: 40px;
  text-align: center;
  margin-top: 80px;
  margin-bottom: 0;
  max-width: 100%;
  min-height: 20vh;
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.project-title {
  color: #fff;
  font-size: 24px;
  margin-bottom: 15px;
}

.project-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
  align-items: center;
  display: flex;
  flex-flow: column;
}

.project-content p {
  color: #ddd;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.github-button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #a057d1;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
  transition: background-color 0.3s;
  position: relative; /* For the icon positioning */
}

.github-button:hover {
  background-color: #7f209e;
}

.github-button svg {
  margin-right: 8px;
  vertical-align: middle; /* Align icon with text */
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  header {
    padding: 100px 20px;
  }

  main {
    padding: 30px 20px;
  }

  .card {
    width: 100%; /* Make cards full-width on smaller screens */
  }
}
</style>