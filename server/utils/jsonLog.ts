import { formatWithOptions } from 'node:util'

// Server logs as one JSON object per line (BRD-374). Alloy reads `level` from it, and a message with an error
// stays one entry: before, console.error(error) printed an H3Error over ~30 lines, each its own Loki entry.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogEntry = {
    time: string
    level: LogLevel
    message: string
    [field: string]: unknown
}

// Noise at its own level: a bot asking for a page that doesn't exist makes Vue Router warn on every request.
const debugMessages = [/No match found for location with path/]

const inline = { breakLength: Infinity, compact: true, depth: 4 }

export function errorFields(error: Error): Record<string, unknown> {
    const { statusCode } = error as { statusCode?: unknown }
    return {
        name: error.name,
        message: error.message,
        ...(typeof statusCode === 'number' ? { statusCode } : {}),
        stack: error.stack,
        ...(error.cause instanceof Error ? { cause: errorFields(error.cause) } : {}),
    }
}

// What console.<level>(...args) would print, as an entry: the first Error goes to `error` (with its stack),
// everything else is formatted the way console does it (%s, objects inline) into `message`.
export function consoleEntry(level: LogLevel, args: unknown[], now = new Date()): LogEntry {
    const error = args.find((arg): arg is Error => arg instanceof Error)
    const text = formatWithOptions(inline, ...args.filter((arg) => arg !== error)).trim()
    const message = error ? [text, error.message].filter(Boolean).join(' ') : text

    return {
        time: now.toISOString(),
        level: debugMessages.some((pattern) => pattern.test(message)) ? 'debug' : level,
        message,
        ...(error ? { error: errorFields(error) } : {}),
    }
}

export function writeEntry(entry: LogEntry): void {
    const stream = entry.level === 'warn' || entry.level === 'error' ? process.stderr : process.stdout
    stream.write(`${JSON.stringify(entry)}\n`)
}
