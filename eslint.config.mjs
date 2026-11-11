import comments from '@eslint-community/eslint-plugin-eslint-comments'
import nextVitals from 'eslint-config-next/core-web-vitals'
import globals from 'globals'

// Next registers the typescript-eslint plugin and parser for .ts and .tsx
// files only. ArtBot has always used them for every file, so the same
// instances are reused here. A second copy under the same name would conflict.
const nextTypescript = nextVitals.find(
  (config) => config.name === 'next/typescript'
)
const typescriptPlugin = nextTypescript.plugins['@typescript-eslint']
const typescriptParser = nextTypescript.languageOptions.parser

// eslint-plugin-react-hooks 7 adds rules for the React Compiler, which ArtBot
// doesn't use. They flag about 85 existing patterns, so they stay off until
// that's reviewed (see ISSUES.md). Only the two classic hooks rules run.
const reactHooks = nextVitals.find((config) => config.name === 'next').plugins[
  'react-hooks'
]
const CLASSIC_HOOKS_RULES = ['rules-of-hooks', 'exhaustive-deps']
const compilerRulesOff = Object.fromEntries(
  Object.keys(reactHooks.rules)
    .filter((rule) => !CLASSIC_HOOKS_RULES.includes(rule))
    .map((rule) => [`react-hooks/${rule}`, 'off'])
)

const config = [
  {
    ignores: [
      'node_modules/**',
      'public/**',
      'test-results/**',
      'playwright-report/**',
      '__local_db/**'
    ]
  },
  ...nextVitals,
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    plugins: { '@typescript-eslint': typescriptPlugin }
  },
  {
    plugins: { '@eslint-community/eslint-comments': comments },
    languageOptions: {
      parser: typescriptParser,
      globals: { ...globals.browser, ...globals.jest }
    },
    rules: {
      ...compilerRulesOff,
      // ESLint 9 and typescript-eslint 8 started checking caught errors by
      // default. 'none' keeps the earlier behaviour.
      '@typescript-eslint/no-unused-vars': ['warn', { caughtErrors: 'none' }],
      'no-undef': ['error', { typeof: true }],
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          caughtErrors: 'none',
          ignoreRestSiblings: false
        }
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': true,
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false
        }
      ],
      '@eslint-community/eslint-comments/no-restricted-disable': [
        'error',
        '@typescript-eslint/ban-ts-comment'
      ]
    }
  }
]

export default config
