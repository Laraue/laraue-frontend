<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LSection from '~/components/landins/LSection.vue'
import LNavIcon from '~/components/ui/LNavIcon.vue'
import { BillingPeriod } from '~/composables/tariffsApi'
import type { GetServiceTariffsResponse, PersonalSubscription, TeamSubscription } from '~/composables/tariffsApi'

withDefaults(defineProps<{
  data: GetServiceTariffsResponse | null
  error?: boolean
  preTitle?: string
  title?: string
  postTitle?: string
  type?: 'light' | 'cream' | 'dark'
  ctaLabel?: string
  ctaHref?: string
}>(), {
  error: false,
  type: 'light',
})

const { t } = useI18n()

const getBillingLabel = (tariff: { billingDuration?: number; billingPeriod: BillingPeriod }) => {
  if (tariff.billingPeriod === BillingPeriod.Forever) {
    return t('billing_label_forever')
  }
  if (tariff.billingDuration === 1) {
    return t('billing_label_month')
  }
  return t('billing_label_n_months', { count: tariff.billingDuration ?? 1 })
}

const getFeatures = (tariff: PersonalSubscription | TeamSubscription, perSeatTokens = false): string[] => {
  const features: string[] = []

  if (tariff.includedTokensCount > 0)
    features.push(perSeatTokens
      ? t('feature_tokens_per_seat', { count: tariff.includedTokensCount.toLocaleString() })
      : t('feature_tokens', { count: tariff.includedTokensCount.toLocaleString() }))

  if ((tariff.type === 'LaraueBoardsPersonal' || tariff.type === 'LaraueBoardsTeam') && tariff.limitIssuesPerMonth)
    features.push(t('feature_issues', { count: tariff.limitIssuesPerMonth.toLocaleString() }))

  if (tariff.type === 'LaraueBoardsPersonal' && tariff.limitFreeTeamOrganizationsCount)
    features.push(t('feature_free_orgs', { count: tariff.limitFreeTeamOrganizationsCount }))

  if (tariff.type === 'MarkdownTranslatorPersonal' && tariff.includedDailyFreeTokensCount)
    features.push(t('feature_daily_tokens', { count: tariff.includedDailyFreeTokensCount.toLocaleString() }))

  return features
}
</script>

<i18n lang="json">
{
  "en": {
    "personal_label": "For individuals",
    "team_label": "For teams",
    "billing_label_forever": "forever",
    "billing_label_month": "month",
    "billing_label_n_months": "every {count} months",
    "feature_tokens": "{count} tokens included",
    "feature_tokens_per_seat": "{count} tokens per seat",
    "feature_issues": "Up to {count} issues / month",
    "feature_free_orgs": "{count} free team organization(s)",
    "feature_daily_tokens": "{count} free tokens / day",
    "per_seat": "per seat",
    "team_pricing_note": "Price and included tokens are per seat, combined across your whole team.",
    "price_unavailable": "Free during MVP",
    "load_error": "Couldn't load pricing right now — please try again later.",
    "mvp_note": "We're still in the MVP phase: the Free plan is completely free right now with no token limits. These prices will take effect once the MVP phase is over."
  },
  "ru": {
    "personal_label": "Для себя",
    "team_label": "Для команд",
    "billing_label_forever": "навсегда",
    "billing_label_month": "месяц",
    "billing_label_n_months": "раз в {count} мес.",
    "feature_tokens": "{count} токенов включено",
    "feature_tokens_per_seat": "{count} токенов на место",
    "feature_issues": "До {count} issues в месяц",
    "feature_free_orgs": "{count} бесплатных организаций",
    "feature_daily_tokens": "{count} бесплатных токенов в день",
    "per_seat": "за место",
    "team_pricing_note": "Цена и включённые токены указаны за одно место и суммируются по всей команде.",
    "price_unavailable": "Бесплатно на MVP",
    "load_error": "Не удалось загрузить тарифы — попробуйте позже.",
    "mvp_note": "Сейчас продукт на стадии MVP: бесплатный тариф полностью бесплатен и без ограничений по токенам. Указанные цены вступят в силу после завершения стадии MVP."
  }
}
</i18n>

<template>
  <LSection :pre-title="preTitle" :title="title" :post-title="postTitle" :type="type">
    <div v-if="error || !data" class="pricing-error" role="alert">{{ t('load_error') }}</div>

    <template v-else>
      <p class="mvp-note reveal">{{ t('mvp_note') }}</p>

      <div v-if="data.personalSubscriptions.length" class="pricing-group personal reveal">
        <div class="pricing-group-label"><LNavIcon name="brain" />{{ t('personal_label') }}</div>
        <div class="pricing-cards">
          <div v-for="tariff in data.personalSubscriptions" :key="tariff.id" class="pricing-card">
            <div class="pricing-card-header">
              <div class="pricing-card-title">{{ tariff.title }}</div>
            </div>
            <div class="pricing-card-body">
              <div class="pricing-card-info">
                <div class="pricing-card-price-row">
                  <span class="pricing-card-price">{{ tariff.formattedPrice }}</span>
                  <span class="pricing-card-billing">/ {{ getBillingLabel(tariff) }}</span>
                </div>
              </div>
              <ul class="pricing-card-features">
                <li v-for="feature in getFeatures(tariff)" :key="feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>
            <a
                v-if="ctaHref"
                :href="ctaHref"
                class="pricing-card-unavailable"
                target="_blank"
                rel="noopener">{{ t('price_unavailable') }}</a>
            <div v-else class="pricing-card-unavailable">{{ t('price_unavailable') }}</div>
          </div>
        </div>
      </div>

      <div v-if="data.teamSubscriptions.length" class="pricing-group team reveal">
        <div class="pricing-group-label"><LNavIcon name="partners" />{{ t('team_label') }}</div>
        <p class="pricing-group-note">{{ t('team_pricing_note') }}</p>
        <div class="pricing-cards">
          <div v-for="tariff in data.teamSubscriptions" :key="tariff.id" class="pricing-card">
            <div class="pricing-card-header">
              <div class="pricing-card-title">{{ tariff.title }}</div>
            </div>
            <div class="pricing-card-body">
              <div class="pricing-card-info">
                <div class="pricing-card-price-row">
                  <span class="pricing-card-price">{{ tariff.formattedPrice }}</span>
                  <span class="pricing-card-billing">/ {{ getBillingLabel(tariff) }} &middot; {{ t('per_seat') }}</span>
                </div>
              </div>
              <ul class="pricing-card-features">
                <li v-for="feature in getFeatures(tariff, true)" :key="feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>
            <a
                v-if="ctaHref"
                :href="ctaHref"
                class="pricing-card-unavailable"
                target="_blank"
                rel="noopener">{{ t('price_unavailable') }}</a>
            <div v-else class="pricing-card-unavailable">{{ t('price_unavailable') }}</div>
          </div>
        </div>
      </div>
    </template>
  </LSection>
