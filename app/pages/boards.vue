<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, ref } from "vue";

const { t } = useI18n();
const { getStaticOgImageUrl } = usePathUtil();
const ogImageUrl = getStaticOgImageUrl('boards-og');

const openFaq = ref<number | null>(null);
const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index;
};
const faqItems = computed(() =>
  [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ q: t(`faq${i}q`), a: t(`faq${i}a`) }))
);

import {
  defineOffer,
  defineSoftwareApp,
  defineBreadcrumb,
  useSchemaOrg,
} from '@unhead/schema-org/vue'
import LMainContent from "~/components/ui/LMainContent.vue";
import LNavIcon from "~/components/ui/LNavIcon.vue";
import LLandingIntro from "~/components/landins/LLandingIntro.vue";
import LActionButton from "~/components/landins/LActionButton.vue";
import LSection from "~/components/landins/LSection.vue";
import LFeaturesGrid from "~/components/landins/LFeaturesGrid.vue";
import LPlatformBadge from "~/components/landins/LPlatformBadge.vue";
import LCallToAction from "~/components/landins/LCallToAction.vue";
const localePath = useLocalePath();

useSchemaOrg([
  defineSoftwareApp({
    name: t('seoTitle'),
    description: t('seoDescription'),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Telegram",
    offers: [
      defineOffer({
        price: 0,
        priceCurrency: "USD",
        description: 'Free: boards, spaces, epics, issues, custom attributes, organizations. Telegram bot, Mini App and web app included.'
      })
    ]
  }),
  {
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: t('faq1q'), acceptedAnswer: { '@type': 'Answer', text: t('faq1a') } },
      { '@type': 'Question', name: t('faq2q'), acceptedAnswer: { '@type': 'Answer', text: t('faq2a') } },
      { '@type': 'Question', name: t('faq3q'), acceptedAnswer: { '@type': 'Answer', text: t('faq3a') } },
      { '@type': 'Question', name: t('faq4q'), acceptedAnswer: { '@type': 'Answer', text: t('faq4a') } },
      { '@type': 'Question', name: t('faq5q'), acceptedAnswer: { '@type': 'Answer', text: t('faq5a') } },
      { '@type': 'Question', name: t('faq6q'), acceptedAnswer: { '@type': 'Answer', text: t('faq6a') } },
      { '@type': 'Question', name: t('faq7q'), acceptedAnswer: { '@type': 'Answer', text: t('faq7a') } },
      { '@type': 'Question', name: t('faq8q'), acceptedAnswer: { '@type': 'Answer', text: t('faq8a') } },
    ]
  },
  defineBreadcrumb({
    itemListElement: [
      { name: t('bc_home'), item: localePath('/') },
      { name: t('bc_current') },
    ]
  }),
])

useSeoMeta({
  title: computed(() => t('seoTitle')),
  description: computed(() => t('seoDescription')),
  ogTitle: computed(() => t('seoTitle')),
  ogDescription: computed(() => t('seoDescription')),
  ogImage: ogImageUrl,
  ogImageWidth: "1200",
  ogImageHeight: "630",
  ogImageType: "image/png",
  ogImageAlt: t('seoTitle'),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: computed(() => t('seoTitle')),
  twitterDescription: computed(() => t('seoDescription')),
  twitterImage: ogImageUrl,
  twitterImageAlt: t('seoTitle')
})
</script>

