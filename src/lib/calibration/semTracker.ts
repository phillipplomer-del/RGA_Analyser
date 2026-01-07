/**
 * SEM-Alterungs-Tracking
 *
 * Verfolgt die SEM-Spannungshistorie, um Detektoralterung zu erkennen.
 * Mit zunehmender Nutzung muss die SEM-Spannung erhöht werden,
 * um den gleichen Gain zu erreichen - ein Zeichen für Alterung.
 *
 * Warnstufen:
 * - >50V Anstieg: Info
 * - >150V Anstieg: Warnung, Neukalibrierung empfohlen
 * - >300V Anstieg: Kritisch, Neukalibrierung dringend empfohlen
 */

import { SEMHistoryEntry, SEMAgingWarning, MeasurementMetadata } from '@/types/calibration'

const SEM_HISTORY_KEY = 'rga_sem_history'
const MAX_HISTORY = 100

/**
 * SEM-Tracker Klasse
 *
 * Speichert SEM-Spannungen in localStorage und erkennt Alterung.
 */
export class SEMTracker {
  private history: SEMHistoryEntry[] = []

  /**
   * Lädt die Historie aus localStorage
   */
  loadHistory(): void {
    try {
      const stored = localStorage.getItem(SEM_HISTORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.history = parsed.map((e: SEMHistoryEntry) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }))
      }
    } catch (error) {
      console.warn('Fehler beim Laden der SEM-Historie:', error)
      this.history = []
    }
  }

  /**
   * Fügt einen neuen Eintrag hinzu
   *
   * @param metadata - Messwert-Metadaten mit SEM-Spannung
   */
  addEntry(metadata: MeasurementMetadata): void {
    if (!metadata.semVoltage) return

    this.history.push({
      timestamp: new Date(),
      filename: metadata.filename,
      voltage: metadata.semVoltage
    })

    // Nur letzte 100 Einträge behalten
    if (this.history.length > MAX_HISTORY) {
      this.history.shift()
    }

    this.saveHistory()
  }

  /**
   * Prüft auf Alterung und gibt ggf. eine Warnung zurück
   *
   * Vergleicht die letzten Einträge und berechnet den Spannungsanstieg.
   *
   * @returns Warnung oder null wenn keine Alterung erkannt
   */
  checkAging(): SEMAgingWarning | null {
    // Mindestens 5 Einträge für aussagekräftige Analyse
    if (this.history.length < 5) return null

    const recent = this.history.slice(-10)
    const oldest = recent[0]
    const newest = recent[recent.length - 1]

    const voltageIncrease = newest.voltage - oldest.voltage
    const daysBetween = (newest.timestamp.getTime() - oldest.timestamp.getTime())
      / (1000 * 60 * 60 * 24)

    // Kritisch: >300V Anstieg
    if (voltageIncrease > 300) {
      return {
        warning: `SEM-Spannung um ${voltageIncrease}V gestiegen in ${daysBetween.toFixed(0)} Tagen. ` +
                 `Detektor stark gealtert – Neukalibrierung dringend empfohlen!`,
        severity: 'critical'
      }
    }

    // Warnung: >150V Anstieg
    if (voltageIncrease > 150) {
      return {
        warning: `SEM-Spannung um ${voltageIncrease}V gestiegen. ` +
                 `Neukalibrierung empfohlen.`,
        severity: 'warning'
      }
    }

    // Info: >50V Anstieg
    if (voltageIncrease > 50) {
      return {
        warning: `SEM-Spannung um ${voltageIncrease}V gestiegen seit ${oldest.timestamp.toLocaleDateString()}.`,
        severity: 'info'
      }
    }

    return null
  }

  /**
   * Speichert die Historie in localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(SEM_HISTORY_KEY, JSON.stringify(this.history))
    } catch (error) {
      console.warn('Fehler beim Speichern der SEM-Historie:', error)
    }
  }

  /**
   * Gibt die vollständige Historie zurück
   */
  getHistory(): SEMHistoryEntry[] {
    return [...this.history]
  }

  /**
   * Löscht die Historie
   */
  clearHistory(): void {
    this.history = []
    localStorage.removeItem(SEM_HISTORY_KEY)
  }

  /**
   * Gibt Statistiken über die SEM-Nutzung zurück
   */
  getStatistics(): {
    entryCount: number
    oldestEntry: Date | null
    newestEntry: Date | null
    minVoltage: number | null
    maxVoltage: number | null
    averageVoltage: number | null
  } {
    if (this.history.length === 0) {
      return {
        entryCount: 0,
        oldestEntry: null,
        newestEntry: null,
        minVoltage: null,
        maxVoltage: null,
        averageVoltage: null
      }
    }

    const voltages = this.history.map(e => e.voltage)
    const sum = voltages.reduce((a, b) => a + b, 0)

    return {
      entryCount: this.history.length,
      oldestEntry: this.history[0].timestamp,
      newestEntry: this.history[this.history.length - 1].timestamp,
      minVoltage: Math.min(...voltages),
      maxVoltage: Math.max(...voltages),
      averageVoltage: sum / voltages.length
    }
  }
}

/**
 * Singleton-Instanz für globalen Zugriff
 */
let globalTracker: SEMTracker | null = null

export function getSEMTracker(): SEMTracker {
  if (!globalTracker) {
    globalTracker = new SEMTracker()
    globalTracker.loadHistory()
  }
  return globalTracker
}
