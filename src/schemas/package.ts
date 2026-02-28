import type { PM } from '@/pm/packageManagers'

// Common SPDX license identifiers
export type License =
  | 'MIT'
  | 'Apache-2.0'
  | 'GPL-2.0-only'
  | 'GPL-2.0-or-later'
  | 'GPL-3.0-only'
  | 'GPL-3.0-or-later'
  | 'LGPL-2.1-only'
  | 'LGPL-2.1-or-later'
  | 'LGPL-3.0-only'
  | 'LGPL-3.0-or-later'
  | 'BSD-2-Clause'
  | 'BSD-3-Clause'
  | 'ISC'
  | 'MPL-2.0'
  | 'AGPL-3.0-only'
  | 'AGPL-3.0-or-later'
  | 'Unlicense'
  | 'WTFPL'
  | 'CC0-1.0'
  | 'CC-BY-4.0'
  | 'CC-BY-SA-4.0'
  | 'Zlib'
  | 'BSL-1.0'
  | 'EPL-2.0'
  | 'EUPL-1.2'
  | 'CDDL-1.0'
  | 'Artistic-2.0'
  | 'OSL-3.0'
  | 'AFL-3.0'
  | 'LPPL-1.3c'
  | (string & {}) // Allow custom licenses while preserving autocomplete

// Standard package.json fields
export interface StandardPackageJson {
  name: string
  version?: string
  description?: string
  keywords?: string[]
  homepage?: string
  bugs?: string | { url?: string; email?: string }
  license?: License
  author?: string | { name: string; email?: string; url?: string }
  contributors?: (string | { name: string; email?: string; url?: string })[]
  repository?: string | { type: string; url: string; directory?: string }
  main?: string
  module?: string
  types?: string
  exports?: Record<
    string,
    string | { import?: string; require?: string; types?: string }
  >
  bin?: string | Record<string, string>
  files?: string[]
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  engines?: Record<string, string>
  os?: string[]
  cpu?: string[]
  private?: boolean
  publishConfig?: Record<string, unknown>
  workspaces?: string[]
  type?: 'module' | 'commonjs'
}

// Script preset names
export type ScriptPreset =
  | 'typescript'
  | 'react'
  | 'node'
  | 'testing'
  | 'prettier'
  | 'eslint'

// Dependency can be: 'lodash' | 'lodash@^4' | { lodash: '^4.0.0' } | Record<string, string>
export type DependencyInput = string | Record<string, string>

// Dependencies can be array (magical) or object (standard)
export type DependenciesInput = DependencyInput[] | Record<string, string>

// Conditional config block
export interface ConditionalConfig {
  when: {
    env?: string
    platform?: NodeJS.Platform
    nodeVersion?: string
    ci?: boolean
  }
  set: Partial<StandardPackageJson>
}

// Magical package.json config with extra features
export interface PackageConfig extends Omit<
  StandardPackageJson,
  'scripts' | 'dependencies' | 'devDependencies' | 'peerDependencies'
> {
  // Required package manager config used by opk/ts-pkg tooling
  pm: PM
  // Optional: other pm compat
  altPms?: PM[]

  // Extends another config
  extends?: string | PackageConfig
  
  // Custom properties
  properties?: Record<string, any>

  // Script presets: auto-generate common scripts
  scriptPresets?: ScriptPreset[]
  scripts?: Record<string, string>

  // Magical dependency inputs (auto-resolve versions) or standard object format
  dependencies?: DependenciesInput
  devDependencies?: DependenciesInput
  peerDependencies?: DependenciesInput

  // Conditional configuration
  conditions?: ConditionalConfig[]

  // Auto-infer fields
  autoInfer?: {
    version?: boolean // from git tags
    repository?: boolean // from git remote
    author?: boolean // from git config
  }
}

// Re-export for backwards compatibility
export type PackageJson = PackageConfig
