import type {
  PackageConfig,
  StandardPackageJson,
  ScriptPreset,
  DependencyInput,
  DependenciesInput,
  ConditionalConfig,
  License,
} from './schemas/package'
import {
  createPackageJson,
  writePackageJson,
  type GenerateOptions,
} from './generator/createPackageJson'

export function definePackageConfig(config: PackageConfig): PackageConfig {
  return config
}

// Run CLI if executed directly
async function main() {
  const configPath = process.argv[2] ?? 'package.config.ts'
  const outputPath = process.argv[3] ?? 'package.json'

  try {
    const configModule = await import(Bun.pathToFileURL(configPath).href)
    const config: PackageConfig = configModule.default ?? configModule

    await writePackageJson(config, { outputPath })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND') {
      console.error(`❌ Config file not found: ${configPath}`)
      console.error('\nCreate a package.config.ts file with:')
      console.error(`
import { definePackageConfig } from './src/main'

export default definePackageConfig({
  name: 'my-package',
  version: '1.0.0',
  scriptPresets: ['typescript', 'testing'],
  dependencies: ['lodash', 'zod'],
  devDependencies: ['typescript', 'vitest'],
})
`)
      process.exit(1)
    }
    throw error
  }
}

// Export everything
export {
  createPackageJson,
  writePackageJson,
  type PackageConfig,
  type StandardPackageJson,
  type ScriptPreset,
  type DependencyInput,
  type DependenciesInput,
  type ConditionalConfig,
  type GenerateOptions,
  type License,
}
