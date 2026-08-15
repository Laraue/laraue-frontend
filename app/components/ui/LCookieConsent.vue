<script setup lang="ts">
const { t } = useI18n()
const { gtag } = useGtag()

const STORAGE_KEY = 'cookie-consent'

const visible = ref(false)

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored === 'denied') {
    gtag('consent', 'update', { analytics_storage: 'denied' })
    return
  }

  if (stored !== 'granted') {
    visible.value = true
  }
})

function accept() {
  localStorage.setItem(STORAGE_KEY, 'granted')
  gtag('consent', 'update', { analytics_storage: 'granted' })
  visible.value = false
}

function decline() {
  localStorage.setItem(STORAGE_KEY, 'denied')
  gtag('consent', 'update', { analytics_storage: 'denied' })
  visible.value = false
}
</script>

<template>
  <div v-if="visible" class="cookie-consent" role="dialog" aria-live="polite">
    <p class="cookie-consent__text">{{ t('cookieConsentText') }}</p>
    <div class="cookie-consent__actions">
      <button class="cookie-consent__btn cookie-consent__btn--decline" @click="decline">
        {{ t('cookieConsentDecline') }}
      </button>
      <button class="cookie-consent__btn cookie-consent__btn--accept" @click="accept">
        {{ t('cookieConsentAccept') }}
      </button>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "cookieConsentText": "We use cookies for analytics to understand how visitors use this site. By continuing to browse, you agree to their use.",
    "cookieConsentAccept": "Accept",
    "cookieConsentDecline": "Decline"
  },
  "ru": {
    "cookieConsentText": "Мы используем файлы cookie для аналитики, чтобы понимать, как посетители используют этот сайт. Продолжая пользоваться сайтом, вы соглашаетесь с их использованием.",
    "cookieConsentAccept": "Принять",
    "cookieConsentDecline": "Отклонить"
  }
}
</i18n>

<style scoped>
.cookie-consent {
  position: fixed;
  left: 20px;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  max-width: 480px;
  margin-left: auto;
  background: var(--paper);
  color: var(--ink);
  border: 1px solid rgba(15, 14, 12, .12);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 8px 32px rgba(15, 14, 12, .18);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cookie-consent__text {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.cookie-consent__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cookie-consent__btn {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, transform .15s;
}

.cookie-consent__btn--accept {
  background: var(--ink);
  color: var(--paper);
}

.cookie-consent__btn--accept:hover {
  background: var(--accent);
  transform: translateY(-1px);
}

.cookie-consent__btn--decline {
  background: transparent;
  color: var(--ink);
  border: 1px solid rgba(15, 14, 12, .2);
}

.cookie-consent__btn--decline:hover {
  background: rgba(15, 14, 12, .06);
}

@media (max-width: 520px) {
  .cookie-consent {
    left: 12px;
    right: 12px;
    bottom: 12px;
    max-width: none;
  }
}
</style>
