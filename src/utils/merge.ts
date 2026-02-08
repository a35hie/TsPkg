import type { PackageConfig } from '../schemas/package'

// Deep merge two objects, with source overriding target
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (sourceValue === undefined) continue

    if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T]
    } else {
      result[key] = sourceValue as T[keyof T]
    }
  }

  return result
}

// Merge arrays (for dependencies)
export function mergeArrays<T>(
  target: T[] | undefined,
  source: T[] | undefined
): T[] {
  return [...(target ?? []), ...(source ?? [])]
}

// Resolve extends chain
export async function resolveExtends(
  config: PackageConfig
): Promise<PackageConfig> {
  if (!config.extends) {
    return config
  }

  let baseConfig: PackageConfig

  if (typeof config.extends === 'string') {
    // Import from file path
    const imported = await import(config.extends)
    baseConfig = imported.default ?? imported
  } else {
    baseConfig = config.extends
  }

  // Recursively resolve base config's extends
  baseConfig = await resolveExtends(baseConfig)

  // Merge base into current (current overrides base)
  const { extends: _, ...currentWithoutExtends } = config

  return {
    ...baseConfig,
    ...currentWithoutExtends,
    // Merge arrays for dependencies
    dependencies: mergeArrays(
      baseConfig.dependencies,
      currentWithoutExtends.dependencies
    ),
    devDependencies: mergeArrays(
      baseConfig.devDependencies,
      currentWithoutExtends.devDependencies
    ),
    peerDependencies: mergeArrays(
      baseConfig.peerDependencies,
      currentWithoutExtends.peerDependencies
    ),
    // Merge objects for scripts
    scripts: { ...baseConfig.scripts, ...currentWithoutExtends.scripts },
    scriptPresets: [
      ...(baseConfig.scriptPresets ?? []),
      ...(currentWithoutExtends.scriptPresets ?? []),
    ],
  }
}
