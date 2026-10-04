import { afterEach, assert, beforeEach, test, vi } from 'vitest'

import { runAfterLoad } from '../../app/utils/runAfterLoad'

const createTarget = (readyState: string) => {
    const listeners = new Map<string, () => void>()

    return {
        document: { readyState },
        addEventListener: (name: string, listener: () => void) => void listeners.set(name, listener),
        removeEventListener: (name: string) => void listeners.delete(name),
        emit: (name: string) => listeners.get(name)?.(),
        count: () => listeners.size,
    }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

test('runs the task a delay after the page is loaded, not before', () => {
    const target = createTarget('loading')
    const task = vi.fn()

    runAfterLoad(task, 3000, target)
    vi.advanceTimersByTime(10_000)
    assert.equal(task.mock.calls.length, 0)

    target.emit('load')
    vi.advanceTimersByTime(2999)
    assert.equal(task.mock.calls.length, 0)

    vi.advanceTimersByTime(1)
    assert.equal(task.mock.calls.length, 1)
})

test('starts the delay at once when the page is already loaded', () => {
    const target = createTarget('complete')
    const task = vi.fn()

    runAfterLoad(task, 3000, target)
    vi.advanceTimersByTime(3000)

    assert.equal(task.mock.calls.length, 1)
})

test('runs once on the first interaction and stops listening', () => {
    const target = createTarget('complete')
    const task = vi.fn()

    runAfterLoad(task, 3000, target)
    target.emit('pointerdown')
    target.emit('keydown')
    vi.advanceTimersByTime(10_000)

    assert.equal(task.mock.calls.length, 1)
    assert.equal(target.count(), 0) // the page is loaded already, and the interaction listeners are removed
})
