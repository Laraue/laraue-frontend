import { consoleEntry, requestErrorEntry, writeEntry } from '../utils/jsonLog'

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('error', (error, { event, tags }) => {
        writeEntry(requestErrorEntry(error, event?.path, tags))
    })

    if (import.meta.dev) {
        return
    }

    console.debug = (...args: unknown[]) => writeEntry(consoleEntry('debug', args))
    console.info = (...args: unknown[]) => writeEntry(consoleEntry('info', args))
    console.log = console.info
    console.warn = (...args: unknown[]) => writeEntry(consoleEntry('warn', args))
    console.error = (...args: unknown[]) => writeEntry(consoleEntry('error', args))
})
