/**
 * CriteriaTab - Diagnostic Criteria (User-Facing)
 *
 * Shows all 22 diagnoses organized by category with useful information:
 * - What to look for (characteristic masses)
 * - What it means (description)
 * - What to do (recommendations)
 *
 * NO developer info - this is for END USERS.
 */

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { DETECTOR_REGISTRY } from '../lib/detectorRegistry'
import { KNOWLEDGE_PANEL_STYLES as KPS } from '../lib/designTokens'
import { DiagnosisType } from '@/lib/diagnosis/types'

interface CriteriaTabProps {
  isGerman: boolean
}

// Detaillierte Diagnose-Dokumentation (neue Struktur wie FeaturesTab)
interface DetailedDiagnosis {
  type: DiagnosisType
  name: string
  nameEn: string
  icon: string
  explanation: string
  explanationEn: string
  characteristicMasses: {
    masses: number[]
    description: string
    descriptionEn: string
    ratios: Array<{
      formula: string
      value: string
      tolerance: string
      significance: string
      significanceEn: string
    }>
  }
  practicalExample: string
  practicalExampleEn: string
  recommendation: string
  recommendationEn: string
  validation: {
    confidence: 'high' | 'medium' | 'low'
    sources: Array<{
      name: string
      url?: string
      type: 'standard' | 'paper' | 'manual' | 'validation'
    }>
  }
}

// Category definitions with user-friendly names
const CATEGORIES = {
  leaks: {
    name: 'Lecks',
    nameEn: 'Leaks',
    icon: '💨',
    description: 'Verschiedene Arten von Undichtigkeiten im Vakuumsystem',
    descriptionEn: 'Various types of leaks in the vacuum system',
  },
  contamination_oils: {
    name: 'Kontamination: Öle',
    nameEn: 'Contamination: Oils',
    icon: '🛢️',
    description: 'Ölbasierte Kontaminationen (z.B. Pumpenöl)',
    descriptionEn: 'Oil-based contaminations (e.g. pump oil)',
  },
  contamination_fluorinated: {
    name: 'Kontamination: Fluoriert',
    nameEn: 'Contamination: Fluorinated',
    icon: '⚗️',
    description: 'Fluorierte Verbindungen (z.B. FOMBLIN)',
    descriptionEn: 'Fluorinated compounds (e.g. FOMBLIN)',
  },
  contamination_polymers: {
    name: 'Kontamination: Polymere',
    nameEn: 'Contamination: Polymers',
    icon: '🧪',
    description: 'Kunststoffe, Silikone, Weichmacher',
    descriptionEn: 'Plastics, silicones, plasticizers',
  },
  contamination_solvents: {
    name: 'Kontamination: Lösungsmittel',
    nameEn: 'Contamination: Solvents',
    icon: '🧴',
    description: 'Organische Lösungsmittel und Rückstände',
    descriptionEn: 'Organic solvents and residues',
  },
  contamination_aromatics: {
    name: 'Kontamination: Aromaten',
    nameEn: 'Contamination: Aromatics',
    icon: '💍',
    description: 'Aromatische Kohlenwasserstoffe',
    descriptionEn: 'Aromatic hydrocarbons',
  },
  outgassing: {
    name: 'Ausgasung',
    nameEn: 'Outgassing',
    icon: '💧',
    description: 'Materialausgasung (Wasser, Wasserstoff)',
    descriptionEn: 'Material outgassing (water, hydrogen)',
  },
  artifacts: {
    name: 'Artefakte',
    nameEn: 'Artifacts',
    icon: '⚡',
    description: 'Messartefakte und technische Effekte',
    descriptionEn: 'Measurement artifacts and technical effects',
  },
  gases: {
    name: 'Gase',
    nameEn: 'Gases',
    icon: '🌫️',
    description: 'Spezifische Gasidentifikationen',
    descriptionEn: 'Specific gas identifications',
  },
  isotopes: {
    name: 'Isotope',
    nameEn: 'Isotopes',
    icon: '☢️',
    description: 'Isotopenverhältnisse zur Verifizierung',
    descriptionEn: 'Isotope ratios for verification',
  },
  quality: {
    name: 'Qualität',
    nameEn: 'Quality',
    icon: '✨',
    description: 'Vakuumqualitätsbewertung',
    descriptionEn: 'Vacuum quality assessment',
  },
}

