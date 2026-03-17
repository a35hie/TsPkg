import type { PackageConfig, PackageJsonFields } from '@/schemas/package'
import { getPresetScripts, mergeScripts } from '@/presets/scripts'
import { resolveDependenciesCached } from '@/resolvers/dependencies'
import { resolveExtends } from '@/utils/merge'
import { applyConditions } from '@/utils/conditions'

export interface GenerateOptions {
  indent?: number
  outputPath?: string
}

export async function createPackageJson(
  config: PackageConfig,
  options: GenerateOptions = {}
): Promise<string> {
  const { indent = 2 } = options
  const generatedAlert =
    "THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY. Instead, edit package.ts and run 'ts-pkg' to regenerate."

  // Step 1: Resolve extends chain
  let resolved = await resolveExtends(config)

  // Step 2: Build scripts from presets + custom
  const presetScripts = resolved.scriptPresets
    ? getPresetScripts(resolved.scriptPresets)
    : {}
  const finalScripts = mergeScripts(presetScripts, resolved.scripts)

  // Step 3: Resolve dependency versions
  const [dependencies, devDependencies, peerDependencies] = await Promise.all([
    resolveDependenciesCached(resolved.dependencies),
    resolveDependenciesCached(resolved.devDependencies),
    resolveDependenciesCached(resolved.peerDependencies),
  ])

  // Step 4: Build package.json from resolved fields (omit config-only keys)
  const {
    extends: _extends,
    alert: _alert,
    scriptPresets: _scriptPresets,
    conditions: _conditions,
    autoInfer: _autoInfer,
    pm: _pm,
    altPms: _altPms,
    properties,
    scripts: _scripts,
    dependencies: _dependencies,
    devDependencies: _devDependencies,
    peerDependencies: _peerDependencies,
    ...restFields
  } = resolved

  const { alert: _propertiesAlert, ...restProperties } = properties ?? {}

  const basePackageJson: PackageJsonFields = {
    ...restProperties,
    ...restFields,
  }

  const packageJson: PackageJsonFields = {
    alert: generatedAlert,
    ...basePackageJson,
    ...(Object.keys(finalScripts).length && { scripts: finalScripts }),
    ...(Object.keys(dependencies).length && { dependencies }),
    ...(Object.keys(devDependencies).length && { devDependencies }),
    ...(Object.keys(peerDependencies).length && { peerDependencies }),
  }

  // Step 5: Apply conditional configs
  const finalPackageJson = applyConditions(packageJson, resolved.conditions)

  return JSON.stringify(finalPackageJson, null, indent)
}

export async function writePackageJson(
  config: PackageConfig,
  options: GenerateOptions = {}
): Promise<void> {
  const { outputPath = 'package.json' } = options
  const json = await createPackageJson(config, options)
  const { writeFile } = await import('node:fs/promises')
  await writeFile(outputPath, json + '\n')
  console.log(`✨ Generated ${outputPath}`)
}
