<script setup lang="ts">
useSeoMeta({
  title: 'Laraue App: Learn Language Bot',
  description: 'The telegram bot that helps to learn top 5k used words of English, Japanese, Russian and French languages',
})
</script>

<template>
  <header>
    <h1>Laraue's Language Learning Platform</h1>
    <p>Master languages with multiple ways to study vocabulary. Learn anytime, anywhere without installing any app!</p>
    <div>
      <a href="https://t.me/learn_lang_bot" class="btn-start">Start Learning Now</a>
      <img src="/images/quiz-mode.jpg" alt="Learn Language Bot" class="hero-image">
    </div>
  </header>
  <main>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>Powerful Learning Features</h2>
          <p>The platform combines cutting-edge technology with proven learning methods</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i>🧠</i>
            </div>
            <h3>Quiz Mode</h3>
            <p>Engage in interactive, gamified quizzes designed to boost retention and make learning vocabulary fun and effective.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i>💬</i>
            </div>
            <h3>Personalized Learning</h3>
            <p>Customize your study sessions to focus on specific language pairs or difficulty levels that suit your goals.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i>📊</i>
            </div>
            <h3>Progress Tracking</h3>
            <p>Monitor your learning streak, quiz scores, and word mastery to stay motivated and track your improvement over time.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i>🖥️</i>
            </div>
            <h3>Seamless Access</h3>
            <p>Access the platform instantly on Telegram, compatible with smartphones, tablets, or desktops without downloading apps.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i>👀</i>
            </div>
            <h3>View Mode</h3>
            <p>Organize and explore words by CEFR level (A1-C2), topic (e.g., travel, business), or alphabetically for tailored learning.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>How It Works</h2>
          <p>Learning a new language has never been easier</p>
        </div>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Choose Your Language</h3>
            <p>Select any of the available languages pair on settings</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Start Learning</h3>
            <p>Use Quiz Mode to learn new words</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Practice &amp; Improve</h3>
            <p>Each finished Quiz will update and show your statistics</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>Supported Languages</h2>
          <p>Learn the most popular languages with our platform</p>
        </div>
        <div class="languages-grid">
          <div class="language-card">
            <h3>Russian-English</h3>
            <p>RU-EN</p>
          </div>
          <div class="language-card">
            <h3>Japanese-English</h3>
            <p>JA-EN</p>
          </div>
          <div class="language-card">
            <h3>French-English</h3>
            <p>FR-EN</p>
          </div>
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
  margin-right: 20px;
  transition: opacity 0.3s;
}

.btn-start:hover {
  opacity: 0.9;
}

.section {
  padding: 80px 0;
}

main {
  background: url("/images/learn-words-background.png") no-repeat center center/cover;
}

.section-title {
  text-align: center;
  margin-bottom: 60px;
}

.section-title h2 {
  font-size: 2.5rem;
  color: #7437ae;;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.section-title h2::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: #00b4d8;
  border-radius: 2px;
}

.section-title p {
  font-size: 1.2rem;
  color: #6c757d;;
  max-width: 700px;
  margin: 0 auto;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-top: 50px;
}

.step {
  flex: 1;
  min-width: 250px;
  max-width: 300px;
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.language-card {
  background: white;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.language-card h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #7437ae;
}

.step-number {
  width: 50px;
  height: 50px;
  background: #8c2abf;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 20px;
}

.step h3 {
  margin-bottom: 15px;
  color: #7437ae;
}

h3 {
  font-size: 1.17em;
  text-align: center;
}

section {
  text-align: center;
  margin: 40px auto;
  max-width: 1000px;
}

.features h2,
.languages h2 {
  font-size: 2.5rem;
  color: #7437ae;
  font-weight: 500;
  margin: 5vh 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  background: white;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: #8c2abf;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #343a40;
}

.feature-card p {
  color: #6c757d;
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: rgba(140, 42, 191, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #8c2abf;
  font-size: 2rem;
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

.hero-image {
  max-width: 300px;
  margin: 30px auto 0;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);;
  border: 5px solid #c6e3ec;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  header {
    padding: 100px 20px;
  }

  main {
    padding: 30px 20px;
  }

  header h1 {
    font-size: 2.5rem;
  }

  header p {
    font-size: 1.1rem;
  }

  .section {
    padding: 10px 0;
  }

  .section-title h2 {
    font-size: 2rem;
    text-align: center;
  }

  .language-card p {
    text-align: center;
  }

  .step p {
    text-align: center;
  }
}
</style>