// The public address of a blog page: `/blog/articles/x` in English, `/ru/blog/articles/x` in Russian.
export const blogUrl = (siteUrl: string, locale: BlogLocale, path: string[]): string =>
    `${siteUrl.replace(/\/$/, '')}${locale === 'en' ? '' : `/${locale}`}/${path.join('/')}`
