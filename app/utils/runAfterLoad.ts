const interactionEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const

interface LoadTarget {
  addEventListener(name: string, listener: () => void, options?: AddEventListenerOptions): void
  removeEventListener(name: string, listener: () => void): void
  document: { readyState: string }
}

/**
 * Runs `task` once, but not while the page is loading: after the `load` event plus `delayMs`, or as
 * soon as the visitor interacts with the page, whichever comes first. It keeps heavy third-party
 * scripts (the Google tag) off the critical path of the first paint and the first interaction.
 */
export function runAfterLoad(task: () => void, delayMs = 3000, target: LoadTarget = window): void {
  let done = false
  let timer: ReturnType<typeof setTimeout> | undefined

  const run = () => {
    if (done) {
      return
    }

    done = true
    clearTimeout(timer)
    for (const name of interactionEvents) {
      target.removeEventListener(name, run)
    }

    task()
  }

  for (const name of interactionEvents) {
    target.addEventListener(name, run, { passive: true, once: true })
  }

  const schedule = () => {
    timer = setTimeout(run, delayMs)
  }

  if (target.document.readyState === 'complete') {
    schedule()
  } else {
    target.addEventListener('load', schedule, { once: true })
  }
}
