import type { RawData, RGAMetadata, DataPoint } from '@/types/rga'

export function parseASCFile(content: string): RawData {
  // Normalize line endings (handle \r\n, \r, and \n)
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Detect file format
  if (normalizedContent.startsWith('ASCII SCAN ANALOG DATA:')) {
    return parseAlternativeASCFormat(normalizedContent)
  }
  return parseQuaderaFormat(normalizedContent)
}

// Parse the standard Pfeiffer Quadera export format
function parseQuaderaFormat(content: string): RawData {
  const lines = content.split('\n')
  const metadata: Partial<RGAMetadata> = {}
  const points: DataPoint[] = []

  let dataStarted = false
  let scanCount = 0

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
        scanCount++
      }
    } else {
      // Check if we hit a new scan cycle (stop at first scan only)
      if (trimmed.startsWith('First Mass') || trimmed.startsWith('Mass [amu]')) {
        // New scan detected - stop parsing, use only first scan
        break
      }

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

// Parse alternative ASCII SCAN ANALOG DATA format (e.g., from OIPT software)
function parseAlternativeASCFormat(content: string): RawData {
  const lines = content.split('\n')
  const metadata: Partial<RGAMetadata> = {}
  const points: DataPoint[] = []

  let dataStarted = false
  let scanCycle = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (!dataStarted) {
      // Header parsing
      if (trimmed.startsWith('ASCII SCAN ANALOG DATA:')) {
        const match = trimmed.match(/ASCII SCAN ANALOG DATA:\s*(.+)/)
        if (match) {
          metadata.sourceFile = match[1].trim()
        }
      } else if (trimmed.startsWith('DATE:')) {
        const dateMatch = trimmed.match(/DATE:\s*(\d+\.\d+\.\d+)/)
        const timeMatch = lines.find(l => l.includes('TIME:'))?.match(/TIME:\s*(\d+:\d+:\d+)/)
        if (dateMatch && timeMatch) {
          metadata.startTime = parseGermanDate(`${dateMatch[1]} ${timeMatch[1]}`)
        }
      } else if (trimmed.startsWith('First Mass')) {
        const match = trimmed.match(/First Mass\s+([\d.,]+)/)
        if (match) {
          metadata.firstMass = parseGermanNumber(match[1])
        }
      } else if (trimmed.startsWith('Scan Width')) {
        const match = trimmed.match(/Scan Width\s+([\d.,]+)/)
        if (match) {
          metadata.scanWidth = parseGermanNumber(match[1])
        }
      } else if (trimmed.startsWith('ScanData')) {
        // Data starts after this line
        // Format: "ScanData\t1" followed by data on subsequent lines
        dataStarted = true
        scanCycle++
      }
    } else {
      // Data parsing - format: "   0.00\t8.6075E-012" (mass\tcurrent)
      // Stop if we hit a new ScanData block (multiple cycles)
      if (trimmed.startsWith('ScanData')) {
        break // Only use first scan cycle
      }

      const parts = trimmed.split('\t')
      if (parts.length >= 2) {
        const mass = parseGermanNumber(parts[0])
        const current = parseScientificNotation(parts[1])
        if (!isNaN(mass) && !isNaN(current) && current !== 0) {
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
      exportTime: null,
      startTime: metadata.startTime || null,
      endTime: null,
      taskName: 'Scan',
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
