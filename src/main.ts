import type {
  PackageConfig,
  StandardPackageJson,
  ScriptPreset,
  DependencyInput,
  DependenciesInput,
  ConditionalConfig,
  License,
} from '@/schemas/package'
import {
  createPackageJson,
  writePackageJson,
  type GenerateOptions,
} from '@/generator/createPackageJson'

export function definePackage(config: PackageConfig): PackageConfig {
  return config
}

// Export everything
export {
  // legacy <0.3.0 support
  definePackage as definePackageConfig,
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
