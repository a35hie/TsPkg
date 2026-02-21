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
  BunPm,
  DenoPm,
  NpmPm,
  PnpmPm,
  YarnPm,
  type PackageManager,
} from '@/pm/packageManagers'
import {
  createPackageJson,
  writePackageJson,
  type GenerateOptions,
} from '@/generator/createPackageJson'
import { syncDependencies, type SyncOptions } from '@/sync/syncDependencies'

export function definePackage(config: PackageConfig): PackageConfig {
  return config
}

// Export everything
export {
  // package managers
  BunPm,
  NpmPm,
  PnpmPm,
  YarnPm,
  DenoPm,

  // legacy <0.3.0 support
  definePackage as definePackageConfig,
  createPackageJson,
  writePackageJson,
  syncDependencies,
  type PackageConfig,
  type StandardPackageJson,
  type ScriptPreset,
  type DependencyInput,
  type DependenciesInput,
  type ConditionalConfig,
  type GenerateOptions,
  type SyncOptions,
  type License,
  type PackageManager,
}
