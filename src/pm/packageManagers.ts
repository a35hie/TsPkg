export interface PackageManager {
  name: string
  description: string
  install: string
  add: string
  remove: string
  update: string
  audit: string
  list: string
  run: string
  exec: string
}

export const BunPm: PackageManager = {
  name: 'Bun',
  description: 'Lightning-fast, modern package manager',
  install: 'bun install',
  add: 'bun add',
  remove: 'bun rm',
  update: 'bun update',
  audit: 'bun audit',
  list: 'bun pm ls',
  run: 'bun run',
  exec: 'bunx',
}

export const NpmPm: PackageManager = {
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
}

export const PnpmPm: PackageManager = {
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
}

export const YarnPm: PackageManager = {
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
}

export const DenoPm: PackageManager = {
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
}
