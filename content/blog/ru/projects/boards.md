---
title: Laraue Boards
type: project
name: Laraue Boards
tags: [task-tracker, telegram, open-source]
repository: https://github.com/Laraue/Laraue.Apps.Boards
language: C#
description: Laraue Boards — опенсорсный таск-трекер с интеграцией Telegram. Сайт продукта — boards.laraue.com; эта страница — о проекте и о том, как мы его делаем.
seoTitle: Laraue Boards: как мы его делаем
seoDescription: История и исходный код Laraue Boards — опенсорсного таск-трекера с интеграцией Telegram. Сам продукт — на boards.laraue.com.
createdAt: 2026-04-16
updatedAt: 2026-10-02 20:45
---

Laraue Boards — опенсорсный таск-трекер с интеграцией Telegram и основной продукт, который мы делаем. Всё о самом продукте — что он умеет, как попробовать, документация — на его собственном сайте: **[boards.laraue.com](https://boards.laraue.com)**.

Эта страница — место проекта в блоге: где лежит код и как он устроен.

|          |                                                                       |
|----------|-----------------------------------------------------------------------|
| Статус   | Активная разработка                                                   |
| Сайт     | [boards.laraue.com](https://boards.laraue.com)                        |
| Бот      | [@msgboard_bot](https://t.me/msgboard_bot)                            |
| Бэкенд   | [Laraue.Apps.Boards](https://github.com/Laraue/Laraue.Apps.Boards) — .NET 10 / C#, PostgreSQL 18 |
| Фронтенд | [laraue-boards](https://github.com/Laraue/laraue-boards) — Nuxt 4, Vue 3, TypeScript |

## Как он устроен

Мы делаем Boards в одиночку, с помощью ИИ, и записываем решения по ходу дела. Цикл статей начинается с [того, зачем мы делаем ещё один таск-трекер](../articles/building-jira-alternative-solo-why-and-repositories), и проходит через стек, Telegram-бота, аутентификацию, деплой и веб-версию. Все части — под тегом [devlog](https://laraue.com/ru/blog?tag=devlog).

Мы также ведём в Boards его собственный бэклог, подключив ИИ-агента по MCP — см. [как мы ведём бэклог в Boards через Claude Code](../articles/running-our-backlog-with-claude-code-mcp).
