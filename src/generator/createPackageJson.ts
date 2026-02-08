import type { PackageConfig, StandardPackageJson } from '../schemas/package'
import { getPresetScripts, mergeScripts } from '../presets/scripts'
import { resolveDependenciesCached } from '../resolvers/dependencies'
import { resolveExtends } from '../utils/merge'
import { applyConditions } from '../utils/conditions'

export interface GenerateOptions {
  indent?: number
  outputPath?: string
}

export async function createPackageJson(
  config: PackageConfig,
  options: GenerateOptions = {}
): Promise<string> {
  const { indent = 2 } = options

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

  // Step 4: Build standard package.json
  const packageJson: StandardPackageJson = {
    name: resolved.name,
    ...(resolved.version && { version: resolved.version }),
    ...(resolved.description && { description: resolved.description }),
    ...(resolved.keywords?.length && { keywords: resolved.keywords }),
    ...(resolved.homepage && { homepage: resolved.homepage }),
    ...(resolved.bugs && { bugs: resolved.bugs }),
    ...(resolved.license && { license: resolved.license }),
    ...(resolved.author && { author: resolved.author }),
    ...(resolved.contributors?.length && {
      contributors: resolved.contributors,
    }),
    ...(resolved.repository && { repository: resolved.repository }),
    ...(resolved.type && { type: resolved.type }),
    ...(resolved.main && { main: resolved.main }),
    ...(resolved.module && { module: resolved.module }),
    ...(resolved.types && { types: resolved.types }),
    ...(resolved.exports && { exports: resolved.exports }),
    ...(resolved.bin && { bin: resolved.bin }),
    ...(resolved.files?.length && { files: resolved.files }),
    ...(Object.keys(finalScripts).length && { scripts: finalScripts }),
    ...(Object.keys(dependencies).length && { dependencies }),
    ...(Object.keys(devDependencies).length && { devDependencies }),
    ...(Object.keys(peerDependencies).length && { peerDependencies }),
    ...(resolved.optionalDependencies && {
      optionalDependencies: resolved.optionalDependencies,
    }),
    ...(resolved.engines && { engines: resolved.engines }),
    ...(resolved.os?.length && { os: resolved.os }),
    ...(resolved.cpu?.length && { cpu: resolved.cpu }),
    ...(resolved.private !== undefined && { private: resolved.private }),
    ...(resolved.publishConfig && { publishConfig: resolved.publishConfig }),
    ...(resolved.workspaces?.length && { workspaces: resolved.workspaces }),
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