<i18n lang="json">
{
  "en": {
    "bc_home": "Home",
    "bc_current": "Laraue Boards",
    "hv_sender": "Alex Chen",
    "hv_sender_initials": "AC",
    "hv_chat_title": "Product Team",
    "hv_chat": "#product-team",
    "hv_msg": "checkout button's broken on mobile safari, cant pay 😩",
    "hv_replier": "Priya Nair",
    "hv_replier_initials": "PN",
    "hv_time1": "9:41",
    "hv_time2": "9:42",
    "hv_command": "/aisave",
    "hv_arrow": "New issue in Backlog, title & description written by AI",
    "hv_key": "WRK-42",
    "hv_badge": "Backlog",
    "hv_title": "Fix checkout button on mobile Safari",
    "hv_desc": "Pay button doesn't respond to tap. Only happens in Safari on mobile",

    "seoTitle": "Laraue Boards — Turn Telegram Messages into Kanban Boards",
    "seoDescription": "Stop losing important messages in Telegram. Laraue Boards turns messages you send to {'@'}msgboard_bot into cards on a kanban board. Free, open source, works as a Telegram Mini App and a web app.",

    "sec_top": "Overview",
    "sec_use_cases": "Use cases",
    "sec_platforms": "Platforms",
    "sec_features": "Features",
    "sec_how": "How it works",
    "sec_open": "Open source",

    "open_webapp": "Web App",

    "hero_eyebrow": "Boards by Laraue Software",
    "hero_title": "Turn Telegram messages\ninto Kanban boards",
    "hero_sub": "Forward a message to {'@'}msgboard_bot alone, or link your team's group chats to route work straight to shared boards. Free, open source, ready in seconds.",
    "hero_cta_web": "Open Web App",

    "uc_label": "Built for two worlds",
    "uc_title": "Personal productivity\nor team coordination",
    "uc_sub": "Laraue Boards adapts to how you work — solo or with a team.",
    "uc_personal_title": "Personal use",
    "uc_personal_desc": "Capture thoughts, tasks and links without leaving Telegram. Forward a message to the bot and it lands on your board.",
    "uc_p1": "Forward any message — text, photo, video or album",
    "uc_p2": "Edit the message in Telegram, the card updates",
    "uc_p3": "Search everything by keyword",
    "uc_p4": "Organise into epics and columns when you have time",
    "uc_p_cta": "Start with the Telegram bot",
    "uc_teams_title": "Small teams & agencies",
    "uc_teams_desc": "A lightweight Jira alternative for teams that find Jira overwhelming — and for agencies juggling several clients at once. Create an organization, invite teammates, track work together.",
    "uc_t1": "Organization mode with shared boards",
    "uc_t2": "Invite teammates via Telegram",
    "uc_t3": "Permissions per operation on spaces, epics and issues",
    "uc_t4": "Custom attributes defined by an admin",
    "uc_t5": "One space per client, scoped access for contractors",
    "uc_t_cta": "Open web app",

    "pl_label": "Two ways to use it",
    "pl_title": "Web app & Telegram Mini App",
    "pl_sub": "Start in Telegram, continue in the browser. Your boards are always in sync.",
    "web_name": "Web App",
    "web_desc": "Full-featured Kanban in the browser. Sign in with your Telegram account — no separate registration. Works on desktop and mobile.",
    "web_f1": "Telegram login — no password",
    "web_f2": "Full drag-and-drop Kanban",
    "web_f3": "Organization & permission management",
    "web_f4": "Large screen — see more, do more",
    "tg_name": "Telegram Mini App",
    "tg_desc": "Access your boards inside Telegram without leaving the app. Forward any message to the bot and it lands on your board in seconds.",
    "tg_f1": "Forward messages from any chat",
    "tg_f2": "Native iOS & Android feel",
    "tg_f3": "Instant — nothing to install",
    "tg_f4": "The same boards as the web app",

    "feat_label": "Everything you need",
    "feat_title": "Nothing you don't",
    "feat_sub": "Deliberately simple. Every feature earns its place.",
    "f1t": "Visual Kanban Boards",
    "f1d": "Drag-and-drop cards across columns. Clean, fast, works on any screen.",
    "f2t": "Forward to Board",
    "f2d": "Send any Telegram message to the bot and it appears as a card instantly — with a 👍 to confirm.",
    "f3t": "Media and albums",
    "f3d": "Photos, videos and whole albums become one card with all the attachments, in original quality.",
    "f4t": "Edits sync back",
    "f4d": "Edit the message in Telegram and the card changes with it. The reaction turns into a ❤.",
    "f5t": "Spaces and issue keys",
    "f5d": "Group epics into spaces per project. Every issue gets a key like WRK-42 you can quote in a chat.",
    "f6t": "Custom attributes",
    "f6d": "An admin defines attributes — task type, due by — and the team fills them in on issues.",
    "f7t": "Organization & permissions",
    "f7d": "Shared boards, and permissions set per operation on spaces, epics and issues.",
    "f8t": "Privacy first",
    "f8d": "Login via Telegram — no new password. Your data is never sold.",
    "f9t": "Open source",
    "f9d": "The backend and the frontend are public. Read exactly what happens to your message.",
    "f10t": "AI-cleaned cards",
    "f10d": "Send /aisave and a messy, rambling message becomes a clean title with a bullet-point description. Free while it's in testing.",
    "f11t": "Search from any chat",
    "f11d": "Type {'@'}msgboard_bot and a query in any Telegram chat to find an issue — no need to open the app.",

    "struct_label": "How it's organized",
    "struct_title": "Structured like a real tracker,\nnot a chat log",
    "struct_sub": "One hierarchy that works for a single board or twenty client spaces.",
    "struct_org": "Organization",
    "struct_org_ex": "Acme Studio",
    "struct_space": "Space",
    "struct_space_ex": "Client: Redsight",
    "struct_board": "Board",
    "struct_board_ex": "Website Redesign",
    "struct_issue": "Issue",
    "struct_issue_ex": "WRK-42 — Fix nav bug",
    "struct_p1t": "Quotable issue keys",
    "struct_p1d": "Every issue gets a short key like WRK-42 you can reference in a chat message or a commit.",
    "struct_p2t": "Spaces per client or project",
    "struct_p2d": "Group boards by client, product or department. Each space keeps its own backlog and numbering.",
    "struct_p3t": "Move without rebuilding",
    "struct_p3d": "Start in your personal organization, then move a whole space to a team org later — nothing to recreate.",

    "cta2_label": "Ready when you are",
    "cta2_title": "Send your first message\nright now",
    "cta2_sub": "It's already in your Telegram. Open the bot and try it — no signup, no setup.",

    "os_label": "Built in the open",
    "os_title": "Open source, mistakes included",
    "os_sub": "You can read the code — and you can read how it was written.",
    "os_code_title": "The code is public",
    "os_code_desc": "Backend and frontend are both on GitHub. People told us they were not ready to trust private notes to a product they did not know — open code is the honest answer to that.",
    "os_code_cta": "View on GitHub",
    "os_devlog_title": "The devlog",
    "os_devlog_desc": "We write down how the product is being built, including what went wrong — the bot that asked too many questions and had to be rolled back, the database decision we got wrong.",
    "os_devlog_cta": "Read the full story",

    "faq_label": "Questions",
    "faq_title": "Common questions",
    "faq1q": "Is it free?",
    "faq1a": "Yes. Everything on this page is free to use. /aisave is free while it's in testing and will become a paid feature later — everything else stays free.",
    "faq2q": "Is it really open source?",
    "faq2a": "Yes. Both the backend and the frontend are public on GitHub, so you can read exactly what happens to a message after you send it.",
    "faq3q": "How is this different from Telegram Saved Messages?",
    "faq3a": "Saved Messages is a great place to save something quickly, but a bad place to find it later. Laraue Boards keeps the saving just as easy and gives what you saved a board, columns and statuses.",
    "faq4q": "Do I need an account or a password?",
    "faq4a": "No. You log in with Telegram. In the Mini App you are already logged in, and the web version has a Telegram login button.",
    "faq5q": "Is Laraue Boards a Jira alternative?",
    "faq5a": "Yes — a lighter one, built for teams that find Jira's setup overwhelming. You still get spaces, boards, custom attributes and permissions, but the Telegram connection means capturing work takes a forwarded message instead of a form.",
    "faq6q": "Can I use it alone, without a team?",
    "faq6a": "Yes. Every account gets a private personal organization automatically — no team, no invites, nothing to configure. Forward a message and it lands on your own board.",
    "faq7q": "Does Laraue Boards work on mobile?",
    "faq7a": "Yes, two ways: the Telegram Mini App opens inside Telegram on any phone, and the web app is fully responsive if you'd rather use a browser.",
    "faq8q": "Can I search across all my boards at once?",
    "faq8a": "Yes. The web app has an all-issues search across every space and board, and you can also search from inside any Telegram chat by typing {'@'}msgboard_bot followed by your query.",

    "pr_note": "Laraue Boards is free. /aisave is free while it's in testing and will become a paid feature later; everything else on this page stays free.",

    "cta_label": "Get started today",
    "cta_title": "Your work deserves\nbetter than chat history",
    "cta_sub": "Free and open source. Works in 30 seconds.",
    "documentation": "Documentation",
    "project_page": "How it's built",
    "project_description": "More details"
  },
  "ru": {
    "bc_home": "Главная",
    "bc_current": "Laraue Boards",
    "hv_sender": "Игорь Петров",
    "hv_sender_initials": "ИП",
    "hv_chat_title": "Продукт-команда",
    "hv_chat": "#продукт-команда",
    "hv_msg": "кнопка оплаты не работает в сафари на телефоне, не могу оплатить 😩",
    "hv_replier": "Мария Соколова",
    "hv_replier_initials": "МС",
    "hv_time1": "9:41",
    "hv_time2": "9:42",
    "hv_command": "/aisave",
    "hv_arrow": "Новый issue в Бэклоге, заголовок и описание пишет ИИ",
    "hv_key": "WRK-42",
    "hv_badge": "Бэклог",
    "hv_title": "Починить кнопку оплаты в мобильном Safari",
    "hv_desc": "Кнопка не реагирует на нажатие. Только в Safari на телефоне",

    "seoTitle": "Laraue Boards — превращайте сообщения Telegram в Kanban-доски",
    "seoDescription": "Перестаньте терять важные сообщения в Telegram. Laraue Boards превращает сообщения, отправленные боту {'@'}msgboard_bot, в карточки на канбан-доске. Бесплатно, открытый код, работает как Telegram Mini App и веб-приложение.",

    "sec_top": "Обзор",
    "sec_use_cases": "Кейсы",
    "sec_platforms": "Платформы",
    "sec_features": "Функции",
    "sec_how": "Как это работает",
    "sec_open": "Открытый код",

    "open_webapp": "Веб-приложение",

    "hero_eyebrow": "Boards от Laraue Software",
    "hero_title": "Превращайте сообщения Telegram\nв Kanban-доски",
    "hero_sub": "Пересылайте сообщение {'@'}msgboard_bot в одиночку, или привяжите групповые чаты команды, чтобы задачи попадали сразу на общие доски. Бесплатно, с открытым кодом, готово за секунды.",
    "hero_cta_web": "Открыть веб-приложение",


    "uc_label": "Для двух сценариев",
    "uc_title": "Личная продуктивность\nили командная работа",
    "uc_sub": "Laraue Boards адаптируется под ваш стиль работы — одиночный или командный режим.",
    "uc_personal_title": "Личное использование",
    "uc_personal_desc": "Сохраняйте мысли, задачи и ссылки, не выходя из Telegram. Перешлите сообщение боту — оно окажется на доске.",
    "uc_p1": "Пересылайте что угодно — текст, фото, видео или альбом",
    "uc_p2": "Отредактировали сообщение в Telegram — карточка обновилась",
    "uc_p3": "Поиск по ключевому слову",
    "uc_p4": "Организуйте по эпикам и статусам, когда найдется время",
    "uc_p_cta": "Начать через Telegram-бота",
    "uc_teams_title": "Команды и агентства",
    "uc_teams_desc": "Лёгкая альтернатива Jira для команд, которым она кажется избыточной, — и для агентств, ведущих сразу несколько клиентов. Создайте организацию, пригласите коллег, работайте над задачами вместе.",
    "uc_t1": "Режим организации с общими досками",
    "uc_t2": "Приглашайте коллег через Telegram",
    "uc_t3": "Права по операциям над спейсами, эпиками и issues",
    "uc_t4": "Кастомные атрибуты, настраиваемые админом",
    "uc_t5": "Отдельный спейс на каждого клиента, права — точечно для подрядчиков",
    "uc_t_cta": "Открыть веб-приложение",

    "pl_label": "Два способа использования",
    "pl_title": "Веб-приложение и Telegram Mini App",
    "pl_sub": "Начните в Telegram, продолжайте в браузере. Доски всегда синхронизированы.",
    "web_name": "Веб-приложение",
    "web_desc": "Полноценный Kanban в браузере. Вход через аккаунт Telegram без дополнительной регистрации. Работает на десктопе и мобильных.",
    "web_f1": "Вход через Telegram — без пароля",
    "web_f2": "Drag-and-drop Kanban",
    "web_f3": "Управление организацией и правами",
    "web_f4": "Адаптация под большой экран",
    "tg_name": "Telegram Mini App",
    "tg_desc": "Доступ к доскам прямо внутри Telegram. Перешлите любое сообщение боту — оно сразу появится на доске.",
    "tg_f1": "Пересылка сообщений из любого чата",
    "tg_f2": "Нативный iOS и Android",
    "tg_f3": "Мгновенно — ничего не нужно устанавливать",
    "tg_f4": "Те же доски, что в веб-приложении",

    "feat_label": "Всё, что нужно",
    "feat_title": "И ничего лишнего",
    "feat_sub": "Намеренная простота. Каждая функция действительно полезна.",
    "f1t": "Визуальные Kanban-доски",
    "f1d": "Drag-and-drop карточки по колонкам. Работает на любом экране.",
    "f2t": "Пересылка на доску",
    "f2d": "Отправьте сообщение боту — оно станет карточкой, а бот подтвердит это реакцией 👍.",
    "f3t": "Медиа и альбомы",
    "f3d": "Фото, видео и целые альбомы становятся одной карточкой со всеми вложениями, в исходном качестве.",
    "f4t": "Правки синхронизируются",
    "f4d": "Отредактируйте сообщение в Telegram — карточка изменится. Реакция сменится на ❤.",
    "f5t": "Спейсы и номера issues",
    "f5d": "Группируйте эпики в спейсы по проектам. У каждого issue есть номер вида WRK-42 — на него можно сослаться в чате.",
    "f6t": "Кастомные атрибуты",
    "f6d": "Админ задаёт атрибуты — тип задачи, выполнить до — а команда заполняет их в issues.",
    "f7t": "Организация и права",
    "f7d": "Общие доски и права, настраиваемые по операциям над спейсами, эпиками и issues.",
    "f8t": "Конфиденциальность",
    "f8d": "Вход через Telegram — без нового пароля. Данные не продаются.",
    "f9t": "Открытый код",
    "f9d": "Бэкенд и фронтенд открыты. Можно проверить, что происходит с сообщением.",
    "f10t": "Карточки, очищенные ИИ",
    "f10d": "Команда /aisave превращает сумбурное сообщение в чёткий заголовок с описанием по пунктам. Бесплатно, пока функция тестируется.",
    "f11t": "Поиск из любого чата",
    "f11d": "Введите {'@'}msgboard_bot и запрос в любом чате Telegram, чтобы найти issue, не открывая приложение.",

    "struct_label": "Как всё устроено",
    "struct_title": "Структура как в настоящем трекере,\nа не в переписке",
    "struct_sub": "Одна иерархия — подходит и для одной доски, и для двадцати клиентских спейсов.",
    "struct_org": "Организация",
    "struct_org_ex": "Acme Studio",
    "struct_space": "Спейс",
    "struct_space_ex": "Клиент: Redsight",
    "struct_board": "Доска",
    "struct_board_ex": "Редизайн сайта",
    "struct_issue": "Issue",
    "struct_issue_ex": "WRK-42 — Починить навигацию",
    "struct_p1t": "Issue с коротким номером",
    "struct_p1d": "У каждого issue есть номер вида WRK-42 — на него можно сослаться в чате или в коммите.",
    "struct_p2t": "Спейс под каждого клиента",
    "struct_p2d": "Группируйте доски по клиентам, продуктам или отделам. У каждого спейса свой бэклог и своя нумерация.",
    "struct_p3t": "Переносите, не пересобирая",
    "struct_p3d": "Начните в личной организации, а потом перенесите весь спейс в командную — ничего не придётся создавать заново.",

    "cta2_label": "Готовы начать?",
    "cta2_title": "Отправьте первое сообщение\nпрямо сейчас",
    "cta2_sub": "Бот уже есть в Telegram. Откройте его и попробуйте — без регистрации и настройки.",

    "os_label": "Разработка на виду",
    "os_title": "Открытый код, включая ошибки",
    "os_sub": "Можно прочитать код — и то, как он писался.",
    "os_code_title": "Код открыт",
    "os_code_desc": "Бэкенд и фронтенд лежат на GitHub. Пользователи писали, что не готовы доверить личные заметки незнакомому продукту, — открытый код честный ответ на это.",
    "os_code_cta": "Посмотреть на GitHub",
    "os_devlog_title": "Цикл статей",
    "os_devlog_desc": "Мы рассказываем, как продукт разрабатывается, включая то, что пошло не так: бот, который задавал слишком много вопросов и был откачен, решение в базе данных, которое оказалось неверным.",
    "os_devlog_cta": "Читать полную историю",

    "faq_label": "Вопросы",
    "faq_title": "Частые вопросы",
    "faq1q": "Это бесплатно?",
    "faq1a": "Да. Всё, что описано на этой странице, бесплатно. Функция /aisave бесплатна, пока она тестируется, и позже станет платной — всё остальное останется бесплатным.",
    "faq2q": "Проект действительно опенсорсный?",
    "faq2a": "Да. Бэкенд и фронтенд открыты на GitHub — можно прочитать, что именно происходит с сообщением после отправки.",
    "faq3q": "Чем это отличается от «Сохраненных сообщений» в Telegram?",
    "faq3a": "«Сохраненные сообщения» — отличное место, чтобы что-то быстро сохранить, но плохое, чтобы это потом найти. Laraue Boards оставляет сохранение таким же простым и даёт сохранённому доску, колонки и статусы.",
    "faq4q": "Нужен ли аккаунт или пароль?",
    "faq4a": "Нет. Вход через Telegram: в Mini App вы уже авторизованы, а в веб-версии есть кнопка входа через Telegram.",
    "faq5q": "Laraue Boards — это альтернатива Jira?",
    "faq5a": "Да, только легче — для команд, которым настройка Jira кажется избыточной. Здесь есть спейсы, доски, кастомные атрибуты и права, но благодаря связи с Telegram задача создаётся пересланным сообщением, а не через форму.",
    "faq6q": "Можно ли пользоваться в одиночку, без команды?",
    "faq6a": "Да. У каждого аккаунта автоматически есть личная организация — без команды, без приглашений, без настройки. Перешлите сообщение — и оно окажется на вашей доске.",
    "faq7q": "Работает ли Laraue Boards на телефоне?",
    "faq7a": "Да, двумя способами: Telegram Mini App открывается прямо в Telegram на любом телефоне, а веб-приложение полностью адаптивно, если вам удобнее браузер.",
    "faq8q": "Можно ли искать по всем доскам сразу?",
    "faq8a": "Да. В веб-приложении есть поиск по всем issues во всех спейсах и досках, а ещё можно искать прямо из любого чата Telegram, набрав {'@'}msgboard_bot и запрос.",

    "pr_note": "Laraue Boards бесплатен. Функция /aisave бесплатна, пока она тестируется, и позже станет платной; всё остальное на этой странице останется бесплатным.",

    "cta_label": "Начните сегодня",
    "cta_title": "Ваши заметки заслуживают большего,\nчем затеряться в чате",
    "cta_sub": "Бесплатно и с открытым кодом. За 30 секунд.",
    "documentation": "Документация",
    "project_page": "Как это сделано",
    "project_description": "Подробнее о проекте"
  }
}
</i18n>

