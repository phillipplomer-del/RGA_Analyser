# Wissenschaftliche Validierung - Masterplan

> **Ziel:** Systematische Validierung aller Features/Detektoren mit Quellen-Dokumentation und UI-Integration

**Erstellt:** 2026-01-09
**Status:** 🔄 In Planung
**Motivation:** RGA-Analyse ist bei vielen Kollegen "Kaffeesatzleserei" - wir wollen wissenschaftlich fundierte Diagnostik!

---

## 🎯 Kernziele

1. **Wissenschaftliche Glaubwürdigkeit etablieren**
2. **Jeden Detektor/Feature mit Quellen belegen**
3. **Transparenz für User schaffen** (Validierungs-Status in App sichtbar)
4. **Systematische Dokumentation** in SCIENTIFIC_REFERENCES.md
5. **"Verified by Science" Badge** im KnowledgePanel

---

## 📊 Aktueller Stand (aus WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md)

### Validierungs-Bilanz (30 Features/Detektoren)

| Status | Anzahl | Prozent | Handlungsbedarf |
|--------|--------|---------|-----------------|
| ✅ Vollständig validiert | 8 | 27% | Dokumentation in UI |
| ⚠️ Teilvalidiert | 13 | 43% | **Quellen-Recherche** |
| ❓ Nicht validiert | 8 | 27% | **Web-Recherche** |
| ❌ Verworfen | 1 | 3% | Bereits dokumentiert |

**Target:** 90% vollständig validiert (27 von 30)

---

## 🗓️ Phasenplan (3 Phasen, 2-3 Wochen)

### Phase 1: Kritische Features (Woche 1) 🔥

**Ziel:** Wichtigste 8 Features wissenschaftlich absichern

| Feature | Status | Aufwand | Priorität |
|---------|--------|---------|-----------|
| **Ausgasungs-Simulator (1.5.1)** | ⚠️ Teilvalidiert | 2-3h | KRITISCH |
| **ESD-Artefakt-Erkennung (1.5.4)** | ⚠️ Teilvalidiert | 2-3h | KRITISCH |
| **Konfidenz-Score System (1.5.3)** | ❓ Nicht validiert | 3-4h | KRITISCH |
| **Lösemittelrückstände** | ⚠️ Teilvalidiert | 1-2h | HOCH |
| **Wasser-Ausgasung** | ⚠️ Teilvalidiert | 1-2h | HOCH |
| **Wasserstoff-Dominanz** | ⚠️ Teilvalidiert | 1h | HOCH |
| **Virtuelles Leck** | ❓ Nicht validiert | 2-3h | HOCH |
| **Sauberer UHV-Status** | ❓ Nicht validiert | 2-3h | HOCH |

**Total:** ~15-20h

### Phase 2: Restliche Detektoren (Woche 2) ⚙️

**Ziel:** Alle verbleibenden Detektoren validieren

| Feature | Status | Aufwand | Priorität |
|---------|--------|---------|-----------|
| **Ammoniak-Kontamination** | ⚠️ Teilvalidiert | 1h | MITTEL |
| **Methan-Kontamination** | ⚠️ Teilvalidiert | 1h | MITTEL |
| **Aromatische Kohlenwasserstoffe** | ❓ Nicht validiert | 1-2h | MITTEL |
| **Polymer-Ausgasung (Phthalate)** | ❓ Nicht validiert | 2h | MITTEL |
| **Weichmacher-Kontamination** | ❓ Nicht validiert | 1-2h | MITTEL |
| **Prozessgas-Rückstände (Halbleiter)** | ❓ Nicht validiert | 2h | MITTEL |
| **Kühlwasser-Leck** | ⚠️ Teilvalidiert | 1h | MITTEL |

**Total:** ~10-12h

### Phase 3: UI-Integration & Dokumentation (Woche 3) 🎨

**Ziel:** Validierung in App sichtbar machen

| Task | Beschreibung | Aufwand |
|------|--------------|---------|
| **Validierungs-Metadaten in types.ts** | `DiagnosticResult` um `validationStatus` erweitern | 30min |
| **KnowledgePanel UI-Update** | "Verified by Science" Badge + Quellen-Dropdown | 2-3h |
| **SCIENTIFIC_REFERENCES.md Update** | Alle neuen Quellen einpflegen | 2h |
| **FEATURE_BACKLOG.md Update** | Validierungs-Status für alle Features | 1h |
| **FEATURES.md Update** | Validierungs-Dokumentation wie 1.5.2/1.5.5 | 1-2h |
| **Knowledge Panel Intro-Text** | "Wissenschaftlich validiert" Sektion | 30min |

