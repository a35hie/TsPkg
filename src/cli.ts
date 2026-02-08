import type { PackageConfig } from './schemas/package'
import { writePackageJson } from './generator/createPackageJson'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

async function main() {
  const configPath = process.argv[2] ?? 'package.config.ts'
  const outputPath = process.argv[3] ?? 'package.json'

  const absoluteConfigPath = resolve(process.cwd(), configPath)

  try {
    const configModule = await import(pathToFileURL(absoluteConfigPath).href)
    const config: PackageConfig = configModule.default ?? configModule

    await writePackageJson(config, { outputPath })
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'ENOENT') {
      console.error(`❌ Config file not found: ${configPath}`)
      console.error('\nCreate a package.config.ts file with:')
      console.error(`
import { definePackageConfig } from '@a35hie/ts-pkg'

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
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

main()
