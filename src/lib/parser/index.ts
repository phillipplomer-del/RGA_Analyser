import type { RawData, RGAMetadata, DataPoint } from '@/types/rga'

export function parseASCFile(content: string): RawData {
  const lines = content.split('\n')
  const metadata: Partial<RGAMetadata> = {}
  const points: DataPoint[] = []

  let dataStarted = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Header parsing
    if (!dataStarted) {
      if (trimmed.startsWith('Sourcefile')) {
        metadata.sourceFile = trimmed.split('\t')[1]?.trim()
      } else if (trimmed.startsWith('Exporttime')) {
        metadata.exportTime = parseGermanDate(trimmed.split('\t')[1]?.trim())
      } else if (trimmed.startsWith('Start Time') && !metadata.startTime) {
        metadata.startTime = parseGermanDate(trimmed.split('\t')[1]?.trim())
      } else if (trimmed.startsWith('End Time')) {
        metadata.endTime = parseGermanDate(trimmed.split('\t')[1]?.trim())
      } else if (trimmed.startsWith('Task Name')) {
        metadata.taskName = trimmed.split('\t')[1]?.trim()
      } else if (trimmed.startsWith('First Mass')) {
        metadata.firstMass = parseGermanNumber(trimmed.split('\t')[1]?.trim())
      } else if (trimmed.startsWith('Scan Width')) {
        metadata.scanWidth = parseGermanNumber(trimmed.split('\t')[1]?.trim())
      } else if (trimmed.startsWith('Mass [amu]')) {
        dataStarted = true
      }
    } else {
      // Data parsing
      const parts = trimmed.split('\t')
      if (parts.length >= 2) {
        const mass = parseGermanNumber(parts[0])
        const current = parseScientificNotation(parts[1])
        if (!isNaN(mass) && !isNaN(current)) {
          points.push({ mass, current })
        }
      }
    }
  }

  // Extract chamber name and pressure from filename if available
  if (metadata.sourceFile) {
    const info = extractInfoFromFilename(metadata.sourceFile)
    metadata.chamberName = info.chamberName
    metadata.pressure = info.pressure
  }

  return {
    metadata: {
      sourceFile: metadata.sourceFile || '',
      exportTime: metadata.exportTime || null,
      startTime: metadata.startTime || null,
      endTime: metadata.endTime || null,
      taskName: metadata.taskName || 'Scan',
      firstMass: metadata.firstMass || 0,
      scanWidth: metadata.scanWidth || 100,
      chamberName: metadata.chamberName,
      pressure: metadata.pressure,
    },
    points,
  }
}

export function parseGermanNumber(str: string | undefined): number {
  if (!str) return 0
  return parseFloat(str.replace(',', '.'))
}

export function parseScientificNotation(str: string | undefined): number {
  if (!str) return 0
  return parseFloat(str.replace(',', '.'))
}

export function parseGermanDate(str: string | undefined): Date | null {
  if (!str) return null

  // Format: "12.16.2025 12:58:16.824" (Monat.Tag.Jahr)
  const match = str.match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+):(\d+)/)
  if (match) {
    const [, month, day, year, hour, min, sec] = match
    return new Date(+year, +month - 1, +day, +hour, +min, +sec)
  }

  return null
}

function extractInfoFromFilename(filename: string): { chamberName?: string; pressure?: string } {
  const result: { chamberName?: string; pressure?: string } = {}

  // Look for "Kammer" in filename
  const chamberMatch = filename.match(/Kammer\s*(\d+)/i)
  if (chamberMatch) {
    result.chamberName = `Kammer ${chamberMatch[1]}`
  }

  // Look for pressure (e.g., "2,1e-9mbar")
  const pressureMatch = filename.match(/(\d+[,.]?\d*e-?\d+)\s*mbar/i)
  if (pressureMatch) {
    result.pressure = `${pressureMatch[1].replace(',', '.')} mbar`
  }

  return result
}
