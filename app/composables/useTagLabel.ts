// The tags are the same keys in both languages (they are the `?tag=` of the filter); only the label
// shown to the visitor is translated. A tag without a translation shows as its key, as the terms
// that are written the same in Russian (dotnet, nuxt, telegram, ai...).
const russianLabels: Record<string, string> = {
    architecture: 'архитектура',
    authentication: 'аутентификация',
    crawling: 'парсинг',
    database: 'базы данных',
    deployment: 'деплой',
    'language-learning': 'изучение языков',
    product: 'продукт',
    'real-estate': 'недвижимость',
    'task-tracker': 'таск-трекер',
}

export const useTagLabel = () => {
    const { locale } = useI18n()

    return (tag: string): string => (locale.value === 'ru' ? russianLabels[tag] : undefined) ?? tag
}
