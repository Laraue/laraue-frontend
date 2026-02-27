<script setup lang="ts">
interface MenuItem {
  text: string;
  link?: string;
  children?: MenuItem[];
  id: string
}

const menuItems: MenuItem[] = [
  {
    text: "Apps",
    id: "1",
    children: [
      {
        text: "Markdown to HTML Converter",
        link: "/markdown-converter",
        id: "1-1",
      },
      {
        text: "AI-Ranked Apartments",
        link: "/crawled-apartments",
        id: "1-2",
      },
      {
        text: "Pdf Query Language Concept",
        link: "/pdf-extractor",
        id: "1-3",
      }
    ]
  },
  {
    text: "Telegram Bots",
    id: "2",
    children: [
      {
        text: "Increase Vocabulary with Flashcards",
        link: "/learn-language-bot",
        id: "2-1"
      },
    ]
  },
  {
    text: "Blog",
    id: "3",
    link: "/blog",
  }
]

const isMobileMenuActive = ref(false);
const activeItem: Ref<string | undefined> = ref(undefined);
const isActive = (id: string) => activeItem.value === id;
const removeActiveItem = () => activeItem.value = undefined;

</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <a href="/" class="site-name">Laraue Tools</a>
      <div class="hamburger" @click="isMobileMenuActive = !isMobileMenuActive">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul class="nav-menu" id="nav-menu" :class="isMobileMenuActive ? 'active' : ''">
        <li
          v-for="item in menuItems"
          class="nav-item level-1"
          :class="isActive(item.id) ? 'active' : ''">
          <a
            @click="isActive(item.id) ? removeActiveItem() : activeItem = item.id"
            :href="item.link"
            class="nav-link">
            {{ item.text }}
          </a>
          <div v-if="item.children" class="dropdown">
            <a
              v-for="childrenItem in item.children"
              :href="childrenItem.link"
              class="dropdown-item">
              {{ childrenItem.text }}
            </a>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: #251645;
  position: sticky;
  top: 0;
  z-index: 1000;
  margin: 0;
  padding: 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  max-height: 60px;
}

.site-name {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 1rem 0;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: block;
  color: white;
  text-decoration: none;
  padding: 1rem 1.2rem;
  transition: background-color 0.3s;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #29dfd0;
  transition: all 0.3s;
  transform: translateX(-50%);
}

.nav-link:hover::after {
  width: 80%;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #251645;
  min-width: 200px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.nav-item:hover .dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  color: white;
  padding: 0.8rem 1.2rem;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background: #412777;
}

.nav-item.level-1 .dropdown-item {
  padding-left: 1.2rem;
}

.nav-item.level-2 .dropdown-item {
  padding-left: 2.4rem;
}

.nav-item.level-3 .dropdown-item {
  padding-left: 3.6rem;
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 2px;
}

@media screen and (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .nav-menu {
    border-top: 2px solid #a59ccf;
    position: absolute;
    left: -100%;
    top: 55px;
    flex-direction: column;
    background: #251645;
    width: 100%;
    text-align: center;
    transition: 0.3s;
    box-shadow: 0 10px 27px rgba(0,0,0,0.05);
    padding: 2rem 0;
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-item {
    margin: 0.5rem 0;
  }

  .dropdown {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    background: #251645;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .nav-item.active .dropdown {
    max-height: 500px;
  }

  .dropdown-item {
    padding-left: 1.2rem;
    background: #352163;
    max-width: 80%;
    margin: 2px 1rem 0;
  }

  .dropdown-item::after {
    background-color: #29dfd0;
  }

  .nav-item.level-2 .dropdown-item {
    padding-left: 2.4rem;
  }

  .nav-item.level-3 .dropdown-item {
    padding-left: 3.6rem;
  }

  .hamburger.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .hamburger.active span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }

  .nav-link::after {
    background-color: inherit;
    transition: none;
    transform: none;
  }
}
</style>