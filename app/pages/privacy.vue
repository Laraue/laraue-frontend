<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('seoTitle'),
  description: t('seoDescription'),
  ogTitle: t('seoTitle'),
  ogDescription: t('seoDescription'),
  ogType: 'website',
})

// Emails and @handles live in the template, not in the messages below: vue-i18n treats '@' in a
// message as the start of a linked-message reference.
const contactEmail = 'info@laraue.com'
</script>

<template>
  <main class="privacy">
    <article class="privacy__article">
      <h1>{{ t('title') }}</h1>
      <p class="privacy__updated">{{ t('updated') }}</p>

      <p>{{ t('intro') }}</p>

      <h2>{{ t('whoTitle') }}</h2>
      <p>
        {{ t('whoText') }}
        <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
        {{ t('whoOr') }}
        <a href="https://t.me/win7user10" rel="nofollow" target="_blank">Telegram</a>.
      </p>

      <h2>{{ t('collectTitle') }}</h2>
      <h3>{{ t('accountTitle') }}</h3>
      <p>{{ t('accountText') }}</p>
      <ul>
        <li>{{ t('accountTelegram') }}</li>
        <li>{{ t('accountGoogle') }}</li>
      </ul>
      <p>{{ t('accountIdentity') }}</p>

      <h3>{{ t('contentTitle') }}</h3>
      <p>{{ t('contentText') }}</p>
      <ul>
        <li>{{ t('contentBoards') }}</li>
        <li>{{ t('contentTelegram') }}</li>
        <li>{{ t('contentApiKeys') }}</li>
        <li>{{ t('contentUsage') }}</li>
      </ul>

      <h3>{{ t('paymentsTitle') }}</h3>
      <p>{{ t('paymentsText') }}</p>
      <ul>
        <li>{{ t('paymentsData') }}</li>
        <li>{{ t('paymentsCard') }}</li>
        <li>{{ t('paymentsReceipt') }}</li>
      </ul>

      <h3>{{ t('analyticsTitle') }}</h3>
      <p>{{ t('analyticsText') }}</p>

      <h2>{{ t('useTitle') }}</h2>
      <ul>
        <li>{{ t('use1') }}</li>
        <li>{{ t('use2') }}</li>
        <li>{{ t('use3') }}</li>
        <li>{{ t('use4') }}</li>
        <li>{{ t('use5') }}</li>
      </ul>

      <h2>{{ t('googleTitle') }}</h2>
      <p>{{ t('googleText') }}</p>

      <h2>{{ t('shareTitle') }}</h2>
      <p>{{ t('shareText') }}</p>
      <ul>
        <li>{{ t('shareTelegram') }}</li>
        <li>{{ t('shareGoogle') }}</li>
        <li>{{ t('shareAi') }}</li>
        <li>{{ t('sharePayments') }}</li>
        <li>{{ t('shareAnalytics') }}</li>
      </ul>
      <p>{{ t('shareNoSale') }}</p>

      <h2>{{ t('retentionTitle') }}</h2>
      <p>{{ t('retentionText') }}</p>
      <p>{{ t('retentionPayments') }}</p>
      <p>
        {{ t('retentionDelete') }}
        <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>.
      </p>

      <h2>{{ t('rightsTitle') }}</h2>
      <p>
        {{ t('rightsText') }}
        <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>.
      </p>

      <h2>{{ t('consentTitle') }}</h2>
      <p>{{ t('consentText') }}</p>

      <h2>{{ t('changesTitle') }}</h2>
      <p>{{ t('changesText') }}</p>
    </article>
  </main>
</template>