// Detaillierte Diagnose-Dokumentation (2 Beispiele im neuen Format)
const DETAILED_DIAGNOSES: DetailedDiagnosis[] = [
  {
    type: DiagnosisType.AIR_LEAK,
    name: 'Luftleck',
    nameEn: 'Air Leak',
    icon: '💨',
    explanation: `Ein Luftleck liegt vor, wenn atmosphärische Gase (N₂, O₂, Ar) im typischen Luft-Verhältnis in das Vakuumsystem eindringen. Dies ist eines der häufigsten Vakuumprobleme.

**Wie entsteht ein Luftleck?**
- Undichte Flanschverbindungen (CF, KF, ISO)
- Beschädigte oder alte O-Ringe
- Risse in Schweißnähten
- Undichte Ventile oder Durchführungen
- Poröse Materialien

**Warum ist das problematisch?**
- Verhindert Erreichen des Enddrucks
- Kontaminiert ultrahochvakuum-empfindliche Prozesse
- Erhöht Pumpzeit drastisch
- Kann zu Oxidation von Oberflächen führen`,
    explanationEn: `An air leak occurs when atmospheric gases (N₂, O₂, Ar) enter the vacuum system in typical air ratios. This is one of the most common vacuum problems.

**How does an air leak occur?**
- Leaky flange connections (CF, KF, ISO)
- Damaged or old O-rings
- Cracks in welds
- Leaky valves or feedthroughs
- Porous materials

**Why is this problematic?**
- Prevents achieving ultimate pressure
- Contaminates ultra-high vacuum sensitive processes
- Drastically increases pump-down time
- Can lead to oxidation of surfaces`,
    characteristicMasses: {
      masses: [14, 28, 32, 40, 20],
      description: 'Luftlecks zeigen ein charakteristisches Muster atmosphärischer Gase mit präzisen Verhältnissen.',
      descriptionEn: 'Air leaks show a characteristic pattern of atmospheric gases with precise ratios.',
      ratios: [
        {
          formula: 'N₂/O₂ (m28/m32)',
          value: '3.0 - 4.5',
          tolerance: '±15%',
          significance: 'Hauptkriterium: Atmosphärische Luft hat N₂/O₂ ≈ 3.73',
          significanceEn: 'Main criterion: Atmospheric air has N₂/O₂ ≈ 3.73'
        },
        {
          formula: '⁴⁰Ar/³⁶Ar (m40/m36)',
          value: '298.6',
          tolerance: '±5%',
          significance: 'Bestätigt atmosphärischen Ursprung (nicht Prozessgas)',
          significanceEn: 'Confirms atmospheric origin (not process gas)'
        },
        {
          formula: 'Ar²⁺/Ar⁺ (m20/m40)',
          value: '0.10 - 0.15',
          tolerance: '±50%',
          significance: 'Doppelt ionisiertes Argon (RGA-spezifisch)',
          significanceEn: 'Doubly ionized argon (RGA-specific)'
        },
        {
          formula: 'N₂⁺/N⁺ (m28/m14)',
          value: '6 - 20',
          tolerance: 'Typisch: 14',
          significance: 'Fragment-Verhältnis bestätigt N₂ (nicht CO)',
          significanceEn: 'Fragment ratio confirms N₂ (not CO)'
        }
      ]
    },
    practicalExample: `**Szenario: Flansch undicht nach Wartung**

Nach Öffnen einer CF-Flanschverbindung zur Wartung zeigt das RGA:

**Gemessene Peaks:**
- m/z 2 (H₂): 1.00 (Referenz)
- m/z 14 (N⁺): 0.015
- m/z 28 (N₂): 0.210
- m/z 32 (O₂): 0.055
- m/z 40 (Ar): 0.012
- m/z 36 (³⁶Ar): 0.00004
- m/z 20 (Ar²⁺): 0.0015

**Diagnose-Analyse:**

1. **N₂/O₂-Verhältnis:**
   - Berechnung: 0.210 / 0.055 = 3.82
   - Erwartung: 3.0 - 4.5 ✅
   - Interpretation: Passt perfekt zu atmosphärischer Luft (3.73)

2. **Argon-Isotopen:**
   - ⁴⁰Ar/³⁶Ar = 0.012 / 0.00004 = 300
   - Erwartung: 298.6 ± 5% ✅
   - Interpretation: Definitiv atmosphärisches Argon

3. **Ar-Doppelionisation:**
   - Ar²⁺/Ar⁺ = 0.0015 / 0.012 = 0.125
   - Erwartung: 0.10 - 0.15 ✅
   - Interpretation: Typisch für RGA-Ionisation

**Diagnose:** Luftleck (Confidence: 95%)

**Empfohlene Maßnahme:**
1. Kühlwasser ausschalten
2. Helium-Lecksucher an Flansch ansetzen
3. CF-Kupferdichtung auf Kratzer prüfen
4. Flansch-Schrauben gleichmäßig anziehen (Kreuzschema)
5. Nach Reparatur: RGA-Spektrum wiederholen`,
    practicalExampleEn: `**Scenario: Flange leaky after maintenance**

After opening a CF flange for maintenance, the RGA shows:

**Measured peaks:**
- m/z 2 (H₂): 1.00 (reference)
- m/z 14 (N⁺): 0.015
- m/z 28 (N₂): 0.210
- m/z 32 (O₂): 0.055
- m/z 40 (Ar): 0.012
- m/z 36 (³⁶Ar): 0.00004
- m/z 20 (Ar²⁺): 0.0015

**Diagnosis analysis:**

1. **N₂/O₂ ratio:**
   - Calculation: 0.210 / 0.055 = 3.82
   - Expectation: 3.0 - 4.5 ✅
   - Interpretation: Perfect match to atmospheric air (3.73)

2. **Argon isotopes:**
   - ⁴⁰Ar/³⁶Ar = 0.012 / 0.00004 = 300
   - Expectation: 298.6 ± 5% ✅
   - Interpretation: Definitely atmospheric argon

3. **Ar double ionization:**
   - Ar²⁺/Ar⁺ = 0.0015 / 0.012 = 0.125
   - Expectation: 0.10 - 0.15 ✅
   - Interpretation: Typical for RGA ionization

**Diagnosis:** Air leak (Confidence: 95%)

**Recommended action:**
1. Turn off cooling water
2. Apply helium leak detector to flange
3. Check CF copper gasket for scratches
4. Tighten flange bolts evenly (cross pattern)
5. After repair: repeat RGA spectrum`,
    recommendation: `**Sofortmaßnahmen:**
1. Helium-Lecksucher verwenden (Helium ist eindeutiger als Luft)
2. Systematisch alle Flansche, Ventile und Durchführungen prüfen
3. Besondere Aufmerksamkeit auf kürzlich gewartete Stellen

**Typische Leckstellen:**
- CF-Flansche: Kupferdichtung beschädigt oder Flanschflächen verkratzt
- KF-Flansche: O-Ring porös, falsche Größe oder verdreht
- Ventile: Spindeldichtung verschlissen
- Durchführungen: Glasdurchführungen rissig

**Langfristige Maßnahmen:**
- O-Ringe regelmäßig austauschen (jährlich bei häufigem Öffnen)
- CF-Kupferdichtungen nur einmal verwenden
- Flanschflächen sauber halten (keine Kratzer!)
- Dokumentation: Welche Flansche wann geöffnet wurden`,
    recommendationEn: `**Immediate actions:**
1. Use helium leak detector (helium is more unambiguous than air)
2. Systematically check all flanges, valves, and feedthroughs
3. Pay special attention to recently serviced areas

**Typical leak locations:**
- CF flanges: copper gasket damaged or flange faces scratched
- KF flanges: O-ring porous, wrong size, or twisted
- Valves: spindle seal worn
- Feedthroughs: glass feedthroughs cracked

**Long-term measures:**
- Replace O-rings regularly (annually with frequent opening)
- Use CF copper gaskets only once
- Keep flange faces clean (no scratches!)
- Documentation: which flanges were opened when`,
    validation: {
      confidence: 'high',
      sources: [
        {
          name: 'NIST Physics - Argon Isotope Table',
          url: 'https://physics.nist.gov/PhysRefData/Handbook/Tables/argontable1_a.htm',
          type: 'standard'
        },
        {
          name: 'CIAAW - Argon Standard (2007)',
          url: 'https://ciaaw.org/argon.htm',
          type: 'standard'
        },
        {
          name: 'NIST WebBook - Nitrogen',
          url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7727379&Mask=200',
          type: 'standard'
        },
        {
          name: 'CERN Vacuum Handbook',
          type: 'manual'
        },
        {
          name: 'Gemini + Grok Cross-Validation (95%)',
          type: 'validation'
        }
      ]
    }
  },
  {
    type: DiagnosisType.OIL_BACKSTREAMING,
    name: 'Öl-Rückströmung (Heavy Hydrocarbons)',
    nameEn: 'Oil Backstreaming (Heavy Hydrocarbons)',
    icon: '🛢️',
    explanation: `Öl-Rückströmung tritt auf, wenn Öldämpfe von der Vakuumpumpe in die Kammer zurückwandern und Oberflächen kontaminieren. Dies zeigt sich als charakteristisches "Delta-14"-Muster schwerer Kohlenwasserstoffe.

**Wie entsteht Öl-Rückströmung?**
- Öldiffusionspumpen ohne Cold Trap
- Überhitzte Öl-Rotationspumpen
- Defekte Ölabscheider
- Zu hohe Pumpenöl-Temperatur
- Rückschlagventil defekt

**Warum ist das problematisch?**
- Kontaminiert ultrareine Oberflächen (Halbleiter, Optik)
- Verschlechtert Vakuum-Qualität dauerhaft
- Kann zu Film-Bildung auf Substraten führen
- Schwer zu entfernen (Bakeout nötig)`,
    explanationEn: `Oil backstreaming occurs when oil vapors from the vacuum pump migrate back into the chamber and contaminate surfaces. This manifests as a characteristic "delta-14" pattern of heavy hydrocarbons.

**How does oil backstreaming occur?**
- Oil diffusion pumps without cold trap
- Overheated rotary vane pumps
- Defective oil mist eliminators
- Pump oil temperature too high
- Check valve defective

**Why is this problematic?**
- Contaminates ultra-clean surfaces (semiconductors, optics)
- Permanently degrades vacuum quality
- Can lead to film formation on substrates
- Difficult to remove (bakeout required)`,
    characteristicMasses: {
      masses: [39, 41, 43, 55, 57, 69, 71, 83, 85],
      description: 'Öl zeigt ein Delta-14-Muster: Peaks im Abstand von 14 amu (CH₂-Einheiten). Mindestens 3 dieser Peaks müssen vorhanden sein.',
      descriptionEn: 'Oil shows a delta-14 pattern: peaks spaced 14 amu apart (CH₂ units). At least 3 of these peaks must be present.',
      ratios: [
        {
          formula: 'C₄H₉⁺/C₃H₇⁺ (m57/m43)',
          value: '0.5 - 1.4',
          tolerance: 'Typisch: 0.6 - 1.0',
          significance: 'Hauptkriterium: Verhältnis charakteristisch für Pumpenöl',
          significanceEn: 'Main criterion: ratio characteristic of pump oil'
        },
        {
          formula: 'Heavy HC Pattern',
          value: 'Min. 3 Peaks',
          tolerance: 'Aus: 39, 41, 43, 55, 57, 69, 71, 83, 85',
          significance: 'Delta-14-Muster (CH₂-Wiederholung)',
          significanceEn: 'Delta-14 pattern (CH₂ repetition)'
        },
        {
          formula: 'm41/m43',
          value: '< 1.0',
          tolerance: 'Anti-Pattern Check',
          significance: 'Schließt leichte KW aus (Aceton, IPA)',
          significanceEn: 'Excludes light HC (acetone, IPA)'
        }
      ]
    },
    practicalExample: `**Szenario: Diffusionspumpe ohne Cold Trap**

Ein System mit Öldiffusionspumpe zeigt nach mehreren Stunden Betrieb:

**Gemessene Peaks:**
- m/z 2 (H₂): 1.00 (Referenz)
- m/z 39 (C₃H₃⁺): 0.008
- m/z 41 (C₃H₅⁺): 0.014
- m/z 43 (C₃H₇⁺): 0.022
- m/z 55 (C₄H₇⁺): 0.018
- m/z 57 (C₄H₉⁺): 0.016
- m/z 69 (C₅H₉⁺): 0.010
- m/z 71 (C₅H₁₁⁺): 0.007

**Diagnose-Analyse:**

1. **Delta-14-Pattern:**
   - Gefunden: m/z 43, 57, 69, 71 (4 Peaks im 14-amu-Abstand) ✅
   - Minimum: 3 Peaks gefordert ✅
   - Interpretation: Typisch für langkettige Kohlenwasserstoffe

2. **C₄H₉⁺/C₃H₇⁺-Verhältnis:**
   - Berechnung: 0.016 / 0.022 = 0.73
   - Erwartung: 0.5 - 1.4 ✅
   - Interpretation: Perfekt für Pumpenöl (Santovac, Fomblin würde abweichen)

3. **Anti-Pattern Check (m41/m43):**
   - Berechnung: 0.014 / 0.022 = 0.64
   - Check: < 1.0 ✅
   - Interpretation: Definitiv schwere KW, nicht Aceton

**Diagnose:** Oil Backstreaming (Confidence: 90%)

**Warum passiert das?**
- Cold Trap fehlt oder zu warm (> -100°C)
- Diffusionspumpe zu heiß (> 200°C)
- Öl zu alt oder falsche Sorte

**Empfohlene Maßnahme:**
1. SOFORT Cold Trap mit LN₂ füllen (falls vorhanden)
2. Diffusionspumpen-Temperatur prüfen
3. Bakeout-Zyklus durchführen (150-200°C, 24h)
4. Öl-Wechsel bei Rotationspumpe
5. Langfristig: Auf ölfreie Pumpe umsteigen (Turbopumpe)`,
    practicalExampleEn: `**Scenario: Diffusion pump without cold trap**

A system with oil diffusion pump shows after several hours of operation:

**Measured peaks:**
- m/z 2 (H₂): 1.00 (reference)
- m/z 39 (C₃H₃⁺): 0.008
- m/z 41 (C₃H₅⁺): 0.014
- m/z 43 (C₃H₇⁺): 0.022
- m/z 55 (C₄H₇⁺): 0.018
- m/z 57 (C₄H₉⁺): 0.016
- m/z 69 (C₅H₉⁺): 0.010
- m/z 71 (C₅H₁₁⁺): 0.007

**Diagnosis analysis:**

1. **Delta-14 pattern:**
   - Found: m/z 43, 57, 69, 71 (4 peaks at 14-amu spacing) ✅
   - Minimum: 3 peaks required ✅
   - Interpretation: Typical for long-chain hydrocarbons

2. **C₄H₉⁺/C₃H₇⁺ ratio:**
   - Calculation: 0.016 / 0.022 = 0.73
   - Expectation: 0.5 - 1.4 ✅
   - Interpretation: Perfect for pump oil (Santovac, Fomblin would differ)

3. **Anti-pattern check (m41/m43):**
   - Calculation: 0.014 / 0.022 = 0.64
   - Check: < 1.0 ✅
   - Interpretation: Definitely heavy HC, not acetone

**Diagnosis:** Oil Backstreaming (Confidence: 90%)

**Why does this happen?**
- Cold trap missing or too warm (> -100°C)
- Diffusion pump too hot (> 200°C)
- Oil too old or wrong type

**Recommended action:**
1. IMMEDIATELY fill cold trap with LN₂ (if available)
2. Check diffusion pump temperature
3. Perform bakeout cycle (150-200°C, 24h)
4. Oil change in rotary pump
5. Long-term: Switch to oil-free pump (turbo pump)`,
    recommendation: `**Sofortmaßnahmen:**
1. Cold Trap aktivieren (LN₂ füllen)
2. Pumpenöl-Temperatur überprüfen und ggf. reduzieren
3. Rückschlagventil zwischen Pumpe und Kammer prüfen

**Reinigung der Kontamination:**
- Bakeout bei 150-200°C für 24-48 Stunden
- Bei starker Kontamination: Chemische Reinigung mit Aceton/IPA
- Danach: erneutes RGA-Spektrum zur Verifikation

**Prävention:**
- **Empfohlen:** Wechsel auf ölfreie Turbopumpe
- Falls Öl-Pumpe nötig: Cold Trap mit LN₂ IMMER aktiv halten
- Regelmäßiger Öl-Wechsel (alle 3-6 Monate)
- Pumpen-Temperatur überwachen (Thermocouple)
- Baffle zwischen Pumpe und Kammer installieren

**Wichtig für Halbleiter/Optik:**
Öl-Kontamination kann irreversibel sein! Prävention ist KRITISCH.`,
    recommendationEn: `**Immediate actions:**
1. Activate cold trap (fill with LN₂)
2. Check pump oil temperature and reduce if necessary
3. Check check valve between pump and chamber

**Cleaning contamination:**
- Bakeout at 150-200°C for 24-48 hours
- For severe contamination: chemical cleaning with acetone/IPA
- Afterward: repeat RGA spectrum for verification

**Prevention:**
- **Recommended:** Switch to oil-free turbo pump
- If oil pump necessary: ALWAYS keep cold trap active with LN₂
- Regular oil changes (every 3-6 months)
- Monitor pump temperature (thermocouple)
- Install baffle between pump and chamber

**Important for semiconductor/optics:**
Oil contamination can be irreversible! Prevention is CRITICAL.`,
    validation: {
      confidence: 'high',
      sources: [
        {
          name: 'Kurt J. Lesker - RGA Advanced Interpretation',
          url: 'https://de.lesker.com/newweb/technical_info/vacuumtech/rga_04_advanceinterpret.cfm',
          type: 'manual'
        },
        {
          name: 'Hiden Analytical - Hydrocarbon Fragments',
          url: 'https://www.hidenanalytical.com/wp-content/uploads/2016/08/hydrocarbon_fragments-1-1.pdf',
          type: 'paper'
        },
        {
          name: 'ThinkSRS - Vacuum Diagnostics with RGA',
          url: 'https://www.thinksrs.com/downloads/pdfs/applicationnotes/Vac_diag_RGA.pdf',
          type: 'manual'
        },
        {
          name: 'Gemini Cross-Validation',
          type: 'validation'
        },
        {
          name: 'Grok Cross-Validation',
          type: 'validation'
        }
      ]
    }
  },

  // === HELIUM LEAK INDICATOR ===
  {
    type: DiagnosisType.HELIUM_LEAK_INDICATOR,
    name: 'Helium-Signal auffällig',
    nameEn: 'Helium Signal Detected',
    icon: '🎈',
    explanation: `Ein erhöhtes Helium-Signal (m/z 4) deutet auf ein Helium-Leck hin, wie es bei der Helium-Lecksuche verwendet wird. Helium dringt durch kleinste Öffnungen und wird zum Lokalisieren von Lecks eingesetzt.

**Wie entsteht ein Helium-Signal?**
- Aktive Helium-Lecksuche: Helium wird von außen auf verdächtige Stellen gesprüht
- Helium-Prozessgas: Helium in der Anlage (Kühlung, Inertgas)
- Helium aus der Luft: Sehr geringe Konzentration (5 ppm), normalerweise nicht sichtbar

**Wichtige Einschränkung:**
⚠️ Das RGA ist **1-3 Größenordnungen weniger empfindlich** als ein dedizierter Helium-Lecksucher! Ein positives Signal ist ein klarer Indikator, aber ein negatives Signal bedeutet NICHT, dass kein Leck vorhanden ist.

**Verwechslungsgefahr: m/z 4 kann auch D₂ sein**
- m/z 4 = He⁺ (Helium) ODER D₂⁺ (Deuterium-Molekül)
- Die App prüft m/z 3 (HD): Wenn m/z 3 hoch ist, ist es wahrscheinlich D₂
- Wenn m/z 3 niedrig ist, ist es wahrscheinlich Helium`,
    explanationEn: `An elevated helium signal (m/z 4) indicates a helium leak, as used in helium leak detection. Helium penetrates through the smallest openings and is used to locate leaks.

**How does a helium signal arise?**
- Active helium leak search: Helium is sprayed from outside on suspicious areas
- Helium process gas: Helium in the system (cooling, inert gas)
- Helium from air: Very low concentration (5 ppm), normally not visible

**Important limitation:**
⚠️ The RGA is **1-3 orders of magnitude less sensitive** than a dedicated helium leak detector! A positive signal is a clear indicator, but a negative signal does NOT mean there is no leak.

**Confusion risk: m/z 4 can also be D₂**
- m/z 4 = He⁺ (helium) OR D₂⁺ (deuterium molecule)
- The app checks m/z 3 (HD): If m/z 3 is high, it's probably D₂
- If m/z 3 is low, it's probably helium`,
    characteristicMasses: {
      masses: [4, 3, 2],
      description: 'Helium-Detektion basiert auf m/z 4 (He⁺), mit D₂-Korrektur über m/z 3 (HD). RSF-Korrektur ist kritisch für quantitative Analyse.',
      descriptionEn: 'Helium detection based on m/z 4 (He⁺), with D₂ correction via m/z 3 (HD). RSF correction is critical for quantitative analysis.',
      ratios: [
        {
          formula: 'He/H₂ (RSF-korrigiert)',
          value: '> 0.03',
          tolerance: '3% Schwelle',
          significance: 'RSF-korrigiertes Verhältnis für He-Detektion. RSF_He = 0.15, RSF_H₂ = 0.44',
          significanceEn: 'RSF-corrected ratio for He detection. RSF_He = 0.15, RSF_H₂ = 0.44'
        },
        {
          formula: 'm/z 3 / m/z 4',
          value: '< 0.5',
          tolerance: 'Hoch = D₂',
          significance: 'Niedrig = Helium wahrscheinlich, Hoch = Deuterium-Überlappung',
          significanceEn: 'Low = helium likely, High = deuterium overlap'
        },
        {
          formula: 'm/z 4 absolut',
          value: '> LOD',
          tolerance: 'Über Nachweisgrenze',
          significance: 'Signal muss signifikant über dem Grundrauschen liegen',
          significanceEn: 'Signal must be significantly above background noise'
        }
      ]
    },
    practicalExample: `**Szenario: Helium-Lecksuche an UHV-Kammer**
Sie sprühen Helium von außen auf eine verdächtige CF-Flanschverbindung.

**Gemessene Peaks:**
- m/z 2 (H₂): 1.00 (Referenz)
- m/z 4 (He): 0.025 (2.5% vom H₂-Peak)
- m/z 3 (HD): 0.0005 (sehr niedrig)

**Diagnose-Analyse:**
1. **RSF-Korrektur berechnen:**
   - He_korrigiert = (0.025 / 0.15) = 0.167
   - H₂_korrigiert = (1.00 / 0.44) = 2.27
   - Verhältnis = 0.167 / 2.27 = **0.073** (7.3%) ✅

2. **D₂-Check:**
   - m/z 3 / m/z 4 = 0.0005 / 0.025 = **0.02** (< 0.5) ✅
   - → Es ist Helium, nicht Deuterium

3. **Schwelle:**
   - 7.3% > 3% Schwelle ✅

**Diagnose:** Helium-Leck detektiert (Confidence: 85%)

**Nächster Schritt:**
Verwenden Sie einen dedizierten Helium-Lecksucher, um die genaue Leckrate zu messen und das Leck zu lokalisieren. Das RGA gibt nur einen **qualitativen Hinweis**!`,
    practicalExampleEn: `**Scenario: Helium leak search on UHV chamber**
You spray helium from outside on a suspicious CF flange connection.

**Measured peaks:**
- m/z 2 (H₂): 1.00 (reference)
- m/z 4 (He): 0.025 (2.5% of H₂ peak)
- m/z 3 (HD): 0.0005 (very low)

**Diagnosis analysis:**
1. **Calculate RSF correction:**
   - He_corrected = (0.025 / 0.15) = 0.167
   - H₂_corrected = (1.00 / 0.44) = 2.27
   - Ratio = 0.167 / 2.27 = **0.073** (7.3%) ✅

2. **D₂ check:**
   - m/z 3 / m/z 4 = 0.0005 / 0.025 = **0.02** (< 0.5) ✅
   - → It's helium, not deuterium

3. **Threshold:**
   - 7.3% > 3% threshold ✅

**Diagnosis:** Helium leak detected (Confidence: 85%)

**Next step:**
Use a dedicated helium leak detector to measure the exact leak rate and locate the leak. The RGA only provides a **qualitative indication**!`,
    recommendation: `**Sofortmaßnahmen:**
1. **Dedizierter Helium-Lecksucher erforderlich** (z.B. Pfeiffer ASM 340, Inficon UL 1000)
2. Systematisch alle verdächtigen Stellen mit He besprühen
3. Leckrate quantitativ bestimmen (RGA kann das NICHT präzise)

**Wichtig:**
- Das RGA ist ein **Screening-Tool**, kein Präzisions-Lecksucher
- Empfindlichkeit: typisch 10⁻⁶ mbar·l/s (He-Lecksucher: 10⁻⁹ bis 10⁻¹¹)
- Verwenden Sie das RGA, um zu entscheiden: "Lohnt sich der He-Lecksucher?"

**Wenn kein He-Signal trotz Verdacht:**
→ Das bedeutet NICHT "kein Leck"! Das Leck könnte kleiner sein als die RGA-Nachweisgrenze. Verwenden Sie trotzdem einen He-Lecksucher.`,
    recommendationEn: `**Immediate actions:**
1. **Dedicated helium leak detector required** (e.g. Pfeiffer ASM 340, Inficon UL 1000)
2. Systematically spray all suspicious areas with He
3. Determine leak rate quantitatively (RGA CANNOT do this precisely)

**Important:**
- The RGA is a **screening tool**, not a precision leak detector
- Sensitivity: typically 10⁻⁶ mbar·l/s (He leak detector: 10⁻⁹ to 10⁻¹¹)
- Use the RGA to decide: "Is the He leak detector worth it?"

**If no He signal despite suspicion:**
→ This does NOT mean "no leak"! The leak could be smaller than the RGA detection limit. Use a He leak detector anyway.`,
    validation: {
      confidence: 'high',
      sources: [
        {
          name: 'Hiden Analytical - RGA Series (RSF values)',
          url: 'https://www.hidenanalytical.com/products/residual-gas-analysis/rga-series/',
          type: 'manual'
        },
        {
          name: 'MKS Instruments - RGA Basics',
          url: 'https://www.mks.com/n/residual-gas-analysis',
          type: 'manual'
        },
        {
          name: 'NIST Chemistry WebBook (He mass spectrum)',
          url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7440597&Units=SI&Mask=20',
          type: 'standard'
        },
        {
          name: 'ISO 3530 - Leak detection using helium',
          type: 'standard'
        },
        {
          name: 'Gemini Cross-Validation',
          type: 'validation'
        },
        {
          name: 'Grok Cross-Validation',
          type: 'validation'
        }
      ]
    }
  },

  // === VIRTUAL LEAK ===
  {
    type: DiagnosisType.VIRTUAL_LEAK,
    name: 'Virtuelles Leck',
    nameEn: 'Virtual Leak',
    icon: '🕳️',
    explanation: `Ein virtuelles Leck ist KEIN echtes Leck in der Kammerwand. Stattdessen ist Gas in einem Hohlraum oder einer Gewindebohrung eingeschlossen, das langsam ausgast. Das Spektrum sieht aus wie ein Luftleck, hat aber charakteristische Abweichungen.

**Wie entsteht ein virtuelles Leck?**
- Blinde Gewindebohrungen ohne Entlüftungsbohrung
- Hohlräume zwischen Doppelwänden oder Zwischenringen
- Poröse Materialien (gesinterte Metalle, Keramiken)
- Undichte Kabelschläuche oder Rohrdurchführungen

**Unterschied zu echtem Luftleck:**
- **Echtes Luftleck:** Atmosphärische Luft mit N₂/O₂ ≈ 3.73, Ar vorhanden (0.93% der Luft)
- **Virtuelles Leck:** Gas war VOR dem Evakuieren eingeschlossen → Ar wird bevorzugt adsorbiert oder fehlt ganz, O₂ wird auf Oberflächen adsorbiert → N₂/O₂-Verhältnis erhöht

**Warum ist Ar niedrig/fehlend?**
Argon wird auf Metalloberflächen STÄRKER adsorbiert als N₂. In einem eingeschlossenen Volumen mit großer Oberfläche (z.B. Gewinde) kann Ar fast vollständig adsorbiert werden.

**Warum ist H₂O erhöht?**
Eingeschlossene Volumina enthalten oft Feuchtigkeit, die langsam ausgast. H₂O hat eine hohe Ausgasungsrate und dominiert daher das Spektrum.`,
    explanationEn: `A virtual leak is NOT a real leak in the chamber wall. Instead, gas is trapped in a cavity or threaded hole that slowly outgasses. The spectrum looks like an air leak but has characteristic deviations.

**How does a virtual leak arise?**
- Blind threaded holes without vent holes
- Cavities between double walls or spacer rings
- Porous materials (sintered metals, ceramics)
- Leaking cable conduits or pipe feedthroughs

**Difference from real air leak:**
- **Real air leak:** Atmospheric air with N₂/O₂ ≈ 3.73, Ar present (0.93% of air)
- **Virtual leak:** Gas was trapped BEFORE evacuation → Ar is preferentially adsorbed or completely missing, O₂ is adsorbed on surfaces → N₂/O₂ ratio increased

**Why is Ar low/missing?**
Argon is adsorbed MORE STRONGLY on metal surfaces than N₂. In a trapped volume with large surface area (e.g. threads), Ar can be almost completely adsorbed.

**Why is H₂O elevated?**
Trapped volumes often contain moisture that slowly outgasses. H₂O has a high outgassing rate and therefore dominates the spectrum.`,
    characteristicMasses: {
      masses: [28, 32, 18, 40],
      description: 'Virtuelles Leck zeigt luftähnliches N₂/O₂-Verhältnis (3.0-4.5), aber mit Anomalien: Ar niedrig/fehlend (< 1.5% von O₂), H₂O erhöht (> 2× O₂), N₂/O₂ oft erhöht (> 4.5) wegen O₂-Adsorption.',
      descriptionEn: 'Virtual leak shows air-like N₂/O₂ ratio (3.0-4.5), but with anomalies: Ar low/missing (< 1.5% of O₂), H₂O elevated (> 2× O₂), N₂/O₂ often elevated (> 4.5) due to O₂ adsorption.',
      ratios: [
        {
          formula: 'N₂/O₂ (m28/m32)',
          value: '3.0 - 4.5',
          tolerance: 'Oft > 4.5',
          significance: 'Luftähnlich, aber oft erhöht wegen O₂-Adsorption auf Oberflächen',
          significanceEn: 'Air-like, but often elevated due to O₂ adsorption on surfaces'
        },
        {
          formula: 'H₂O/O₂ (m18/m32)',
          value: '> 2.0',
          tolerance: 'Hoch = virtuell',
          significance: 'Eingeschlossene Feuchtigkeit gast langsam aus → H₂O dominant',
          significanceEn: 'Trapped moisture outgasses slowly → H₂O dominant'
        },
        {
          formula: 'Ar/O₂ (m40/m32)',
          value: '< 0.015',
          tolerance: 'Sehr niedrig',
          significance: 'Ar bevorzugt adsorbiert → fehlt oder sehr niedrig (Normal: 0.029)',
          significanceEn: 'Ar preferentially adsorbed → missing or very low (Normal: 0.029)'
        },
        {
          formula: 'N₂/O₂-Trend über Zeit',
          value: 'Steigt',
          tolerance: 'Typisch',
          significance: 'O₂ wird adsorbiert, N₂ bleibt → Verhältnis steigt über Stunden',
          significanceEn: 'O₂ is adsorbed, N₂ remains → ratio increases over hours'
        }
      ]
    },
    practicalExample: `**Szenario: Blinde Gewindebohrung ohne Entlüftung**
Sie evakuieren eine neue Kammer. Nach 24h Pumpzeit stabilisiert sich der Druck bei 5×10⁻⁶ mbar, aber das RGA zeigt "Luftleck".

**Gemessene Peaks:**
- m/z 2 (H₂): 1.00 (Referenz)
- m/z 28 (N₂): 0.180
- m/z 32 (O₂): 0.035
- m/z 18 (H₂O): 0.085
- m/z 40 (Ar): 0.0003 (sehr niedrig!)

**Diagnose-Analyse:**
1. **N₂/O₂-Verhältnis:** 0.180 / 0.035 = **5.14** (erhöht! Normal: 3.73) ✅
2. **H₂O/O₂:** 0.085 / 0.035 = **2.43** (> 2.0) ✅
3. **Ar/O₂:** 0.0003 / 0.035 = **0.0086** (< 0.015, Normal: 0.029) ✅
4. **Ar-Isotopen:** Nicht messbar (zu niedrig)

**Diagnose:** Virtuelles Leck (Confidence: 75%)

**Warum kein echtes Luftleck?**
- Ar ist fast nicht vorhanden (sollte 0.029 sein)
- H₂O ist sehr hoch (typisch für eingeschlossene Feuchtigkeit)
- N₂/O₂-Verhältnis ist erhöht (O₂ wird adsorbiert)

**Bestätigung:**
He-Lecksucher zeigt KEIN Leck → Bestätigt virtuelles Leck.`,
    practicalExampleEn: `**Scenario: Blind threaded hole without venting**
You evacuate a new chamber. After 24h pumping time, pressure stabilizes at 5×10⁻⁶ mbar, but the RGA shows "air leak".

**Measured peaks:**
- m/z 2 (H₂): 1.00 (reference)
- m/z 28 (N₂): 0.180
- m/z 32 (O₂): 0.035
- m/z 18 (H₂O): 0.085
- m/z 40 (Ar): 0.0003 (very low!)

**Diagnosis analysis:**
1. **N₂/O₂ ratio:** 0.180 / 0.035 = **5.14** (elevated! Normal: 3.73) ✅
2. **H₂O/O₂:** 0.085 / 0.035 = **2.43** (> 2.0) ✅
3. **Ar/O₂:** 0.0003 / 0.035 = **0.0086** (< 0.015, Normal: 0.029) ✅
4. **Ar isotopes:** Not measurable (too low)

**Diagnosis:** Virtual leak (Confidence: 75%)

**Why not a real air leak?**
- Ar is almost absent (should be 0.029)
- H₂O is very high (typical for trapped moisture)
- N₂/O₂ ratio is elevated (O₂ is adsorbed)

**Confirmation:**
He leak detector shows NO leak → Confirms virtual leak.`,
    recommendation: `**Bestätigung mit He-Lecksucher:**
1. He-Lecksucher verwenden → Wenn KEIN Leck: virtuelles Leck bestätigt
2. Wenn doch Leck gefunden: kombiniertes Problem (Leck + virtuelles Leck)

**Lokalisierung:**
1. **Gewindebohrungen:** Prüfen Sie alle blinden Gewinde
   - Lösung: Entlüftungsbohrung (0.5-1 mm) bohren zum Hauptvolumen
2. **Hohlräume:** Prüfen Sie Zwischenringe, Doppelwände
   - Lösung: Entlüftungsschlitze oder -bohrungen
3. **Poröse Materialien:** Gesinterte Filter, Keramiken
   - Lösung: Bakeout bei erhöhter Temperatur (100-150°C)

**Abhilfe:**
- **Kurzfristig:** Längere Pumpzeit (Stunden bis Tage), Bakeout-Zyklus
- **Langfristig:** Konstruktionsänderung (Entlüftungsbohrungen)

**Typische Pumpzeit:**
Virtuelles Leck kann TAGE zum vollständigen Abpumpen brauchen! Geduld ist nötig.`,
    recommendationEn: `**Confirmation with He leak detector:**
1. Use He leak detector → If NO leak: virtual leak confirmed
2. If leak found: combined problem (leak + virtual leak)

**Localization:**
1. **Threaded holes:** Check all blind threads
   - Solution: Drill vent hole (0.5-1 mm) to main volume
2. **Cavities:** Check spacer rings, double walls
   - Solution: Vent slots or holes
3. **Porous materials:** Sintered filters, ceramics
   - Solution: Bakeout at elevated temperature (100-150°C)

**Remedy:**
- **Short-term:** Longer pumping time (hours to days), bakeout cycle
- **Long-term:** Design change (vent holes)

**Typical pumping time:**
Virtual leak can take DAYS to pump out completely! Patience is required.`,
    validation: {
      confidence: 'medium',
      sources: [
        {
          name: 'ThinkSRS - Vacuum Diagnostics with RGA',
          url: 'https://www.thinksrs.com/downloads/pdfs/applicationnotes/Vac_diag_RGA.pdf',
          type: 'manual'
        },
        {
          name: 'Hiden Analytical - Leak Detection with RGA',
          url: 'https://www.hidenanalytical.com/blog/how-residual-gas-analysis-rga-factors-leak-detection/',
          type: 'manual'
        },
        {
          name: 'Heat Treat Today - Virtual Vacuum Leaks',
          url: 'https://www.heattreattoday.com/how-to-find-both-real-and-virtual-vacuum-leaks/',
          type: 'manual'
        },
        {
          name: 'O\'Hanlon - User\'s Guide to Vacuum Technology (2003)',
          type: 'paper'
        },
        {
          name: 'Wutz Handbuch Vakuumtechnik',
          type: 'manual'
        }
      ]
    }
  },

  // === COOLING WATER LEAK ===
  {
    type: DiagnosisType.COOLING_WATER_LEAK,
    name: 'Kühlwasser-Leck (KRITISCH)',
    nameEn: 'Cooling Water Leak (CRITICAL)',
    icon: '💧',
    explanation: `Ein Kühlwasser-Leck ist ein **NOTFALL** und die gefährlichste Diagnose! Wasser strömt in die Vakuumkammer und kondensiert. Der Druck stabilisiert sich beim Sättigungsdampfdruck von Wasser bei Raumtemperatur (15-30 mbar). Dies führt zu massiver Kontamination und kann Pumpen zerstören.

**Wie entsteht ein Kühlwasser-Leck?**
- Riss in wassergekühlten Wänden (z.B. bei UHV-Rezipienten mit Kühlkanälen)
- Defekte Kühlspirale in der Kammerwand
- Undichte Wasserdurchführung (z.B. bei wassergekühlten Experimenten)
- Korrosion in Kühlkanälen nach Jahren

**Warum stabilisiert sich der Druck bei 15-30 mbar?**
- **20°C:** Sättigungsdampfdruck H₂O = 23.4 mbar
- **25°C:** Sättigungsdampfdruck H₂O = 31.7 mbar
- Wasser verdampft, bis der Partialdruck den Sättigungsdampfdruck erreicht
- Danach: Gleichgewicht zwischen Verdampfung und Kondensation
- Das Wasser "regelt" den Druck selbst!

**Warum ist das so gefährlich?**
- ⚠️ **Pumpen-Schaden:** Turbopumpen können bei hohem Druck beschädigt werden
- ⚠️ **Öl-Emulsion:** Wenn Wasser in Öl-Pumpen gelangt → Öl-Emulsion → Pumpenzerstörung
- ⚠️ **Massive Kontamination:** Wasser adsorbiert auf allen Oberflächen → Wochen Bakeout nötig
- ⚠️ **Korrosion:** Wasser + Metalle = Rost, besonders bei Edelstahl`,
    explanationEn: `A cooling water leak is an **EMERGENCY** and the most dangerous diagnosis! Water flows into the vacuum chamber and condenses. Pressure stabilizes at the saturation vapor pressure of water at room temperature (15-30 mbar). This leads to massive contamination and can destroy pumps.

**How does a cooling water leak arise?**
- Crack in water-cooled walls (e.g., in UHV vessels with cooling channels)
- Defective cooling coil in chamber wall
- Leaking water feedthrough (e.g., in water-cooled experiments)
- Corrosion in cooling channels after years

**Why does pressure stabilize at 15-30 mbar?**
- **20°C:** Saturation vapor pressure H₂O = 23.4 mbar
- **25°C:** Saturation vapor pressure H₂O = 31.7 mbar
- Water evaporates until partial pressure reaches saturation vapor pressure
- Then: Equilibrium between evaporation and condensation
- The water "regulates" the pressure itself!

**Why is this so dangerous?**
- ⚠️ **Pump damage:** Turbo pumps can be damaged at high pressure
- ⚠️ **Oil emulsion:** If water enters oil pumps → oil emulsion → pump destruction
- ⚠️ **Massive contamination:** Water adsorbs on all surfaces → weeks of bakeout needed
- ⚠️ **Corrosion:** Water + metals = rust, especially with stainless steel`,
    characteristicMasses: {
      masses: [18, 17, 16],
      description: 'Kühlwasser-Leck zeigt extrem dominantes H₂O-Signal (> 90% der Gesamtintensität), Druck stabilisiert bei 15-30 mbar (Sättigungsdampfdruck), alle anderen Gase unterdrückt.',
      descriptionEn: 'Cooling water leak shows extremely dominant H₂O signal (> 90% of total intensity), pressure stabilized at 15-30 mbar (saturation vapor pressure), all other gases suppressed.',
      ratios: [
        {
          formula: 'H₂O-Anteil',
          value: '> 90%',
          tolerance: 'Extrem dominant',
          significance: 'Wasser dominiert komplett, alle anderen Gase werden verdrängt',
          significanceEn: 'Water completely dominates, all other gases are displaced'
        },
        {
          formula: 'Totaldruck',
          value: '15 - 30 mbar',
          tolerance: 'Temperaturabhängig',
          significance: 'Stabilisiert beim Sättigungsdampfdruck: 20°C = 23.4 mbar, 25°C = 31.7 mbar',
          significanceEn: 'Stabilizes at saturation vapor pressure: 20°C = 23.4 mbar, 25°C = 31.7 mbar'
        },
        {
          formula: 'm/z 17 / m/z 18',
          value: '≈ 0.015 - 0.02',
          tolerance: 'Isotopenverhältnis',
          significance: 'OH⁺ Fragment von H₂O, typisch 1.5-2% von H₂O⁺',
          significanceEn: 'OH⁺ fragment from H₂O, typically 1.5-2% of H₂O⁺'
        },
        {
          formula: 'Andere Gase (N₂, O₂, etc.)',
          value: '< 5%',
          tolerance: 'Stark unterdrückt',
          significance: 'Wasser verdrängt alle anderen Gase, nur noch Spuren sichtbar',
          significanceEn: 'Water displaces all other gases, only traces visible'
        }
      ]
    },
    practicalExample: `**Szenario: Wassergekühlte UHV-Kammer mit Kühlspirale**
Sie schalten die Turbopumpe ein, aber der Druck sinkt nur auf 22 mbar und bleibt dort stabil. Das RGA zeigt fast nur H₂O.

**Gemessene Peaks (bei 22 mbar):**
- m/z 18 (H₂O): 0.94 (94% der Gesamtintensität!)
- m/z 17 (OH): 0.018
- m/z 28 (N₂): 0.015
- m/z 32 (O₂): 0.005
- m/z 2 (H₂): 0.008

**Diagnose-Analyse:**
1. **Totaldruck:** 22 mbar → Passt zu H₂O-Sättigungsdampfdruck bei 20°C (23.4 mbar) ✅
2. **H₂O-Anteil:** 94% der Gesamtintensität ✅
3. **OH/H₂O:** 0.018 / 0.94 = 0.019 (1.9%) → Typisch für H₂O ✅
4. **Andere Gase unterdrückt:** N₂ + O₂ nur 2% (normalerweise dominant) ✅

**Diagnose:** Kühlwasser-Leck (Confidence: 99%) - **NOTFALL!**

**Sofortmaßnahme:**
1. **SOFORT Turbopumpe STOPPEN** (Gefahr der Zerstörung!)
2. **SOFORT Vorpumpe isolieren** (Wasser darf nicht in Öl-Pumpe!)
3. Wasserversorgung ABSCHALTEN
4. Kammer fluten mit N₂`,
    practicalExampleEn: `**Scenario: Water-cooled UHV chamber with cooling coil**
You turn on the turbo pump, but pressure only drops to 22 mbar and remains stable there. The RGA shows almost only H₂O.

**Measured peaks (at 22 mbar):**
- m/z 18 (H₂O): 0.94 (94% of total intensity!)
- m/z 17 (OH): 0.018
- m/z 28 (N₂): 0.015
- m/z 32 (O₂): 0.005
- m/z 2 (H₂): 0.008

**Diagnosis analysis:**
1. **Total pressure:** 22 mbar → Fits H₂O saturation vapor pressure at 20°C (23.4 mbar) ✅
2. **H₂O fraction:** 94% of total intensity ✅
3. **OH/H₂O:** 0.018 / 0.94 = 0.019 (1.9%) → Typical for H₂O ✅
4. **Other gases suppressed:** N₂ + O₂ only 2% (normally dominant) ✅

**Diagnosis:** Cooling water leak (Confidence: 99%) - **EMERGENCY!**

**Immediate action:**
1. **IMMEDIATELY STOP turbo pump** (Risk of destruction!)
2. **IMMEDIATELY isolate backing pump** (Water must not enter oil pump!)
3. SHUT OFF water supply
4. Flood chamber with N₂`,
    recommendation: `**NOTFALL-PROTOKOLL:**

**1. SOFORT (erste 5 Minuten):**
- ⛔ **Turbopumpe STOPPEN** (läuft bei 22 mbar im Grenzbereich → Überlastung!)
- ⛔ **Vorpumpe isolieren** (Ventil schließen, sonst Wasser-Öl-Emulsion!)
- ⛔ **Wasserversorgung ABSCHALTEN** (alle Kühlkreisläufe!)
- ⛔ **Kammer belüften mit trockenem N₂** (verhindert weitere Kondensation)

**2. Schadensbegrenzung (erste Stunde):**
- Kammer öffnen und Wasser auslaufen lassen
- Alle Oberflächen mit trockenen Tüchern abwischen
- Mit Ethanol/IPA abwischen (bindet Restwasser)
- N₂-Gasstrom durchleiten (12-24h bei Raumtemperatur)

**3. Leck lokalisieren:**
- Visuell Kühlkanäle/Kühlspirale inspizieren
- Druckprobe mit N₂ am Kühlkreislauf (bei entfernter Kammer!)
- Kühlspirale mit Heliummassenlecksucher testen

**4. Sanierung (2-4 Wochen!):**
- Kühlspirale reparieren oder ersetzen
- **Intensiver Bakeout erforderlich:** 150-200°C für 48-72h
- Mehrfache RGA-Kontrolle (H₂O-Signal muss auf < 10% sinken)

**Prävention:**
- Kühlkreisläufe jährlich druckprüfen (vor dem Evakuieren!)
- Kühlwasser-Durchfluss überwachen (Durchflussmesser installieren)
- Redundante Dichtungen verwenden
- Erwägen Sie luftgekühlte Alternativen`,
    recommendationEn: `**EMERGENCY PROTOCOL:**

**1. IMMEDIATELY (first 5 minutes):**
- ⛔ **STOP turbo pump** (running at 22 mbar in critical range → overload!)
- ⛔ **Isolate backing pump** (close valve, otherwise water-oil emulsion!)
- ⛔ **SHUT OFF water supply** (all cooling circuits!)
- ⛔ **Vent chamber with dry N₂** (prevents further condensation)

**2. Damage control (first hour):**
- Open chamber and drain water
- Wipe all surfaces with dry cloths
- Wipe with ethanol/IPA (binds residual water)
- Flow N₂ gas through (12-24h at room temperature)

**3. Locate leak:**
- Visually inspect cooling channels/cooling coil
- Pressure test with N₂ on cooling circuit (with chamber removed!)
- Test cooling coil with helium mass leak detector

**4. Remediation (2-4 weeks!):**
- Repair or replace cooling coil
- **Intensive bakeout required:** 150-200°C for 48-72h
- Multiple RGA checks (H₂O signal must drop to < 10%)

**Prevention:**
- Pressure test cooling circuits annually (before evacuation!)
- Monitor cooling water flow (install flow meter)
- Use redundant seals
- Consider air-cooled alternatives`,
    validation: {
      confidence: 'high',
      sources: [
        {
          name: 'Engineering ToolBox - Water Vapor Saturation Pressure',
          url: 'https://www.engineeringtoolbox.com/water-vapor-saturation-pressure-d_599.html',
          type: 'standard'
        },
        {
          name: 'Engineering ToolBox - Water Evacuation Pressure',
          url: 'https://www.engineeringtoolbox.com/water-evacuation-pressure-temperature-d_1686.html',
          type: 'standard'
        },
        {
          name: 'Normandale - Effects of Humidity on Vacuum Systems',
          url: 'https://www.normandale.edu/academics/degrees-certificates/vacuum-and-thin-film-technology/articles/the-effects-of-humidity-on-vacuum-systems.html',
          type: 'manual'
        },
        {
          name: 'CRC Handbook of Chemistry and Physics - Water Vapor Pressure',
          type: 'standard'
        },
        {
          name: 'O\'Hanlon - User\'s Guide to Vacuum Technology (2003)',
          type: 'paper'
        }
      ]
    }
  }
]

