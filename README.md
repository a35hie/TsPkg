# TS Package Config

✨ TypeScript-based `package.json` with magical features.

Define your package configuration in TypeScript with type safety, auto-complete, and powerful features like automatic version resolution, script presets, config inheritance, and conditional configuration.

> IMPORTANT: It is imperative to read this page before using this package.

## Features

- **Auto-resolve versions** – List package names, latest versions are fetched automatically
- **Script presets** – Common scripts for TypeScript, React, testing, etc.
- **Config inheritance** – Extend from base configurations
- **Conditional config** – Different settings based on environment, CI, platform
- **Full TypeScript** - Type-safe with autocomplete

## Installation

```bash
bun add -D @a35hie/ts-pkg
```

## Usage

Create a `package.ts` file:

```typescript
import { definePackage } from '@a35hie/ts-pkg'

export default definePackage({
  name: 'my-awesome-package',
  version: '1.0.0',
  description: 'An awesome package',
  type: 'module',

  // ✨ Script presets - auto-generates common scripts
  scriptPresets: ['typescript', 'testing', 'prettier'],

  // Add or override scripts
  scripts: {
    dev: 'tsx watch src/index.ts',
  },

  // ✨ Just list packages - versions resolved automatically!
  dependencies: [
    'lodash', // → "lodash": "^4.17.23"
    'zod', // → "zod": "^4.3.6"
  ],

  devDependencies: [
    'typescript',
    'vitest',
    '@types/lodash@^4', // Can specify version constraints
  ],

  // ✨ Conditional configuration
  conditions: [
    {
      when: { env: 'production' },
      set: { private: false },
    },
    {
      when: { ci: true },
      set: {
        scripts: { test: 'vitest run --coverage' },
      },
    },
  ],
})
```

Generate your `package.json`:

```bash
bunx ts-pkg
# or
bunx ts-pkg package.ts package.json
```

## Syncing Dependencies

When you install packages with `bun add` or `npm install`, sync them back to your config:

```bash
# After installing packages
bun add lodash axios
ts-pkg sync

# Or specify paths
ts-pkg sync package.ts package.json
```

This keeps your `package.ts` as the source of truth while still allowing quick installs via your package manager.

## Script Presets

| Preset       | Scripts                               |
| ------------ | ------------------------------------- |
| `typescript` | `build`, `build:watch`, `typecheck`   |
| `react`      | `dev`, `build`, `preview`             |
| `node`       | `start`, `dev`, `build`               |
| `testing`    | `test`, `test:watch`, `test:coverage` |
| `prettier`   | `format`, `format:check`              |
| `eslint`     | `lint`, `lint:fix`                    |

## Config Inheritance

Extend from a base config:

```typescript
// base.config.ts
export default definePackage({
  author: 'Your Name',
  license: 'MIT',
  scriptPresets: ['typescript', 'prettier'],
  devDependencies: ['typescript', 'prettier'],
})

// package.ts
export default definePackage({
  extends: './base.config.ts',
  name: 'my-package',
  dependencies: ['lodash'],
})
```

## Conditional Configuration

Apply different settings based on the environment:

```typescript
conditions: [
  {
    when: { env: 'production' },
    set: { private: false },
  },
  {
    when: { platform: 'win32' },
    set: {
      scripts: { build: 'tsc && copy assets dist' },
    },
  },
  {
    when: { ci: true },
    set: {
      scripts: { test: 'vitest run --reporter=junit' },
    },
  },
]
```

## API

### `definePackage(config: PackageConfig): PackageConfig`

Type-safe helper for defining your configuration.

### `createPackageJson(config: PackageConfig, options?): Promise<string>`

Generate package.json content as a string.

### `writePackageJson(config: PackageConfig, options?): Promise<void>`

Generate and write package.json to disk.
