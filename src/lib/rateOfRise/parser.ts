/**
 * TPG362 CSV Parser
 * Parses Pfeiffer Vacuum TPG362 pressure logger CSV exports
 */

import type {
  TPGMetadata,
  PressureDataPoint,
  RateOfRiseData,
  SensorType,
  ParseResult,
} from '@/types/rateOfRise'

/**
 * Reconstruct lines from a single-line TPG362 CSV file
 * TPG362 exports sometimes have all data concatenated without line breaks
 */
function reconstructLines(content: string): string[] {
  const lines: string[] = []

  // Extract sep=; as first line
  const sepIndex = content.indexOf('sep=;')
  if (sepIndex >= 0) {
    lines.push('sep=;')
  }

  // Metadata fields to extract (in order they typically appear)
  // Include both German and English field names for international TPG362 exports
  const metadataFields = [
    // German
    'Hersteller:', 'Gerät:', 'Geraet:', 'Artikelnummer:', 'Seriennummer:',
    'Firmware Version:', 'Dateiname:', 'Datum / Zeit:', 'Messintervall:',
    'Sensor 1:', 'Sensor 2:',
    // English
    'Producer:', 'Device:', 'Product number:', 'Serial number:',
    'Firmware version:', 'Filename:', 'Date: / time:', 'Sampletime:',
    'Channel 1:', 'Channel 2:'
  ]

  // Extract metadata fields
  for (const field of metadataFields) {
    const fieldIndex = content.indexOf(field)
    if (fieldIndex >= 0) {
      // Find the value after the field (between ; and next known field or date pattern)
      const afterField = content.substring(fieldIndex)
      const parts = afterField.split(';')
      if (parts.length >= 2) {
        // Field name is parts[0], value is parts[1]
        lines.push(`${parts[0]};${parts[1]};`)
      }
    }
  }

  // Find the data header (Datum;Zeit;Sensor or Date;Time;Channel)
  const headerMatch = content.match(/(Datum;Zeit;[^;]+;[^;]*;?)/) ||
                      content.match(/(Date;Time;[^;]+;[^;]*;?)/)
  if (headerMatch) {
    lines.push(headerMatch[1])
  }

  // Extract data rows by finding date patterns (YYYY-MM-DD or DD.MM.YYYY)
  // Pattern: date;time;pressure1;pressure2;
  const dataRowPattern = /(\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.\d{4});(\d{2}:\d{2}:\d{2});([^;]+);([^;]*);?/g
  let match
  while ((match = dataRowPattern.exec(content)) !== null) {
    lines.push(`${match[1]};${match[2]};${match[3]};${match[4]};`)
  }

  return lines
}

/**
 * Parse a TPG362 CSV file content
 */
export function parseTPG362CSV(content: string): ParseResult {
  try {
    let lines = content.split(/\r?\n/)

    // Check if file is single-line (no proper line breaks)
    // TPG362 exports sometimes have all data on one line
    // Check for both German (Datum;Zeit;) and English (Date;Time;) headers
    const hasDataHeader = content.includes('Datum;Zeit;') || content.includes('Date;Time;')
    if (lines.length < 20 && content.includes('sep=;') && hasDataHeader) {
      lines = reconstructLines(content)
    }

    // Minimum: headers + at least 10 data points
    if (lines.length < 20) {
      return { success: false, error: 'Datei zu kurz / File too short' }
    }

    // Check for TPG362 format (sep=; in first line)
    if (!lines[0].includes('sep=;')) {
      return {
        success: false,
        error: 'Ungültiges Format: sep=; erwartet / Invalid format: sep=; expected',
      }
    }

    // Check for Pfeiffer manufacturer (German: Hersteller, English: Producer)
    const manufacturerLine = lines.find((l) =>
      l.startsWith('Hersteller:') || l.startsWith('Producer:')
    )
    if (!manufacturerLine?.includes('Pfeiffer')) {
      return {
        success: false,
        error:
          'Kein Pfeiffer-Gerät erkannt / No Pfeiffer device detected',
      }
    }

    // Parse metadata
    const metadata = parseMetadata(lines)

    // Find data header line (contains "Datum;Zeit;Sensor")
    const headerIndex = lines.findIndex(
      (line) =>
        line.startsWith('Datum;Zeit;') || line.startsWith('Date;Time;')
    )

    if (headerIndex === -1) {
      return {
        success: false,
        error: 'Daten-Header nicht gefunden / Data header not found',
      }
    }

    // Parse data points and detect if Channel 2 is used as primary
    const dataPoints: PressureDataPoint[] = []
    let firstTimestamp: Date | null = null
    let usesChannel2AsPrimary = false

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith(';')) continue

      // Detect if first valid data row uses Channel 2 as primary
      if (dataPoints.length === 0 && !usesChannel2AsPrimary) {
        const parts = line.split(';')
        if (parts.length >= 4) {
          const rawP1 = parseGermanFloat(parts[2])
          const rawP2 = parseGermanFloat(parts[3])
          if ((!rawP1 || rawP1 <= 0 || isNaN(rawP1)) && rawP2 && rawP2 > 0) {
            usesChannel2AsPrimary = true
          }
        }
      }

      const point = parseDataLine(line, dataPoints.length)
      if (point) {
        if (!firstTimestamp) {
          firstTimestamp = point.timestamp
        }
        point.relativeTimeS =
          (point.timestamp.getTime() - firstTimestamp.getTime()) / 1000
        dataPoints.push(point)
      }
    }

    if (dataPoints.length < 10) {
      return {
        success: false,
        error: `Zu wenige Datenpunkte (${dataPoints.length}) / Too few data points`,
      }
    }

    // If Channel 2 is used as primary, swap sensor types in metadata
    if (usesChannel2AsPrimary && metadata.sensor2Type) {
      const temp = metadata.sensor1Type
      metadata.sensor1Type = metadata.sensor2Type
      metadata.sensor2Type = temp !== 'UNKNOWN' ? temp : null
    }

    // Calculate derived values
    const pressures = dataPoints
      .map((p) => p.pressure1)
      .filter((p) => p > 0)

    if (pressures.length === 0) {
      return {
        success: false,
        error: 'Keine gültigen Druckwerte / No valid pressure values',
      }
    }

    const data: RateOfRiseData = {
      metadata,
      dataPoints,
      duration: dataPoints[dataPoints.length - 1].relativeTimeS,
      minPressure: Math.min(...pressures),
      maxPressure: Math.max(...pressures),
      pointCount: dataPoints.length,
    }

    return { success: true, data }
  } catch (e) {
    return {
      success: false,
      error: `Parser-Fehler: ${e instanceof Error ? e.message : 'Unbekannt'}`,
    }
  }
}

