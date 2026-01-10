#!/usr/bin/env tsx
/**
 * RGA Feature CLI
 *
 * Interactive tool for managing scientific features.
 *
 * Usage: npm run feature
 */

import inquirer from 'inquirer'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface FeatureMetadata {
  id: string
  name: string
  type: 'detector' | 'tool' | 'enhancement'
  scientific: boolean
  effort: string
}

async function main() {
  console.log('🔬 RGA Feature Management CLI\n')
  console.log('━'.repeat(60))
  console.log('')

  // Check for command-line arguments
  const args = process.argv.slice(2)
  let action = args[0]

  // If no arguments or invalid action, show menu
  if (!action || !['create', 'report', 'validate', 'exit'].includes(action)) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📝 Create new feature', value: 'create' },
          { name: '📊 Generate feature report', value: 'report' },
          { name: '🔍 Validate documentation', value: 'validate' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }
    ])
    action = answer.action
  }

  switch (action) {
    case 'create':
      await createFeature()
      break
    case 'report':
      await generateReport()
      break
    case 'validate':
      await validateDocumentation()
      break
    case 'exit':
      console.log('\nGoodbye! 👋\n')
      process.exit(0)
  }
}

async function createFeature() {
  console.log('\n📝 Creating new feature...\n')
  console.log('━'.repeat(60))
  console.log('')

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Feature ID (e.g., 1.5.9):',
      validate: (input) => /^\d+\.\d+\.\d+$/.test(input) || 'Invalid ID format (use X.Y.Z)'
    },
    {
      type: 'input',
      name: 'name',
      message: 'Feature name (German):',
      validate: (input) => input.length > 0 || 'Name required'
    },
    {
      type: 'list',
      name: 'type',
      message: 'Feature type:',
      choices: [
        { name: 'Detector (diagnosis algorithm)', value: 'detector' },
        { name: 'Tool (calculator, analyzer)', value: 'tool' },
        { name: 'Enhancement (existing feature improvement)', value: 'enhancement' }
      ]
    },
    {
      type: 'confirm',
      name: 'scientific',
      message: 'Requires scientific validation?',
      default: true
    },
    {
      type: 'input',
      name: 'effort',
      message: 'Estimated effort (e.g., 2-3h):',
      default: '2-4h'
    }
  ])

  // Generate file names
  const featureSlug = answers.name
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ß/g, 'SS')
    .replace(/[^A-Z0-9]/g, '_')

  const planFile = `FEATURE_${answers.id}_${featureSlug}_PLAN.md`
  const checklistFile = `FEATURE_${answers.id}_CHECKLIST.md`
  const planPath = path.join(__dirname, '../NextFeatures', planFile)
  const checklistPath = path.join(__dirname, '../NextFeatures', checklistFile)

  // Load templates
  const templateDir = path.join(__dirname, '../DOCUMENTATION/BACKLOG/TEMPLATES')
  const planTemplate = fs.readFileSync(
    path.join(templateDir, 'FEATURE_PLAN_TEMPLATE.md'),
    'utf-8'
  )
  const checklistTemplate = fs.readFileSync(
    path.join(templateDir, 'FEATURE_CHECKLIST.md'),
    'utf-8'
  )

  // Replace placeholders
  const today = new Date().toISOString().split('T')[0]

  const planContent = planTemplate
    .replace(/\[FEATURE_NAME\]/g, answers.name)
    .replace(/\[FEATURE_ID\]/g, answers.id)
    .replace(/\[Datum\]/g, today)
    .replace(/\[Name oder "Claude Code"\]/g, 'Claude Code')

  const checklistContent = checklistTemplate
    .replace(/\[FEATURE_NAME\]/g, answers.name)
    .replace(/\[z\.B\. 1\.5\.7\]/g, answers.id)
    .replace(/\[Datum\]/g, today)

  // Write files
  fs.writeFileSync(planPath, planContent)
  fs.writeFileSync(checklistPath, checklistContent)

  console.log('')
  console.log('━'.repeat(60))
  console.log('✅ Feature files created:')
  console.log('━'.repeat(60))
  console.log('')
  console.log(`  📄 Planning:  NextFeatures/${planFile}`)
  console.log(`  📋 Checklist: NextFeatures/${checklistFile}`)
  console.log('')
  console.log('━'.repeat(60))
  console.log('📋 Next steps:')
  console.log('━'.repeat(60))
  console.log('')
  console.log('  1. Add entry to FEATURE_BACKLOG.md (Status: ⬜)')
  console.log('  2. Fill in planning file with scientific research')
  console.log('  3. Add sources to SCIENTIFIC_REFERENCES.md')
  console.log('  4. Implement feature')
  console.log('  5. Add ValidationMetadata to src/lib/diagnosis/validation.ts')
  console.log('  6. Update FEATURE_BACKLOG.md (Status: ✅)')
  console.log('  7. Move planning file to DOCUMENTATION/ARCHIVED/')
  console.log('')
  console.log('  💡 Run: npm run check:features  →  Verify completeness')
  console.log('')
}

