import { consoleEntry, writeEntry } from '../utils/jsonLog'

// Every console call on the server, ours or a library's (Nitro's "[request error]", Vue Router warnings), is
// written as one JSON line (BRD-374). Runs first (00.) so the other plugins log through it too. Dev keeps the
// readable console.
export default defineNitroPlugin(() => {
    if (import.meta.dev) {
        return
    }

    console.debug = (...args: unknown[]) => writeEntry(consoleEntry('debug', args))
    console.log = (...args: unknown[]) => writeEntry(consoleEntry('info', args))
    console.info = (...args: unknown[]) => writeEntry(consoleEntry('info', args))
    console.warn = (...args: unknown[]) => writeEntry(consoleEntry('warn', args))
    console.error = (...args: unknown[]) => writeEntry(consoleEntry('error', args))
})
