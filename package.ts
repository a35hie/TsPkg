import { definePackage } from '@/main.ts'

export default definePackage({
  name: '@a35hie/ts-pkg',
  version: '0.3.0',
  description: 'TypeScript-based package.json with magical features',
  type: 'module',
  license: 'Apache-2.0',
  repository: 'https://github.com/a35hie/TsPkg',

  // Entry points
  main: 'dist/main.js',
  module: 'dist/main.js',
  types: 'dist/main.d.ts',
  bin: {
    'ts-pkg': './dist/cli.js',
  },
  files: ['dist'],

  // Script presets auto-generate common scripts
  scriptPresets: ['typescript', 'prettier'],

  // Custom scripts (merged with presets, overrides if same name)
  scripts: {
    build: 'bun run build.ts',
    generate: 'bun run src/cli.ts',
  },

  // Just list package names - versions auto-resolved!
  dependencies: [],

  devDependencies: ['@types/bun', 'bun-plugin-dts', 'prettier', 'typescript'],

  peerDependencies: ['typescript'],

  // Conditional configuration based on environment
  conditions: [
    {
      when: { env: 'production' },
      set: {
        private: false,
      },
    },
    {
      when: { ci: true },
      set: {
        scripts: {
          test: 'vitest run --reporter=verbose',
        },
      },
    },
  ],

  engines: {
    node: '>=18',
    bun: '>=1.0',
  },
})