**Total:** ~7-9h

---

## 📋 Detaillierter Validierungs-Workflow

### Schritt-für-Schritt für JEDES Feature/Detektor

#### 1. Web-Recherche (30-60 min pro Feature)

**Recherche-Strategie:**

```
1. Google Scholar Suche:
   - "RGA [Feature-Name] detection"
   - "[Feature-Name] mass spectrometry"
   - "[Feature-Name] vacuum contamination"

2. Hersteller-Dokumentation:
   - Pfeiffer Vacuum Application Notes
   - Hiden Analytical Tech Data
   - MKS Instruments Resources
   - Kurt Lesker Knowledge Base

3. Standards-Organisationen:
   - NIST WebBook (für Fragmentierung)
   - ASTM Standards (für Materialien)
   - ISO Standards (für Methoden)

4. Peer-reviewed Journals:
   - Journal of Vacuum Science & Technology
   - Vacuum Journal
   - Review of Scientific Instruments
```

**Suchquellen priorisiert:**
1. **Tier 1 (Peer-reviewed):** PubMed, ScienceDirect, Springer, ACS Publications
2. **Tier 2 (Standards):** NIST, ASTM, ISO, CIAAW
3. **Tier 3 (Hersteller):** Pfeiffer, Hiden, MKS, Kurt Lesker
4. **Tier 4 (Foren/Docs):** Vacuum tech forums, technical documentation

#### 2. Quellen-Bewertung (10-15 min)

**Validierungs-Kriterien:**

| Kriterium | ✅ Akzeptabel | ❌ Nicht akzeptabel |
|-----------|---------------|---------------------|
| **Quellentyp** | Peer-reviewed, Hersteller-official, Standards-Body | Blog-Posts, Forum-Meinungen ohne Quelle |
| **Aktualität** | 2000-2026 bevorzugt | >30 Jahre alt (außer klassische Referenzen) |
| **Spezifität** | Direkt zum Feature/Detektor | Allgemein ohne Details |
| **Konsistenz** | Mehrere Quellen sagen dasselbe | Widersprüche ohne Erklärung |

**Mindest-Anforderungen für "Vollständig validiert":**
- ≥2 Tier-1 Quellen ODER
- ≥1 Tier-1 + ≥2 Tier-2/3 Quellen ODER
- ≥3 Tier-2/3 Quellen (wenn Tier-1 nicht verfügbar)

#### 3. Dokumentation in SCIENTIFIC_REFERENCES.md (15-20 min)

**Format-Template:**

```markdown
### [Feature-Name]

**Status:** ✅ VALIDIERT / ⚠️ TEILVALIDIERT / ❓ NICHT VALIDIERT

**Implementierung:** [detectors.ts:LINE](../src/lib/diagnosis/detectors.ts#LLINE) - `detect[Name]()`

**Validiert:**
- ✅ [Spezifischer Aspekt 1] - [Beschreibung]
- ✅ [Spezifischer Aspekt 2] - [Beschreibung]
- ❌ [Was NICHT validiert ist] - [Erklärung]

**Quellen:**

| Source | URL | Content |
|--------|-----|---------|
| **[Name]** | https://... | [Beschreibung] |
| **[Name]** | https://... | [Beschreibung] |

**Key Finding:**
> "[Wichtigstes Zitat aus Literatur]"

**Implementierungs-Details:**
- Schwellenwerte: [Werte mit Quelle]
- Algorithmus: [Methode mit Quelle]
- Limitationen: [Bekannte Einschränkungen]
```

#### 4. Update WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md (5 min)

Status von ❓/⚠️ → ✅ ändern, Quellen-Anzahl aktualisieren

#### 5. Update FEATURE_BACKLOG.md (5 min)

**Changelog-Eintrag hinzufügen:**

```markdown
| 2026-01-XX | ✅ **[Feature-Name] wissenschaftlich validiert:**
Web-Recherche ergab [Zusammenfassung]. Implementierung basiert auf [Methode].
X Quellen dokumentiert ([Haupt-Quellen]) in SCIENTIFIC_REFERENCES.md. |
```

