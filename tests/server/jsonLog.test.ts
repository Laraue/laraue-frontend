import { assert, test, vi } from 'vitest'

import { consoleEntry, requestErrorEntry, writeEntry } from '../../server/utils/jsonLog'

test('writes one JSON line for a request failure, including the default 500', () => {
    const write = vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    try {
        for (const statusCode of [undefined, 503]) {
            const error = Object.assign(new Error('upstream\ntimeout'), { statusCode })
            writeEntry(requestErrorEntry(error, '/boards?token=secret'))
            writeEntry(consoleEntry('error', ['[request error] [unhandled] [GET] /boards\n', error]))
            const expected = {
                level: 'error',
                message: error.message,
                path: '/boards',
                stack: error.stack,
                status: statusCode ?? 500,
            }
            assert.deepEqual(write.mock.calls, [[`${JSON.stringify(expected)}\n`]])
            write.mockClear()
        }
    } finally {
        write.mockRestore()
    }
})

test('drops request 4xx and router misses without suppressing other warnings or errors', () => {
    const error = Object.assign(new Error('missing'), { fatal: true, statusCode: 404 })
    assert.isUndefined(requestErrorEntry(error, '/x'))
    assert.isUndefined(consoleEntry('error', ['[request error] [fatal] [GET] /x\n', error]))

    const message = '[VUE_ROUTER_R0004] No match found for location with path "/x"'
    assert.isUndefined(consoleEntry('warn', [message]))
    assert.isUndefined(consoleEntry('debug', ['details']))
    assert.equal(consoleEntry('error', [new Error(message)])?.level, 'error')
    assert.equal(consoleEntry('warn', ['No match found for location with path'])?.level, 'warn')
})

test.each(['unhandledRejection', 'uncaughtException'])(
    'logs %s only through the console',
    (tag) => {
        const error = new Error('background failure')
        assert.deepEqual(consoleEntry('error', [`[${tag}]`, error]), {
            level: 'error',
            message: `[${tag}] background failure`,
            stack: error.stack,
        })
        assert.isUndefined(requestErrorEntry(error, undefined, [tag]))
    },
)

test('preserves console formatting and an error stack', () => {
    const error = new Error('timeout')
    assert.deepEqual(consoleEntry('error', ['Attempt %d: %s', 3, error]), {
        level: 'error',
        message: 'Attempt 3: timeout',
        stack: error.stack,
    })
})

test('keeps the second error stack in the message', () => {
    const first = new Error('timeout')
    const second = new Error('retry failed')
    const entry = consoleEntry('error', ['Both attempts failed', first, second])
    assert.isDefined(entry)
    assert.equal(entry.stack, first.stack)
    assert.isDefined(second.stack)
    assert.include(entry.message, second.stack)
})
