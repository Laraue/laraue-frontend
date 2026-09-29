// Laraue Boards has its own site; its landing page mirrors this site's language prefix.
export const useBoardsUrl = () => {
    const { locale } = useI18n()

    return computed(() => `https://boards.laraue.com${locale.value === 'ru' ? '/ru' : ''}`)
}
