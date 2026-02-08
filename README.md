# TS Package Config

✨ TypeScript-based `package.json` with magical features.

Define your package configuration in TypeScript with type safety, auto-complete, and powerful features like automatic version resolution, script presets, config inheritance, and conditional configuration.

## Features

- **Auto-resolve versions** – List package names, latest versions are fetched automatically
- **Script presets** – Common scripts for TypeScript, React, testing, etc.
- **Config inheritance** – Extend from base configurations
- **Conditional config** – Different settings based on environment, CI, platform
- **Full TypeScript** - Type-safe with autocomplete

## Installation

```bash
bun add -D ts-pkg-config
```

## Usage

Create a `package.config.ts` file:

```typescript
import { definePackageConfig } from 'ts-pkg-config'

export default definePackageConfig({
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
    'lodash', // → "lodash": "^4.17.21"
    'zod', // → "zod": "^3.22.4"
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
bunx ts-pkg package.config.ts package.json
```

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
export default definePackageConfig({
  author: 'Your Name',
  license: 'MIT',
  scriptPresets: ['typescript', 'prettier'],
  devDependencies: ['typescript', 'prettier'],
})

// package.config.ts
export default definePackageConfig({
  extends: './base.config.ts',
  name: 'my-package',
  dependencies: ['lodash'],
})
```

## Conditional Configuration

Apply different settings based on environment:

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

### `definePackageConfig(config: PackageConfig): PackageConfig`

Type-safe helper for defining your configuration.

### `createPackageJson(config: PackageConfig, options?): Promise<string>`

Generate package.json content as a string.

### `writePackageJson(config: PackageConfig, options?): Promise<void>`

Generate and write package.json to disk.
