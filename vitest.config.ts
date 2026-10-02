import { defineConfig } from 'vitest/config'

// The tests are of the plain code of the blog (`shared/blog`), they do not need the Nuxt app.
export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
    },
})