/**
 * Parse metadata from CSV header lines
 */
function parseMetadata(lines: string[]): TPGMetadata {
  const getValue = (line: string): string => {
    const parts = line.split(';')
    return parts[1]?.trim() || ''
  }

  // Helper to get value from German or English field name
  const getLineValue = (...prefixes: string[]): string => {
    for (const prefix of prefixes) {
      const line = lines.find((l) => l.startsWith(prefix))
      if (line) return getValue(line)
    }
    return ''
  }

  // Parse measurement interval (e.g., "10s" -> 10)
  const intervalStr = getLineValue('Messintervall:', 'Sampletime:')
  const interval = parseInt(intervalStr.replace(/[^\d]/g, '')) || 10

  // Parse recording start date/time
  const dateStr = getLineValue('Datum / Zeit:', 'Date: / time:')
  const recordingStart = parseDateTimeString(dateStr)

  // Parse sensor types (German: Sensor, English: Channel)
  const sensor1Str = getLineValue('Sensor 1:', 'Channel 1:')
  const sensor2Str = getLineValue('Sensor 2:', 'Channel 2:')

  return {
    manufacturer: getLineValue('Hersteller:', 'Producer:'),
    device: getLineValue('Gerät:', 'Geraet:', 'Device:'),
    articleNumber: getLineValue('Artikelnummer:', 'Product number:'),
    serialNumber: getLineValue('Seriennummer:', 'Serial number:'),
    firmwareVersion: getLineValue('Firmware Version:', 'Firmware version:'),
    filename: getLineValue('Dateiname:', 'Filename:'),
    recordingStart,
    measurementInterval: interval,
    sensor1Type: parseSensorType(sensor1Str),
    sensor2Type:
      sensor2Str && !sensor2Str.includes('KEIN') && !sensor2Str.toLowerCase().includes('nosensor')
        ? parseSensorType(sensor2Str)
        : null,
  }
}

/**
 * Parse a single data line
 * Format: 2025-03-19;06:18:35;4,0333e-08;0,0000e+00;
 * Note: Some files have data only in Channel 2 (e.g., when Channel 1 is "noSENSOR")
 */
