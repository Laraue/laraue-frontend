---
title: Vocabulary Bot: How a Telegram Quiz Picks the Next Word
type: project
name: Vocabulary Bot
tags: [telegram, language-learning]
repository: https://github.com/Laraue/Laraue.Apps.LearnLanguage
language: C#
license: PolyForm-Noncommercial-1.0.0
description: How Vocabulary Bot decides what to ask next: new, almost learned and fading words, the three-in-a-row rule, the word list and the source code.
seoDescription: How Vocabulary Bot decides what to ask next: new, almost learned and fading words, the three-in-a-row rule, the word list and the source code.
createdAt: 2025-11-01
updatedAt: 2026-10-03 15:50
---
**Vocabulary Bot** (`@learn_lang_bot`) is a Telegram quiz bot for learning the most used English words. This page is about how it works inside: the rule for a learned word, the algorithm that picks the next question, the word list and the source code. To use the bot, go to the [product page](https://laraue.com/learn-language-bot). About 350 people have registered in it so far, and about 150 of them started at least one quiz.

## What the user does

You choose a language pair, such as English and Russian or English and Japanese. Then you either start the quiz at once or first pick the topics and the CEFR levels you want to learn first. The bot shows a word and you choose its translation from eight options.

![Vocabulary Bot quiz ready to start, showing language pair and level selection before beginning a session](https://laraue.com/static/images/quiz-ready-to-start.jpg)

## When a word counts as learned

A pair of words is considered learned when you have chosen the correct translation for it **three times in a row**. A wrong answer breaks the series, so the word comes back until it is answered correctly three times in a row.

![Vocabulary Bot quiz result screen showing correct answer feedback](https://laraue.com/static/images/quiz-result.jpg)

## How the answer options are made

Each question has eight options: the right translation and seven wrong ones. When the wrong options are generated, only translations with the **same part of speech** as the right answer are used. A noun is never offered among adjectives, so you cannot find the answer by the grammar of the words and have to know the meaning.

## How the quiz picks the next word

The core of the bot is the algorithm that chooses what to ask next. It keeps a balance between three kinds of words:

- **New words** you have not seen yet.
- **Words you are about to finish learning**, which have one or two correct answers in a row and need the last repetition.
- **Words that can already be forgotten**, which you learned some time ago and should see again.

If a quiz asked only new words, you would forget the old ones. If it repeated only the old ones, you would never move forward. The balance is what makes a short daily session useful. It is in the spirit of spaced repetition, but without a separate flashcard system to manage.

## The word list: 5,000+ most used English words

The bot is built on the 5,000+ most used English words. Each word has its **CEFR level** (from A1 for beginners upward) and the **topics** it belongs to, so you can start with the words that matter to you: the topics of your work, a trip or an exam, at the level you are at.

![Telegram bot interface showing CEFR language level selection](https://laraue.com/static/images/select-cefr-level.jpg)

The languages in the database are English, Russian, French, Japanese, Spanish, German, Chinese and Hindi. The translations are stored in one JSON file in the repository, so the whole list is open to read.

## Source code

The source code is available on GitHub: [Laraue.Apps.LearnLanguage](https://github.com/Laraue/Laraue.Apps.LearnLanguage). It is the .NET backend of the bot. The code is free for personal and other noncommercial use under the [PolyForm Noncommercial License 1.0.0](https://github.com/Laraue/Laraue.Apps.LearnLanguage/blob/master/LICENSE). If you want to earn money with it, you need a separate commercial agreement: see [COMMERCIAL.md](https://github.com/Laraue/Laraue.Apps.LearnLanguage/blob/master/COMMERCIAL.md).

To see how the data is organized: words and translations live in `translations.json`, languages in `languages.json`, and new entries are added to the database by a migration at the next start.

## Use the bot

The steps to start, the languages and the screenshots are on the [product page](https://laraue.com/learn-language-bot). Or open [@learn_lang_bot](https://t.me/learn_lang_bot?start=source-blog) in Telegram directly.
