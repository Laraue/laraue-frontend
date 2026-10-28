---
title: Деплой Nuxt Telegram Mini App. Настройка HTTPS на nginx с Let's Encrypt. Новый мини-апп через BotFather
description: Часть 7 цикла о разработке Telegram-таск-трекера небольшой командой. Как задеплоить Nuxt Telegram Mini App за nginx с HTTPS: поддомен, конфигурация nginx, первый сертификат Let's Encrypt и автопродление через certbot, регистрация в BotFather, локальное тестирование через ngrok и что делать, если Mini App показывает «Welcome to nginx!».
seoTitle: Деплой Nuxt Telegram Mini App: nginx, HTTPS, Let's Encrypt
seoDescription: Деплой Nuxt Mini App за nginx с HTTPS и certbot, BotFather, ngrok и что делать, если открывается «Welcome to nginx». Часть 7.
type: article
series: architecture-first
part: 7
createdAt: 2026-06-23 12:00
updatedAt: 2026-10-28
projects: [boards]
tags: [devlog, nuxt, telegram, deployment]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 7.
> В [предыдущей статье](deploying-dotnet-postgres-vps-docker-compose) мы развернули Telegram-бота на сервере. Пока он только сохраняет сообщения пользователя. В этой статье мы задеплоим и настроим пустой Telegram Mini App, который в следующих итерациях превратится в полноценное приложение.

## Краткое содержание

Как развернуть Nuxt-приложение как Telegram Mini App:

1. Соберите Nuxt-приложение в статические файлы и загрузите их на сервер; на каждое изменение это делает CI-пайплайн.
2. Создайте поддомен с `A`-записью, указывающей на сервер. Telegram открывает только HTTPS-адреса с действующим сертификатом.
3. Раздавайте файлы через nginx в Docker-контейнере: порт 80 для ACME-проверки и редиректа, порт 443 с TLS, а для одностраничного приложения — `try_files ... /index.html`.
4. Первый сертификат Let's Encrypt получите разовым скриптом: nginx не запускается без сертификата, а certbot не выпустит его без nginx. Дальше сертификат продлевает certbot.
5. Зарегистрируйте HTTPS-адрес в `@BotFather` как Main App или как кнопку меню.
6. Для локальной разработки пробросьте локальные порты через ngrok.
7. Если Mini App показывает «Welcome to nginx!», запрос попал на сайт nginx по умолчанию, а не в ваш блок `server`; смотрите раздел с разбором ниже.

Дальше — те же шаги на реальном проекте.

Цель: добиться, чтобы Nuxt-приложение открывалось внутри Telegram как Mini App. План: создать приложение, в котором почти не будет логики, задеплоить его на сервер. После — сделать его доступным по HTTPS, зарегистрировать адрес как mini app в `@BotFather`. Убедиться, что приложение открывается и пользовательские данные отображаются.

## Создание Nuxt-приложения

