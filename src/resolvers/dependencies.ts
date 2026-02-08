import type { DependencyInput } from '../schemas/package'

interface NpmPackageInfo {
  'dist-tags': {
    latest: string
    [tag: string]: string
  }
  versions: Record<string, unknown>
}

// Parse dependency input: 'lodash' | 'lodash@^4' | { lodash: '^4.0.0' }
function parseDependency(dep: DependencyInput): {
  name: string
  version?: string
} {
  if (typeof dep === 'string') {
    const atIndex = dep.lastIndexOf('@')
    if (atIndex > 0) {
      return {
        name: dep.slice(0, atIndex),
        version: dep.slice(atIndex + 1),
      }
    }
    return { name: dep }
  }

  // Object form: { lodash: '^4.0.0' }
  const [name, version] = Object.entries(dep)[0]!
  return { name, version }
}

// Fetch latest version from npm registry
async function fetchLatestVersion(packageName: string): Promise<string> {
  const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${packageName}: ${response.statusText}`)
  }

  const data = (await response.json()) as NpmPackageInfo
  return data['dist-tags'].latest
}

// Resolve a single dependency to name: version pair
async function resolveDependency(
  dep: DependencyInput
): Promise<[string, string]> {
  const { name, version } = parseDependency(dep)

  if (version) {
    return [name, version]
  }

  // Auto-resolve latest version with ^ prefix
  const latestVersion = await fetchLatestVersion(name)
  return [name, `^${latestVersion}`]
}

// Resolve all dependencies in parallel with batching
export async function resolveDependencies(
  deps: DependencyInput[] | undefined
): Promise<Record<string, string>> {
  if (!deps || deps.length === 0) {
    return {}
  }

  const results = await Promise.all(deps.map(resolveDependency))

  return Object.fromEntries(results)
}

// Cache for resolved versions (persists during single run)
const versionCache = new Map<string, string>()

export async function resolveDependenciesCached(
  deps: DependencyInput[] | undefined
): Promise<Record<string, string>> {
  if (!deps || deps.length === 0) {
    return {}
  }

  const results: [string, string][] = []

  for (const dep of deps) {
    const { name, version } = parseDependency(dep)

    if (version) {
      results.push([name, version])
      continue
    }

    // Check cache first
    let resolvedVersion = versionCache.get(name)
    if (!resolvedVersion) {
      resolvedVersion = `^${await fetchLatestVersion(name)}`
      versionCache.set(name, resolvedVersion)
    }

    results.push([name, resolvedVersion])
  }

  return Object.fromEntries(results)
}