</template>

<style scoped>
.pricing-error{
  color:#8a3b1f;background:#fbeae4;border:1px solid #f0c4b3;border-radius:10px;
  padding:16px 20px;font-size:14px;font-weight:500;margin-top:24px;
}

.mvp-note{
  font-size:13px;color:var(--muted);background:var(--cream);border:1px solid var(--border);
  border-radius:10px;padding:14px 18px;margin-top:24px;line-height:1.6;
}
.dark .mvp-note{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:rgba(247,244,238,.65)}

.pricing-group{margin-top:40px}
.pricing-group-label{
  display:flex;align-items:center;gap:8px;
  font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:16px;
}
.pricing-group-label :deep(.nav-icon-svg){width:16px;height:16px}
.team .pricing-group-label{color:var(--accent)}
.personal .pricing-group-label{color:var(--blue)}

.pricing-group-note{margin:-8px 0 20px;font-size:13px;color:var(--muted);max-width:620px;line-height:1.5}

.pricing-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:24px;align-items:stretch}
.pricing-card{
  background:#fff;border:1px solid var(--border);border-radius:16px;
  overflow:hidden;position:relative;
  display:flex;flex-direction:column;
  transition:box-shadow .2s,transform .2s;
}
.pricing-card:hover{box-shadow:0 8px 32px rgba(15,14,12,.1);transform:translateY(-3px)}

.pricing-card-header{padding:24px 28px}
.personal .pricing-card-header{background:var(--msg-blue, #2d7dd2)}
.team .pricing-card-header{background:var(--accent)}

.pricing-card-body{padding:28px 28px 0;display:flex;flex-direction:column;flex:1}

.pricing-card-info{margin-bottom:22px}

.pricing-card-title{font-family:var(--serif);font-size:19px;font-weight:700;letter-spacing:-.2px;color:#fff}

.pricing-card-price-row{display:flex;align-items:baseline;gap:6px}
.pricing-card-price{font-size:30px;font-weight:400;letter-spacing:-.3px;color:var(--ink)}
.pricing-card-billing{font-size:13px;font-weight:500;color:var(--muted)}

.pricing-card-features{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:28px;flex:1}
.pricing-card-features li{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--muted);line-height:1.45}
.pricing-card-features li svg{width:15px;height:15px;flex-shrink:0;margin-top:2px}
.personal .pricing-card-features li svg{stroke:var(--blue)}
.team .pricing-card-features li svg{stroke:var(--accent)}

.pricing-card-cta{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  border-radius:8px;border:1.5px solid;padding:11px 20px;
  text-decoration:none;font-weight:600;font-size:14px;
  transition:background .2s,color .2s,transform .15s;align-self:flex-start;margin-bottom:28px;
}
.personal .pricing-card-cta{border-color:var(--blue);color:var(--blue)}
.personal .pricing-card-cta:hover{background:var(--blue);color:#fff;transform:translateY(-1px)}
.team .pricing-card-cta{border-color:var(--accent);color:var(--accent)}
.team .pricing-card-cta:hover{background:var(--accent);color:#fff;transform:translateY(-1px)}

.pricing-card-unavailable{
  display:block;margin:auto -28px 0;padding:14px 28px;
  background:var(--cream);color:var(--ink);
  text-align:center;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  text-decoration:none;transition:background .2s,color .2s;
}
a.pricing-card-unavailable:hover{color:#fff}
.personal .pricing-card-unavailable{background:var(--blue-light);color:var(--blue)}
.personal a.pricing-card-unavailable:hover{background:var(--blue)}
.team .pricing-card-unavailable{background:rgba(200,75,47,.12);color:var(--accent)}
.team a.pricing-card-unavailable:hover{background:var(--accent)}

.dark .pricing-group-label{color:rgba(247,244,238,.7)}
.dark .pricing-group-note{color:rgba(247,244,238,.55)}
.dark .pricing-card{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12)}
.dark .pricing-card-price{color:#fff}
.dark .pricing-card-features li{color:rgba(247,244,238,.75)}
.dark .pricing-card-unavailable{background:rgba(255,255,255,.08);color:rgba(247,244,238,.85)}

@media(max-width:480px){
  .pricing-cards{grid-template-columns:1fr}
}
</style>