#### 6. Update FEATURES.md (10 min)

**Validierungs-Sektion hinzufügen** (analog zu 1.5.2 und 1.5.5):

```markdown
### [Feature-Name]

**Wissenschaftliche Validierung (2026-01-XX):**
- ✅ **[Hauptaspekt validiert]:** [Beschreibung]
- ✅ **[Weitere Aspekte]:** [Details]
- ❌ **[Limitationen]:** [Was nicht möglich ist]
- ✅ **X wissenschaftliche Quellen** dokumentiert ([Hauptquellen])

**Dokumentation:** [SCIENTIFIC_REFERENCES.md](./RGA_Knowledge/SCIENTIFIC_REFERENCES.md)
Sektion "[Sektionsname]"

**Implementierung:** [detectors.ts:LINE](./src/lib/diagnosis/detectors.ts#LINE) -
`detect[Name]()`
```

---

## 🎨 UI-Integration: "Verified by Science" Feature

### Design-Konzept

**KnowledgePanel erweitert um Validierungs-Info:**

```
┌─────────────────────────────────────────┐
│ 🔬 Luftleck-Erkennung                   │
│                                         │
│ ✅ Wissenschaftlich validiert           │
│ 📚 4 peer-reviewed Quellen              │
│                                         │
│ [Quellen anzeigen ▼]                    │
│                                         │
│ Beschreibung: ...                       │
│ Evidenz: ...                            │
└─────────────────────────────────────────┘
```

### Implementierungs-Schritte

#### Schritt 1: Types erweitern (30 min)

**Datei:** `src/lib/diagnosis/types.ts`

```typescript
// Neu hinzufügen
export type ValidationStatus = 'FULLY_VALIDATED' | 'PARTIALLY_VALIDATED' | 'NOT_VALIDATED' | 'DEPRECATED'

export interface ValidationMetadata {
  status: ValidationStatus
  validatedDate?: string // ISO date string
  sourcesCount: number
  sourcesPreview: Array<{
    name: string
    url: string
    type: 'peer-reviewed' | 'standards-body' | 'manufacturer' | 'other'
  }>
  limitations?: string[] // Bekannte Limitationen
}

// Erweitern
export interface DiagnosticResult {
  type: DiagnosisType
  name: string
  nameEn: string
  confidence: number
  severity: DiagnosisSeverity
  evidence: EvidenceItem[]
  systemState?: SystemState
  recommendation?: string
  recommendationEn?: string
  affectedMasses?: number[]

  // NEU:
  validation?: ValidationMetadata  // Optional für Abwärtskompatibilität
}
```

#### Schritt 2: Validierungs-Datenbank erstellen (1-2h)

**Neue Datei:** `src/lib/diagnosis/validationRegistry.ts`

