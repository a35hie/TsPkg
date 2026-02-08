import { definePackageConfig } from '@/main.ts'

export default definePackageConfig({
  name: '@a35hie/ts-pkg',
  version: '0.1.1',
  description: 'TypeScript-based package.json with magical features',
  type: 'module',
  license: 'Apache-2.0',
  repository: 'https://github.com/a35hie/TsPkg',

  // Entry points
  main: 'dist/main.js',
  module: 'dist/main.js',
  types: 'dist/main.d.ts',
  bin: {
    'ts-pkg': './dist/main.js',
  },

  // Script presets auto-generate common scripts
  scriptPresets: ['typescript', 'prettier', 'testing'],

  // Custom scripts (merged with presets, overrides if same name)
  scripts: {
    generate: 'bun run src/main.ts',
  },

  // Just list package names - versions auto-resolved!
  dependencies: [],

  devDependencies: ['typescript', 'prettier', '@types/bun'],

  peerDependencies: [
    'typescript@^5', // Can specify version constraints
  ],

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
