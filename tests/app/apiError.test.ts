import { assert, test } from 'vitest'

import { ApiError, parseRetryAfter } from '../../app/composables/apiError'

test('reads Retry-After in seconds', () => {
    assert.equal(parseRetryAfter('42'), 42)
    assert.equal(parseRetryAfter(' 7 '), 7)
})

test('ignores a missing or non-numeric Retry-After', () => {
    assert.isNull(parseRetryAfter(null))
    assert.isNull(parseRetryAfter(''))
    assert.isNull(parseRetryAfter('Wed, 21 Oct 2026 07:28:00 GMT'))
    assert.isNull(parseRetryAfter('-1'))
})

test('a 429 is too many requests, and keeps the retry delay', () => {
    const error = new ApiError(429, {}, 12)

    assert.isTrue(error.isTooManyRequests)
    assert.equal(error.retryAfter, 12)
    assert.isFalse(new ApiError(400, { to: ['wrong'] }).isTooManyRequests)
})
