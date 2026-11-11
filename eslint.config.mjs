// ESLint 9 flat config. eslint-config-next 15 only ships the older eslintrc
// format, so FlatCompat translates it, along with the rules that used to live
// in .eslintrc.json. Next 16's eslint-config-next exports a flat config that
// can replace FlatCompat.
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url))
})

const config = [
  {
    ignores: [
      '.next/**',
      'build/**',
      'node_modules/**',
      'public/**',
      'test-results/**',
      'playwright-report/**',
      '__local_db/**',
      'next-env.d.ts'
    ]
  },
  ...compat.config({
    env: {
      browser: true,
      jest: true
    },
    extends: 'next/core-web-vitals',
    parser: '@typescript-eslint/parser',
    plugins: ['@eslint-community/eslint-comments', '@typescript-eslint'],
    rules: {
      // ESLint 9 and typescript-eslint 8 started checking caught errors by
      // default. 'none' keeps the earlier behaviour.
      '@typescript-eslint/no-unused-vars': ['warn', { caughtErrors: 'none' }],
      'no-undef': [
        'error',
        {
          typeof: true
        }
      ],
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
  })
]

export default config
