---
title: AI Apartment Ranking: How It Worked, Limits and Status
type: project
name: AI Apartment Search
projectType: application
applicationLink: https://apartments.laraue.com
tags: [ai, crawling, real-estate]
repository: https://github.com/Laraue/Laraue.Apps.RealEstate
language: C#
license: AGPL-3.0
description: An application that crawled two big listing sites, scored every apartment photo with a local vision model and ranked flats by renovation quality. 100,000+ listings, open source. No new listings now.
seoTitle: AI Apartment Ranking: How It Worked, Limits and Status
seoDescription: How ranking apartments by photo quality with a local AI model worked: the hosts, the limits, and why it no longer collects new listings.
createdAt: 2025-11-01
updatedAt: 2026-10-03 17:25
---
**This application collected apartment listings from two large listing sites, looked at every photo with a local AI vision model and put the flats in the best condition first.** It gathered more than 100,000 listings. This page is about how it worked and what its status is; to browse the collected listings, see the [app page](https://laraue.com/crawled-apartments). We did not run the crawler around the clock: we launched it on a local machine from time to time. Now we do not launch it at all, because we have not found a legal way to make the project a product and we have no time to keep it going for free. The application is online and keeps the listings collected so far, but no new ones appear. The code is open source, and the article about how it was built is linked below.

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
- **GpuWorkerHost** takes listings one by one and asks a local vision model, served by Ollama (`qwen2.5vl:7b` by default), to rate the renovation quality of each photo. The model uses about 8 GB of memory, preferably on a GPU. The renovation rating of a listing is the average of its photos, and a listing with too few photos is left out of the ranking, so one unrepresentative picture does not decide.
- **WorkerHost** marks listings as ready for the API once they have a rating.
- **ApiHost** serves the listings with filters: price, price per square meter, area, rooms, floor, renovation rating, metro station, source, text search and dates.
- **TelegramHost** sends the results to people.

A second number, the **ideality score**, combines the renovation rating with the location: how close the metro station is and how far the flat is from the center. Everything runs locally, with no cloud AI service and no data sent to third parties.

## Telegram: personal selections and a public channel

A user can set a filter (price, rooms, minimum rating), and the bot sends the matching listings and pages through them with inline buttons. The public channel mode posts the best new listings after each crawling session: renovation rating 7 or higher, price from 5 to 9 million rubles, the top three. With no crawling sessions there are no new listings to send.

## What did not work well

- **Predictions are wrong sometimes.** Photos shot from odd angles, very dark photos and heavily staged interiors can produce a wrong score. Averaging over all the photos of a listing reduces that, but does not remove it.
- **A photo score is not a visit.** It filters out clearly bad flats efficiently. It does not tell you about noise, neighbors or the house.
- **We built it for one city first.** The crawler schemas are written for specific listing sites, and the code is organized per city. The README mentions Moscow and Volgograd as further cities you can switch on, but Saint Petersburg is the one we ran.
- **No way to turn it into a product.** This is the real reason we stopped launching the crawler, and no technical fix helps with it.

## What remains

- **The application and the data.** It stays online and keeps the history of more than 100,000 listings with their ratings. Nothing new is added.
- **The code,** under AGPL-3.0: [github.com/Laraue/Laraue.Apps.RealEstate](https://github.com/Laraue/Laraue.Apps.RealEstate). To run it yourself you need PostgreSQL 15 or newer and an Ollama instance with the vision model.
- **The story of how it was built:** the crawler, the Ollama integration and the ranking in the [technical article](../articles/building-ai-real-estate-system). The crawler library is described on the [Laraue.Crawling page](crawler).

Contributions that still make sense are new crawler schemas for other listing sources and better prompts for the renovation score.
