import type { ScriptPreset } from '@/schemas/package'

type ScriptDefinitions = Record<string, string>

const scriptPresets: Record<ScriptPreset, ScriptDefinitions> = {
  typescript: {
    build: 'tsc',
    'build:watch': 'tsc --watch',
    typecheck: 'tsc --noEmit',
  },

  react: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
  },

  node: {
    start: 'node dist/index.js',
    dev: 'tsx watch src/index.ts',
    build: 'tsup src/index.ts --format esm,cjs --dts',
  },

  testing: {
    test: 'vitest',
    'test:watch': 'vitest watch',
    'test:coverage': 'vitest --coverage',
  },

  prettier: {
    format: 'prettier --write .',
    'format:check': 'prettier --check .',
  },

  eslint: {
    lint: 'eslint .',
    'lint:fix': 'eslint . --fix',
  },
}

export function getPresetScripts(presets: ScriptPreset[]): ScriptDefinitions {
  const merged: ScriptDefinitions = {}

  for (const preset of presets) {
    const scripts = scriptPresets[preset]
    if (scripts) {
      Object.assign(merged, scripts)
    }
  }

  return merged
}

export function mergeScripts(
  presetScripts: ScriptDefinitions,
  customScripts?: ScriptDefinitions
): ScriptDefinitions {
  return { ...presetScripts, ...customScripts }
}
