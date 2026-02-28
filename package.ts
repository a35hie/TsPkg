import { BunPm, definePackage } from '@/main.ts'

export const logo: string = `
 ▄██████████████▄
██████████████████
██████████████████
█████▒▒▒▒▒██▒▒▒███  ███  █  █   ██
███████▒███▒██████  █  █ █ █   █
███████▒████▒▒▒██▒▒ █  █ ██   █
███████▒███████▒██  ███  █ █   █ █
███████▒████▒▒▒███  █    █  █   ██
 ▀██████████████▀
`

export default definePackage({
  pm: BunPm,
  name: '@opk/ts-pkg',
  version: '0.6.0',
  description: 'TypeScript-based package.json with magical features.',
  type: 'module',
  license: 'Apache-2.0',
  repository: 'https://github.com/opk-pm/TsPkg',
  keywords: [
    'typescript',
    'package-json',
    'npm',
    'bun',
    'monorepo-tooling',
    'nodejs',
  ],

  // Entry points
  main: 'dist/main.js',
  module: 'dist/main.js',
  types: 'dist/main.d.ts',
  bin: {
    'ts-pkg': './dist/cli.js',
  },
  files: ['dist', 'images'],

  // Script presets auto-generate common scripts
  scriptPresets: ['typescript', 'prettier'],

  // Custom scripts (merged with presets, overrides if same name)
  scripts: {
    build: 'bun run build.ts',
    generate: 'bun run src/cli.ts',
  },

  devDependencies: {
    '@types/bun': '^1.3.8',
    'bun-plugin-dts': '^0.3.0',
    prettier: '^3.8.1',
    typescript: '^6.0.0-beta',
  },

  peerDependencies: {
    typescript: '^6.0.0-beta',
  },

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
    node: '>=22',
    bun: '>=1.3.5',
  },
})
