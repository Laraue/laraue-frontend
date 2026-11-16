import { assert, test } from 'vitest'

import { consoleEntry } from '../../server/utils/jsonLog'

const now = new Date('2026-11-16T20:00:00.000Z')

test('formats console arguments into one message', () => {
    assert.deepEqual(consoleEntry('info', ['Submitted %d URLs', 3, { status: 200 }], now), {
        time: '2026-11-16T20:00:00.000Z',
        level: 'info',
        message: 'Submitted 3 URLs { status: 200 }',
    })
})

test('keeps a multi-line message in one entry', () => {
    const entry = consoleEntry('warn', ['first line\n  second line\n'], now)
    assert.equal(entry.message, 'first line\n  second line')
    assert.notInclude(JSON.stringify(entry), '\n')
})

test('moves an error and its stack into the error field', () => {
    const error = Object.assign(new Error('Page not found: /x', { cause: new Error('inner') }), { statusCode: 404 })
    const entry = consoleEntry('error', ['[request error] [GET] https://laraue.com/x\n', error], now)

    assert.equal(entry.level, 'error')
    assert.equal(entry.message, '[request error] [GET] https://laraue.com/x Page not found: /x')
    assert.deepInclude(entry.error, { name: 'Error', message: 'Page not found: /x', statusCode: 404 })
    assert.include((entry.error as { stack: string }).stack, 'Page not found: /x')
    assert.deepInclude((entry.error as { cause: object }).cause, { message: 'inner' })
})

test('logs an error passed alone with its message', () => {
    assert.equal(consoleEntry('error', [new Error('boom')], now).message, 'boom')
})

test('turns Vue Router misses into debug', () => {
    assert.equal(consoleEntry('warn', ['[VUE_ROUTER_R0004] No match found for location with path "/wp-login.php"'], now).level, 'debug')
    assert.equal(consoleEntry('warn', ['[Vue Router warn]: No match found for location with path "/x"'], now).level, 'debug')
})
