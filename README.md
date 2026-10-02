# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Blog

The blog (articles and projects, English and Russian) is served by this app itself:

- The texts are markdown files in `content/blog/{en,ru}/{articles,projects}/<slug>.md`. A page has the same file name in both languages. Set `updatedAt` of a file you touch to the current date and time.
- `shared/blog` reads the files (frontmatter, markdown to HTML, lists, tags, neighbors); the server reads them once at start (`server/utils/blogCatalog.ts`) and the pages ask it through `server/routes/blog-content`.
- Also served here: the RSS feed `/api/blog/rss?languageCode=en`, the sitemap `/blog/sitemap.xml` and the preview images `/api/blog/images/og-image`, drawn on request (`server/utils/ogImage.ts`).
- `pnpm test` checks both languages exist, the frontmatter is valid and no link of the blog is broken.
- `node scripts/compare-crawl.mjs <current host> <new host>` compares the pages, the feeds and the images of two deployments.
- `NUXT_INDEX_NOW_KEY` (optional) is the IndexNow key; the blog addresses are sent to the search engines after a start.