```typescript
/**
 * Validierungs-Registry für alle Diagnose-Detektoren
 *
 * Wird automatisch mit DiagnosticResult verknüpft
 */

import { DiagnosisType, ValidationMetadata } from './types'

export const VALIDATION_REGISTRY: Record<DiagnosisType, ValidationMetadata> = {
  AIR_LEAK: {
    status: 'FULLY_VALIDATED',
    validatedDate: '2026-01-09',
    sourcesCount: 4,
    sourcesPreview: [
      {
        name: 'NIST Isotope Data',
        url: 'https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=Ar',
        type: 'standards-body'
      },
      {
        name: 'CIAAW Argon Atomic Weight',
        url: 'https://ciaaw.org/argon.htm',
        type: 'standards-body'
      }
    ],
    limitations: [
      'Ar-Ratio: 295.5 (Nier 1950) vs. 298.6 (Lee 2006) - 1% Abweichung akzeptabel für RGA'
    ]
  },

  OIL_BACKSTREAMING: {
    status: 'FULLY_VALIDATED',
    validatedDate: '2026-01-09',
    sourcesCount: 6,
    sourcesPreview: [
      {
        name: 'Kurt Lesker - Advanced RGA Interpretation',
        url: 'https://de.lesker.com/newweb/technical_info/vacuumtech/rga_04_advanceinterpret.cfm',
        type: 'manufacturer'
      },
      {
        name: 'Hiden Analytical - Hydrocarbon Fragments',
        url: 'https://www.hidenanalytical.com/wp-content/uploads/2016/08/hydrocarbon_fragments-1-1.pdf',
        type: 'manufacturer'
      }
    ],
    limitations: [
      'Kann generelle Kohlenwasserstoff-Kontamination erkennen',
      'KEINE zuverlässige Unterscheidung zwischen spezifischen Öl-Typen (Mineralöl vs. Diffusionspumpen-Öl)'
    ]
  },

  HELIUM_LEAK: {
    status: 'FULLY_VALIDATED',
    validatedDate: '2026-01-09',
    sourcesCount: 20,
    sourcesPreview: [
      {
        name: 'Hiden Analytical - RGA Series',
        url: 'https://www.hidenanalytical.com/products/residual-gas-analysis/rga-series/',
        type: 'manufacturer'
      },
      {
        name: 'MKS - Residual Gas Analysis',
        url: 'https://www.mks.com/n/residual-gas-analysis',
        type: 'manufacturer'
      }
    ],
    limitations: [
      'Nur qualitative Helium-Detektion möglich',
      'NICHT für quantitative Leckraten-Messungen geeignet',
      'RGAs sind 1-2 Größenordnungen weniger empfindlich als dedizierte He-Leckdetektoren'
    ]
  },

  // Teilvalidiert - braucht noch Arbeit
  ESD_ARTIFACTS: {
    status: 'PARTIALLY_VALIDATED',
    validatedDate: '2026-01-09',
    sourcesCount: 2,
    sourcesPreview: [
      {
        name: 'ESD-Artefakt-Erkennung Plan',
        url: '../NextFeatures/done/ESD_ARTEFAKT_ERKENNUNG_PLAN.md',
        type: 'other'
      }
    ],
    limitations: [
      'Schwellenwerte (O⁺/O₂ > 0.5, etc.) noch nicht durch peer-reviewed Literatur belegt',
      'Benötigt zusätzliche Validierung durch RGA-spezifische ESD-Studien'
    ]
  },

  // Nicht validiert - braucht Recherche
  CLEAN_UHV: {
    status: 'NOT_VALIDATED',
    sourcesCount: 0,
    sourcesPreview: [],
    limitations: [
      'Keine wissenschaftliche Literatur für "sauberes UHV" Spektrum gefunden',
      'Benötigt Benchmark-Spektren von CERN/ITER oder ISO/DIN Standards'
    ]
  },

  // Verworfen
  // OIL_TYPE_DISTINCTION: {  // Hypothetisches verworfenes Feature
  //   status: 'DEPRECATED',
  //   validatedDate: '2026-01-09',
  //   sourcesCount: 0,
  //   limitations: [
  //     'Wissenschaftlich nicht validierbar',
  //     'Literatur unterstützt keine Unterscheidung spezifischer Öl-Typen'
  //   ]
  // },

  // ... Alle anderen DiagnosisType-Einträge
}

/**
 * Verknüpft Validierungs-Metadaten mit DiagnosticResult
 */
export function enrichWithValidation(result: DiagnosticResult): DiagnosticResult {
  return {
    ...result,
    validation: VALIDATION_REGISTRY[result.type]
  }
}
```

#### Schritt 3: KnowledgePanel UI-Komponente (2-3h)

**Datei:** `src/components/KnowledgePanel/ValidationBadge.tsx` (neu)

