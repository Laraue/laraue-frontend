---
title: Laraue.Apps.RealEstate: Status, Limits and What Remains
type: project
name: AI Apartment Search
projectType: application
applicationLink: https://apartments.laraue.com
tags: [ai, crawling, real-estate]
repository: https://github.com/Laraue/Laraue.Apps.RealEstate
language: C#
license: AGPL-3.0
description: The status of Laraue.Apps.RealEstate: an application that crawled two big listing sites and rated flats from their photos with a local vision model. 100,000+ listings, open source; the crawler is not launched now.
seoTitle: Laraue.Apps.RealEstate: Status, Limits and What Remains
seoDescription: Status of Laraue.Apps.RealEstate, an open source AI apartment ranker: the hosts, the limits, and why it no longer collects new listings.
createdAt: 2025-11-01
updatedAt: 2026-10-03 18:24
---
**This application collected apartment listings from two large listing sites, looked at the photos of every flat with a local AI vision model and put the flats in the best condition first.** It gathered more than 100,000 listings. This page is about how it worked and what its status is; to browse the collected listings, see the [app page](https://laraue.com/crawled-apartments). We did not run the crawler around the clock: we launched it on a local machine from time to time. Now we do not launch it at all, because we have not found a legal way to make the project a product and we have no time to keep it going for free. The application is online and keeps the listings collected so far, but no new ones appear. The code is open source, and the article about how it was built is linked below.

|              |                                                                                  |
|--------------|----------------------------------------------------------------------------------|
| Language     | C#, .NET                                                                         |
| Project type | Application (crawler, AI scoring, API, Telegram bots)                            |
| Status       | Online with the collected data; the crawler is not launched, no new listings     |
| License      | AGPL-3.0                                                                         |
| GitHub       | [Laraue.Apps.RealEstate](https://github.com/Laraue/Laraue.Apps.RealEstate)       |

## The idea: sort listings by condition, not by date

Listing sites sort by recency or price, which helps sellers. A flat posted yesterday can have peeling wallpaper and photos taken in the dark, while one posted three weeks ago at the same price can be freshly renovated. Real estate agents learn to see that from a set of photos in seconds. We wanted a program that does the same, so a buyer or a renter looks first at the flats that are worth the trip.

## How it worked

The system is several small hosts around one PostgreSQL database:

- **CrawlingHost** reads the search pages of the listing sites with the [Laraue.Crawling](crawler) library. A session takes only the listings that are new since the last one; the repository settings start a session every four hours, though we launched it by hand.
- **GpuWorkerHost** takes listings one by one and sends all the photos of a listing, merged into one collage, to a local vision model served by Ollama (`qwen2.5vl:7b` by default). The model rates the **whole flat** from 0 to 10 and lists its features. It uses about 8 GB of memory, preferably on a GPU. A listing without a loadable photo gets 0.
- **WorkerHost** runs the background jobs. It takes the rated listings, computes their predicted price and ideality, and marks them ready for the API. It also sends Telegram messages, archives listings that have no photos, and cleans unavailable links.
- **ApiHost** serves the listings with filters: price, price per square meter, area, rooms, floor, renovation rating, metro station, source, text search and dates.
- **TelegramHost** sends the results to people.

A second number, the **ideality**, compares the real price per square meter with the price plus fines. The fines come from the renovation rating (`1 - rating / 10`), the first or last floor (0.2) and the nearest metro stop (the walking time over 5 minutes and the station's priority). Everything runs locally, with no cloud AI service and no data sent to third parties.

The code-level details (the crawler, the collage, the prompt and the ranking formula) are in the [technical article](../articles/building-ai-real-estate-system).

## Telegram: personal selections and a public channel

A user can set a filter (price, rooms, minimum rating), and the bot sends the matching listings and pages through them with inline buttons. The public channel mode posts the best new listings after each crawling session: renovation rating 7 or higher, price from 5 to 9 million rubles, the top three. With no crawling sessions there are no new listings to send.

## What did not work well

- **Predictions are wrong sometimes.** Photos shot from odd angles, very dark photos and heavily staged interiors can produce a wrong score. The model sees all the photos of a flat at once, so one bad photo has less effect, but it does not remove the errors.
- **A photo score is not a visit.** It filters out clearly bad flats efficiently. It does not tell you about noise, neighbors or the house.
- **We built it for one city first.** The crawler schemas are written for specific listing sites, and the code is organized per city. The README mentions Moscow and Volgograd as further cities you can switch on, but Saint Petersburg is the one we ran.
- **No way to turn it into a product.** This is the real reason we stopped launching the crawler, and no technical fix helps with it.

## What remains

- **The application and the data.** It stays online and keeps the history of more than 100,000 listings with their ratings. Nothing new is added.
- **The code,** under AGPL-3.0: [github.com/Laraue/Laraue.Apps.RealEstate](https://github.com/Laraue/Laraue.Apps.RealEstate). To run it yourself you need PostgreSQL 15 or newer and an Ollama instance with the vision model.
- **The story of how it was built:** the crawler, the Ollama integration and the ranking in the [technical article](../articles/building-ai-real-estate-system). The crawler library is described on the [Laraue.Crawling page](crawler).

Contributions that still make sense are new crawler schemas for other listing sources and better prompts for the renovation score.
