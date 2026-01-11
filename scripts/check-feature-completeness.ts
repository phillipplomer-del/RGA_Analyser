#!/usr/bin/env tsx
/**
 * Feature Completeness Checker (Modular Architecture)
 *
 * Prüft, ob alle wissenschaftlichen Features vollständig dokumentiert sind.
 * Unterstützt die neue modulare Backlog-Struktur.
 *
 * Usage: npm run check:features
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface FeatureEntry {
  id: string
  name: string
  status: '⬜' | '🔄' | '✅' | '⏸️' | '❌'
  validationStatus: '✅' | '⚠️' | '-' | ''
  specFile: string
  scientific: boolean
  module: string // 'RGA', 'LeakSearch', 'Infrastructure', etc.
}

interface ValidationIssue {
  featureId: string
  severity: 'error' | 'warning'
  message: string
  location: string
}

// Parse a single markdown file for features
function parseFeaturesFromFile(filePath: string, moduleName: string): FeatureEntry[] {
  if (!fs.existsSync(filePath)) {
    return []
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  // Regex to extract feature entries from markdown tables
  // Format: | 1.5.7 | **Feature Name** | ✅ | ✅ | [spec.md](...) | ...
  const featureRegex = /\|\s*([\d.]+)\s*\|\s*\*\*(.*?)\*\*\s*\|\s*(⬜|🔄|✅|⏸️|❌)\s*\|\s*(✅|⚠️|-|)\s*\|\s*\[(.*?)\]/g

  const features: FeatureEntry[] = []
  let match

  while ((match = featureRegex.exec(content)) !== null) {
    const [_, id, name, status, validationStatus, specFile] = match

    // Detect scientific features
    const scientific =
      id.startsWith('0.') ||
      id.startsWith('1.5.') ||
      id.startsWith('1.8.') ||
      id.startsWith('1.9.') ||
      id.startsWith('3.') ||
      name.toLowerCase().includes('validierung') ||
      name.toLowerCase().includes('validation') ||
      name.toLowerCase().includes('detektor') ||
      name.toLowerCase().includes('detector') ||
      name.toLowerCase().includes('diagnose')

    features.push({
      id,
      name,
      status: status as any,
      validationStatus: (validationStatus.trim() || '') as any,
      specFile,
      scientific,
      module: moduleName
    })
  }

  return features
}

// Parse all module backlogs
function parseAllFeatures(): FeatureEntry[] {
  const features: FeatureEntry[] = []

  // Module backlog locations
  const moduleBacklogs = [
    { path: 'DOCUMENTATION/MODULES/RGA/FEATURE_BACKLOG_RGA.md', name: 'RGA' },
    { path: 'DOCUMENTATION/MODULES/LeakSearch/FEATURE_BACKLOG_LEAKSEARCH.md', name: 'LeakSearch' },
    { path: 'DOCUMENTATION/BACKLOG/FEATURE_BACKLOG_INFRASTRUCTURE.md', name: 'Infrastructure' },
  ]

  for (const backlog of moduleBacklogs) {
    const fullPath = path.join(__dirname, '..', backlog.path)
    const moduleFeatures = parseFeaturesFromFile(fullPath, backlog.name)
    features.push(...moduleFeatures)
  }

  return features
}

// Check if planning file exists
function checkPlanningFile(feature: FeatureEntry): ValidationIssue | null {
  if (feature.status === '❌') return null // Skipped/rejected features don't need planning

  // Try multiple locations
  const possiblePaths = [
    path.join(__dirname, `../NextFeatures/${feature.specFile}`),
    path.join(__dirname, `../DOCUMENTATION/ARCHIVED/${feature.specFile}`),
    path.join(__dirname, `../DOCUMENTATION/MODULES/${feature.module}/${feature.specFile}`),
    path.join(__dirname, `../${feature.specFile}`)
  ]

  const foundPath = possiblePaths.find(p => fs.existsSync(p))

  if (!foundPath && feature.status !== '⬜') {
    // Only warn for in-progress or completed features
    return {
      featureId: feature.id,
      severity: feature.status === '✅' ? 'error' : 'warning',
      message: `Planning file missing: ${feature.specFile}`,
      location: `NextFeatures/ or DOCUMENTATION/MODULES/${feature.module}/`
    }
  }

  return null
}

// Check if feature is documented in REFERENCES.md
function checkScientificReferences(feature: FeatureEntry): ValidationIssue | null {
  if (!feature.scientific) return null
  if (feature.status !== '✅') return null // Only check completed features

  // New location for scientific references
  const referencesPath = path.join(__dirname, '../DOCUMENTATION/SCIENTIFIC/REFERENCES.md')

  if (!fs.existsSync(referencesPath)) {
    return {
      featureId: feature.id,
      severity: 'error',
      message: 'REFERENCES.md not found',
      location: 'DOCUMENTATION/SCIENTIFIC/'
    }
  }

  const content = fs.readFileSync(referencesPath, 'utf-8')

  // Check if feature ID or name appears in references
  const featureIdNormalized = feature.id.replace(/\./g, '')
  const featureNameNormalized = feature.name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const contentNormalized = content.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (!contentNormalized.includes(featureIdNormalized) &&
      !contentNormalized.includes(featureNameNormalized)) {
    return {
      featureId: feature.id,
      severity: 'warning',
      message: `Feature "${feature.name}" not found in REFERENCES.md (might be in detector docs)`,
      location: 'DOCUMENTATION/SCIENTIFIC/REFERENCES.md'
    }
  }

  return null
}

// Check if ValidationMetadata exists in validation.ts
function checkValidationMetadata(feature: FeatureEntry): ValidationIssue | null {
  if (!feature.scientific) return null
  if (feature.status !== '✅') return null // Only check completed features

  const validationPath = path.join(__dirname, '../src/lib/diagnosis/validation.ts')

  if (!fs.existsSync(validationPath)) {
    return {
      featureId: feature.id,
      severity: 'warning',
      message: 'validation.ts not found (might be expected for non-detector features)',
      location: 'src/lib/diagnosis/'
    }
  }

  const content = fs.readFileSync(validationPath, 'utf-8')

  // Simple check: does feature ID appear in validation.ts?
  if (!content.includes(feature.id)) {
    // Don't error - just warn, as not all scientific features need ValidationMetadata
    return {
      featureId: feature.id,
      severity: 'warning',
      message: `Feature "${feature.name}" may be missing ValidationMetadata in validation.ts (check if it's a detector)`,
      location: 'src/lib/diagnosis/validation.ts'
    }
  }

  return null
}

// Check validation status column
function checkValidationStatus(feature: FeatureEntry): ValidationIssue | null {
  // Skip rejected features
  if (feature.status === '❌') return null

  // For scientific features (completed), validation status should not be empty
  if (feature.scientific && feature.status === '✅') {
    if (feature.validationStatus === '') {
      return {
        featureId: feature.id,
        severity: 'error',
        message: `Completed scientific feature "${feature.name}" missing validation status (should be ✅ or ⚠️)`,
        location: `MODULES/${feature.module}/FEATURE_BACKLOG - 🔬 Validiert? column`
      }
    }

    // If validation status is ✅, verify REFERENCES.md has an entry
    if (feature.validationStatus === '✅') {
      const referencesPath = path.join(__dirname, '../DOCUMENTATION/SCIENTIFIC/REFERENCES.md')

      if (fs.existsSync(referencesPath)) {
        const content = fs.readFileSync(referencesPath, 'utf-8')
        const featureIdNormalized = feature.id.replace(/\./g, '')
        const contentNormalized = content.toLowerCase().replace(/[^a-z0-9]/g, '')

        if (!contentNormalized.includes(featureIdNormalized)) {
          return {
            featureId: feature.id,
            severity: 'warning',
            message: `Feature marked as fully validated (✅) but not found in REFERENCES.md`,
            location: 'DOCUMENTATION/SCIENTIFIC/REFERENCES.md'
          }
        }
      }
    }
  }

  // For infrastructure/tool features (not scientific), should be marked as "-"
  if (!feature.scientific && feature.status === '✅' && feature.validationStatus !== '-') {
    return {
      featureId: feature.id,
      severity: 'warning',
      message: `Non-scientific feature "${feature.name}" should have validation status "-" (not applicable)`,
      location: `MODULES/${feature.module}/FEATURE_BACKLOG - 🔬 Validiert? column`
    }
  }

  return null
}

// Main validation
function validateFeatures() {
  console.log('🔍 RGA Analyser - Feature Completeness Check (Modular Architecture)\n')
  console.log('━'.repeat(60))
  console.log('')

  const features = parseAllFeatures()
  const issues: ValidationIssue[] = []

  if (features.length === 0) {
    console.log('⚠️  No features found in module backlogs')
    console.log('   Expected locations:')
    console.log('   - DOCUMENTATION/MODULES/RGA/FEATURE_BACKLOG_RGA.md')
    console.log('   - DOCUMENTATION/MODULES/LeakSearch/FEATURE_BACKLOG_LEAKSEARCH.md')
    console.log('   - DOCUMENTATION/BACKLOG/FEATURE_BACKLOG_INFRASTRUCTURE.md')
    console.log('')
    return 1
  }

  // Group by module
  const byModule = features.reduce((acc, f) => {
    if (!acc[f.module]) acc[f.module] = []
    acc[f.module].push(f)
    return acc
  }, {} as Record<string, FeatureEntry[]>)

  console.log(`📊 Found ${features.length} features across ${Object.keys(byModule).length} modules\n`)

  for (const [module, moduleFeatures] of Object.entries(byModule)) {
    const scientific = moduleFeatures.filter(f => f.scientific).length
    const completed = moduleFeatures.filter(f => f.status === '✅').length
    console.log(`   ${module}: ${moduleFeatures.length} total (${scientific} scientific, ${completed} completed)`)
  }

  console.log('')

  for (const feature of features) {
    const planningIssue = checkPlanningFile(feature)
    if (planningIssue) issues.push(planningIssue)

    const referencesIssue = checkScientificReferences(feature)
    if (referencesIssue) issues.push(referencesIssue)

    const validationIssue = checkValidationMetadata(feature)
    if (validationIssue) issues.push(validationIssue)

    const validationStatusIssue = checkValidationStatus(feature)
    if (validationStatusIssue) issues.push(validationStatusIssue)
  }

  console.log('━'.repeat(60))
  console.log('')

  // Report
  if (issues.length === 0) {
    console.log('✅ All features are properly documented!\n')
    console.log('   No issues found. Documentation is complete.')
    console.log('')
    return 0
  }

  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  if (errors.length > 0) {
    console.log(`❌ ${errors.length} ERROR(S) found:\n`)
    errors.forEach(issue => {
      console.log(`  [${issue.featureId}] ${issue.message}`)
      console.log(`  └─ Location: ${issue.location}`)
      console.log('')
    })
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} WARNING(S) found:\n`)
    warnings.forEach(issue => {
      console.log(`  [${issue.featureId}] ${issue.message}`)
      console.log(`  └─ Location: ${issue.location}`)
      console.log('')
    })
  }

  console.log('━'.repeat(60))
  console.log('')
  console.log(`Summary: ${errors.length} error(s), ${warnings.length} warning(s)`)
  console.log('')

  if (errors.length > 0) {
    console.log('💡 Tip: Fix errors before committing. Warnings are informational.')
  }

  console.log('')

  return errors.length > 0 ? 1 : 0
}

// Run
const exitCode = validateFeatures()
process.exit(exitCode)
