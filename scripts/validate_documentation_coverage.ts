#!/usr/bin/env tsx
/**
 * Documentation Coverage Validator
 *
 * Prüft, ob alle wissenschaftlichen Werte aus dem Code in der Dokumentation erfasst sind
 */

import * as fs from 'fs'
import * as path from 'path'

// Typen für unsere Analyse
interface ScientificValue {
  file: string
  line: number
  type: 'constant' | 'threshold' | 'ratio' | 'rsf' | 'cracking_pattern' | 'isotope'
  name: string
  value: string | number
  context: string
}

interface DocumentationCheck {
  value: ScientificValue
  documented: boolean
  documentLocation?: string
}

// Dateien, die geprüft werden sollen
// NOTE: Detectors migrated to modular structure (21 files)
const CODE_FILES = [
  // Modular Detectors - Leaks (4)
  'src/modules/rga/lib/detectors/leaks/detectAirLeak.ts',
  'src/modules/rga/lib/detectors/leaks/detectHeliumLeak.ts',
  'src/modules/rga/lib/detectors/leaks/detectVirtualLeak.ts',
  'src/modules/rga/lib/detectors/leaks/detectCoolingWaterLeak.ts',

  // Modular Detectors - Contamination (8)
  'src/modules/rga/lib/detectors/contamination/oils/detectOilBackstreaming.ts',
  'src/modules/rga/lib/detectors/contamination/fluorinated/detectFomblinContamination.ts',
  'src/modules/rga/lib/detectors/contamination/polymers/detectPolymerOutgassing.ts',
  'src/modules/rga/lib/detectors/contamination/polymers/detectPlasticizerContamination.ts',
  'src/modules/rga/lib/detectors/contamination/polymers/detectSiliconeContamination.ts',
  'src/modules/rga/lib/detectors/contamination/solvents/detectSolventResidue.ts',
  'src/modules/rga/lib/detectors/contamination/solvents/detectChlorinatedSolvent.ts',
  'src/modules/rga/lib/detectors/contamination/aromatics/detectAromatic.ts',

  // Modular Detectors - Outgassing (2)
  'src/modules/rga/lib/detectors/outgassing/detectWaterOutgassing.ts',
  'src/modules/rga/lib/detectors/outgassing/detectHydrogenDominant.ts',

  // Modular Detectors - Artifacts (1)
  'src/modules/rga/lib/detectors/artifacts/detectESDartifacts.ts',

  // Modular Detectors - Gases (4)
  'src/modules/rga/lib/detectors/gases/detectAmmonia.ts',
  'src/modules/rga/lib/detectors/gases/detectMethane.ts',
  'src/modules/rga/lib/detectors/gases/detectSulfur.ts',
  'src/modules/rga/lib/detectors/gases/detectProcessGasResidue.ts',

  // Modular Detectors - Isotopes (1)
  'src/modules/rga/lib/detectors/isotopes/verifyIsotopeRatios.ts',

  // Modular Detectors - Quality (1)
  'src/modules/rga/lib/detectors/quality/detectCleanUHV.ts',

  // Other scientific code
  'src/lib/calibration/constants.ts',
  'src/lib/calibration/deconvolution.ts',
  'src/lib/knowledge/isotopePatterns.ts',
  'src/lib/knowledge/outgassingRates.ts'
]

// Dokumentations-Dateien
const DOC_FILES = [
  'DOCUMENTATION/SCIENTIFIC/DETECTORS.md',
  'DOCUMENTATION/SCIENTIFIC/CALCULATIONS.md',
  'DOCUMENTATION/SCIENTIFIC/CRACKING_PATTERNS.md',
  'DOCUMENTATION/SCIENTIFIC/WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md',
  'RGA_Knowledge/SCIENTIFIC_REFERENCES.md'
]

/**
 * Extrahiert wissenschaftliche Werte aus einer Code-Datei
 */
function extractValuesFromCode(filePath: string): ScientificValue[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const values: ScientificValue[] = []

  lines.forEach((line, index) => {
    // Numerische Konstanten (z.B. ratio >= 3.0 && ratio <= 4.5)
    const rangeMatch = line.match(/>=\s*(\d+\.?\d*)\s*&&.*<=\s*(\d+\.?\d*)/)
    if (rangeMatch) {
      values.push({
        file: path.basename(filePath),
        line: index + 1,
        type: 'threshold',
        name: extractVariableName(line),
        value: `${rangeMatch[1]}-${rangeMatch[2]}`,
        context: line.trim()
      })
    }

    // RSF-Werte (z.B. 'He': 0.14)
    const rsfMatch = line.match(/'([A-Za-z0-9]+)':\s*(\d+\.?\d*)/)
    if (rsfMatch && filePath.includes('constants.ts')) {
      values.push({
        file: path.basename(filePath),
        line: index + 1,
        type: 'rsf',
        name: rsfMatch[1],
        value: parseFloat(rsfMatch[2]),
        context: line.trim()
      })
    }

    // Isotopenverhältnisse (z.B. const ratio = 295.5)
    const isotopeMatch = line.match(/const\s+(\w+)\s*=\s*(\d+\.?\d*)/)
    if (isotopeMatch && filePath.includes('isotopePatterns.ts')) {
      values.push({
        file: path.basename(filePath),
        line: index + 1,
        type: 'isotope',
        name: isotopeMatch[1],
        value: parseFloat(isotopeMatch[2]),
        context: line.trim()
      })
    }

    // Cracking Patterns (z.B. 28: 100)
    const crackingMatch = line.match(/^\s*(\d+):\s*(\d+\.?\d*)/)
    if (crackingMatch && (filePath.includes('constants.ts') || filePath.includes('deconvolution.ts'))) {
      values.push({
        file: path.basename(filePath),
        line: index + 1,
        type: 'cracking_pattern',
        name: `m/z ${crackingMatch[1]}`,
        value: parseFloat(crackingMatch[2]),
        context: line.trim()
      })
    }
  })

  return values
}

