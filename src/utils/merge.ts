import type { PackageConfig, DependenciesInput } from '../schemas/package'

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

// Merge dependencies (handles both array and object formats)
export function mergeDependencies(
  target: DependenciesInput | undefined,
  source: DependenciesInput | undefined
): DependenciesInput | undefined {
  if (!target && !source) return undefined
  if (!target) return source
  if (!source) return target

  // If both are arrays, concat them
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source]
  }

  // If both are objects, merge them
  if (!Array.isArray(target) && !Array.isArray(source)) {
    return { ...target, ...source }
  }

  // Mixed formats: convert array to object entries and merge
  const targetObj = Array.isArray(target) ? {} : target
  const sourceObj = Array.isArray(source) ? {} : source
  const targetArr = Array.isArray(target) ? target : []
  const sourceArr = Array.isArray(source) ? source : []

  // Return as array with both arrays and object merged
  return [...targetArr, ...sourceArr, { ...targetObj, ...sourceObj }]
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
    // Merge dependencies (handles both array and object formats)
    dependencies: mergeDependencies(
      baseConfig.dependencies,
      currentWithoutExtends.dependencies
    ),
    devDependencies: mergeDependencies(
      baseConfig.devDependencies,
      currentWithoutExtends.devDependencies
    ),
    peerDependencies: mergeDependencies(
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