```tsx
import React, { useState } from 'react'
import type { ValidationMetadata } from '@/lib/diagnosis/types'

interface Props {
  validation?: ValidationMetadata
  compact?: boolean
}

export function ValidationBadge({ validation, compact = false }: Props) {
  const [showSources, setShowSources] = useState(false)

  if (!validation) {
    return (
      <div className="text-sm text-gray-500 italic">
        Validierungs-Status unbekannt
      </div>
    )
  }

  const { status, sourcesCount, sourcesPreview, limitations, validatedDate } = validation

  // Status-abhängige Farben und Icons
  const statusConfig = {
    FULLY_VALIDATED: {
      icon: '✅',
      label: 'Wissenschaftlich validiert',
      labelEn: 'Scientifically validated',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-700'
    },
    PARTIALLY_VALIDATED: {
      icon: '⚠️',
      label: 'Teilweise validiert',
      labelEn: 'Partially validated',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-700'
    },
    NOT_VALIDATED: {
      icon: '❓',
      label: 'Noch nicht validiert',
      labelEn: 'Not yet validated',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      textColor: 'text-gray-700 dark:text-gray-300',
      borderColor: 'border-gray-200 dark:border-gray-700'
    },
    DEPRECATED: {
      icon: '❌',
      label: 'Verworfen',
      labelEn: 'Deprecated',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-700'
    }
  }

  const config = statusConfig[status]

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.bgColor} ${config.textColor}`}>
        <span>{config.icon}</span>
        <span>{sourcesCount > 0 ? `${sourcesCount} Quellen` : config.label}</span>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-3 ${config.bgColor} ${config.borderColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 font-medium ${config.textColor}`}>
          <span className="text-lg">{config.icon}</span>
          <span>{config.label}</span>
        </div>
        {sourcesCount > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            📚 {sourcesCount} Quellen
          </div>
        )}
      </div>

      {/* Validierungsdatum */}
      {validatedDate && (
        <div className="text-xs text-gray-500 mb-2">
          Validiert am {new Date(validatedDate).toLocaleDateString('de-DE')}
        </div>
      )}

      {/* Quellen-Toggle */}
      {sourcesPreview.length > 0 && (
        <div>
          <button
            onClick={() => setShowSources(!showSources)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Quellen anzeigen</span>
            <span className={`transform transition-transform ${showSources ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showSources && (
            <div className="mt-2 space-y-2">
              {sourcesPreview.map((source, i) => (
                <div key={i} className="text-sm pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {source.name} ↗
                  </a>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {source.type === 'peer-reviewed' && '📄 Peer-reviewed'}
                    {source.type === 'standards-body' && '📊 Standards-Organisation'}
                    {source.type === 'manufacturer' && '🏭 Hersteller-Dokumentation'}
                    {source.type === 'other' && '📋 Sonstige Quelle'}
                  </div>
                </div>
              ))}

              {sourcesCount > sourcesPreview.length && (
                <div className="text-xs text-gray-500 pl-4">
                  + {sourcesCount - sourcesPreview.length} weitere Quellen in{' '}
                  <a
                    href="/path/to/SCIENTIFIC_REFERENCES.md"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Dokumentation ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Limitationen */}
      {limitations && limitations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bekannte Limitationen:
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {limitations.map((limit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>{limit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

**Integration in KnowledgePanel:**

```tsx
// src/components/KnowledgePanel/index.tsx

import { ValidationBadge } from './ValidationBadge'

// In der DiagnosticResult-Anzeige:
<div className="space-y-3">
  {/* Existierende Diagnose-Info */}
  <div>
    <h3>{result.name}</h3>
    <p>{result.confidence * 100}% Konfidenz</p>
  </div>

  {/* NEU: Validierungs-Badge */}
  <ValidationBadge validation={result.validation} />

  {/* Restliche Evidenz, Empfehlungen, etc. */}
</div>
```

#### Schritt 4: Diagnose-Engine Integration (30 min)

**Datei:** `src/lib/diagnosis/index.ts`

```typescript
import { enrichWithValidation } from './validationRegistry'

export function runFullDiagnosis(
  input: DiagnosisInput,
  minConfidence: number = 0.3
): DiagnosticResult[] {
  const results: DiagnosticResult[] = []

  // Alle Detektoren ausführen
  for (const detector of ALL_DETECTORS) {
    try {
      const result = detector(input)
      if (result && result.confidence >= minConfidence) {
        // NEU: Validierungs-Metadaten hinzufügen
        const enrichedResult = enrichWithValidation(result)
        results.push(enrichedResult)
      }
    } catch (error) {
      console.warn(`Detector ${detector.name} failed:`, error)
    }
  }

  // Sortieren...
  return results
}
```

---

## 📊 Priorisierte Feature-Liste für Validierung

### Priorität 1: KRITISCH (Woche 1) 🔥

#### 1.1 Ausgasungs-Simulator (1.5.1) - ⚠️ Teilvalidiert

**Recherche-Fokus:**
- NASA GSFC Outgassing Database
- ASTM E595 Standardwerte
- Neuere Daten (2020-2026) für Materialien

**Suchbegriffe:**
- "NASA outgassing database materials"
- "ASTM E595 TML CVCM values"
- "vacuum outgassing rates stainless steel aluminum 2024"

**Expected Sources:**
- https://etd.gsfc.nasa.gov/capabilities/outgassing-database
- https://store.astm.org/standards/e595
- VACOM/Chiggiato (bereits vorhanden, aber Vergleich mit NASA DB)

**Validierungs-Ziel:**
- Alle 17 Materialien gegen NASA DB abgleichen
- Temperaturabhängigkeit (Aktivierungsenergien) validieren
- q(t) = q₀ × t⁻ⁿ Modell gegen Literatur prüfen

#### 1.2 ESD-Artefakt-Erkennung (1.5.4) - ⚠️ Teilvalidiert

**Recherche-Fokus:**
- Schwellenwerte für atomare Ionen-Verhältnisse
- RGA-spezifische ESD-Studien
- Filament-Degassing-Protokolle

**Suchbegriffe:**
- "electron stimulated desorption RGA quadrupole"
- "RGA ionizer artifacts filament outgassing"
- "atomic ion fragment ratios mass spectrometry"

**Expected Sources:**
- Journal of Vacuum Science & Technology (ESD-Studien)
- Hersteller-Docs zu Filament-Degassing (Pfeiffer, Hiden)
- Vacuum Journal (Ionizer-Artefakte)

**Validierungs-Ziel:**
- O⁺/O₂ > 0.5 Schwellenwert durch Literatur belegen
- N⁺/N₂ > 0.15 und C⁺/CO > 0.12 validieren
- Degassing-Protokolle (10min vs. 30min) abgleichen

#### 1.3 Konfidenz-Score System (1.5.3) - ❓ Nicht validiert

**Recherche-Fokus:**
- RGA-Datenqualitäts-Metriken
- Kalibrierungs-Drift-Raten
- SNR-Schwellenwerte für zuverlässige Diagnosen

**Suchbegriffe:**
- "RGA measurement quality metrics"
- "quadrupole mass spectrometer calibration drift"
- "mass spectrometer signal to noise ratio requirements"

**Expected Sources:**
- Pfeiffer/MKS Application Notes zu Kalibrierung
- Review of Scientific Instruments (MS-Qualitätskriterien)
- ISO Standards für MS-Qualität

**Validierungs-Ziel:**
- 6 Faktoren (SNR, Peak Count, etc.) gegen Literatur prüfen
- Schwellenwerte für Noten A-F wissenschaftlich begründen
- Kalibrieralter-Einfluss (aktuell weight=0) recherchieren

---

### Priorität 2: HOCH (Woche 1) ⚙️

#### 2.1 Lösemittelrückstände - ⚠️ Teilvalidiert

**Recherche-Fokus:** NIST Mass Spec Database Einträge für Aceton, IPA, Ethanol, Methanol

**Suchbegriffe:** "NIST mass spectrum acetone IPA ethanol"

**Aufwand:** 1-2h

#### 2.2 Wasser-Ausgasung - ⚠️ Teilvalidiert

**Recherche-Fokus:** Fragment-Verhältnisse OH⁺/H₂O⁺ und O⁺/H₂O⁺

**Suchbegriffe:** "water fragmentation mass spectrometry OH H2O ratio"

**Aufwand:** 1-2h

#### 2.3 Wasserstoff-Dominanz - ⚠️ Teilvalidiert

**Recherche-Fokus:** Post-bakeout H₂ Dominance, typische H₂/(H₂O+CO) Verhältnisse

**Suchbegriffe:** "post-bakeout hydrogen dominance vacuum UHV"

**Aufwand:** 1h

#### 2.4 Virtuelles Leck - ❓ Nicht validiert

**Recherche-Fokus:** Virtual leak signatures, Zeitverhalten

**Suchbegriffe:** "virtual leak detection RGA trapped volume outgassing"

**Aufwand:** 2-3h

#### 2.5 Sauberer UHV-Status - ❓ Nicht validiert

**Recherche-Fokus:** Benchmark-Spektren, ISO/DIN Standards

**Suchbegriffe:** "UHV residual gas spectrum benchmark CERN ITER clean vacuum"

**Aufwand:** 2-3h

---

### Priorität 3: MITTEL (Woche 2) 📋

#### Alle verbleibenden Detektoren:
- Ammoniak (NH₃ Pattern NIST)
- Methan (CH₄ Pattern NIST)
- Schwefel (bereits S-Isotope validiert, aber Fragmentierung prüfen)
- Aromatische KW (Benzol-Pattern NIST)
- Polymer-Ausgasung (Phthalat-MS-Spektren)
- Weichmacher (DOP/DBP Pattern)
- Prozessgas-Rückstände (NF₃/WF₆ bereits RSF korrigiert, Quellen dokumentieren)
- Kühlwasser-Leck (H₂O + NH₃ Kombination)

**Pro Feature:** 1-2h Recherche + Dokumentation

---

## 📈 Erfolgs-Metriken

### Quantitative Ziele

| Metrik | Aktuell | Target | Deadline |
|--------|---------|--------|----------|
| **Vollständig validierte Features** | 8 (27%) | 27 (90%) | 2026-01-30 |
| **Dokumentierte Quellen in SCIENTIFIC_REFERENCES.md** | 53 | 100+ | 2026-01-30 |
| **Features mit UI-Validierungs-Badge** | 0 | 30 | 2026-01-30 |

### Qualitative Ziele

- ✅ Jedes validierte Feature hat ≥2 peer-reviewed Quellen
- ✅ Alle Schwellenwerte wissenschaftlich begründet
- ✅ Bekannte Limitationen explizit dokumentiert
- ✅ User kann Validierungs-Status in App sehen
- ✅ "Verified by Science" Badge als USP

---

## 🚀 Quick Start: Erste 3 Features validieren (Heute, 3-4h)

**Ziel:** Workflow testen und erste Erfolge zeigen

### Feature 1: Lösemittelrückstände (1h)

1. **Web-Recherche (30 min):**
   - NIST WebBook: Aceton, IPA, Ethanol, Methanol
   - https://webbook.nist.gov/chemistry/

2. **Dokumentation (20 min):**
   - SCIENTIFIC_REFERENCES.md: Neue Sektion "Solvent Residue Detection"
   - WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md: Status → ✅

3. **Update Docs (10 min):**
   - FEATURE_BACKLOG.md: Changelog-Eintrag
   - FEATURES.md: Validierungs-Sektion

### Feature 2: Wasser-Ausgasung (1h)

Analog zu Feature 1, Fokus: OH⁺/H₂O⁺ Fragment-Verhältnisse

### Feature 3: Wasserstoff-Dominanz (1h)

Analog zu Feature 1, Fokus: Post-bakeout H₂ Dominance

**Nach diesen 3 Features:**
- Validierungsquote: 11/30 (37%)
- Workflow etabliert
- Template für restliche Features

---

## 📝 Template: Validierungs-Session-Log

**Pro Feature/Session ausfüllen:**

```markdown
## [Feature-Name] Validierungs-Session

**Datum:** 2026-01-XX
**Dauer:** Xh
**Validiert von:** [Name]

### Recherche-Ergebnisse

**Gefundene Quellen:**
1. [Quelle 1] - [URL] - [Typ: peer-reviewed/standards/manufacturer]
2. [Quelle 2] - [URL]
3. ...

**Validierungs-Status:** ✅ VOLLSTÄNDIG / ⚠️ TEILWEISE / ❌ NICHT MÖGLICH

**Key Findings:**
- [Wichtigste Erkenntnis 1]
- [Wichtigste Erkenntnis 2]
- [Limitationen gefunden]

### Implementierungs-Abgleich

**Code-Review:** [detectors.ts:LINE]
- ✅ Schwellenwerte korrekt
- ✅ Algorithmus valide
- ⚠️ [Eventuell gefundene Diskrepanz]

### Dokumentations-Updates

- [x] SCIENTIFIC_REFERENCES.md aktualisiert (Sektion: [Name])
- [x] WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md aktualisiert
- [x] FEATURE_BACKLOG.md Changelog-Eintrag
- [x] FEATURES.md Validierungs-Sektion

### Nächste Schritte (falls teilvalidiert)

- [ ] [Noch benötigte Quelle/Info]
- [ ] [Offene Frage]
```

---

## 🎓 Best Practices & Lessons Learned

### Aus bisherigen Validierungen gelernt

**✅ Was gut funktioniert hat:**
1. **Web-Recherche VOR Implementierung** (Feature 1.5.5, 1.5.6)
2. **Primärquellen bevorzugen** (NIST > Hersteller > Foren)
3. **Ehrliche Limitationen kommunizieren** (He: qualitativ ≠ quantitativ)
4. **Widersprüche dokumentieren** (Ar: 295.5 vs. 298.6 → 1% OK für RGA)

**❌ Was schief ging:**
1. **Feature 1.5.6:** Spec-Annahmen nicht hinterfragt (FOMBLIN-Fehler)
2. **Feature 1.5.5:** Fast quantitative Leckraten implementiert (nicht validiert)

**🔑 Kernprinzipien:**
- "Trust, but verify" - auch bei Hersteller-Angaben
- Pseudopräzision schadet mehr als sie nutzt
- Wissenschaftliche Validität > Feature-Count
- User-Vertrauen durch Transparenz

---

## 📞 Eskalations-Pfad

**Falls Feature NICHT validierbar:**

1. **Option A: Degradieren** (✅ → ⚠️)
   - Feature behalten, aber "Teilvalidiert" markieren
   - Limitationen explizit machen
   - Beispiel: ESD-Artefakte (Schwellenwerte nicht belegt)

2. **Option B: Verwerfen** (✅ → ❌)
   - Feature entfernen, wenn pseudowissenschaftlich
   - Dokumentation in `done/[NAME]_VERWORFEN.md`
   - Beispiel: Feature 1.5.6 (Öl-Typ-Unterscheidung)

3. **Option C: User-Warning** (⚠️ mit Disclaimer)
   - Feature behalten mit expliziter Warnung
   - "Experimentell - noch nicht wissenschaftlich validiert"
   - Beispiel: Konfidenz-Score (wenn keine Literatur gefunden)

---

## ✅ Checkliste: Plan-Umsetzung

### Vorbereitung
- [ ] Masterplan mit User besprechen
- [ ] Zeitslots für Validierungs-Sessions blocken
- [ ] Zugang zu Journals prüfen (PubMed, ScienceDirect via Institution?)

### Woche 1: Kritische Features
- [ ] Ausgasungs-Simulator validieren (2-3h)
- [ ] ESD-Artefakt-Erkennung validieren (2-3h)
- [ ] Konfidenz-Score System validieren (3-4h)
- [ ] Lösemittel, Wasser, H₂, Virtuelles Leck, UHV validieren (8-10h)
- [ ] Zwischenstand: ~37% → ~60% validiert

### Woche 2: Restliche Detektoren
- [ ] Ammoniak validieren (1h)
- [ ] Methan validieren (1h)
- [ ] Aromatische KW validieren (1-2h)
- [ ] Polymer-Ausgasung validieren (2h)
- [ ] Weichmacher validieren (1-2h)
- [ ] Prozessgas-Rückstände validieren (2h)
- [ ] Kühlwasser-Leck validieren (1h)
- [ ] Zwischenstand: ~60% → ~90% validiert

### Woche 3: UI-Integration
- [ ] Types erweitern (30min)
- [ ] ValidationRegistry erstellen (1-2h)
- [ ] ValidationBadge-Komponente (2-3h)
- [ ] KnowledgePanel-Integration (1h)
- [ ] Diagnose-Engine-Integration (30min)
- [ ] Testing & Bug-Fixing (2h)

### Dokumentation
- [ ] SCIENTIFIC_REFERENCES.md: Alle Quellen eingetragen
- [ ] WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md: Aktualisiert (90% Ziel)
- [ ] FEATURE_BACKLOG.md: Alle Features mit Validierungs-Status
- [ ] FEATURES.md: Validierungs-Sektionen für alle Features
- [ ] KnowledgePanel: Intro-Text "Wissenschaftlich validiert"

### Launch
- [ ] User-Kommunikation: "Wissenschaftlich validierte RGA-Diagnostik"
- [ ] Demo-Video: Validierungs-Badges zeigen
- [ ] Feedback-Loop: User-Vertrauen messen

---

## 🎯 Erfolgs-Kriterium

**Das Projekt ist erfolgreich, wenn:**

1. ✅ **≥90% der Features vollständig validiert** (27/30)
2. ✅ **Jedes Feature zeigt Validierungs-Status in App** (UI-Badge)
3. ✅ **100+ wissenschaftliche Quellen dokumentiert** (SCIENTIFIC_REFERENCES.md)
4. ✅ **User-Feedback:** "RGA Analyser ist wissenschaftlich fundiert, nicht Kaffeesatzleserei"

---

**Nächster Schritt:** User-Approval für Masterplan, dann mit Phase 1 starten! 🚀
