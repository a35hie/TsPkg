import type { PackageConfig } from '@/schemas/package'
import { writePackageJson } from '@/generator/createPackageJson'
import { syncDependencies } from '@/sync/syncDependencies'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import pkg, { logo } from '../package'

function printInfo(): void {
  console.log(`
${logo}
${pkg.description}
Version: ${pkg.version}
  `)
}

function printHelp(): void {
  printInfo()
  console.log(`

Usage:
  ts-pkg [configPath] [outputPath]    Generate package.json from config
  ts-pkg sync [configPath] [packageJsonPath]  Sync deps from package.json to config
  ts-pkg help                         Show this help message

Commands:
  (default)  Generate package.json from package.ts
  sync       Sync dependencies from package.json back to package.ts

Examples:
  ts-pkg                              # Generate from package.ts
  ts-pkg my.config.ts                 # Generate from custom config
  ts-pkg sync                         # Sync deps to package.ts
  ts-pkg sync package.ts package.json
`)
}

async function runGenerate(
  configPath: string,
  outputPath: string
): Promise<void> {
  const absoluteConfigPath: string = resolve(process.cwd(), configPath)

  try {
    const configModule = await import(pathToFileURL(absoluteConfigPath).href)
    const config: PackageConfig = configModule.default ?? configModule

    await writePackageJson(config, { outputPath })
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'ENOENT') {
      printInfo()

      console.error(`× Config file not found: ${configPath}`)
      console.error('\nCreate a package.ts file with:')
      console.error(`
import { definePackage } from '@a35hie/ts-pkg'

export default definePackage({
  name: 'my-package',
  version: '1.0.0',
  scriptPresets: ['typescript', 'testing'],
  dependencies: ['lodash', 'zod'],
  devDependencies: ['typescript', 'vitest'],
})
`)
      process.exit(1)
    }
    console.error('× Error:', err.message)
    process.exit(1)
  }
}

async function runSync(
  configPath: string,
  packageJsonPath: string
): Promise<void> {
  // Detect if running from postinstall (npm_lifecycle_event is set by npm/bun)
  const isPostinstall = process.env.npm_lifecycle_event === 'postinstall'

  await syncDependencies({
    configPath,
    packageJsonPath,
    // Add delay when running as postinstall to let package manager finish writing
    delay: isPostinstall ? 100 : 0,
  })
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0]

  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp()
    return
  }

  if (command === 'sync') {
    const configPath = args[1] ?? 'package.ts'
    const packageJsonPath = args[2] ?? 'package.json'
    await runSync(configPath, packageJsonPath)
    return
  }

  // Default: generate package.json
  const configPath = args[0] ?? 'package.ts'
  const outputPath = args[1] ?? 'package.json'
  await runGenerate(configPath, outputPath)
}

main()
