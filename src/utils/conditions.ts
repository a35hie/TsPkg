import type { ConditionalConfig, StandardPackageJson } from '../schemas/package'
import { deepMerge } from './merge'

interface ConditionContext {
  env: string
  platform: NodeJS.Platform
  nodeVersion: string
  ci: boolean
}

function getContext(): ConditionContext {
  return {
    env: process.env.NODE_ENV ?? 'development',
    platform: process.platform,
    nodeVersion: process.version,
    ci: process.env.CI === 'true' || process.env.CI === '1',
  }
}

function evaluateCondition(
  when: ConditionalConfig['when'],
  context: ConditionContext
): boolean {
  if (when.env !== undefined && context.env !== when.env) {
    return false
  }

  if (when.platform !== undefined && context.platform !== when.platform) {
    return false
  }

  if (when.ci !== undefined && context.ci !== when.ci) {
    return false
  }

  if (when.nodeVersion !== undefined) {
    // Simple semver check (starts with)
    if (!context.nodeVersion.startsWith(when.nodeVersion)) {
      return false
    }
  }

  return true
}

export function applyConditions(
  baseConfig: Partial<StandardPackageJson>,
  conditions: ConditionalConfig[] | undefined
): Partial<StandardPackageJson> {
  if (!conditions || conditions.length === 0) {
    return baseConfig
  }

  const context = getContext()
  let result = { ...baseConfig }

  for (const condition of conditions) {
    if (evaluateCondition(condition.when, context)) {
      result = deepMerge(
        result,
        condition.set as Record<string, unknown>
      ) as Partial<StandardPackageJson>
    }
  }

  return result
}