Фронтенд на [Nuxt](https://nuxt.com/) мы создали в новом репозитории [laraue-boards](https://github.com/Laraue/laraue-boards) командой:

```bash
pnpm create nuxt@latest laraue-boards
```

Получается минимальный Nuxt-проект, который уже запускается: в нём только файловая структура будущего приложения и шаблонная страница в `app.vue`.

В первой версии мы хотели только научиться определять, что приложение запущено из Telegram, и выводить данные текущего пользователя. Telegram передаёт в mini app данные через свой SDK. Читаем их в Nuxt-плагине [`auth.init.ts`](https://github.com/Laraue/laraue-boards/blob/185cc189361ba9345913226c10616ab015e958b4/app/plugins/auth.init.ts), который запускается до отрисовки приложения:

```ts
export default defineNuxtPlugin(async (nuxtApp) => {
  const { setIsAppInitialized, setIsInMiniApp } = useAppState();
  const { setUser } = useAuth();
  try {
    const WebApp = (await import('@twa-dev/sdk')).default;
    const isInMiniApp = WebApp.initData !== '';
    if (isInMiniApp) {
      setIsInMiniApp(true);
      setUser(WebApp.initData);
    } else {
      throw Error('Init data object is missing');
    }
  } catch (err) {
    const { setInitError } = useAppState();
    setInitError(err);
  } finally {
    setIsAppInitialized(true);
  }
});
```

Важное условие — `WebApp.initData !== ''`. Пакет `@twa-dev/sdk` позволяет работать с типизированными данными, полученными Mini App от Telegram: когда приложение запущено внутри Telegram, объект `initData` заполнен, а в обычном браузере — нет. Так приложение и определяет, запущено ли оно как Mini App. Если да, данные из init data записываются в `appState`; если нет, туда записывается ошибка, и она показывается на экране.

> Эта версия приложения **не проверяет подлинность данных** в init data. В настоящем приложении проверка обязательна; о ней — в статье про [аутентификацию Telegram Mini App](telegram-mini-app-authentication-dotnet).

Интерфейса в первой версии нет: шаблон `app.vue` нужен только для того, чтобы проверить, правильно ли заполняется объект пользователя:

```vue
<template>
  <div id="app">
    <div v-if="initError">
      {{ initError }}
    </div>
    <div v-else>
      {{ appState.user }}
    </div>
  </div>
</template>
```

## GitHub CI-пайплайн фронтенда

Пайплайн фронтенда [`build-and-publish.yml`](https://github.com/Laraue/laraue-boards/blob/master/.github/workflows/build-and-publish.yml) собирает Nuxt-приложение как SPA и выгружает результат сборки на VPS:

```yaml
name: Build Vue App
on:
  push:
    branches: [ "master" ]
  pull_request:
    branches: [ "master" ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'pnpm'
      - run: pnpm i
      - run: pnpm nuxt generate
      - name: Upload
        if: github.ref == 'refs/heads/master'
        uses: marcodallasanta/ssh-scp-deploy@v1.2.0
        with:
          host: ${{ secrets.SSH_HOST }}
          port: ${{ secrets.SSH_PORT }}
          user: ${{ secrets.SSH_USER }}
          password: ${{ secrets.SSH_PASSWORD }}
          local: .output/*
          remote: "/home/laraue/note-to-board-frontend"
          post_upload: echo "Uploaded"
```

Пайплайн устанавливает pnpm и Node, запускает сборку командой `pnpm nuxt generate`, а при пуше в `master` копирует результат по SSH в `/home/laraue/note-to-board-frontend`. Эту папку контейнер nginx подключает как корневую папку сайта.

Мы используем `nuxt generate`, а не `nuxt build`, чтобы получить полностью статичный сайт с HTML, CSS и JavaScript-файлами. Так nginx отдаёт обычные файлы, рендерингом занимается браузер, и не нужно тратить ресурсы на Node-процесс. Если какую-то часть контента понадобится открыть поисковикам, фронтенд перейдёт на серверный рендеринг (SSR) — в Nuxt это делается в несколько кликов.

## Разворачивание Mini App на поддомене с HTTPS

Приложение собрано, файлы лежат на сервере — теперь нужно открыть к нему доступ извне. У Telegram есть требование: **в Mini App может быть открыт только HTTPS адрес с валидным сертификатом**. Поэтому к приложению придётся привязать домен (в нашем случае поддомен) с действующим HTTPS-сертификатом и раздавать по этому адресу файлы приложения.

Для приложения мы завели поддомен `boards.laraue.com`, чтобы его адреса не смешивались с адресами основного сайта. Со временем этот поддомен может обслуживать отдельный VPS.

Поддомен создаётся обычно в DNS-панели регистратора домена: это дополнительная `A`-запись со значением `msgboard`, указывающая на IP-адрес VPS, который будет обрабатывать запросы. Новая запись начинает работать не сразу: на это уходит от нескольких минут до заметно большего времени. Это важно, так как **HTTPS-сертификат не получится выпустить, пока поддомен не начнет резолвиться**. Сертификат мы выпускаем через Let's Encrypt, и если DNS ещё не обновился, проверка падает с ошибкой:

```
DNS problem: NXDOMAIN looking up A for boards.laraue.com
  - check that a DNS record exists for this domain;
DNS problem: NXDOMAIN looking up AAAA for boards.laraue.com
  - check that a DNS record exists for this domain
```

Ошибка означает, что имя пока не резолвится — запись DNS не распространилась по сети или неверна. Проверить, что поддомен резолвится, можно через `ping` локально или с помощью бесплатных сервисов для проверки DNS.

## Конфигурация Nginx

Запросы на поддомен обрабатывает nginx. Добавляем его в `docker-compose` ещё одним контейнером:

```yaml
nginx:
  ports:
    - "80:80"
    - "443:443"
  build:
    context: .
    dockerfile: "NginxDockerfile"
  networks:
    - dockerapi-dev
  volumes:
    - ./../letsencrypt:/etc/letsencrypt
    - ./../.well-known/acme-challenge:/.well-known/acme-challenge
    - ./note-to-board-frontend/public:/usr/share/nginx/html/note-to-board-frontend
  command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"
```

**Собранные файлы фронтенда монтируются в nginx как volume.** Строка `./note-to-board-frontend/public:/usr/share/nginx/html/note-to-board-frontend` означает, что файлы фронтенда всегда доступны в контейнере по пути `/usr/share/nginx/html/note-to-board-frontend`. После выгрузки новой версии фронтенда контейнер перезапускать не нужно: nginx всегда отдает последние выгруженные файлы. То есть деплой фронтенда — это просто замена файлов при пуше в `master`. 

**`command` выполняет перезагрузку nginx по таймеру.** Раз в шесть часов скрипт выполняет `nginx -s reload`. Перезагрузка нужна, чтобы nginx подхватывал обновлённые TLS-сертификаты: их продлевает контейнер с certbot, о нём ниже.

Для работы поддомена в `nginx.conf` добавляются два блока. Первый слушает порт 80, открывает папку ACME-challenge, через которую Let's Encrypt проверяет владение доменом (об этом ниже), и перенаправляет всё остальное на HTTPS:

```nginx
server {
    listen 80;
    server_name boards.laraue.com;
    location /.well-known/acme-challenge/ {
        root /.well-known/acme-challenge;
    }
    location / {
        return 301 https://$host$request_uri;
    }
}
```

Второй блок — основной: порт 443, TLS и раздача приложения:

```nginx
server {
    listen 443 ssl;
    server_name boards.laraue.com;

    ssl_certificate     /etc/letsencrypt/live/boards.laraue.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/boards.laraue.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /usr/share/nginx/html/note-to-board-frontend;
    index index.html;

    location /_nuxt {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;

        add_header Cache-Control "no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

Несколько пояснений к конфигурации.

`root` указывает на папку со статикой, прокинутую внутрь контейнера. Nginx раздаёт файлы прямо с диска, без Node-процесса. 

`try_files ... /index.html` — SPA-fallback. Маршрутизация в SPA происходит в браузере, поэтому на любой клиентский маршрут nginx должен отдавать `index.html` и передавать управление роутеру приложения, а не возвращать 404. Без этой строки навигация внутри SPA не работает.

У файлов сборки в `/_nuxt` в имени всегда есть хеш, поэтому их можно пометить как `immutable` и кешировать надолго, чтобы браузер не скачивал их при каждом открытии приложения. А `index.html`, наоборот, отдаётся с `no-store, must-revalidate`, чтобы браузер всегда загружал свежую копию. Это стандартный паттерн кеширования для SPA: мы одновременно избегаем устаревшего кода и не грузим одни и те же файлы при каждом запуске.

Позже в конфигурации появятся `location`-блоки, которые проксируют запросы вида `/api/...` на бэкенд, но это уже тема [следующей статьи](telegram-mini-app-authentication-dotnet).

## TLS-сертификаты через Let's Encrypt и certbot

Конфигурация почти готова, но для запуска нужен сертификат. Let's Encrypt выдаёт его бесплатно. Каждый сертификат действует три месяца; чтобы не выпускать и не продлевать их вручную, мы используем certbot.

`certbot` работает в отдельном контейнере того же `docker-compose` и продлевает сертификаты до того, как истечёт их срок:

```yaml
certbot:
  image: certbot/certbot:v1.7.0
  networks:
    - dockerapi-dev
  volumes:
    - ./../letsencrypt:/etc/letsencrypt
    - ./../.well-known/acme-challenge:/var/www/certbot
  entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

Первый volume, `letsencrypt` — место, куда certbot сохраняет выпущенные сертификаты. `nginx` читает из той же директории — поэтому пути `ssl_certificate` в server-блоках выше указывают на `/etc/letsencrypt/live/boards.laraue.com/`.

Второй volume, `acme-challenge` — папка для временных файлов, которыми подтверждается владение доменом: Let's Encrypt просит создать временный файл, который будет доступен по адресу `http://boards.laraue.com/.well-known/acme-challenge/{fileName}`. Если файл доступен, адрес считается подтвержденным и Let's Encrypt выпускает сертификат. Порт 80 раздаёт этот путь напрямую, а не делает редирект на HTTPS — проверка должна проходить и тогда, когда сертификата ещё нет.

`entrypoint` — цикл, запускающий `certbot renew` каждые двенадцать часов. Когда срок сертификата подходит к концу, эта команда автоматически выпускает новый.

Главная проблема в этой схеме — первое получение сертификата. `certbot renew` продлевает только уже существующий сертификат, поэтому первый приходится получать иначе.

### Проблема курицы и яйца: nginx не стартует без сертификата, сертификат не получить без nginx

Server-блок порта 443 ссылается на файлы сертификата через `ssl_certificate` и `ssl_certificate_key`. Если этих файлов нет, **nginx отказывается стартовать**. Но сертификат нельзя получить, пока nginx не запущен и не дает доступа к папке с ACME-challenge.

Поэтому первый сертификат получают однократным запуском скрипта [`init-letsencrypt.sh`](https://github.com/wmnnd/nginx-certbot/blob/master/init-letsencrypt.sh), который:

1. Создаёт **заглушку — самоподписанный сертификат** по пути, который ожидает nginx.
2. С этим файлом nginx **успешно стартует** — поднимаются блок порта 80 с ACME-challenge и блок порта 443 с заглушкой.
3. **Заглушка удаляется и скрипт запрашивает настоящий сертификат** у Let's Encrypt, который проходит ACME-challenge через запущенный nginx.
4. Скрипт **перезагружает nginx**, и тот подхватывает настоящий сертификат.

Скрипт больше не нужен — обновления сертификата certbot берёт на себя.

Теперь приложение работает по HTTPS и доступно по адресу `boards.laraue.com`. Если открыть его в браузере, видна заготовка с ошибкой о том, что приложение запущено вне Telegram. Остаётся один шаг, чтобы оно стало Mini App.

## Регистрация Mini App в BotFather

Теперь нужно сообщить Telegram, что у нашего бота есть Mini App по адресу `boards.laraue.com`. Это делается через [@BotFather](https://t.me/BotFather): выбираем бота и в разделе **Mini Apps** привязываем приложение как **Main App** или к **menu button** бота (кнопке рядом с полем ввода). В обоих случаях потребуется ввести адрес приложения: `https://boards.laraue.com`. В Laraue Boards Mini App привязан к menu button.

После этой настройки рядом с чатом бота появится кнопка запуска приложения:

![Кнопка запуска Mini App рядом с чатом бота](https://laraue.com/static/images/blog/articles/laraue-boards/message-board-bot-launch-mini-app-button.jpg)

После нажатия на кнопку Nuxt-приложение откроется прямо в Telegram, плагин `auth.init.ts` прочитает init data и выведет на экран объект пользователя, или ошибку инициализации, если что-то пошло не так.

## Если Mini App показывает «Welcome to nginx!»

Страница «Welcome to nginx!» значит, что на запрос ответил сайт nginx по умолчанию, а не блок `server` вашего приложения. Telegram показывает только то, что вернул ваш адрес, поэтому причина на сервере или в зарегистрированном адресе. Чаще всего причины такие:

1. **Запрос попал в другой блок `server`.** Nginx выбирает блок по порту и заголовку `Host`. Если имя не совпало ни с одним `server_name`, он берёт сервер по умолчанию для этого порта: первый в конфигурации, если ни один не помечен `default_server`. В официальном Docker-образе nginx это `/etc/nginx/conf.d/default.conf` — сайт на порту 80, который отдаёт `/usr/share/nginx/html/index.html`, то есть страницу «Welcome to nginx!». Типичные поводы: опечатка или другой поддомен в адресе из BotFather, IP-адрес вместо имени, DNS, который ведёт имя на другой сервер.
2. **`root` указывает не в ту папку.** В нашей схеме приложение примонтировано в `/usr/share/nginx/html/note-to-board-frontend`, а стандартная страница лежит в родительской папке `/usr/share/nginx/html`. С `root /usr/share/nginx/html;` nginx находит стандартный `index.html` и показывает приветствие.
3. **Ваша конфигурация не загрузилась.** Контейнер всё ещё работает на стандартном конфиге: Dockerfile не скопировал ваш `nginx.conf`, или контейнер не пересобрали или не перезагрузили после изменений.

Чтобы понять, какая из причин ваша, посмотрите, что nginx реально загрузил и что он отвечает на ваше имя:

```bash
# активная конфигурация с реальными значениями server_name, listen и root
docker compose exec nginx nginx -T | grep -E "server_name|listen|root"

# что сервер отвечает на ваше имя, не задействуя DNS
curl -I --resolve app.example.com:443:<server-ip> https://app.example.com/
```

Если вашего `server_name` в выводе нет, конфигурация не загрузилась (причина 3). Если он есть, а ответ всё равно приветственная страница, проверьте, что адрес в BotFather ровно адрес вашего приложения, например `https://app.example.com`, а `root` заканчивается папкой приложения.

Чтобы такая ошибка была заметна, а не молча подменялась стандартной страницей, добавьте сервер-ловушку, который отказывает всем запросам не на ваше имя:

```nginx
server {
    listen 80 default_server;
    return 444;
}

server {
    listen 443 ssl default_server;
    ssl_reject_handshake on;
}
```

`return 444` закрывает соединение без ответа, а `ssl_reject_handshake` (nginx 1.19.4 и новее) отклоняет TLS-рукопожатие для неизвестных имён, поэтому сертификат для этого блока не нужен. Если в вашем образе есть стандартный `conf.d/default.conf`, удалите и его, чтобы сервер по умолчанию был один.

## Локальная разработка Mini App через ngrok

Требование HTTPS добавляет сложностей при локальной разработке: Telegram не откроет Mini App с `http://localhost:3000`. Чтобы обойти это ограничение, мы используем [ngrok](https://ngrok.com/): он создаёт публичный HTTPS-URL и пробрасывает запросы с него на локальный компьютер. Полная настройка описана в [README](https://github.com/Laraue/laraue-boards) репозитория фронтенда, а в общих чертах так:

1. **Пробросить локальные порты.** Конфиг `ngrok.yml` выставляет фронтенд (3000) и бэкенд (5200) как публичные HTTPS-URL через `ngrok start --all`.
2. **Настроить бота на адреса, выданные ngrok.** В настройках Mini App в BotFather кнопка ставится на ngrok-URL фронтенда.
3. **Разрешить бэкенду принимать запросы с адреса, выданного ngrok.** ngrok-URL фронтенда добавляется в CORS-allowlist бэкенда, базовый адрес API в фронтенде меняется на ngrok-URL бэкенда.

Так Mini App можно полностью протестировать с локальной машины.

Внутри Telegram нет консоли браузера, поэтому для отладки мы подключали скрипт `eruda`. Он добавляет кнопку, которая открывает консоль прямо в Mini App, — это очень выручает, когда при запуске Mini App видишь только белый экран и не понимаешь, что сломалось.

## Итоги

Новых функций для пользователя на этом этапе не появилось, зато готов фундамент для всего фронтенда. Nuxt-приложение обновляется на сервере при пуше в `master`, и дальше остаётся только писать код.

## Что дальше

Mini App открывается, но пока ничего не умеет: у него нет бэкенда, а данные пользователя можно подделать. Следующая статья — о web API: новом хосте, который проверит пользователя из Telegram Mini App и вернёт в приложение первые реальные данные.