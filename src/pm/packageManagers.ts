// flags interfaces
export interface PMLockFlags {
  lockOnly: string
  frozenLockFile: string
}

export interface PMIgnoreFlags {
  ignoreScripts: string
  ignoreEngines: string
  ignoreOptional: string
  ignoreWorkspaceRootCheck: string
  ignorePnP: string
}

export interface PMScopeFlags {
  production: string
  dev: string
  peer: string
  optional: string
}

export interface PMOutputFlags {
  verbose: string
  silent: string
}

export interface PM {
  // meta
  name: string
  description: string

  // commands
  install: string
  add: string
  remove: string
  update: string
  audit: string
  list: string
  run: string
  exec: string

  // flags
  lockFlags: PMLockFlags
  ignoreFlags: PMIgnoreFlags
  scopeFlags: PMScopeFlags
  outputFlags: PMOutputFlags
}

export const BunPm: PM = {
  name: 'Bun',
  description: 'Lightning-fast, modern package manager. Recommended for most workflows',
  install: 'bun install',
  add: 'bun add',
  remove: 'bun rm',
  update: 'bun update',
  audit: 'bun audit',
  list: 'bun pm ls',
  run: 'bun run',
  exec: 'bunx',
  lockFlags: {
    lockOnly: '--lockfile-only',
    frozenLockFile: '--frozen-lockfile',
  },
  ignoreFlags: {
    ignoreScripts: '--ignore-scripts',
    ignoreEngines: '--ignore-engines',
    ignoreOptional: '--no-optional',
    ignoreWorkspaceRootCheck: '--no-workspace-root-check',
    ignorePnP: '',
  },
  scopeFlags: {
    production: '--production',
    dev: '--dev',
    peer: '--peer',
    optional: '--optional',
  },
  outputFlags: {
    verbose: '--verbose',
    silent: '--silent',
  },
}

export const NodePm: PM = {
  name: 'npm',
  description: 'The default Node.js package manager',
  install: 'npm install',
  add: 'npm install',
  remove: 'npm uninstall',
  update: 'npm update',
  audit: 'npm audit',
  list: 'npm ls --depth=0',
  run: 'npm run',
  exec: 'npx',
  lockFlags: {
    lockOnly: '--package-lock-only',
    frozenLockFile: '--ci',
  },
  ignoreFlags: {
    ignoreScripts: '--ignore-scripts',
    ignoreEngines: '--engine-strict=false',
    ignoreOptional: '--no-optional',
    ignoreWorkspaceRootCheck: '',
    ignorePnP: '',
  },
  scopeFlags: {
    production: '--production',
    dev: '--save-dev',
    peer: '--save-peer',
    optional: '--save-optional',
  },
  outputFlags: {
    verbose: '--verbose',
    silent: '--silent',
  },
}

export const PnPm: PM = {
  name: 'pnpm',
  description: 'Fast, disk-efficient package manager',
  install: 'pnpm install',
  add: 'pnpm add',
  remove: 'pnpm remove',
  update: 'pnpm update',
  audit: 'pnpm audit',
  list: 'pnpm list --depth=0',
  run: 'pnpm run',
  exec: 'pnpm dlx',
  lockFlags: {
    lockOnly: '--lockfile-only',
    frozenLockFile: '--frozen-lockfile',
  },
  ignoreFlags: {
    ignoreScripts: '--ignore-scripts',
    ignoreEngines: '--no-engine-strict',
    ignoreOptional: '--no-optional',
    ignoreWorkspaceRootCheck: '--ignore-workspace-root-check',
    ignorePnP: '',
  },
  scopeFlags: {
    production: '--prod',
    dev: '--save-dev',
    peer: '--save-peer',
    optional: '--save-optional',
  },
  outputFlags: {
    verbose: '--reporter=append-only',
    silent: '--silent',
  },
}

export const YarnPm: PM = {
  name: 'Yarn',
  description: 'Reliable package manager with workspaces support',
  install: 'yarn install',
  add: 'yarn add',
  remove: 'yarn remove',
  update: 'yarn upgrade',
  audit: 'yarn npm audit',
  list: 'yarn list --depth=0',
  run: 'yarn',
  exec: 'yarn dlx',
  lockFlags: {
    lockOnly: '--mode=update-lockfile',
    frozenLockFile: '--immutable',
  },
  ignoreFlags: {
    ignoreScripts: '--ignore-scripts',
    ignoreEngines: '--ignore-engines',
    ignoreOptional: '--ignore-optional',
    ignoreWorkspaceRootCheck: '',
    ignorePnP: '--no-pnp',
  },
  scopeFlags: {
    production: '--production',
    dev: '--dev',
    peer: '--peer',
    optional: '--optional',
  },
  outputFlags: {
    verbose: '--verbose',
    silent: '--silent',
  },
}

export const DenoPm: PM = {
  name: 'Deno',
  description: 'Secure runtime with first-class TypeScript support',
  install: 'deno install',
  add: 'deno add',
  remove: 'deno remove',
  update: 'deno outdated --update',
  audit: 'deno audit',
  list: 'deno info',
  run: 'deno task',
  exec: 'deno run',
  lockFlags: {
    lockOnly: '--lock-write',
    frozenLockFile: '--frozen',
  },
  ignoreFlags: {
    ignoreScripts: '',
    ignoreEngines: '',
    ignoreOptional: '',
    ignoreWorkspaceRootCheck: '',
    ignorePnP: '',
  },
  scopeFlags: {
    production: '',
    dev: '',
    peer: '',
    optional: '',
  },
  outputFlags: {
    verbose: '--log-level=debug',
    silent: '--quiet',
  },
}
