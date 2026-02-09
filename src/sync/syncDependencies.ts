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
 * Sync dependencies from package.json back to package.config.ts
 */
export async function syncDependencies(options: SyncOptions = {}): Promise<void> {
  const {
    packageJsonPath = 'package.json',
    configPath = 'package.config.ts',
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
      console.error('Run ts-pkg init first to create a package.config.ts')
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

  // Update dependencies array
  updatedContent = updateDepsInConfig(updatedContent, 'dependencies', deps)
  updatedContent = updateDepsInConfig(updatedContent, 'devDependencies', devDeps)
  updatedContent = updateDepsInConfig(updatedContent, 'peerDependencies', peerDeps)

  // Write updated config
  await writeFile(absoluteConfigPath, updatedContent)

  if (!quiet) {
    console.log(`✨ Synced dependencies to ${configPath}`)
    if (deps.length) console.log(`   dependencies: ${deps.length} packages`)
    if (devDeps.length) console.log(`   devDependencies: ${devDeps.length} packages`)
    if (peerDeps.length) console.log(`   peerDependencies: ${peerDeps.length} packages`)
  }
}

/**
 * Find the end of an array starting at a given position
 */
function findArrayEnd(content: string, startIndex: number): number {
  let depth = 0
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '[') depth++
    else if (content[i] === ']') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * Update a specific dependency type in the config content
 */
function updateDepsInConfig(
  content: string,
  depType: 'dependencies' | 'devDependencies' | 'peerDependencies',
  deps: string[]
): string {
  const formattedDeps = formatDepsArray(deps)

  // Find the field pattern (e.g., "dependencies:")
  const fieldPattern = new RegExp(`(${depType}:\\s*)\\[`)
  const match = fieldPattern.exec(content)

  if (match && match[1]) {
    const arrayStart = match.index + match[1].length
    const arrayEnd = findArrayEnd(content, arrayStart)
    if (arrayEnd !== -1) {
      return content.slice(0, arrayStart) + formattedDeps + content.slice(arrayEnd + 1)
    }
  }

  // If the field doesn't exist and we have deps to add, we need to add it
  if (deps.length > 0) {
    // Try to find a good insertion point
    const insertPatterns = [
      // After existing dep fields (match the whole field including multiline array)
      { pattern: /peerDependencies:\s*\[/, after: true },
      { pattern: /devDependencies:\s*\[/, after: true },
      { pattern: /dependencies:\s*\[/, after: true },
      // Before conditions or engines
      { pattern: /(\n\s*)(conditions:\s*\[)/, before: true },
      { pattern: /(\n\s*)(engines:\s*\{)/, before: true },
    ]

    for (const { pattern, after, before } of insertPatterns) {
      const m = pattern.exec(content)
      if (m) {
        if (after) {
          // Find end of this array and insert after
          const arrStart = m.index + m[0].length - 1
          const arrEnd = findArrayEnd(content, arrStart)
          if (arrEnd !== -1) {
            // Find the end of line (including trailing comma)
            let insertPos = arrEnd + 1
            let char = content[insertPos]
            while (insertPos < content.length && char && /[,\s]/.test(char) && char !== '\n') {
              insertPos++
              char = content[insertPos]
            }
            if (content[insertPos] === '\n') insertPos++
            return content.slice(0, insertPos) + `\n  ${depType}: ${formattedDeps},\n` + content.slice(insertPos)
          }
        } else if (before) {
          return content.replace(pattern, `$1${depType}: ${formattedDeps},\n$1$2`)
        }
      }
    }
  }

  return content
}