export function CriteriaTab({ isGerman }: CriteriaTabProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedDiagnosis, setExpandedDiagnosis] = useState<DiagnosisType | null>(null)
  const [expandedDetailedDiagnosis, setExpandedDetailedDiagnosis] = useState<DiagnosisType | null>(null)

  // Group detectors by category
  const groupedDetectors = DETECTOR_REGISTRY.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = []
    }
    acc[entry.category].push(entry)
    return acc
  }, {} as Record<string, typeof DETECTOR_REGISTRY>)

  // Severity mapping for user-friendly display
  const getSeverityInfo = (priority: number, isGerman: boolean) => {
    if (priority >= 8) {
      return { label: isGerman ? 'Kritisch' : 'Critical', className: KPS.colors.dangerBadge }
    } else if (priority >= 5) {
      return { label: isGerman ? 'Warnung' : 'Warning', className: KPS.colors.warningBadge }
    } else if (priority >= 3) {
      return { label: 'Info', className: KPS.colors.infoBadge }
    } else {
      return { label: 'OK', className: KPS.colors.okBadge }
    }
  }

  // Quality checks - ALL 13 from src/lib/quality/index.ts
  const qualityChecks = [
    {
      name: 'H₂/H₂O Verhältnis',
      nameEn: 'H₂/H₂O Ratio',
      formula: 'H₂ > 5 × H₂O',
      description: 'Wasserstoff muss mindestens 5× größer als Wasser sein',
      descriptionEn: 'Hydrogen must be at least 5× greater than water',
    },
    {
      name: 'N₂/O₂ Verhältnis (Luftleck)',
      nameEn: 'N₂/O₂ Ratio (Air Leak)',
      formula: 'N₂/CO > 4 × O₂',
      description: 'N₂/CO muss mindestens 4× größer als O₂ sein (sonst Luftleck)',
      descriptionEn: 'N₂/CO must be at least 4× greater than O₂ (otherwise air leak)',
    },
    {
      name: 'Fragment-Konsistenz',
      nameEn: 'Fragment Consistency',
      formula: 'Peak(14) < Peak(16)',
      description: 'N-Fragment sollte kleiner als O-Fragment sein',
      descriptionEn: 'N-fragment should be smaller than O-fragment',
    },
    {
      name: 'Leichte Kohlenwasserstoffe',
      nameEn: 'Light Hydrocarbons',
      formula: 'Σ(39,41,43,45) < 0.1%',
      description: 'Summe der Massen 39, 41-43, 45 unter 0.1% des Gesamtdrucks',
      descriptionEn: 'Sum of masses 39, 41-43, 45 below 0.1% of total pressure',
    },
    {
      name: 'Schwere Kohlenwasserstoffe (Öl)',
      nameEn: 'Heavy Hydrocarbons (Oil)',
      formula: 'Σ(69,77) < 0.05%',
      description: 'Summe der Massen 69, 77 unter 0.05% des Gesamtdrucks',
      descriptionEn: 'Sum of masses 69, 77 below 0.05% of total pressure',
    },
    {
      name: 'Bakeout-Erfolg',
      nameEn: 'Bakeout Success',
      formula: 'Peak(2) > Peak(18)',
      description: 'Nach erfolgreichem Bakeout sollte H₂ dominieren',
      descriptionEn: 'After successful bakeout, H₂ should dominate',
    },
    {
      name: 'N₂ vs CO Unterscheidung',
      nameEn: 'N₂ vs CO Distinction',
      formula: 'Peak(14)/Peak(28) ≈ 0.07',
      description: 'Prüft ob Peak 28 hauptsächlich N₂ ist oder CO',
      descriptionEn: 'Checks if peak 28 is mainly N₂ or CO',
    },
    {
      name: 'Ar Doppelionisation',
      nameEn: 'Ar Double Ionization',
      formula: 'Peak(20)/Peak(40) ≈ 0.10-0.15',
      description: 'Ar²⁺ bei m/z 20 sollte 10-15% von Ar⁺ bei m/z 40 sein',
      descriptionEn: 'Ar²⁺ at m/z 20 should be 10-15% of Ar⁺ at m/z 40',
    },
    {
      name: 'HC-frei (DESY)',
      nameEn: 'HC-free (DESY)',
      formula: 'Σ(45-100) < 0.1%',
      description: 'Kohlenwasserstoffe (m/z 45-100) unter 0.1% des Gesamtdrucks',
      descriptionEn: 'Hydrocarbons (m/z 45-100) below 0.1% of total pressure',
    },
    {
      name: 'CO₂-Korrektur für m/z 28',
      nameEn: 'CO₂ Correction for m/z 28',
      formula: 'm28_korr = m28 - (m44 × 0.11)',
      description: 'CO₂ trägt ~11% zu m/z 28 bei (CO⁺ Fragment)',
      descriptionEn: 'CO₂ contributes ~11% to m/z 28 (CO⁺ fragment)',
    },
    {
      name: 'CH₄ vs O⁺ bei m/z 16',
      nameEn: 'CH₄ vs O⁺ at m/z 16',
      formula: 'CH₄: m15/m16 ≈ 0.85',
      description: 'CH₃⁺ bei m/z 15 ist sauberer CH₄-Indikator',
      descriptionEn: 'CH₃⁺ at m/z 15 is clean CH₄ indicator',
    },
    {
      name: 'NH₃ vs H₂O bei m/z 17',
      nameEn: 'NH₃ vs H₂O at m/z 17',
      formula: 'm17_excess = m17 - (m18 × 0.23)',
      description: 'H₂O → OH⁺ bei m/z 17 (~23%). Überschuss deutet auf NH₃',
      descriptionEn: 'H₂O → OH⁺ at m/z 17 (~23%). Excess indicates NH₃',
    },
    {
      name: 'CO-Beitrag (C⁺ Fragment)',
      nameEn: 'CO Contribution (C⁺ Fragment)',
      formula: 'Peak(12)/Peak(28)',
      description: 'C⁺ bei m/z 12 zeigt CO-Anteil. CO → C⁺ ~4.5%',
      descriptionEn: 'C⁺ at m/z 12 indicates CO contribution. CO → C⁺ ~4.5%',
    },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      {/* Introduction */}
      <div className={cn(KPS.cards.gradient, KPS.colors.intro)}>
        <h3 className={cn(KPS.typography.cardTitle, 'text-aqua-600 dark:text-aqua-400 mb-2')}>
          {isGerman ? 'Qualitäts- und Diagnosekriterien' : 'Quality & Diagnostic Criteria'}
        </h3>
        <p className={cn(KPS.typography.caption, 'leading-relaxed')}>
          {isGerman
            ? 'Wissenschaftliche Grundlagen für die automatische Spektrenauswertung: Qualitätsprüfungen basieren auf etablierten Verhältnissen (CERN, GSI, DESY). Die Diagnose-Algorithmen erkennen charakteristische Muster und klassifizieren Vakuumprobleme.'
            : 'Scientific foundations for automatic spectrum evaluation: Quality checks based on established ratios (CERN, GSI, DESY). Diagnostic algorithms detect characteristic patterns and classify vacuum problems.'}
        </p>
      </div>

      {/* Detaillierte Diagnosen (2 Beispiele) */}
      <section>
        <h3 className={KPS.typography.sectionTitle}>
          {isGerman ? '📖 Detaillierte Diagnosen' : '📖 Detailed Diagnoses'}
        </h3>
        <p className={cn(KPS.typography.captionMuted, 'mb-3')}>
          {isGerman
            ? 'Beispiele für detaillierte Diagnose-Dokumentation mit vollständiger wissenschaftlicher Validierung'
            : 'Examples of detailed diagnosis documentation with complete scientific validation'}
        </p>
        <div className={KPS.spacing.itemGap}>
          {DETAILED_DIAGNOSES.map((diagnosis) => {
            const isExpanded = expandedDetailedDiagnosis === diagnosis.type
            return (
              <div key={diagnosis.type} className="border border-subtle rounded-lg overflow-hidden">
                {/* Diagnosis Header - Clickable */}
                <button
                  onClick={() => setExpandedDetailedDiagnosis(isExpanded ? null : diagnosis.type)}
                  className="w-full px-4 py-3 bg-surface-hover hover:bg-surface-card transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{diagnosis.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-body font-semibold text-text-primary">
                          {isGerman ? diagnosis.name : diagnosis.nameEn}
                        </h3>
                        <span className={cn(
                          KPS.badges.base,
                          diagnosis.validation.confidence === 'high' ? KPS.colors.okBadge :
                          diagnosis.validation.confidence === 'medium' ? KPS.colors.infoBadge :
                          KPS.colors.warningBadge
                        )}>
                          {diagnosis.validation.confidence === 'high' ? (isGerman ? 'Hoch' : 'High') :
                           diagnosis.validation.confidence === 'medium' ? (isGerman ? 'Mittel' : 'Medium') :
                           (isGerman ? 'Niedrig' : 'Low')} Konfidenz
                        </span>
                      </div>
                      <p className="text-caption text-text-secondary">
                        {isGerman ? diagnosis.characteristicMasses.description : diagnosis.characteristicMasses.descriptionEn}
                      </p>
                    </div>
                    <span className="text-text-muted transition-transform" style={{
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}>
                      ▶
                    </span>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 py-4 space-y-4 bg-surface-card border-t border-subtle">
                    {/* Explanation */}
                    <div>
                      <h4 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-2">
                        <span>📖</span>
                        {isGerman ? 'Was ist das?' : 'What is it?'}
                      </h4>
                      <div className="text-caption text-text-secondary whitespace-pre-line leading-relaxed">
                        {isGerman ? diagnosis.explanation : diagnosis.explanationEn}
                      </div>
                    </div>

                    {/* Characteristic Masses + Ratios */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <h4 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-2">
                        <span>🔍</span>
                        {isGerman ? 'Charakteristische Signale' : 'Characteristic Signals'}
                      </h4>
                      <div className="space-y-2">
                        <div className="text-caption text-text-secondary mb-2">
                          <strong>{isGerman ? 'Massen:' : 'Masses:'}</strong> {diagnosis.characteristicMasses.masses.map(m => `m/z ${m}`).join(', ')}
                        </div>
                        <div className="space-y-2">
                          <strong className="text-caption text-text-primary">{isGerman ? 'Typische Verhältnisse:' : 'Typical ratios:'}</strong>
                          {diagnosis.characteristicMasses.ratios.map((ratio, idx) => (
                            <div key={idx} className="bg-surface-card rounded p-2 text-caption">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-mono text-text-primary font-medium">{ratio.formula}</div>
                                  <div className="text-micro text-text-muted">{isGerman ? ratio.significance : ratio.significanceEn}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono text-mint-600 font-semibold">{ratio.value}</div>
                                  <div className="text-micro text-text-muted">{ratio.tolerance}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Practical Example */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <h4 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-2">
                        <span>💡</span>
                        {isGerman ? 'Praktisches Beispiel' : 'Practical Example'}
                      </h4>
                      <div className="text-caption text-text-secondary whitespace-pre-line">
                        {isGerman ? diagnosis.practicalExample : diagnosis.practicalExampleEn}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-mint-500/10 border border-mint-500/20 rounded-lg p-3">
                      <h4 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-2">
                        <span>🔧</span>
                        {isGerman ? 'Empfehlung' : 'Recommendation'}
                      </h4>
                      <div className="text-caption text-text-secondary whitespace-pre-line">
                        {isGerman ? diagnosis.recommendation : diagnosis.recommendationEn}
                      </div>
                    </div>

                    {/* Sources */}
                    <div>
                      <h4 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-2">
                        <span>📚</span>
                        {isGerman ? 'Wissenschaftliche Quellen' : 'Scientific Sources'}
                      </h4>
                      <div className="space-y-2">
                        {diagnosis.validation.sources.map((source, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-caption">
                            <span className="text-text-muted flex-shrink-0">
                              {source.type === 'standard' && '📋'}
                              {source.type === 'paper' && '📄'}
                              {source.type === 'manual' && '📖'}
                              {source.type === 'validation' && '✅'}
                            </span>
                            {source.url ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-aqua-500 hover:text-aqua-400 hover:underline"
                              >
                                {source.name}
                              </a>
                            ) : (
                              <span className="text-text-secondary">{source.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Quality Checks - THE MOST IMPORTANT PART */}
      <section>
        <h3 className={KPS.typography.sectionTitle}>
          {isGerman ? '✓ Qualitätsprüfungen' : '✓ Quality Checks'}
        </h3>
        <p className={cn(KPS.typography.captionMuted, 'mb-3')}>
          {isGerman
            ? 'Automatische Prüfungen zur Beurteilung der Vakuumqualität basierend auf Peak-Verhältnissen'
            : 'Automatic checks to assess vacuum quality based on peak ratios'}
        </p>
        <div className={KPS.spacing.itemGapSmall}>
          {qualityChecks.map((check, i) => (
            <div key={i} className={cn(KPS.cards.mutedPadded, 'border-l-2 border-aqua-500')}>
              <div className={cn(KPS.layout.flexBetween, 'mb-1')}>
                <span className={KPS.typography.cardTitle}>
                  {isGerman ? check.name : check.nameEn}
                </span>
                <code className={cn(KPS.typography.mono, 'bg-aqua-500/10 text-aqua-600 dark:text-aqua-400 px-2 py-0.5 rounded font-semibold')}>
                  {check.formula}
                </code>
              </div>
              <p className={KPS.typography.captionMuted}>
                {isGerman ? check.description : check.descriptionEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Diagnoses by Category */}
      <section>
        <h3 className={KPS.typography.sectionTitle}>
          {isGerman ? '🔍 Diagnose-Datenbank' : '🔍 Diagnosis Database'} ({DETECTOR_REGISTRY.length})
        </h3>
        <p className={cn(KPS.typography.captionMuted, 'mb-3')}>
          {isGerman
            ? 'Alle automatischen Diagnosen nach Kategorie sortiert'
            : 'All automatic diagnoses sorted by category'}
        </p>
      <div className={KPS.spacing.itemGap}>
        {Object.entries(groupedDetectors).map(([categoryKey, detectors]) => {
          const category = CATEGORIES[categoryKey as keyof typeof CATEGORIES]
          if (!category) return null

          const isExpanded = expandedCategory === categoryKey

          return (
            <div key={categoryKey} className={KPS.cards.base}>
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
                className={cn(KPS.cards.interactiveFull, KPS.layout.flex, 'items-center gap-3 p-4')}
              >
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1 text-left">
                  <div className={cn(KPS.layout.flex, 'items-center gap-2')}>
                    <span className={KPS.typography.cardTitle}>
                      {isGerman ? category.name : category.nameEn}
                    </span>
                    <span className={cn(KPS.badges.base, 'bg-bg-secondary text-text-secondary')}>
                      {detectors.length}
                    </span>
                  </div>
                  <p className={cn(KPS.typography.captionMuted, 'mt-1')}>
                    {isGerman ? category.description : category.descriptionEn}
                  </p>
                </div>
                <span className={cn(KPS.interactions.expandIcon, isExpanded && KPS.interactions.expandIconRotated)}>
                  ▼
                </span>
              </button>

              {/* Diagnoses in Category */}
              {isExpanded && (
                <div className={cn(KPS.borders.subtleDivider, 'p-3 pt-0', KPS.spacing.itemGapSmall)}>
                  {detectors.map((entry) => {
                    const severityInfo = getSeverityInfo(entry.uiMetadata.priority, isGerman)
                    const isDiagnosisExpanded = expandedDiagnosis === entry.type

                    return (
                      <div key={entry.type} className={cn(KPS.cards.muted, 'overflow-hidden')}>
                        {/* Diagnosis Header */}
                        <button
                          onClick={() => setExpandedDiagnosis(isDiagnosisExpanded ? null : entry.type)}
                          className={cn(KPS.cards.interactiveFull, KPS.layout.flex, 'items-start gap-3 p-3')}
                        >
                          <span className="text-lg">{entry.uiMetadata.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className={cn(KPS.layout.flex, 'items-center gap-2')}>
                              <span className={KPS.typography.cardTitle}>
                                {isGerman ? entry.name : entry.nameEn}
                              </span>
                              <span className={cn(KPS.badges.base, severityInfo.className)}>
                                {severityInfo.label}
                              </span>
                              <span className={cn(KPS.interactions.expandIcon, 'text-xs', isDiagnosisExpanded && KPS.interactions.expandIconRotated)}>
                                ▼
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Diagnosis Details - ONLY USEFUL USER INFO */}
                        {isDiagnosisExpanded && (
                          <div className="px-3 pb-3 space-y-3">
                            {/* Description */}
                            <div>
                              <h4 className={cn(KPS.typography.subTitle, 'mb-1')}>
                                {isGerman ? 'Was ist das?' : 'What is it?'}
                              </h4>
                              <p className={KPS.typography.caption}>
                                {isGerman
                                  ? entry.validation.notes || 'Charakteristisches Muster im Massenspektrum'
                                  : entry.validation.notes || 'Characteristic pattern in mass spectrum'}
                              </p>
                            </div>

                            {/* Characteristic Masses */}
                            <div>
                              <h4 className={cn(KPS.typography.subTitle, 'mb-1')}>
                                {isGerman ? 'Charakteristische Massen' : 'Characteristic Masses'}
                              </h4>
                              <p className={KPS.typography.caption}>
                                {isGerman
                                  ? 'Typische Signale: variiert je nach Spektrum'
                                  : 'Typical signals: varies by spectrum'}
                              </p>
                            </div>

                            {/* Scientific Confidence (user-friendly) */}
                            <div>
                              <h4 className={cn(KPS.typography.subTitle, 'mb-1')}>
                                {isGerman ? 'Wissenschaftliche Basis' : 'Scientific Basis'}
                              </h4>
                              <div className={cn(KPS.layout.flex, 'items-center gap-2')}>
                                <span className={cn(
                                  KPS.badges.base,
                                  entry.validation.confidence === 'high' ? KPS.colors.okBadge :
                                  entry.validation.confidence === 'medium' ? KPS.colors.infoBadge :
                                  KPS.colors.warningBadge
                                )}>
                                  {entry.validation.confidence === 'high' ? (isGerman ? 'Hoch' : 'High') :
                                   entry.validation.confidence === 'medium' ? (isGerman ? 'Mittel' : 'Medium') :
                                   (isGerman ? 'Niedrig' : 'Low')}
                                </span>
                                <span className={KPS.typography.captionMuted}>
                                  {entry.validation.sources.length} {isGerman ? 'wissenschaftliche Quellen' : 'scientific sources'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      </section>
    </div>
  )
}
