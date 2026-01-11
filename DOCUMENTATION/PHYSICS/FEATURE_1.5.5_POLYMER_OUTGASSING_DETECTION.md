# FEATURE 1.5.5: Polymer Outgassing Detection

**Physics Documentation - FEATURE_1.5.5_POLYMER_OUTGASSING_DETECTION**

**Status:** ⚠️ Conditional Approval (polymer specificity critical issue identified)
**Implementation File:** [src/lib/diagnosis/detectors.ts:1694-1758](../../../src/lib/diagnosis/detectors.ts#L1694-L1758)
**Detector Function:** `detectPolymerOutgassing()`
**Cross-Validation:** [REVERSE_SPEC_detectPolymerOutgassing.md](../../../NextFeatures/REVERSE_SPEC_detectPolymerOutgassing.md)
**Last Updated:** 2026-01-11

---

## Deutsch (DE)

### Physikalisches Modell

**Ziel:** Erkennung von Wasser-dominierter Ausgasung ohne Luftleck-Signatur - typisch für hochleistungs-Polymere (PEEK, Kapton, Viton) in Vakuumsystemen.

**Schlüsselkonzept:** Wasser-dominierte Ausgasung wird durch hohe H₂O-Signale UND Abwesenheit von Luft-Indikatoren (N₂/O₂ und Ar) charakterisiert.

---

### 1. Wasser-Ausgasung (Water-Dominated Signature)

| Parameter | Symbol | Formel | Bereich | Quelle |
|-----------|--------|--------|---------|--------|
| **H₂O-Dominanz** | H₂O/N₂ | m18 > 2× m28 | >2× | Leybold Vacuum Fundamentals |
| **Wasser/OH-Verhältnis** | H₂O/OH⁺ | m18 / m17 | 3.5–5.0 | NIST Mass Spec Data Center |
| **Sauerstoff-Fragment** | O⁺ | m16 / m18 | 0.01–0.03 | NIST Water Fragmentation |
| **Normale Bedingung** | Referenz | — | — | 70 eV Elektronenstoß-Ionisation |

**Physik:**
- Hochleistungs-Polymere (PEEK, Kapton, Viton) sind hygroskopisch und absorbieren Feuchtigkeit aus der Atmosphäre
- Unter Vakuum wird diese Feuchte als H₂O desorbiert (reversibel)
- Typische Menge: 0.1–1.0% Gewicht (abhängig von Polymer und Lagerung)
- H₂O/OH-Verhältnis von 3.5–5.0 ist charakteristisch für 70 eV Elektronenstoß-Fragmentierung (NIST)

**Fragmentierungsmuster (70 eV EI):**
```
H₂O⁺ (m18, ~50%)  → m18 Hauptpeak
OH⁺  (m17, ~20%)  → m18/m17 = 2.5–4.0
O⁺   (m16, ~3%)   → m18/m16 = 33–100
H⁺   (m1, <1%)    → meist vernachlässigbar
```

---

### 2. Luftleck-Ausschluss (Air Leak Exclusion)

| Parameter | Formel | Normal (Luft) | Polymer | Quelle |
|-----------|--------|---------------|---------|--------|
| **N₂/O₂-Verhältnis** | m28/m32 | 3.7–4.0 | >4.5 | O'Hanlon User's Guide to Vacuum |
| **Argon-Anteil** | m40/total | ~0.93% | <0.5% | Standardatmosphären-Zusammensetzung |
| **Schwelle (N₂/O₂)** | Code: >4.5 | — | Air ausgeschlossen | Grok Review |

**Physik:**
- Trockene Luft hat N₂/O₂ ≈ 3.7 (Massenverhältnis), 3.8 (Molarverhältnis)
- Mit Fragmentierungseffekten bei 70 eV: effektives Verhältnis ≈ 3.7–4.0
- Code prüft m28/m32 > 4.5 → "Keine normale Luft"
- Argon ist Tracer für Atmosphärenlecks (1.2% in trockener Luft) → <0.5% bestätigt Ausschluss
- Kombination m28/m32 und Ar ist robuste Prüfung

---

### 3. Konfidenz-Berechnung

**Punkte-System:**
| Bedingung | Punkte | Kriterium |
|-----------|--------|-----------|
| **H₂O > 2× N₂** | +0.4 | m18 > 2 × m28 |
| **Kein Luftleck** | +0.2 | m28/m32 > 4.5 ODER m40 < 0.5% |
| **H₂O/OH im Bereich** | +0.2 | 3.5 ≤ m18/m17 ≤ 5.0 |
| **Summe** | 0.4–0.8 | — |
| **Schwelle (Approval)** | ≥0.5 | minConfidence |

**Interpretation:**
- Schwelle ist konservativ (≥0.5 von max. 0.8) → Falsch-Negative akzeptabel
- Typische Polymer-Ausgasung erreicht 0.6–0.8 Konfidenz
- "Info"-Schweregrad: Polymer-Ausgasung ist NORMAL, nicht alarmerregend

---

### 4. Betroffene Massen (Affected M/Z Values)

**Primär:** [16, 17, 18]
- m16: O⁺ (Sauerstoff-Fragment)
- m17: OH⁺ (Hydroxyl-Fragment)
- m18: H₂O⁺ (Wasser-Molekül-Ion)

**Optional (zukünftig):** [44] (CO₂) und [41, 43, 55, 57] (Kohlenwasserstoffe)
- Polymere geben oft CO₂ ab (m44/m18 ~ 0.05–0.1) → unterscheidet Polymer von unbaktem Stahl
- Kohlenwasserstoffe (m41, m43, etc.) sind weitere Polymer-Dekompositions-Marker

---

### 5. Kritisches Problem: Polymer vs. Unbaktes Stahl

**⚠️ KRITISCHE PROBLEMATIK:**

| Quelle | H₂O-Anteil | Signatur | Problem |
|--------|-----------|----------|---------|
| **PEEK/Kapton/Viton** | >90% (unbaked: ~0.3% Gewicht) | H₂O-dominant, keine Luft | **Detektierbar** ✅ |
| **Unbaktes Edelstahl** | >90% (unbaked: ~0.5% Gewicht) | H₂O-dominant, keine Luft | **IDENTISCH mit Polymer!** ⚠️ |
| **Baked Stahl** | <10% | Minimale H₂O | Unterscheidbar ✅ |

**Erkenntnis von Gemini:**
> "The logic detects **Water**, not specifically **Polymers**. Unbaked stainless steel also outgasses primarily H₂O (>90%). Function name implies specificity not implemented."

**Konsequenz:** Funktion heißt `detectPolymerOutgassing()`, aber detektiert generische Wasser-Ausgasung:
- ✅ Korrekt: Wasser-dominiert ohne Luft erkannt
- ❌ Falsch: Kann nicht zwischen Polymer und unbaktem Stahl unterscheiden
- ❌ Risiko: Nutzer denkt "Polymere vorhanden" → tatsächlich nur Stahl-Desorption

---

### 6. Lösungsmöglichkeiten (Gemini + Grok Consensus)

**OPTION A: Umbenennung (Einfach, aber weniger informativ)**
```typescript
export function detectWaterOutgassing(input: DiagnosisInput) {
  // title_de: "Wasser-Ausgasung (Polymer/Stahl)"
  // title_en: "Water Outgassing (Polymer/Steel)"
  // Acknowledge ambiguity in message
}
```

**OPTION B: Polymer-spezifische Marker hinzufügen (EMPFOHLEN)**

Zusätzliche Prüfungen zur Unterscheidung Polymer ↔ Stahl:

| Marker | Polymer | Unbaktes Stahl | Vorteil |
|--------|---------|-----------------|---------|
| **CO₂ (m44)** | m44/m18 ~ 0.05–0.1 | m44/m18 < 0.01 | Unterscheidung ✅ |
| **Kohlenwasserstoffe** | m41, m43, m55, m57 aktiv | <0.1% | Unterscheidung ✅ |
| **F-Spuren (m19, m20)** | Viton spezifisch | Nicht vorhanden | Viton-ID ✅ |

**Implementierung (pseudocode):**
```typescript
const m44 = getPeak(peaks, 44)    // CO₂
const m41 = getPeak(peaks, 41)    // Alkene
const m43 = getPeak(peaks, 43)    // Alkane

const hasPolymerMarkers =
  (m44 > 0 && m44/m18 > 0.02 && m44/m18 < 0.15) ||
  (m41 > minPeakHeight || m43 > minPeakHeight)

if (hasPolymerMarkers) {
  confidence += 0.2  // Starker Polymer-Beweis
  solution: "Polymer-Ausgasung - extended pumping oder Bakeout"
} else {
  solution: "Wasser-Ausgasung (Polymer oder unbaktes Stahl) - extended pumping"
}
```

---

### 7. Validierungsstatus (Cross-Validation)

| Aspekt | Gemini | Grok | Konsens |
|--------|--------|------|---------|
| **H₂O-dominant-Konzept** | ✅ Gültig | ✅ Gültig | ✅ Physik korrekt |
| **H₂O/OH-Verhältnis 3.5–5.0** | ✅ NIST korrekt | ✅ NIST ~4.7 | ✅ Gültig |
| **N₂/O₂ >4.5** | ✅ OK | ⚠️ Besser als >5 | ✅ Justiert auf >4.5 |
| **Ar <0.5%** | ✅ Korrekt | ✅ Korrekt | ✅ Gültig |
| **Polymer-Spezifität** | ❌ KRITISCH | ⚠️ Erwähnt | ❌ **KRITISCH** |

**Genehmigungsstatus:** ⚠️ **BEDINGT** (Gemini + Grok = Overall Conditional)
- Wasser-Detektion: Physik valide ✅
- Polymer-Spezifität: Fehlende Implementierung ❌

---

### 8. Empfohlene Verbesserungen

**MUSS korrigiert werden (vor Produktion):**
1. ❌ **Polymer-Spezifität** → Umbenennen ODER CO₂/Kohlenwasserstoff-Checks hinzufügen

**SOLLTE korrigiert werden (mittlere Priorität):**
2. ⚠️ **m16 (O⁺) Prüfung hinzufügen** → m18/m16 ~ 33–100 (vollständiges Muster)
3. ⚠️ **m44 (CO₂) Prüfung hinzufügen** → m44/m18 ~ 0.05–0.1 (Polymer-Marker)

**Könnte verbessert werden (optional):**
4. ✅ N₂/O₂-Schwelle bereits auf >4.5 justiert
5. 📋 H₂O/N₂-Schwelle auf >5× oder >10× erhöhen (bessere Spezifität)
6. 📋 Kohlenwasserstoff-Checks (m41, m43, m55, m57) hinzufügen
7. 📋 Viton-spezifische F/HF-Checks (m19, m20) für Fluorelastomere

---

### Quellen

- **Leybold Vacuum Fundamentals** — RGA-Grundlagen, Fragmentierungsmuster
- **O'Hanlon J.F.** (2003) "A User's Guide to Vacuum Technology" — N₂/O₂-Verhältnis in Luft
- **NIST Chemistry WebBook** — Wasser-Fragmentierungsmuster bei 70 eV
- **CERN Vacuum Group** — Polymer-Ausgasung und CO₂-Marker
- **NASA Outgassing Data** — Viton, PEEK, Kapton Absorptions- und Desorptions-Raten

---

---

## English (EN)

### Physical Model

**Goal:** Detection of water-dominated outgassing without air leak signature—typical of high-performance polymers (PEEK, Kapton, Viton) in vacuum systems.

**Key Concept:** Water-dominated outgassing is characterized by high H₂O signals AND absence of air indicators (N₂/O₂ and Ar).

---

### 1. Water Outgassing (Water-Dominated Signature)

| Parameter | Symbol | Formula | Range | Source |
|-----------|--------|---------|-------|--------|
| **Water Dominance** | H₂O/N₂ | m18 > 2× m28 | >2× | Leybold Vacuum Fundamentals |
| **Water/OH Ratio** | H₂O/OH⁺ | m18 / m17 | 3.5–5.0 | NIST Mass Spec Data Center |
| **Oxygen Fragment** | O⁺ | m16 / m18 | 0.01–0.03 | NIST Water Fragmentation |
| **Normal Condition** | Reference | — | — | 70 eV Electron Impact Ionization |

**Physics:**
- High-performance polymers (PEEK, Kapton, Viton) are hygroscopic and absorb moisture from atmosphere
- Under vacuum, this moisture desorbs as H₂O (reversible process)
- Typical amount: 0.1–1.0% by weight (depends on polymer and storage)
- H₂O/OH ratio of 3.5–5.0 is characteristic of 70 eV electron impact fragmentation (NIST)

**Fragmentation Pattern (70 eV EI):**
```
H₂O⁺ (m18, ~50%)  → m18 base peak
OH⁺  (m17, ~20%)  → m18/m17 = 2.5–4.0
O⁺   (m16, ~3%)   → m18/m16 = 33–100
H⁺   (m1, <1%)    → usually negligible
```

---

### 2. Air Leak Exclusion

| Parameter | Formula | Normal (Air) | Polymer | Source |
|-----------|---------|-------------|---------|--------|
| **N₂/O₂ Ratio** | m28/m32 | 3.7–4.0 | >4.5 | O'Hanlon User's Guide to Vacuum |
| **Argon Content** | m40/total | ~0.93% | <0.5% | Standard Atmosphere Composition |
| **Threshold (N₂/O₂)** | Code: >4.5 | — | Air excluded | Grok Review |

**Physics:**
- Dry air has N₂/O₂ ≈ 3.7 (mass ratio), 3.8 (molar ratio)
- With fragmentation effects at 70 eV: effective ratio ≈ 3.7–4.0
- Code checks m28/m32 > 4.5 → "Not normal air"
- Argon is tracer for atmospheric leaks (1.2% in dry air) → <0.5% confirms exclusion
- Combination of m28/m32 and Ar is robust check

---

### 3. Confidence Calculation

**Point System:**
| Condition | Points | Criterion |
|-----------|--------|-----------|
| **H₂O > 2× N₂** | +0.4 | m18 > 2 × m28 |
| **No Air Leak** | +0.2 | m28/m32 > 4.5 OR m40 < 0.5% |
| **H₂O/OH in Range** | +0.2 | 3.5 ≤ m18/m17 ≤ 5.0 |
| **Sum** | 0.4–0.8 | — |
| **Threshold (Approval)** | ≥0.5 | minConfidence |

**Interpretation:**
- Threshold is conservative (≥0.5 of max. 0.8) → False negatives acceptable
- Typical polymer outgassing achieves 0.6–0.8 confidence
- "Info" severity: Polymer outgassing is NORMAL, not alarming

---

### 4. Affected M/Z Values

**Primary:** [16, 17, 18]
- m16: O⁺ (oxygen fragment)
- m17: OH⁺ (hydroxyl fragment)
- m18: H₂O⁺ (water molecular ion)

**Optional (future):** [44] (CO₂) and [41, 43, 55, 57] (hydrocarbons)
- Polymers often release CO₂ (m44/m18 ~ 0.05–0.1) → distinguishes polymer from unbaked steel
- Hydrocarbons (m41, m43, etc.) are additional polymer decomposition markers

---

### 5. Critical Issue: Polymer vs. Unbaked Steel

**⚠️ CRITICAL PROBLEM:**

| Source | H₂O Content | Signature | Problem |
|--------|-----------|-----------|---------|
| **PEEK/Kapton/Viton** | >90% (unbaked: ~0.3% wt) | Water-dominant, no air | **Detectable** ✅ |
| **Unbaked Stainless Steel** | >90% (unbaked: ~0.5% wt) | Water-dominant, no air | **IDENTICAL to Polymer!** ⚠️ |
| **Baked Steel** | <10% | Minimal H₂O | Distinguishable ✅ |

**Finding from Gemini:**
> "The logic detects **Water**, not specifically **Polymers**. Unbaked stainless steel also outgasses primarily H₂O (>90%). Function name implies specificity not implemented."

**Consequence:** Function is named `detectPolymerOutgassing()`, but detects generic water outgassing:
- ✅ Correct: Water-dominated without air detected
- ❌ Wrong: Cannot distinguish polymer from unbaked steel
- ❌ Risk: User thinks "polymers present" → actually just steel desorption

---

### 6. Solution Options (Gemini + Grok Consensus)

**OPTION A: Rename Function (Simple, less informative)**
```typescript
export function detectWaterOutgassing(input: DiagnosisInput) {
  // title_de: "Wasser-Ausgasung (Polymer/Stahl)"
  // title_en: "Water Outgassing (Polymer/Steel)"
  // Acknowledge ambiguity in message
}
```

**OPTION B: Add Polymer-Specific Markers (RECOMMENDED)**

Additional checks to distinguish polymer ↔ steel:

| Marker | Polymer | Unbaked Steel | Advantage |
|--------|---------|---------------|-----------|
| **CO₂ (m44)** | m44/m18 ~ 0.05–0.1 | m44/m18 < 0.01 | Distinction ✅ |
| **Hydrocarbons** | m41, m43, m55, m57 active | <0.1% | Distinction ✅ |
| **F-Traces (m19, m20)** | Viton-specific | Not present | Viton ID ✅ |

**Implementation (pseudocode):**
```typescript
const m44 = getPeak(peaks, 44)    // CO₂
const m41 = getPeak(peaks, 41)    // Alkenes
const m43 = getPeak(peaks, 43)    // Alkanes

const hasPolymerMarkers =
  (m44 > 0 && m44/m18 > 0.02 && m44/m18 < 0.15) ||
  (m41 > minPeakHeight || m43 > minPeakHeight)

if (hasPolymerMarkers) {
  confidence += 0.2  // Strong polymer evidence
  solution: "Polymer outgassing - extended pumping or bakeout"
} else {
  solution: "Water outgassing (polymer or unbaked steel) - extended pumping"
}
```

---

### 7. Validation Status (Cross-Validation)

| Aspect | Gemini | Grok | Consensus |
|--------|--------|------|-----------|
| **Water-dominant Concept** | ✅ Valid | ✅ Valid | ✅ Physics correct |
| **H₂O/OH Ratio 3.5–5.0** | ✅ NIST correct | ✅ NIST ~4.7 | ✅ Valid |
| **N₂/O₂ >4.5** | ✅ OK | ⚠️ Better than >5 | ✅ Adjusted to >4.5 |
| **Ar <0.5%** | ✅ Correct | ✅ Correct | ✅ Valid |
| **Polymer Specificity** | ❌ CRITICAL | ⚠️ Mentioned | ❌ **CRITICAL** |

**Approval Status:** ⚠️ **CONDITIONAL** (Gemini + Grok = Overall Conditional)
- Water detection: Physics valid ✅
- Polymer specificity: Missing implementation ❌

---

### 8. Recommended Improvements

**MUST be corrected (before production):**
1. ❌ **Polymer Specificity** → Rename OR add CO₂/hydrocarbon checks

**SHOULD be corrected (medium priority):**
2. ⚠️ **Add m16 (O⁺) check** → m18/m16 ~ 33–100 (complete pattern)
3. ⚠️ **Add m44 (CO₂) check** → m44/m18 ~ 0.05–0.1 (polymer marker)

**Could be improved (optional):**
4. ✅ N₂/O₂ threshold already adjusted to >4.5
5. 📋 Increase H₂O/N₂ threshold to >5× or >10× (better specificity)
6. 📋 Add hydrocarbon checks (m41, m43, m55, m57)
7. 📋 Add Viton-specific F/HF checks (m19, m20) for fluoroelastomers

---

### Sources

- **Leybold Vacuum Fundamentals** — RGA basics, fragmentation patterns
- **O'Hanlon J.F.** (2003) "A User's Guide to Vacuum Technology" — N₂/O₂ ratio in air
- **NIST Chemistry WebBook** — Water fragmentation pattern at 70 eV
- **CERN Vacuum Group** — Polymer outgassing and CO₂ markers
- **NASA Outgassing Data** — Viton, PEEK, Kapton absorption and desorption rates

---

## Summary Table

| Feature | Validation | Status | Priority |
|---------|-----------|--------|----------|
| **Core Physics (H₂O detection)** | ✅ Both AIs | Valid | Ready |
| **Air Leak Exclusion** | ✅ Both AIs | Valid | Ready |
| **Fragmentation Pattern** | ✅ Both AIs | Valid | Ready |
| **Polymer vs Steel Distinction** | ❌ Critical Issue | Missing | CRITICAL |
| **Additional Markers (m16, m44)** | ⚠️ Recommended | Optional | MEDIUM |

**Overall Assessment:** Physics foundation is sound for water-dominated outgassing detection, but **function name implies polymer specificity that is not implemented**. Either rename function or add CO₂/hydrocarbon checks before production deployment.