async function generateReport() {
  console.log('\n📊 Generating feature report...\n')
  console.log('━'.repeat(60))
  console.log('')

  // Read FEATURE_BACKLOG.md
  const backlogPath = path.join(__dirname, '../DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md')

  if (!fs.existsSync(backlogPath)) {
    console.log('❌ ERROR: FEATURE_BACKLOG.md not found')
    return
  }

  const content = fs.readFileSync(backlogPath, 'utf-8')

  // Parse features
  const featureRegex = /\|\s*([\d.]+)\s*\|\s*\*\*(.*?)\*\*\s*\|\s*(⬜|🔄|✅|⏸️|❌)\s*\|/g
  const features: Array<{ id: string; name: string; status: string }> = []
  let match

  while ((match = featureRegex.exec(content)) !== null) {
    features.push({
      id: match[1],
      name: match[2],
      status: match[3]
    })
  }

  // Count by status
  const counts = {
    '⬜': features.filter(f => f.status === '⬜').length,
    '🔄': features.filter(f => f.status === '🔄').length,
    '✅': features.filter(f => f.status === '✅').length,
    '⏸️': features.filter(f => f.status === '⏸️').length,
    '❌': features.filter(f => f.status === '❌').length
  }

  // Count scientific features
  const scientificCount = features.filter(f =>
    f.id.startsWith('1.5.') ||
    f.id.startsWith('1.8.') ||
    f.name.toLowerCase().includes('validierung') ||
    f.name.toLowerCase().includes('detektor')
  ).length

  console.log('📈 RGA Analyser - Feature Report')
  console.log('━'.repeat(60))
  console.log('')
  console.log(`  Total Features:       ${features.length}`)
  console.log(`  Scientific Features:  ${scientificCount}`)
  console.log('')
  console.log('  Status Breakdown:')
  console.log(`    ⬜ Planned:          ${counts['⬜']}`)
  console.log(`    🔄 In Progress:      ${counts['🔄']}`)
  console.log(`    ✅ Completed:        ${counts['✅']}`)
  console.log(`    ⏸️ Paused:           ${counts['⏸️']}`)
  console.log(`    ❌ Rejected:         ${counts['❌']}`)
  console.log('')
  console.log('  Completion Rate:     ' +
    `${((counts['✅'] / features.length) * 100).toFixed(1)}%`)
  console.log('')
  console.log('━'.repeat(60))
  console.log('')

  // List in-progress features
  const inProgress = features.filter(f => f.status === '🔄')
  if (inProgress.length > 0) {
    console.log('🔄 In Progress:')
    console.log('')
    inProgress.forEach(f => {
      console.log(`  • [${f.id}] ${f.name}`)
    })
    console.log('')
  }

  // List planned features
  const planned = features.filter(f => f.status === '⬜')
  if (planned.length > 0) {
    console.log('⬜ Planned:')
    console.log('')
    planned.forEach(f => {
      console.log(`  • [${f.id}] ${f.name}`)
    })
    console.log('')
  }

  console.log('━'.repeat(60))
  console.log('')
}

async function validateDocumentation() {
  console.log('\n🔍 Running documentation validation...\n')
  console.log('━'.repeat(60))
  console.log('')

  try {
    execSync('npm run check:features', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    })
  } catch (error) {
    // Error already printed by check:features script
    console.log('')
    console.log('💡 Fix the issues above to ensure complete documentation.')
    console.log('')
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
