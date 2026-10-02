---
title: Laraue Boards
type: project
name: Laraue Boards
tags: [task-tracker, telegram, open-source]
description: Laraue Boards is an open source task tracker with Telegram integration. The product site is boards.laraue.com; this page is about the project and how we build it.
seoTitle: Laraue Boards: How We Build It
seoDescription: The story and source code of Laraue Boards, an open source task tracker with Telegram integration. The product itself is at boards.laraue.com.
createdAt: 2026-04-16
updatedAt: 2026-10-02 20:45
---

Laraue Boards is an open source task tracker with Telegram integration, and the main product we are building. Everything about the product itself — what it does, how to try it, the documentation — is on its own site: **[boards.laraue.com](https://boards.laraue.com)**.

This page is the project's place in the blog: where the code is and how it is built.

|          |                                                                       |
|----------|-----------------------------------------------------------------------|
| Status   | Active development                                                    |
| Site     | [boards.laraue.com](https://boards.laraue.com)                        |
| Bot      | [@msgboard_bot](https://t.me/msgboard_bot)                            |
| Backend  | [Laraue.Apps.Boards](https://github.com/Laraue/Laraue.Apps.Boards) — .NET 10 / C#, PostgreSQL 18 |
| Frontend | [laraue-boards](https://github.com/Laraue/laraue-boards) — Nuxt 4, Vue 3, TypeScript |

## How it is built

We build Boards solo, with AI, and write down the decisions as we go. The article series starts with [why we are building yet another task tracker](../articles/building-jira-alternative-solo-why-and-repositories) and goes through the stack, the Telegram bot, authentication, deployment and the web version. All the parts are under the [devlog](https://laraue.com/blog?tag=devlog) tag.

We also use Boards to run its own backlog, with an AI agent connected over MCP — see [how we run our backlog in Boards with Claude Code](../articles/running-our-backlog-with-claude-code-mcp).
