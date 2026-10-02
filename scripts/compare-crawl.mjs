// Compares the pages of the blog on two hosts, for a move of the blog between servers:
//   node scripts/compare-crawl.mjs https://laraue.com http://localhost:3000
// Every address of the blog sitemap on the first host is requested on both; the status, the
// canonical address, the hreflang alternates, the robots tag and the Open Graph tags are compared,
// and so are the sitemap, the RSS feeds and the preview images. Exits with 1 on any difference.
const [from, to] = process.argv.slice(2).map((host) => host?.replace(/\/$/, ''))
if (!from || !to) {
    console.error('usage: node scripts/compare-crawl.mjs <current host> <new host>')
    process.exit(2)
}

const request = async (host, path) => {
    const response = await fetch(`${host}${path}`, { headers: { 'Accept': 'text/html,*/*' }, redirect: 'manual' })
    return { body: Buffer.from(await response.arrayBuffer()), headers: response.headers, status: response.status }
}

const tags = (html, pattern) => [...html.matchAll(pattern)].map((match) => match[1] ?? '')

const attr = (tag, name) => new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1]

// The origins are not compared: a build under test answers with the address of the site it is for.
const summarize = (html) => {
    const heads = [...html.matchAll(/<(?:link|meta)\b[^>]*>/g)].map((match) => match[0])
    const pick = (test) => heads.filter(test).map((tag) => tag.replaceAll(/https?:\/\/(?:laraue\.com|localhost:\d+)/g, '<host>'))
    return {
        canonical: pick((tag) => /rel="canonical"/.test(tag)).map((tag) => attr(tag, 'href')),
        description: pick((tag) => /name="description"/.test(tag)).map((tag) => attr(tag, 'content')),
        h1: tags(html, /<h1[^>]*>([\s\S]*?)<\/h1>/g).map((text) => text.replace(/<[^>]*>/g, '').trim()),
        hreflang: pick((tag) => /rel="alternate"/.test(tag) && /hreflang=/.test(tag))
            .map((tag) => `${attr(tag, 'hreflang')} ${attr(tag, 'href')}`)
            .toSorted(),
        ogImage: pick((tag) => /property="og:image"/.test(tag)).map((tag) => attr(tag, 'content')),
        ogTitle: pick((tag) => /property="og:title"/.test(tag)).map((tag) => attr(tag, 'content')),
        ogType: pick((tag) => /property="og:type"/.test(tag)).map((tag) => attr(tag, 'content')),
        robots: pick((tag) => /name="robots"/.test(tag)).map((tag) => attr(tag, 'content')),
        title: tags(html, /<title[^>]*>([\s\S]*?)<\/title>/g),
    }
}

const problems = []
const compare = (what, left, right) => {
    if (JSON.stringify(left) !== JSON.stringify(right)) {
        problems.push(`${what}\n    ${from}: ${JSON.stringify(left)}\n    ${to}: ${JSON.stringify(right)}`)
    }
}

const sitemap = await request(from, '/blog/sitemap.xml')
const urls = tags(sitemap.body.toString('utf8'), /<loc>([^<]*)<\/loc>/g).map((url) => new URL(url).pathname)
const newSitemap = await request(to, '/blog/sitemap.xml')
compare(
    '/blog/sitemap.xml addresses',
    urls.toSorted(),
    tags(newSitemap.body.toString('utf8'), /<loc>([^<]*)<\/loc>/g).map((url) => new URL(url).pathname).toSorted(),
)

for (const path of urls) {
    const [left, right] = await Promise.all([request(from, path), request(to, path)])
    compare(`${path} status`, left.status, right.status)
    if (left.status === 200 && right.status === 200) {
        const a = summarize(left.body.toString('utf8'))
        const b = summarize(right.body.toString('utf8'))
        for (const key of Object.keys(a)) {
            compare(`${path} ${key}`, a[key], b[key])
        }
    }
}

for (const path of ['/blog?tag=telegram', '/blog?page=2', '/ru/blog?tag=telegram', '/blog/articles/no-such-article']) {
    const [left, right] = await Promise.all([request(from, path), request(to, path)])
    compare(`${path} status`, left.status, right.status)
}

const imageOf = (path) => {
    const [, section, name] = path.replace(/^\/ru/, '').split('/').filter(Boolean)
    return `/api/blog/images/og-image?articlePath=blog&articlePath=${section}&articlePath=${name}&languageCode=${path.startsWith('/ru') ? 'ru' : 'en'}`
}
for (const path of urls.filter((url) => url.split('/').filter((segment) => segment !== '' && segment !== 'ru').length === 3)) {
    const [left, right] = await Promise.all([request(from, imageOf(path)), request(to, imageOf(path))])
    compare(`${imageOf(path)} status/type`, [left.status, left.headers.get('content-type')], [right.status, right.headers.get('content-type')])
}

for (const language of ['en', 'ru']) {
    const path = `/api/blog/rss?languageCode=${language}`
    const [left, right] = await Promise.all([request(from, path), request(to, path)])
    compare(`${path} status/type`, [left.status, left.headers.get('content-type')], [right.status, right.headers.get('content-type')])
    // The feed of the Russian pages used to link the English addresses; it links its own ones now.
    const links = (response) =>
        tags(response.body.toString('utf8'), /<guid[^>]*>([^<]*)<\/guid>/g)
            .map((link) => link.replace('laraue.com/ru/', 'laraue.com/'))
            .toSorted()
    compare(`${path} items`, links(left), links(right))
}

console.log(`${urls.length} pages compared`)
if (problems.length > 0) {
    console.log(`${problems.length} differences:\n${problems.join('\n')}`)
    process.exit(1)
}
console.log('no differences')
