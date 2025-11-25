/**
 * Custom language definition from https://microsoft.github.io/monaco-editor/monarch.html
 * (in Monarch format)
 */
const pdfql: any = {
    defaultToken: '',

    stageNames: [
        'select',
        'selectMany',
        'filter',
        'map'
    ],

    selectTypes: [
        'tables',
        'tableRows',
        'tableCells',
    ],

    // escape sequences
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    operators: [
        '=',
        '>',
        '<',
        '!',
        '==',
        '<=',
        '>=',
        '!=',
        '->',
        '=>'
    ],

    brackets: [
        { open: '{', close: '}', token: 'delimiter.curly' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' }
    ],

    symbols: /[=><!+\-*\/]+/,

    // The main tokenizer for our languages
    tokenizer: {
        root: [
            // identifiers and keywords
            [/@?[a-zA-Z_]\w*/, {
                cases: {
                    '@stageNames': 'stage.name',
                    '@selectTypes': 'stage.selectType',
                    '@default': { token: 'token.identifier' }
                }
            }],

            [/\./, { token: "dot", next: "@dot" }],

            // operators
            [/@symbols/, {
                cases: {
                    '@operators': 'token.operator',
                    '@default': ''
                }
            }],

            // numbers
            [/[0-9_]+/, 'token.number'],

            // brackets
            [/[{}()]/, '@brackets'],

            // strings
            [/"([^'\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
            [/'/, { token: 'string.quote', next: '@string' }],
        ],
        string: [
            [/[^\\']+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/'/, { token: 'string.quote', next: '@pop' }]
        ],
        qualified: [
            [/\(/, 'method.name'],
        ],
        dot: [
            [/[a-zA-Z_]\w*/, 'method.name'],
            ['', '', '@pop']
        ]
    },
}

export { pdfql }
