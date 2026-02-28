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
  NodePm,
  PnPm,
  YarnPm,
  type PM,
  type PMLockFlags,
  type PMIgnoreFlags,
  type PMScopeFlags,
  type PMOutputFlags,
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
  NodePm,
  PnPm,
  YarnPm,
  DenoPm,
  // legacy package manager names
  NodePm as NpmPm,
  PnPm as PnpmPm,

  // api
  createPackageJson,
  writePackageJson,
  syncDependencies,
  // legacy <0.3.0 support
  definePackage as definePackageConfig,

  // types
  type PackageConfig,
  type StandardPackageJson,
  type ScriptPreset,
  type DependencyInput,
  type DependenciesInput,
  type ConditionalConfig,
  type GenerateOptions,
  type SyncOptions,
  type License,
  type PM,
  type PMLockFlags,
  type PMIgnoreFlags,
  type PMScopeFlags,
  type PMOutputFlags,
  // legacy types
  type PM as PackageManager,
}