/**
 * Extrahiert Variablennamen aus einer Zeile
 */
function extractVariableName(line: string): string {
  const match = line.match(/const\s+(\w+)/)
  if (match) return match[1]

  const varMatch = line.match(/(\w+)\s*>=/)
  if (varMatch) return varMatch[1]

  return 'unknown'
}

/**
 * Prüft, ob ein Wert in der Dokumentation vorhanden ist
 */
function checkDocumentation(value: ScientificValue, docContents: Map<string, string>): DocumentationCheck {
  const valueStr = value.value.toString()

  for (const [docFile, content] of docContents.entries()) {
    // Suche nach dem Wert in verschiedenen Formaten
    const patterns = [
      valueStr,
      valueStr.replace('.', ','), // Deutsch: Komma statt Punkt
      value.name,
      `m/z ${value.name}`,
      `${value.name} = ${valueStr}`
    ]

    for (const pattern of patterns) {
      if (content.includes(pattern)) {
        return {
          value,
          documented: true,
          documentLocation: docFile
        }
      }
    }
  }

  return {
    value,
    documented: false
  }
}

/**
 * Hauptfunktion
 */
function main() {
  console.log('🔍 Documentation Coverage Validator\n')
  console.log('=' .repeat(80))

  // 1. Lade Dokumentations-Inhalte
  console.log('\n📚 Lade Dokumentation...')
  const docContents = new Map<string, string>()
  DOC_FILES.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      docContents.set(path.basename(file), content)
      console.log(`   ✓ ${file}`)
    } catch (err) {
      console.log(`   ⚠️  ${file} nicht gefunden`)
    }
  })

  // 2. Extrahiere Werte aus Code
  console.log('\n📝 Extrahiere wissenschaftliche Werte aus Code...')
  const allValues: ScientificValue[] = []
  CODE_FILES.forEach(file => {
    try {
      const values = extractValuesFromCode(file)
      allValues.push(...values)
      console.log(`   ✓ ${file}: ${values.length} Werte gefunden`)
    } catch (err) {
      console.log(`   ⚠️  ${file} konnte nicht gelesen werden`)
    }
  })

  // 3. Prüfe Dokumentation
  console.log('\n🔎 Prüfe Dokumentationsabdeckung...')
  const checks = allValues.map(value => checkDocumentation(value, docContents))

  // 4. Statistiken
  const documented = checks.filter(c => c.documented).length
  const total = checks.length
  const coverage = ((documented / total) * 100).toFixed(1)

  console.log('\n' + '='.repeat(80))
  console.log(`📊 Ergebnis: ${documented}/${total} Werte dokumentiert (${coverage}%)`)
  console.log('='.repeat(80))

  // 5. Gruppiere nach Typ
  const byType = new Map<string, DocumentationCheck[]>()
  checks.forEach(check => {
    const type = check.value.type
    if (!byType.has(type)) byType.set(type, [])
    byType.get(type)!.push(check)
  })

  console.log('\n📋 Abdeckung nach Typ:\n')
  byType.forEach((checkList, type) => {
    const typeDocumented = checkList.filter(c => c.documented).length
    const typeTotal = checkList.length
    const typeCoverage = ((typeDocumented / typeTotal) * 100).toFixed(1)

    console.log(`   ${type.padEnd(20)} ${typeDocumented}/${typeTotal} (${typeCoverage}%)`)
  })

  // 6. Nicht dokumentierte Werte
  const undocumented = checks.filter(c => !c.documented)
  if (undocumented.length > 0) {
    console.log('\n⚠️  Nicht dokumentierte Werte:\n')
    undocumented.slice(0, 20).forEach(check => {
      const v = check.value
      console.log(`   ${v.file}:${v.line} - ${v.type}: ${v.name} = ${v.value}`)
      console.log(`      ${v.context.substring(0, 70)}...`)
    })

    if (undocumented.length > 20) {
      console.log(`\n   ... und ${undocumented.length - 20} weitere`)
    }
  } else {
    console.log('\n✅ Alle Werte sind dokumentiert!')
  }

  // 7. Export für weitere Analyse
  const reportPath = 'DOCUMENTATION/documentation_coverage_report.json'
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total,
      documented,
      coverage: parseFloat(coverage)
    },
    byType: Object.fromEntries(
      Array.from(byType.entries()).map(([type, checks]) => [
        type,
        {
          total: checks.length,
          documented: checks.filter(c => c.documented).length,
          undocumented: checks.filter(c => !c.documented).map(c => ({
            name: c.value.name,
            value: c.value.value,
            file: c.value.file,
            line: c.value.line
          }))
        }
      ])
    )
  }, null, 2))

  console.log(`\n💾 Detaillierter Report gespeichert: ${reportPath}`)
}

main()