<template>
  <LMainContent>
    <LLandingIntro
        :pre-title="t('hero_eyebrow')"
        :title="t('hero_title')"
        :post-title="t('hero_sub')">
      <template #badges>
        <LPlatformBadge type="web" title="Web App" />
        <LPlatformBadge type="tg" title="Telegram Mini App" />
      </template>
      <template #actions>
        <LActionButton :title="t('hero_cta_web')" link="https://boards.laraue.com/" type="site" />
        <LActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
        <div class="hero-quick-links">
          <a :href="localePath('/blog/documentation/laraue-boards')">{{ t('documentation') }} &#8594;</a>
          <a :href="localePath('/blog/projects/boards')">{{ t('project_description') }} &#8594;</a>
        </div>
      </template>
      <template #background>
        <div class="hero-bg-glow"></div>
      </template>
      <template #visual>
        <div class="hero-visual">
          <!-- Message → AI-cleaned card transformation -->
          <div class="transform-mockup">
            <div class="phone-mockup">
              <div class="phone-notch"><div class="phone-notch-bar"></div></div>
              <div class="phone-status">
                <div class="phone-status-avatar"><LNavIcon name="chat" /></div>
                <div>
                  <div class="phone-status-name">{{ t('hv_chat_title') }}</div>
                  <div class="phone-status-sub">{{ t('hv_chat') }}</div>
                </div>
                <div class="phone-status-dot"></div>
              </div>
              <div class="phone-body">
                <div class="tg-bubble">
                  <div class="tg-bubble-header">
                    <div class="tg-bubble-avatar">{{ t('hv_sender_initials') }}</div>
                    <div class="tg-bubble-name">{{ t('hv_sender') }}</div>
                  </div>
                  <p class="tg-bubble-text">{{ t('hv_msg') }}</p>
                  <span class="tg-bubble-time">{{ t('hv_time1') }}</span>
                </div>
                <div class="tg-bubble reply">
                  <div class="tg-bubble-header">
                    <div class="tg-bubble-name">{{ t('hv_replier') }}</div>
                    <div class="tg-bubble-avatar you">{{ t('hv_replier_initials') }}</div>
                  </div>
                  <p class="tg-bubble-text command">{{ t('hv_command') }}</p>
                  <span class="tg-bubble-time">{{ t('hv_time2') }}</span>
                </div>
              </div>
            </div>
            <div class="transform-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v14M12 18l-5-5M12 18l5-5"/></svg>
              <span>{{ t('hv_arrow') }}</span>
            </div>
            <div class="issue-card-mockup">
              <div class="issue-card-row">
                <span class="issue-card-key">{{ t('hv_key') }}</span>
                <span class="issue-card-status">&#9679; {{ t('hv_badge') }}</span>
              </div>
              <p class="issue-card-content"><strong>{{ t('hv_title') }}</strong> --- {{ t('hv_desc') }}</p>
              <div class="issue-card-footer">
                <div class="issue-card-avatar">{{ t('hv_sender_initials') }}</div>
                <span>{{ t('hv_sender') }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </LLandingIntro>

    <!-- ══ USE CASES ══ -->
    <LSection :pre-title="t('uc_label')" :title="t('uc_title')" :post-title="t('uc_sub')" type="cream">
      <div class="use-cases-grid">
        <div class="use-case-card personal reveal">
          <div class="use-case-icon"><LNavIcon name="brain" /></div>
          <div class="use-case-title">{{ t('uc_personal_title') }}</div>
          <p class="use-case-desc">{{ t('uc_personal_desc') }}</p>
          <ul class="use-case-list">
            <li>{{ t('uc_p1') }}</li>
            <li>{{ t('uc_p2') }}</li>
            <li>{{ t('uc_p3') }}</li>
            <li>{{ t('uc_p4') }}</li>
          </ul>
          <a href="https://t.me/msgboard_bot" class="use-case-link" target="_blank" rel="noopener">{{ t('uc_p_cta') }} &#8594;</a>
        </div>
        <div class="use-case-card teams reveal">
          <div class="use-case-icon"><LNavIcon name="partners" /></div>
          <div class="use-case-title">{{ t('uc_teams_title') }}</div>
          <p class="use-case-desc">{{ t('uc_teams_desc') }}</p>
          <ul class="use-case-list">
            <li>{{ t('uc_t1') }}</li>
            <li>{{ t('uc_t2') }}</li>
            <li>{{ t('uc_t3') }}</li>
            <li>{{ t('uc_t4') }}</li>
            <li>{{ t('uc_t5') }}</li>
          </ul>
          <a target="_blank" href="https://boards.laraue.com/" class="use-case-link">{{ t('uc_t_cta') }} &#8594;</a>
        </div>
      </div>
    </LSection>

    <!-- ══ STRUCTURE ══ -->
    <LSection :pre-title="t('struct_label')" :title="t('struct_title')" :post-title="t('struct_sub')" type="light">
      <div class="hierarchy reveal">
        <div class="hierarchy-box">
          <div class="hierarchy-box-label">{{ t('struct_org') }}</div>
          <div class="hierarchy-box-ex">{{ t('struct_org_ex') }}</div>
        </div>
        <div class="hierarchy-arrow">&#8594;</div>
        <div class="hierarchy-box">
          <div class="hierarchy-box-label">{{ t('struct_space') }}</div>
          <div class="hierarchy-box-ex">{{ t('struct_space_ex') }}</div>
        </div>
        <div class="hierarchy-arrow">&#8594;</div>
        <div class="hierarchy-box">
          <div class="hierarchy-box-label">{{ t('struct_board') }}</div>
          <div class="hierarchy-box-ex">{{ t('struct_board_ex') }}</div>
        </div>
        <div class="hierarchy-arrow">&#8594;</div>
        <div class="hierarchy-box highlight">
          <div class="hierarchy-box-label">{{ t('struct_issue') }}</div>
          <div class="hierarchy-box-ex">{{ t('struct_issue_ex') }}</div>
        </div>
      </div>
      <div class="structure-points">
        <div class="structure-point reveal">
          <div class="structure-point-title">{{ t('struct_p1t') }}</div>
          <p class="structure-point-desc">{{ t('struct_p1d') }}</p>
        </div>
        <div class="structure-point reveal">
          <div class="structure-point-title">{{ t('struct_p2t') }}</div>
          <p class="structure-point-desc">{{ t('struct_p2d') }}</p>
        </div>
        <div class="structure-point reveal">
          <div class="structure-point-title">{{ t('struct_p3t') }}</div>
          <p class="structure-point-desc">{{ t('struct_p3d') }}</p>
        </div>
      </div>
    </LSection>

    <!-- ══ MID-PAGE CTA ══ -->
    <LCallToAction :title="t('cta2_title')" :pre-title="t('cta2_label')" :post-title="t('cta2_sub')">
      <LActionButton :title="t('hero_cta_web')" link="https://boards.laraue.com/" type="site" />
      <LActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
    </LCallToAction>

    <!-- ══ FEATURES ══ -->
    <LFeaturesGrid
        :pre-title="t('feat_label')"
        :title="t('feat_title')"
        :post-title="t('feat_sub')"
        type="dark"
        :features="[
      {
        title: t('f1t'),
        icon: 'board',
        description: t('f1d'),
        link: localePath('/blog/documentation/laraue-boards/getting-started/quick-start')
      },
      {
        title: t('f2t'),
        icon: 'mail',
        description: t('f2d'),
        link: localePath('/blog/documentation/laraue-boards/working-alone/telegram-messages')
      },
      {
        title: t('f3t'),
        icon: 'camera',
        description: t('f3d'),
        link: localePath('/blog/documentation/laraue-boards/features/media')
      },
      {
        title: t('f4t'),
        icon: 'edit',
        description: t('f4d'),
        link: localePath('/blog/documentation/laraue-boards/integrations/telegram-save-modes')
      },
      {
        title: t('f5t'),
        icon: 'tag',
        description: t('f5d'),
        link: localePath('/blog/documentation/laraue-boards/features/card-keys')
      },
      {
        title: t('f6t'),
        icon: 'gear',
        description: t('f6d'),
        link: localePath('/blog/documentation/laraue-boards/features/attributes')
      },
      {
        title: t('f7t'),
        icon: 'partners',
        description: t('f7d'),
        link: localePath('/blog/documentation/laraue-boards/concepts/organizations')
      },
      {
        title: t('f8t'),
        icon: 'lock',
        description: t('f8d'),
        link: localePath('/blog/documentation/laraue-boards/getting-started/authorization')
      },
      {
        title: t('f9t'),
        icon: 'code',
        description: t('f9d'),
        link: 'https://github.com/win7user10/Laraue.Apps.Boards'
      },
      {
        title: t('f10t'),
        icon: 'sparkle',
        description: t('f10d'),
        link: localePath('/blog/documentation/laraue-boards/integrations/telegram-save-modes')
      },
      {
        title: t('f11t'),
        icon: 'search',
        description: t('f11d'),
        link: localePath('/blog/documentation/laraue-boards/features/search')
      }
    ]" />

    <!-- ══ PLATFORMS ══ -->
    <LSection :pre-title="t('pl_label')" :title="t('pl_title')" :post-title="t('pl_sub')" type="light">
      <div class="platforms-grid">
        <div class="platform-card reveal">
          <div class="platform-card-header">
            <div class="platform-card-icon web"><LNavIcon name="globe" /></div>
            <div>
              <div class="platform-card-name">{{ t('web_name') }}</div>
              <div class="platform-card-tag">boards.laraue.com</div>
            </div>
          </div>
          <p class="platform-card-desc">{{ t('web_desc') }}</p>
          <ul class="platform-card-features">
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f1') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f2') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f3') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f4') }}</span></li>
          </ul>
          <a target="_blank" href="https://boards.laraue.com/" class="btn-secondary" style="align-self:flex-start">{{ t('open_webapp') }}</a>
        </div>

        <div class="platform-card reveal">
          <div class="platform-card-header">
            <div class="platform-card-icon tg"><LNavIcon name="chat" /></div>
            <div>
              <div class="platform-card-name">{{ t('tg_name') }}</div>
              <div class="platform-card-tag">@msgboard_bot</div>
            </div>
          </div>
          <p class="platform-card-desc">{{ t('tg_desc') }}</p>
          <ul class="platform-card-features">
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f1') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f2') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f3') }}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f4') }}</span></li>
          </ul>
          <a href="https://t.me/msgboard_bot" class="btn-tg" style="align-self:flex-start" target="_blank" rel="noopener">&#128172; @msgboard_bot</a>
        </div>

      </div>
    </LSection>

    <!-- ══ OPEN SOURCE / BUILT IN THE OPEN ══ -->
    <LSection :pre-title="t('os_label')" :title="t('os_title')" :post-title="t('os_sub')" type="cream">
      <div class="use-cases-grid">
        <div class="use-case-card personal reveal">
          <div class="use-case-icon"><LNavIcon name="code" /></div>
          <div class="use-case-title">{{ t('os_code_title') }}</div>
          <p class="use-case-desc">{{ t('os_code_desc') }}</p>
          <ul class="use-case-list">
            <li>Laraue.Apps.Boards — .NET 10 / C#, PostgreSQL 18</li>
            <li>laraue-boards — Nuxt 4, Vue 3, TypeScript</li>
          </ul>
          <a href="https://github.com/win7user10/Laraue.Apps.Boards" class="use-case-link" target="_blank" rel="noopener">{{ t('os_code_cta') }} &#8594;</a>
        </div>
        <div class="use-case-card teams reveal">
          <div class="use-case-icon"><LNavIcon name="book" /></div>
          <div class="use-case-title">{{ t('os_devlog_title') }}</div>
          <p class="use-case-desc">{{ t('os_devlog_desc') }}</p>
          <a :href="localePath('/blog/articles/building-jira-alternative-solo-why-and-repositories')" class="use-case-link">{{ t('os_devlog_cta') }} &#8594;</a>
        </div>
      </div>
      <p class="pricing-note reveal">{{ t('pr_note') }}</p>
    </LSection>

    <!-- ══ FAQ ══ -->
    <section class="faq" id="faq">
      <div class="faq-inner">
        <div class="section-label reveal">{{ t('faq_label') }}</div>
        <h2 class="section-title reveal">{{ t('faq_title') }}</h2>
        <div class="faq-list">
          <div class="faq-item reveal" :data-open="openFaq === index ? 'true' : null" v-for="(item, index) in faqItems" :key="index">
            <button
                class="faq-summary"
                type="button"
                :aria-expanded="openFaq === index"
                :aria-controls="`faq-answer-${index}`"
                @click="toggleFaq(index)"
            >
              {{ item.q }}
            </button>
            <div class="faq-answer-wrap">
              <div class="faq-answer-inner">
                <p :id="`faq-answer-${index}`">{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <LCallToAction :title="t('cta_title')" :pre-title="t('cta_label')" :post-title="t('cta_sub')">
      <LActionButton :title="t('hero_cta_web')" link="https://boards.laraue.com/" type="site" />
      <LActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
    </LCallToAction>
  </LMainContent>
</template>

<style scoped>
section {
  --msg-blue:#2d7dd2; --msg-blue-light:#e8f2fc;
  --msg-green:#2d8a55; --msg-green-light:#e6f7ee;
}

/* ══ HERO QUICK LINKS ══ */
.hero-quick-links{flex-basis:100%;display:flex;gap:20px;flex-wrap:wrap;margin-top:6px;opacity:0;animation:fadeUp var(--anim-duration-lg) calc(var(--anim-stagger) * 4) var(--anim-ease) both}
.hero-quick-links a{font-size:13px;font-weight:600;color:rgba(247,244,238,.65);text-decoration:underline;text-decoration-color:rgba(247,244,238,.3);text-underline-offset:3px;transition:color .2s,text-decoration-color .2s}
.hero-quick-links a:hover{color:#fff;text-decoration-color:rgba(255,255,255,.6)}

/* ══ SHARED UTILS ══ */
.btn-secondary{background:transparent;color:var(--ink);padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;border:1.5px solid var(--border);display:inline-flex;align-items:center;gap:8px;transition:border-color .2s,background .2s,transform .15s}
.btn-secondary:hover{border-color:var(--ink);background:var(--cream);transform:translateY(-2px)}
.btn-tg{background:#229ed9;color:#fff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-flex;align-items:center;gap:8px;transition:background .2s,transform .15s}
.btn-tg:hover{background:#1a8abf;transform:translateY(-1px)}
.section-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-label::after{content:'';flex:1;max-width:40px;height:1px;background:var(--accent);opacity:.5}
.section-title{font-family:var(--serif);font-size:clamp(26px,3vw,42px);line-height:1.12;letter-spacing:-.3px;margin-bottom:16px}
.section-sub{font-size:17px;color:var(--muted);font-weight:300;line-height:1.7;}

.hero-title em{font-style:italic;color:#6ab0f0}
.hero-title .accent{color:var(--accent)}

/* ══ HERO BACKGROUND — plain two-tone glow, no line-art ══ */
.hero-bg-glow{
  position:absolute;inset:0;
  background:
    radial-gradient(circle at 88% -8%, rgba(45,125,210,.24) 0%, transparent 55%),
    radial-gradient(circle at 4% 106%, rgba(200,75,47,.16) 0%, transparent 55%);
  pointer-events:none;
}

/* hero transform visual */
.hero-visual{animation:fadeUp .9s .25s ease both;position:relative}

.transform-mockup{display:flex;flex-direction:column;align-items:center;gap:16px;max-width:360px}

.phone-mockup{
  width:260px;flex-shrink:0;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.14);
  border-radius:28px;overflow:hidden;
  box-shadow:0 24px 64px rgba(0,0,0,.4),0 4px 16px rgba(0,0,0,.2);
}
.phone-notch{height:28px;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center}
.phone-notch-bar{width:60px;height:4px;background:rgba(255,255,255,.2);border-radius:2px}
.phone-status{background:rgba(34,158,217,.9);padding:12px 16px;display:flex;align-items:center;gap:10px}
.phone-status-avatar{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.phone-status-avatar :deep(.nav-icon-svg){width:18px;height:18px}
.phone-status-name{font-size:13px;font-weight:700;color:#fff}
.phone-status-sub{font-size:10px;color:rgba(255,255,255,.65)}
.phone-status-dot{width:7px;height:7px;border-radius:50%;background:#6edd9a;margin-left:auto;box-shadow:0 0 0 2px rgba(110,221,154,.25)}

.phone-body{padding:14px;display:flex;flex-direction:column;gap:10px;background:rgba(0,0,0,.25)}

.tg-bubble{
  background:rgba(255,255,255,.1);
  border-radius:4px 12px 12px 12px;
  padding:9px 12px;
  align-self:flex-start;width:fit-content;max-width:88%;
  opacity:0;animation:msgReveal var(--anim-demo-duration) var(--anim-demo-step) var(--anim-ease) forwards;
}
.tg-bubble-header{display:flex;align-items:center;gap:6px;margin-bottom:5px}
.tg-bubble-avatar{width:18px;height:18px;border-radius:50%;background:#229ed9;color:#fff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;flex-shrink:0}
.tg-bubble-name{font-size:11px;font-weight:700;color:rgba(255,255,255,.85)}
.tg-bubble-text{font-size:12px;color:rgba(255,255,255,.85);line-height:1.5;font-style:italic;margin:0}
.tg-bubble-time{display:block;text-align:right;font-size:9px;color:rgba(255,255,255,.4);margin-top:3px;font-style:normal}
.tg-bubble.reply{align-self:flex-end;background:rgba(200,75,47,.28);border-radius:12px 4px 12px 12px;animation-delay:calc(var(--anim-demo-step) * 2)}
.tg-bubble.reply .tg-bubble-header{flex-direction:row-reverse}
.tg-bubble-avatar.you{background:var(--accent)}
.tg-bubble-text.command{font-style:normal;font-family:var(--mono, monospace);font-weight:600;color:#fff}

.transform-arrow{display:flex;align-items:flex-start;gap:8px;color:rgba(255,255,255,.4);width:260px;opacity:0;animation:msgReveal var(--anim-demo-duration) calc(var(--anim-demo-step) * 3) var(--anim-ease) forwards,pulseArrow var(--anim-pulse-duration) calc(var(--anim-demo-step) * 3 + var(--anim-demo-duration)) ease-in-out infinite}
.transform-arrow svg{width:18px;height:18px;flex-shrink:0;color:var(--accent);margin-top:1px}
.transform-arrow span{font-size:11px;font-weight:700;letter-spacing:.04em;line-height:1.5}

.issue-card-mockup{
  width:260px;
  background:#1a1a1d;
  border:1px solid rgba(255,255,255,.14);
  border-radius:12px;padding:14px 16px;
  box-shadow:0 20px 44px rgba(0,0,0,.4);
  opacity:0;animation:msgReveal var(--anim-demo-duration) calc(var(--anim-demo-step) * 4) var(--anim-ease) forwards;
}
.issue-card-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.issue-card-key{font-size:11px;font-weight:700;color:rgba(255,255,255,.85);font-family:var(--mono, monospace)}
.issue-card-status{margin-left:auto;display:flex;align-items:center;gap:5px;font-size:10px;font-weight:600;color:rgba(255,255,255,.6);background:rgba(255,255,255,.08);padding:3px 9px;border-radius:20px}
.issue-card-content{font-size:13px;font-weight:700;color:#fff;line-height:1.5;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.issue-card-content strong{font-weight:700}
.issue-card-footer{display:flex;align-items:center;gap:6px;justify-content:flex-end}
.issue-card-avatar{width:18px;height:18px;border-radius:50%;background:#229ed9;color:#fff;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.issue-card-footer span{font-size:11px;color:rgba(255,255,255,.55)}

@keyframes pulseArrow{0%,100%{opacity:.55;transform:translateY(0)}50%{opacity:1;transform:translateY(2px)}}
@keyframes msgReveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

@media(max-width:720px){
  .transform-mockup{max-width:none}
}

/* ══ USE CASES ══ */
.use-cases-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px}
.use-cases-grid .use-case-card:nth-child(1){animation-delay:0s}
.use-cases-grid .use-case-card:nth-child(2){animation-delay:var(--anim-stagger)}

.use-case-card{
  background:#fff;border:1px solid var(--border);border-radius:16px;
  padding:36px 36px 32px;overflow:hidden;position:relative;
  transition:box-shadow .2s,transform .2s;
}
.use-case-card:hover{box-shadow:0 8px 32px rgba(15,14,12,.1);transform:translateY(-3px)}
.use-case-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px}
.use-case-card.personal::before{background:linear-gradient(90deg,var(--msg-blue),#6ab0f0)}
.use-case-card.teams::before{background:linear-gradient(90deg,var(--accent),#e0572e)}

.use-case-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.use-case-card.personal .use-case-icon{background:var(--msg-blue-light);color:var(--msg-blue)}
.use-case-card.teams .use-case-icon{background:var(--accent-light);color:var(--accent)}
.use-case-icon :deep(.nav-icon-svg){width:22px;height:22px}
.use-case-title{font-family:var(--serif);font-size:22px;font-weight:700;letter-spacing:-.2px;margin-bottom:10px}
.use-case-desc{font-size:15px;color:var(--muted);line-height:1.65;font-weight:300;margin-bottom:24px}
.use-case-list{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:28px}
.use-case-list li{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--muted);line-height:1.4}
.use-case-list li::before{content:'✓';font-weight:700;color:var(--msg-green);flex-shrink:0;margin-top:1px}
.use-case-card.teams .use-case-list li::before{color:var(--accent)}

.use-case-link{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;text-decoration:none;transition:gap .15s}
.use-case-card.personal .use-case-link{color:var(--msg-blue)}
.use-case-card.teams .use-case-link{color:var(--accent)}
.use-case-card:hover .use-case-link{gap:10px}

/* ══ STRUCTURE ══ */
.hierarchy{display:flex;align-items:center;flex-wrap:wrap;gap:14px;margin-top:48px}
.hierarchy-box{background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px 20px;flex:1;min-width:140px;transition:box-shadow .2s,transform .2s}
.hierarchy-box:hover{box-shadow:0 8px 24px rgba(15,14,12,.08);transform:translateY(-2px)}
.hierarchy-box.highlight{border-color:var(--accent);background:var(--accent-light)}
.hierarchy-box-label{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
.hierarchy-box-ex{font-size:14px;font-weight:600;color:var(--ink)}
.hierarchy-arrow{color:var(--muted);font-size:18px;flex-shrink:0}
.structure-points{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:44px}
.structure-point-title{font-family:var(--serif);font-size:17px;font-weight:700;letter-spacing:-.1px;margin-bottom:8px}
.structure-point-desc{font-size:14px;color:var(--muted);line-height:1.65;font-weight:300}

@media(max-width:900px){
  .structure-points{grid-template-columns:1fr}
}
@media(max-width:720px){
  .hierarchy{flex-direction:column;align-items:stretch}
  .hierarchy-arrow{transform:rotate(90deg);text-align:center}
}

/* ══ PLATFORMS ══ */
.platforms-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px}
.platforms-grid .platform-card:nth-child(1){animation-delay:0s}
.platforms-grid .platform-card:nth-child(2){animation-delay:var(--anim-stagger)}

.platform-card{
  border:1px solid var(--border);border-radius:16px;
  padding:36px;background:#fff;
  display:flex;flex-direction:column;
  transition:box-shadow .2s,transform .2s;
}
.platform-card:hover{box-shadow:0 8px 32px rgba(15,14,12,.09);transform:translateY(-3px)}

.platform-card-header{display:flex;align-items:center;gap:14px;margin-bottom:20px}
.platform-card-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.platform-card-icon.web{background:var(--msg-blue-light);color:var(--msg-blue)}
.platform-card-icon.tg{background:#e0f4fd;color:#229ed9}
.platform-card-icon :deep(.nav-icon-svg){width:24px;height:24px}
.platform-card-name{font-family:var(--serif);font-size:18px;font-weight:700;letter-spacing:-.2px}
.platform-card-tag{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:2px}
.platform-card-desc{font-size:15px;color:var(--muted);line-height:1.65;font-weight:300;flex:1;margin-bottom:24px}
.platform-card-features{list-style:none;display:flex;flex-direction:column;gap:7px;margin-bottom:28px}
.platform-card-features li{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
.platform-card-features li svg{width:14px;height:14px;stroke:var(--msg-green);flex-shrink:0}

/* ══ PRICING NOTE ══ */
.pricing-note{text-align:center;margin-top:36px;font-size:14px;color:var(--muted)}

/* ══ FAQ ══ */
.faq{padding:80px 60px;border-bottom:1px solid var(--border)}
.faq-inner{max-width:820px;margin:0 auto}
.faq-list{display:flex;flex-direction:column;gap:12px;margin-top:40px}
.faq-item{background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px 24px;transition:box-shadow .2s}
.faq-item:hover{box-shadow:0 4px 18px rgba(15,14,12,.07)}
.faq-summary{width:100%;background:none;border:none;padding:0;margin:0;font:inherit;text-align:left;font-weight:700;font-size:15px;color:var(--ink);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px}
.faq-summary::after{content:'+';font-size:20px;font-weight:400;color:var(--muted);flex-shrink:0;transition:transform var(--anim-duration) var(--anim-ease)}
.faq-item[data-open="true"] .faq-summary::after{transform:rotate(45deg)}
.faq-answer-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--anim-duration) var(--anim-ease)}
.faq-item[data-open="true"] .faq-answer-wrap{grid-template-rows:1fr}
.faq-answer-inner{overflow:hidden}
.faq-item p{margin-top:14px;font-size:15px;color:var(--muted);line-height:1.7;font-weight:300}

/* ══ RESPONSIVE ══ */
@media(max-width:1100px){
  .sidebar-links li a span:not(.sidebar-icon){display:none}
  .sidebar-links li a{padding:11px;justify-content:center;border-left:none;border-radius:8px;margin:0 4px}
  .sidebar-links li a.active{background:rgba(200,75,47,.1)}
  .sidebar-links li a .sidebar-icon{width:auto;font-size:16px}
}
@media(max-width:900px){
  .use-cases-grid,.platforms-grid{grid-template-columns:1fr}
}
@media(max-width:720px){
  .hero-visual{order:-1}
  .faq{padding:60px 22px}
}
</style>