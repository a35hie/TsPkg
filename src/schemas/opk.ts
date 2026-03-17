import type { PM } from '@/pm/packageManagers.ts'

export interface OpkConfig {
  // Required package manager config used by opk/ts-pkg tooling
  pm: PM
  // Optional: other pm compat
  altPms?: PM[]
}
