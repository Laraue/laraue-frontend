<script setup lang="ts">
  const dropdownOpened = ref(false)
  const { locale, locales, setLocale } = useI18n()
  const changeLanguage = (code: string) => {
    setLocale(code as any)
    dropdownOpened.value = false
  }
</script>

<template>
  <div class="language-selector">
    <div class="current-flag" @click="dropdownOpened = !dropdownOpened">
      <span :class="['flag-icon', locale]" id="currentFlag"></span>
    </div>

    <div class="flag-dropdown" id="flagDropdown" v-if="dropdownOpened">
      <div class="flag-option" v-for="possibleLocale in locales" @click="changeLanguage(possibleLocale.code)">
        <span :class="['flag-icon', possibleLocale.code]"></span>
        <span>{{ possibleLocale.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.current-flag {
  cursor: pointer;
  border-radius: 4px;
  padding: 5px;
  display: inline-block;
}

.flag-icon {
  width: 24px;
  height: 24px;
  display: inline-block;
  background-size: cover;
  background-position: center;
  border-radius: 2px;
}

.flag-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 0;
  margin-top: 5px;
  min-width: 120px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;
}

.flag-option {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  gap: 8px;
}

.flag-option:hover {
  background: #f5f5f5;
}

.flag-option span {
  margin-left: 5px;
  font-size: 14px;
}

.flag-icon.en {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><path fill="%23bd3d44" d="M0 0h640v480H0"/><path stroke="%23fff" stroke-width="37" d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"/><path fill="%23192f5d" d="M0 0h364.8v258.5H0"/><marker id="m" markerHeight="30" markerWidth="30"><path fill="%23fff" d="M14 0l2 8.4L14 0z"/></marker><path fill="none" marker-mid="url(%23m)" d="M0 0l16 11L0 0z"/></svg>');
}

.flag-icon.ru {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><path fill="%23fff" d="M0 0h640v480H0"/><path fill="%230039a6" d="M0 160h640v160H0"/><path fill="%23d52b1e" d="M0 320h640v160H0"/></svg>');
}
</style>