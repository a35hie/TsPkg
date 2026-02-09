import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

interface PackageJsonDeps {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export interface SyncOptions {
  packageJsonPath?: string
  configPath?: string
  quiet?: boolean
  delay?: number // ms to wait before reading (for postinstall timing)
}

/**
 * Convert a dependencies object to an array of package names
 * e.g., { "lodash": "^4.17.21", "zod": "^3.0.0" } -> ["lodash", "zod"]
 * Versions are omitted so the auto-resolve feature continues to work
 */
function depsObjectToArray(deps: Record<string, string> | undefined): string[] {
  if (!deps) return []
  return Object.keys(deps).sort()
}

/**
 * Format an array of dependencies as TypeScript code
 */
function formatDepsArray(deps: string[], indent: string = '    '): string {
  if (deps.length === 0) return '[]'
  if (deps.length === 1) return `['${deps[0]}']`
  return `[\n${deps.map(d => `${indent}'${d}',`).join('\n')}\n  ]`
}

/**
 * Format dependencies as a TypeScript object
 */
function formatDepsObject(
  deps: Record<string, string>,
  indent: string = '    '
): string {
  const entries = Object.entries(deps).sort(([a], [b]) => a.localeCompare(b))
  if (entries.length === 0) return '{}'
  return `{\n${entries.map(([name, version]) => `${indent}'${name}': '${version}',`).join('\n')}\n  }`
}

/**
 * Sync dependencies from package.json back to package.ts
 */
export async function syncDependencies(
  options: SyncOptions = {}
): Promise<void> {
  const {
    packageJsonPath = 'package.json',
    configPath = 'package.ts',
    quiet = false,
    delay = 0,
  } = options

  // Wait for package manager to finish writing (needed for postinstall)
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  const absolutePackageJsonPath = resolve(process.cwd(), packageJsonPath)
  const absoluteConfigPath = resolve(process.cwd(), configPath)

  // Read package.json
  let packageJson: PackageJsonDeps
  try {
    const packageJsonContent = await readFile(absolutePackageJsonPath, 'utf-8')
    packageJson = JSON.parse(packageJsonContent)
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      console.error(`× package.json not found: ${packageJsonPath}`)
      process.exit(1)
    }
    throw error
  }

  // Read current config file
  let configContent: string
  try {
    configContent = await readFile(absoluteConfigPath, 'utf-8')
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      console.error(`× Config file not found: ${configPath}`)
      console.error('Run ts-pkg init first to create a package.ts')
      process.exit(1)
    }
    throw error
  }

  // Convert dependencies to array format
  const deps = depsObjectToArray(packageJson.dependencies)
  const devDeps = depsObjectToArray(packageJson.devDependencies)
  const peerDeps = depsObjectToArray(packageJson.peerDependencies)

  // Update config content with new dependencies
  let updatedContent = configContent

  // Update dependencies (detect format: array vs object)
  updatedContent = updateDepsInConfig(
    updatedContent,
    'dependencies',
    deps,
    packageJson.dependencies
  )
  updatedContent = updateDepsInConfig(
    updatedContent,
    'devDependencies',
    devDeps,
    packageJson.devDependencies
  )
  updatedContent = updateDepsInConfig(
    updatedContent,
    'peerDependencies',
    peerDeps,
    packageJson.peerDependencies
  )

  // Write updated config
  await writeFile(absoluteConfigPath, updatedContent)

  if (!quiet) {
    console.log(`✨ Synced dependencies to ${configPath}`)
    if (deps.length) console.log(`   dependencies: ${deps.length} packages`)
    if (devDeps.length)
      console.log(`   devDependencies: ${devDeps.length} packages`)
    if (peerDeps.length)
      console.log(`   peerDependencies: ${peerDeps.length} packages`)
  }
}

/**
 * Find the end of a bracket pair ([] or {}) starting at a given position
 */
function findBracketEnd(
  content: string,
  startIndex: number,
  openChar: string,
  closeChar: string
): number {
  let depth = 0
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === openChar) depth++
    else if (content[i] === closeChar) {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * Update a specific dependency type in the config content
 * Handles both array format (dependencies: ['vue']) and object format (dependencies: { vue: '^3' })
 */
function updateDepsInConfig(
  content: string,
  depType: 'dependencies' | 'devDependencies' | 'peerDependencies',
  depsArray: string[],
  depsObject: Record<string, string> | undefined
): string {
  // Check if config uses array format
  const arrayPattern = new RegExp(`(${depType}:\\s*)\\[`)
  const arrayMatch = arrayPattern.exec(content)

  if (arrayMatch && arrayMatch[1]) {
    // Array format - replace with array of package names (no versions)
    const formattedDeps = formatDepsArray(depsArray)
    const arrayStart = arrayMatch.index + arrayMatch[1].length
    const arrayEnd = findBracketEnd(content, arrayStart, '[', ']')
    if (arrayEnd !== -1) {
      return (
        content.slice(0, arrayStart) +
        formattedDeps +
        content.slice(arrayEnd + 1)
      )
    }
  }

  // Check if config uses object format
  const objectPattern = new RegExp(`(${depType}:\\s*)\\{`)
  const objectMatch = objectPattern.exec(content)

  if (objectMatch && objectMatch[1]) {
    // Object format - replace with object including versions
    const formattedDeps = formatDepsObject(depsObject || {})
    const objStart = objectMatch.index + objectMatch[1].length
    const objEnd = findBracketEnd(content, objStart, '{', '}')
    if (objEnd !== -1) {
      return (
        content.slice(0, objStart) + formattedDeps + content.slice(objEnd + 1)
      )
    }
  }

  // If the field doesn't exist and we have deps to add, add as array format
  if (depsArray.length > 0) {
    const formattedDeps = formatDepsArray(depsArray)
    const insertPatterns = [
      { pattern: /peerDependencies:\s*[\[{]/, after: true },
      { pattern: /devDependencies:\s*[\[{]/, after: true },
      { pattern: /dependencies:\s*[\[{]/, after: true },
      { pattern: /(\n\s*)(conditions:\s*\[)/, before: true },
      { pattern: /(\n\s*)(engines:\s*\{)/, before: true },
    ]

    for (const { pattern, after, before } of insertPatterns) {
      const m = pattern.exec(content)
      if (m) {
        if (after) {
          const startChar = content[m.index + m[0].length - 1]
          const isArray = startChar === '['
          const bracketStart = m.index + m[0].length - 1
          const bracketEnd = findBracketEnd(
            content,
            bracketStart,
            isArray ? '[' : '{',
            isArray ? ']' : '}'
          )
          if (bracketEnd !== -1) {
            let insertPos = bracketEnd + 1
            let char = content[insertPos]
            while (
              insertPos < content.length &&
              char &&
              /[,\s]/.test(char) &&
              char !== '\n'
            ) {
              insertPos++
              char = content[insertPos]
            }
            if (content[insertPos] === '\n') insertPos++
            return (
              content.slice(0, insertPos) +
              `\n  ${depType}: ${formattedDeps},\n` +
              content.slice(insertPos)
            )
          }
        } else if (before) {
          return content.replace(
            pattern,
            `$1${depType}: ${formattedDeps},\n$1$2`
          )
        }
      }
    }
  }

  return content
}
