import { assert, test } from 'vitest'

import { isDoubleSlashPath } from '../../server/utils/doubleSlashPath'

test('rejects paths that start with two or more slashes', () => {
    for (const path of ['//test/wp-includes/wlwmanifest.xml', '///x', '//']) {
        assert.isTrue(isDoubleSlashPath(path), path)
    }
})

test('passes the paths of the site, including ones with double slashes inside', () => {
    for (const path of ['/', '/blog/articles/x', '/ru', '/x//y', '/?q=//x']) {
        assert.isFalse(isDoubleSlashPath(path), path)
    }
})