function parseDataLine(
  line: string,
  index: number
): PressureDataPoint | null {
  const parts = line.split(';')

  if (parts.length < 3) return null

  const dateStr = parts[0].trim() // 2025-03-19
  const timeStr = parts[1].trim() // 06:18:35
  const pressure1Str = parts[2].trim() // 4,0333e-08
  const pressure2Str = parts[3]?.trim() // 0,0000e+00

  // Parse timestamp
  const timestamp = parseDateTime(dateStr, timeStr)
  if (!timestamp) return null

  // Parse pressure (German format: comma as decimal separator)
  const rawPressure1 = parseGermanFloat(pressure1Str)
  const rawPressure2 = pressure2Str ? parseGermanFloat(pressure2Str) : null

  // Use the valid pressure value - prefer Channel 1, but use Channel 2 if Channel 1 is invalid/zero
  // This handles files where data is only in Channel 2 (e.g., Palmer file with noSENSOR on Channel 1)
  const pressure1Valid = !isNaN(rawPressure1) && rawPressure1 > 0
  const pressure2Valid = rawPressure2 !== null && !isNaN(rawPressure2) && rawPressure2 > 0

  // Need at least one valid pressure
  if (!pressure1Valid && !pressure2Valid) return null

  // Primary pressure: use Channel 1 if valid, otherwise use Channel 2
  const pressure1 = pressure1Valid ? rawPressure1 : rawPressure2!
  // Secondary pressure: store the other channel if valid
  const pressure2 = pressure1Valid
    ? (pressure2Valid ? rawPressure2 : null)
    : (pressure1Valid ? rawPressure1 : null)

  return {
    index,
    timestamp,
    relativeTimeS: 0, // Calculated later
    pressure1,
    pressure2,
  }
}

/**
 * Parse German number format (comma as decimal separator)
 * Handles scientific notation: "4,0333e-08" -> 4.0333e-08
 */
export function parseGermanFloat(str: string): number {
  if (!str) return NaN
  return parseFloat(str.replace(',', '.'))
}

/**
 * Parse date and time strings
 * dateStr: "2025-03-19"
 * timeStr: "06:18:35"
 */
function parseDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    // Handle YYYY-MM-DD format
    const dateParts = dateStr.split('-')
    if (dateParts.length === 3) {
      const [year, month, day] = dateParts.map(Number)
      const [hour, minute, second] = timeStr.split(':').map(Number)
      return new Date(year, month - 1, day, hour, minute, second || 0)
    }

    // Handle DD.MM.YYYY format (German)
    const datePartsDE = dateStr.split('.')
    if (datePartsDE.length === 3) {
      const [day, month, year] = datePartsDE.map(Number)
      const [hour, minute, second] = timeStr.split(':').map(Number)
      return new Date(year, month - 1, day, hour, minute, second || 0)
    }

    return null
  } catch {
    return null
  }
}

/**
 * Parse date/time string from header
 * Format: "2025-03-19  06:18" or "19.03.2025  06:18"
 */
function parseDateTimeString(str: string): Date {
  if (!str) return new Date()

  // Try YYYY-MM-DD HH:MM format
  const matchISO = str.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/)
  if (matchISO) {
    const [, year, month, day, hour, minute] = matchISO
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    )
  }

  // Try DD.MM.YYYY HH:MM format (German)
  const matchDE = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{2}):(\d{2})/)
  if (matchDE) {
    const [, day, month, year, hour, minute] = matchDE
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    )
  }

  return new Date()
}

/**
 * Parse sensor type string to SensorType enum
 */
function parseSensorType(str: string): SensorType {
  const upper = str.toUpperCase()
  if (upper.includes('PKR')) return 'PKR'
  if (upper.includes('IKR')) return 'IKR'
  if (upper.includes('CMR')) return 'CMR'
  if (upper.includes('TPR')) return 'TPR'
  if (upper.includes('PPT')) return 'PPT'
  if (upper.includes('APR')) return 'APR'
  if (upper.includes('MPT')) return 'MPT'
  if (upper.includes('RPT')) return 'RPT'
  return 'UNKNOWN'
}

/**
 * Check if content looks like a TPG362 CSV file
 */
export function isTPG362Format(content: string): boolean {
  // Check directly in content (handles single-line files)
  const hasCSVSeparator = content.includes('sep=;')
  const hasPfeiffer = content.includes('Pfeiffer') || content.includes('TPG')
  const hasDataHeader = content.includes('Datum;Zeit;') || content.includes('Date;Time;')

  return hasCSVSeparator && (hasPfeiffer || hasDataHeader)
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(0)} min`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

/**
 * Format scientific number with superscript exponent
 */
export function formatScientific(
  value: number,
  unit: string,
  decimals: number = 2
): string {
  if (value === 0) return `0 ${unit}`

  const exponent = Math.floor(Math.log10(Math.abs(value)))
  const mantissa = value / Math.pow(10, exponent)

  // Unicode superscript characters
  const superscript = (n: number): string => {
    const chars = '⁰¹²³⁴⁵⁶⁷⁸⁹'
    return Math.abs(n)
      .toString()
      .split('')
      .map((d) => chars[parseInt(d)])
      .join('')
  }

  const sign = exponent < 0 ? '⁻' : ''
  return `${mantissa.toFixed(decimals)}×10${sign}${superscript(exponent)} ${unit}`
}
