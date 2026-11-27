// An address whose path starts with `//`, e.g. `//test/wp-includes/wlwmanifest.xml` from scanners.
// No page of the site has such an address, and Vue Router warns about each one it is given.
export const isDoubleSlashPath = (path: string): boolean => path.startsWith('//')
