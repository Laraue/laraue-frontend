import { formatWithOptions } from 'node:util'

type LogEntry = {
    level: 'error' | 'info' | 'warn'
    message: string
    path?: string
    stack?: string
    status?: number
}

export function requestErrorEntry(
    error: Error & { status?: number; statusCode?: number },
    path?: string,
    tags?: unknown,
): LogEntry | undefined {
    // Nitro already reports process errors through console.error.
    if (
        Array.isArray(tags) &&
        (tags.includes('unhandledRejection') || tags.includes('uncaughtException'))
    ) {
        return
    }

    const status = error.statusCode ?? error.status ?? 500
    if (status < 500) {
        return
    }

    return {
        level: 'error',
        message: error.message,
        path: path?.split('?')[0],
        stack: error.stack,
        status,
    }
}

export function consoleEntry(
    level: 'debug' | LogEntry['level'],
    args: unknown[],
): LogEntry | undefined {
    if (level === 'debug') {
        return
    }

    const [first, second] = args
    // Nitro also prints request failures after passing them to the error hook.
    if (
        level === 'error' &&
        typeof first === 'string' &&
        first.startsWith('[request error] ') &&
        second instanceof Error
    ) {
        return
    }

    if (
        level === 'warn' &&
        typeof first === 'string' &&
        (first.startsWith('[VUE_ROUTER_R0004]') ||
            first.startsWith('[Vue Router warn]: No match found for location with path'))
    ) {
        return
    }

    const error = args.find((arg): arg is Error => arg instanceof Error)
    const message = formatWithOptions(
        { breakLength: Infinity, colors: false },
        ...(error ? args.map((arg) => (arg === error ? error.message : arg)) : args),
    )
    return { level, message, stack: error?.stack }
}

export function writeEntry(entry: LogEntry | undefined): void {
    if (!entry) {
        return
    }

    const stream = entry.level === 'warn' || entry.level === 'error' ? process.stderr : process.stdout
    stream.write(`${JSON.stringify(entry)}\n`)
}