<i18n lang="json">
{
  "en": {
    "seoTitle": "Privacy Policy — Laraue",
    "seoDescription": "How Laraue Boards and laraue.com collect, use and protect your data.",
    "title": "Privacy Policy",
    "updated": "Last updated: September 30, 2026",
    "intro": "This policy explains what data Laraue Software collects when you use the laraue.com website and Laraue Boards (the web app, the Telegram bot and the MCP integration), how it is used, and what choices you have.",
    "whoTitle": "Who we are",
    "whoText": "Laraue Software is an independent project run by Ilya A. Belyansky, self-employed (INN 344714008567). For any privacy question or request, contact us at",
    "whoOr": "or on",
    "collectTitle": "What data we collect",
    "accountTitle": "Account data",
    "accountText": "When you sign in, we receive basic profile data from the sign-in method you choose:",
    "accountTelegram": "Telegram: your Telegram user id, username, first and last name, and language.",
    "accountGoogle": "Google: your Google account id, email address and name (full, given and family name).",
    "accountIdentity": "This data is kept in a shared Laraue account service, so that the same account is recognized across Laraue products you use. Laraue Boards itself keeps only your account identifiers and a display name derived from your profile.",
    "contentTitle": "Content and usage data",
    "contentText": "To provide the service, we store the data you create or send to it:",
    "contentBoards": "Organizations, spaces, boards, issues, comments, attributes and attached files.",
    "contentTelegram": "Telegram messages you save with the bot — their text, attachments, the chat title, the sender's name and the date. If you link a chat in the mode that saves every message, every message in that chat is saved.",
    "contentApiKeys": "API keys you create for MCP or other integrations, and when they were last used.",
    "contentUsage": "Your plan and the amount of AI features you have used, to apply plan limits.",
    "paymentsTitle": "Payment data",
    "paymentsText": "When you pay for a plan, payments are processed by the Robokassa payment service. We receive and store:",
    "paymentsData": "The payment amount, currency, date, status and the plan you paid for, linked to your account.",
    "paymentsCard": "We never receive or store your card number or other bank details: you enter them on the Robokassa side.",
    "paymentsReceipt": "The receipt is issued through the seller's self-employed account, and the email address you provide for it may be used to send the receipt.",
    "analyticsTitle": "Website analytics",
    "analyticsText": "The laraue.com website and the public pages of boards.laraue.com (the landing page and the documentation) use Google Analytics to understand how visitors use them. The Laraue Boards app itself does not use it. Where the law requires consent, Google Analytics is only loaded after you accept it in the cookie banner. For visitors from Russia, Google Analytics is not used at all.",
    "useTitle": "How we use your data",
    "use1": "To sign you in and keep you signed in.",
    "use2": "To provide Laraue Boards: store your content, show your name to other members of the organizations you belong to, and deliver bot replies.",
    "use3": "To run AI features you explicitly use, such as turning a message into an issue with /aisave.",
    "use4": "To apply plan limits and to handle payments for paid plans.",
    "use5": "To understand and improve the website, through analytics.",
    "googleTitle": "Google user data",
    "googleText": "When you sign in with Google, we only request your basic profile (account id, email address and name) and use it solely to create and identify your Laraue account and to show your name in the product. We do not use Google user data for advertising, do not sell it, and do not share it with third parties except as described in this policy.",
    "shareTitle": "Third parties",
    "shareText": "We share data only with services needed to run the product:",
    "shareTelegram": "Telegram — to operate the bot and sign-in with Telegram.",
    "shareGoogle": "Google — to operate sign-in with Google.",
    "shareAi": "An AI model provider — only the text of the content you send to an AI feature (for example a message saved with /aisave), to generate the result.",
    "sharePayments": "Robokassa — to accept payments; it receives the payment amount, your account identifier for the order and, where needed, your email for the receipt.",
    "shareAnalytics": "Google Analytics — website analytics, as described above.",
    "shareNoSale": "We never sell your data.",
    "retentionTitle": "Retention and deletion",
    "retentionText": "We keep your data while your account exists. When you delete an organization, space, issue or comment, it is hidden from the product but kept in the organization's change history.",
    "retentionPayments": "Records of payments are kept for as long as accounting and tax law requires, even after your account is deleted.",
    "retentionDelete": "To delete your account and all data related to it permanently, send a request to",
    "rightsTitle": "Your rights",
    "rightsText": "You can ask us to access, correct, export or delete your personal data, and you can withdraw consent to website analytics at any time by clearing this site's data in your browser. For any of these requests, contact",
    "consentTitle": "Consent to personal data processing",
    "consentText": "By signing in and by paying for a plan you consent to the processing of your personal data described in this policy, including its transfer to the services listed above, for the purposes of providing the service and processing payments, under the laws of the Russian Federation on personal data. You can withdraw consent at any time by sending a request to the address above; after that we will delete your data, except what we must keep by law.",
    "changesTitle": "Changes to this policy",
    "changesText": "If we change this policy, we will update this page and the date at the top of it."
  },
  "ru": {
    "seoTitle": "Политика конфиденциальности — Laraue",
    "seoDescription": "Какие данные собирают Laraue Boards и laraue.com, как они используются и защищаются.",
    "title": "Политика конфиденциальности",
    "updated": "Последнее обновление: 30 сентября 2026",
    "intro": "Эта политика объясняет, какие данные Laraue Software собирает при использовании сайта laraue.com и Laraue Boards (веб-приложения, Telegram-бота и MCP-интеграции), как они используются и какие у вас есть возможности.",
    "whoTitle": "Кто мы",
    "whoText": "Laraue Software — независимый проект Белянского Ильи Александровича, самозанятого (ИНН 344714008567). По любым вопросам и запросам о персональных данных пишите на",
    "whoOr": "или в",
    "collectTitle": "Какие данные мы собираем",
    "accountTitle": "Данные аккаунта",
    "accountText": "При входе мы получаем базовые данные профиля от выбранного способа входа:",
    "accountTelegram": "Telegram: ваш идентификатор пользователя Telegram, имя пользователя, имя и фамилию, язык.",
    "accountGoogle": "Google: идентификатор аккаунта Google, адрес электронной почты и имя (полное, имя и фамилию).",
    "accountIdentity": "Эти данные хранятся в общем сервисе аккаунтов Laraue, чтобы один и тот же аккаунт узнавался во всех продуктах Laraue, которыми вы пользуетесь. Сам Laraue Boards хранит только идентификаторы аккаунта и отображаемое имя, полученное из профиля.",
    "contentTitle": "Контент и данные об использовании",
    "contentText": "Для работы сервиса мы храним данные, которые вы создаёте или отправляете в него:",
    "contentBoards": "Организации, пространства, доски, задачи, комментарии, атрибуты и прикреплённые файлы.",
    "contentTelegram": "Сообщения Telegram, которые вы сохраняете через бота, — их текст, вложения, название чата, имя отправителя и дату. Если чат привязан в режиме сохранения каждого сообщения, сохраняются все сообщения этого чата.",
    "contentApiKeys": "API-ключи, созданные вами для MCP и других интеграций, и время их последнего использования.",
    "contentUsage": "Ваш тариф и объём использованных ИИ-функций — для применения лимитов тарифа.",
    "paymentsTitle": "Данные об оплате",
    "paymentsText": "Оплата тарифов проходит через платёжный сервис Robokassa. Мы получаем и храним:",
    "paymentsData": "Сумму, валюту, дату и статус платежа и оплаченный тариф, связанные с вашим аккаунтом.",
    "paymentsCard": "Номер вашей карты и другие банковские данные мы не получаем и не храним: вы вводите их на стороне Robokassa.",
    "paymentsReceipt": "Чек формируется через профиль самозанятого исполнителя; указанный вами для чека адрес электронной почты может использоваться для отправки чека.",
    "analyticsTitle": "Аналитика сайта",
    "analyticsText": "Сайт laraue.com и публичные страницы boards.laraue.com (лендинг и документация) используют Google Analytics, чтобы понимать, как посетители ими пользуются. Само приложение Laraue Boards его не использует. Там, где закон требует согласия, Google Analytics загружается только после того, как вы примете его в баннере cookie. Для посетителей из России Google Analytics не используется вовсе.",
    "useTitle": "Как мы используем данные",
    "use1": "Чтобы выполнить вход и сохранять его.",
    "use2": "Чтобы предоставлять Laraue Boards: хранить ваш контент, показывать ваше имя другим участникам ваших организаций и отправлять ответы бота.",
    "use3": "Чтобы выполнять ИИ-функции, которые вы явно используете, например превращать сообщение в задачу командой /aisave.",
    "use4": "Чтобы применять лимиты тарифов и проводить оплату платных тарифов.",
    "use5": "Чтобы понимать и улучшать сайт с помощью аналитики.",
    "googleTitle": "Данные пользователей Google",
    "googleText": "При входе через Google мы запрашиваем только базовый профиль (идентификатор аккаунта, адрес электронной почты и имя) и используем его исключительно для создания и идентификации вашего аккаунта Laraue и отображения вашего имени в продукте. Мы не используем данные пользователей Google для рекламы, не продаём их и не передаём третьим лицам, кроме случаев, описанных в этой политике.",
    "shareTitle": "Третьи стороны",
    "shareText": "Мы передаём данные только сервисам, необходимым для работы продукта:",
    "shareTelegram": "Telegram — для работы бота и входа через Telegram.",
    "shareGoogle": "Google — для входа через Google.",
    "shareAi": "Поставщику ИИ-моделей — только текст контента, который вы отправляете в ИИ-функцию (например, сообщение, сохранённое через /aisave), чтобы получить результат.",
    "sharePayments": "Robokassa — для приёма платежей; сервис получает сумму платежа, идентификатор вашего аккаунта для заказа и, при необходимости, адрес электронной почты для чека.",
    "shareAnalytics": "Google Analytics — аналитика сайта, как описано выше.",
    "shareNoSale": "Мы никогда не продаём ваши данные.",
    "retentionTitle": "Хранение и удаление",
    "retentionText": "Мы храним ваши данные, пока существует ваш аккаунт. Удалённые организации, пространства, задачи и комментарии скрываются в продукте, но сохраняются в истории изменений организации.",
    "retentionPayments": "Записи о платежах хранятся столько, сколько требуют законы о бухгалтерском и налоговом учёте, в том числе после удаления аккаунта.",
    "retentionDelete": "Чтобы безвозвратно удалить аккаунт и все связанные с ним данные, отправьте запрос на",
    "rightsTitle": "Ваши права",
    "rightsText": "Вы можете запросить доступ к своим персональным данным, их исправление, выгрузку или удаление, а также в любой момент отозвать согласие на аналитику сайта, очистив данные этого сайта в браузере. По любым таким запросам пишите на",
    "consentTitle": "Согласие на обработку персональных данных",
    "consentText": "Выполняя вход и оплачивая тариф, вы даёте согласие на обработку ваших персональных данных, описанную в этой политике, включая их передачу перечисленным выше сервисам, в целях предоставления сервиса и проведения платежей в соответствии с законодательством Российской Федерации о персональных данных. Вы можете отозвать согласие в любой момент, направив запрос на указанный выше адрес; после этого мы удалим ваши данные, кроме тех, которые обязаны хранить по закону.",
    "changesTitle": "Изменения политики",
    "changesText": "Если мы изменим эту политику, мы обновим эту страницу и дату в её начале."
  }
}
</i18n>

<style scoped>
.privacy {
  flex: 1;
  background: var(--paper);
  color: var(--ink);
  padding: 64px 24px 96px;
}

.privacy__article {
  max-width: 760px;
  margin: 0 auto;
  font-family: var(--sans);
  font-size: 17px;
  line-height: 1.7;
}

.privacy__article h1 {
  font-family: var(--serif);
  font-size: 40px;
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 8px;
}

.privacy__updated {
  color: var(--muted);
  font-size: 14px;
  margin: 0 0 32px;
}

.privacy__article h2 {
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 700;
  margin: 40px 0 12px;
}

.privacy__article h3 {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 8px;
}

.privacy__article p {
  margin: 0 0 14px;
}

.privacy__article ul {
  margin: 0 0 14px;
  padding-left: 22px;
}

.privacy__article li {
  margin-bottom: 6px;
}

.privacy__article a {
  color: var(--accent);
}

@media (max-width: 600px) {
  .privacy {
    padding: 40px 16px 64px;
  }

  .privacy__article h1 {
    font-size: 30px;
  }
}
</style>
