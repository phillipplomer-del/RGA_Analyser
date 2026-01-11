# Oil Backstreaming Detection - Scientific Basis / Wissenschaftliche Grundlagen

**Feature:** detectOilBackstreaming()
**Validation Status:** ⚠️ Conditional Approval (Gemini + Grok, 2026-01-11)
**Sources:** NIST Chemistry WebBook, Hiden Analytical, Pfeiffer Vacuum, Leybold, Kurt J. Lesker

---

## 🇬🇧 English Version

### Summary

The oil backstreaming detector identifies mineral oil contamination from forepumps and turbopumps by analyzing the characteristic Δ14 amu (mass unit) hydrocarbon fragmentation pattern at 70 eV electron impact ionization. The detector distinguishes between general hydrocarbon contamination and filters out PFPE (perfluorinated polyether) contaminants.

### Physical Model

#### Hydrocarbon Δ14 amu Series (Alkyl Cations)

Mineral oils and PAO (polyalphaolefin) lubricants contain linear and branched alkanes (C_n H_(2n+2)). Under 70 eV electron impact, these fragment into characteristic alkyl cations (C_n H_(2n+1)⁺) appearing at m/z values separated by 14 mass units.

**Detected m/z Values (Alkyl Series):**

| m/z | Ion | Composition | Typical Intensity |
|-----|-----|-------------|-------------------|
| 39 | C₃H₃⁺ | Propene cation | 2-5% |
| 41 | C₃H₅⁺ | Propyl cation | 5-10% |
| 43 | C₃H₇⁺ | Propyl cation (main) | 25-40% (base peak) |
| 55 | C₄H₇⁺ | Butyl cation | 8-15% |
| 57 | C₄H₉⁺ | Butyl cation (main) | 15-25% |
| 69 | C₅H₉⁺ | Pentyl cation | 5-12% |
| 71 | C₅H₁₁⁺ | Pentyl cation | 5-15% |
| 83 | C₆H₁₁⁺ | Hexyl cation | 2-8% |
| 85 | C₆H₁₃⁺ | Hexyl cation | 2-8% |

**Source:** NIST Chemistry WebBook - Electron Impact Ionization at 70 eV

**Pattern Recognition:**
- **Δ14 spacing:** Each consecutive pair (C_n ↔ C_{n+1}) is separated by 14 amu
- **Completeness:** ≥3 peaks required to confirm oil (confidence threshold)
- **Peak intensity pattern:** Follows general alkane fragmentation, with m/z 43 typically dominant

#### Key Diagnostic Ratios

**1. m57/m43 Ratio (Primary Oil Signature)**
- **Expected Range:** 0.6 - 1.0 (Typical alkane fragmentation)
- **Valid Tolerance:** 0.5 - 1.4 (Accommodates different oil types: mineral, PAO, ester)
- **Interpretation:** C₄H₉⁺ / C₃H₇⁺ ratio indicates hydrocarbon chain length distribution
- **Significance:** 40% confidence weight

**Rationale:** This ratio is relatively stable across different mineral oil types and distinguishes genuine hydrocarbons from other contaminants. The range 0.5-1.4 accommodates PAO oils (which trend higher) and mineral oils (which trend lower).

**Source:** Hiden Analytical Application Notes, NIST Mass Spectral Library

**2. m71/m43 Ratio (Hydrocarbon Complexity Indicator)**
- **Threshold:** >0.3 indicates heavier hydrocarbon presence
- **Interpretation:** C₅H₁₁⁺ / C₃H₇⁺ ratio suggests presence of C5+ alkanes
- **Current Implementation Limitation:** Cannot reliably distinguish "Turbopumpe" vs "Vorpumpe" oils (both PAO and mineral oil spectra overlap significantly)
- **Recommended Usage:** "Heavy Hydrocarbons" indicator rather than pump type

**Critical Validation Note:** Both Gemini and Grok AI validators confirmed that the m71/m43 threshold is **not scientifically reliable** for pump type differentiation. PAO oils (turbopumps) and mineral oils (forepumps) have overlapping spectra. This distinction requires additional information (chemical composition, not just fragmentation pattern).

**3. m/z 39 Check (Propene Cation - Completeness)**
- **Detection:** m/z 39 presence (even at low intensity)
- **Range:** Typically 2-5% of m43
- **Significance:** Confirms low-mass alkene/alkane fragmentation typical of oils
- **Confidence Weight:** 10%

#### Anti-Patterns & Exclusion Criteria

**PFPE (Fomblin) Exclusion:**
- **Pattern:** m69 > m43 AND m41 < threshold
- **Rationale:** PFPE has strong m/z 69 (CF₃⁺) but weak m/z 41 (no C₃H₅⁺ from fluorinated species)
- **Action:** Return null (separate PFPE detector handles Fomblin)

**Solvent Interference (Future Enhancement):**
- **Issue:** Short-chain solvents (heptane C₇, hexane C₆) match Δ14 pattern
- **Mitigation:** Optional check for m/z 99, 113 (true oil indicator)
- **Status:** Recommended for implementation (not yet included)

### Confidence Calculation

The detector combines the Δ14 pattern presence with ratio validation to reduce false positives:

```
Base Confidence = 0.0

Peak Detection:
  IF ≥3 peaks from [39,41,43,55,57,69,71,83,85] detected:  +37.5% (base)

Ratio Validation (each adds evidence):
  IF m57/m43 in [0.5, 1.4]:                                 +40%
  IF m71/m43 > 0.3:                                         +15%
  IF m39 detected:                                          +10%

Maximum Confidence = 100%
Threshold for Detection = 30% (≥3 peaks)

Severity Classification:
  - Confidence > 60%: Critical (heavy contamination)
  - Confidence 30-60%: Warning (moderate contamination)
```

**Example Scenarios:**
- 3 peaks detected, all ratios valid: 37.5 + 40 + 15 + 10 = 102.5% → capped at 100%, **CRITICAL**
- 3 peaks detected, only m57/m43 valid: 37.5 + 40 = 77.5%, **CRITICAL**
- 3 peaks detected, no ratios valid: 37.5%, **WARNING**

### Assumptions & Limitations

#### Assumptions
1. **70 eV Electron Impact:** Fragmentation patterns based on standard EI conditions
2. **Mineral Oil or PAO:** Detection optimized for these common lubricants
3. **No Background Correction:** Uses raw ion current without atmospheric normalization
4. **Single Ionization:** Assumes singly charged ions (M⁺ fragmentation)

#### Limitations
1. **Pump Type Ambiguity:** Cannot reliably distinguish turbopump vs forepump oil via simple ratios
2. **Solvent Confusion:** Short-chain solvents (C6-C8 alkanes) produce identical Δ14 pattern
3. **PDMS Interference:** Silicone oil (PDMS) has overlapping m/z 43, 57 fragments (not checked)
4. **No Quantification:** Detects presence only, does not estimate oil concentration or leak rate
5. **Argon Correction Missing:** Ratios not normalized for atmospheric air dilution

### Known Edge Cases

| Scenario | Effect | Mitigation |
|----------|--------|------------|
| **Cleaning solvent residue (heptane)** | False positive (Δ14 pattern match) | Add optional m99, m113 check |
| **PDMS contamination** | Overlapping peaks at m43, m57 | Feature 1.8.3 adds m/z 59 marker |
| **PFPE (Fomblin)** | m69 dominant, false positive risk | Exclusion logic: m69>m43 && m41<thr |
| **Pump type labeling** | "Turbopumpe" vs "Vorpumpe" unreliable | Rename to "Heavy Hydrocarbons" |
| **Low intensity oils** | May not reach ≥3 peak threshold | Reduce threshold in settings |

### Implementation Notes

**Current Code State (as of 2026-01-11):**

```typescript
// Oil mass pattern detection
const oilMasses = [41, 43, 55, 57, 69, 71, 83, 85]  // ⚠️ Missing m39
const detected = oilMasses.filter(m => getPeak(peaks, m) > threshold)

if (detected.length < 3) return null

// Core ratio check
const ratio_57_43 = m57 / m43
const ratioValid = ratio_57_43 >= 0.5 && ratio_57_43 <= 1.2  // ⚠️ Should extend to 1.4

// Pump type (NOT scientifically reliable)
let oilType = 'Vorpumpe'
if (m71/m43 > 0.4) oilType = 'Turbopumpe'  // ⚠️ Rename to "Heavy Hydrocarbons"

confidence = detected.length / 8
severity = confidence > 0.6 ? 'critical' : 'warning'
```

**Validation-Identified Issues:**

1. ⚠️ **m/z 39 Missing:** Add to oilMasses array: `[39, 41, 43, 55, 57, 69, 71, 83, 85]`
2. ⚠️ **m57/m43 Range:** Extend from [0.5-1.2] to [0.5-1.4] (Hiden Analytical data)
3. ⚠️ **Pump Type Labels:** Rename from "Turbopumpe"/"Vorpumpe" to "Heavy Hydrocarbons" (unreliable distinction)

**Optional Enhancements (Future):**
- Add m/z 99, 113 check for oil vs solvent (currently missing)
- Add PDMS anti-pattern (m/z 73, 147, 207)
- Weight confidence by peak intensity (not just count)
- Normalize for atmospheric air dilution

### Validation

**Cross-Validated by:** Gemini-3-Pro + Grok (January 2026)

**Result:** ⚠️ **CONDITIONAL APPROVAL**
- Δ14 amu pattern: ✅ Physically correct
- CₙH₂ₙ₊₁⁺ alkyl series: ✅ Valid at 70 eV EI
- m57/m43 ratio range: ✅ Correct (0.6-1.0 typical, 0.5-1.4 allowable)
- Fomblin exclusion: ✅ Logic correct
- **Pump type differentiation:** ❌ Not scientifically reliable (both AIs agree)

**Issues Requiring Fixes (Before Production):**
1. Rename pump type labels to "Heavy Hydrocarbons" (eliminates false specificity)
2. Update m57/m43 range documentation to 0.5-1.4
3. Add m/z 39 to detection pattern

**Recommended Future Enhancements:**
- Add m/z 99, 113 for oil vs solvent specificity
- Add PDMS interference checks
- Implement intensity-weighted confidence scoring

### References

**Primary Standards:**
- [NIST Chemistry WebBook](https://webbook.nist.gov/chemistry/) - EI fragmentation (70 eV) for alkanes
- Hiden Analytical Application Notes - "Identifying Pump Oil Backstreaming"
- Pfeiffer Vacuum Fundamentals - Oil contamination detection
- Leybold Vacuum Fundamentals - Turbopump oils vs rotary vane oils

**Fragmentation Data:**
- O'Hanlon, J.F. (2005) - *A User's Guide to Vacuum Technology* - Hydrocarbon EI patterns
- NIST Mass Spectral Library - Alkane fragmentation pathways

**Industry References:**
- Kurt J. Lesker - RGA Application Notes
- ASTM E2105 - Mass Spectrometry standards

---

## 🇩🇪 Deutsche Version

### Zusammenfassung

Der Ölrückströmungs-Detektor identifiziert Mineralölkontamination von Vor- und Turbopumpen durch Analyse des charakteristischen Δ14 amu (Masseneinheit) Kohlenwasserstoff-Fragmentierungsmusters bei 70 eV Elektronenstoß-Ionisierung. Der Detektor unterscheidet zwischen allgemeiner Kohlenwasserstoff-Kontamination und filtert PFPE-Kontaminanten (perfluorierte Polyether) heraus.

### Physikalisches Modell

#### Kohlenwasserstoff-Δ14 amu Serie (Alkyl-Kationen)

Mineralöle und PAO (Polyalphaolefin) Schmierstoffe enthalten lineare und verzweigte Alkane (C_n H_(2n+2)). Unter 70 eV Elektronenstoß fragmentieren diese in charakteristische Alkyl-Kationen (C_n H_(2n+1)⁺), die bei m/z-Werten mit 14 Masseneinheiten Abstand erscheinen.

**Detektierte m/z-Werte (Alkyl-Serie):**

| m/z | Ion | Zusammensetzung | Typische Intensität |
|-----|-----|-----------------|-------------------|
| 39 | C₃H₃⁺ | Propen-Kation | 2-5% |
| 41 | C₃H₅⁺ | Propyl-Kation | 5-10% |
| 43 | C₃H₇⁺ | Propyl-Kation (Hauptpeak) | 25-40% (Basispeak) |
| 55 | C₄H₇⁺ | Butyl-Kation | 8-15% |
| 57 | C₄H₉⁺ | Butyl-Kation (Hauptpeak) | 15-25% |
| 69 | C₅H₉⁺ | Pentyl-Kation | 5-12% |
| 71 | C₅H₁₁⁺ | Pentyl-Kation | 5-15% |
| 83 | C₆H₁₁⁺ | Hexyl-Kation | 2-8% |
| 85 | C₆H₁₃⁺ | Hexyl-Kation | 2-8% |

**Quelle:** NIST Chemistry WebBook - Elektronenstoß-Ionisierung bei 70 eV

**Mustererkennung:**
- **Δ14-Abstand:** Jedes aufeinanderfolgende Paar (C_n ↔ C_{n+1}) ist durch 14 amu getrennt
- **Vollständigkeit:** ≥3 Peaks erforderlich zur Bestätigung von Öl (Konfidenz-Schwellwert)
- **Peak-Intensitätsmuster:** Folgt allgemeiner Alkan-Fragmentierung mit m/z 43 typischerweise dominant

#### Charakteristische Diagnoseverhältnisse

**1. m57/m43-Verhältnis (Primäre Ölsignatur)**
- **Erwarteter Bereich:** 0.6 - 1.0 (Typische Alkan-Fragmentierung)
- **Gültige Toleranz:** 0.5 - 1.4 (Berücksichtigung verschiedener Öltypen: Mineralöl, PAO, Ester)
- **Interpretation:** C₄H₉⁺ / C₃H₇⁺ Verhältnis zeigt Kohlenwasserstoff-Kettenlängenverteilung
- **Bedeutung:** 40% Konfidenz-Gewichtung

**Begründung:** Dieses Verhältnis ist über verschiedene Mineralöltypen relativ stabil und unterscheidet echte Kohlenwasserstoffe von anderen Kontaminanten. Der Bereich 0.5-1.4 berücksichtigt PAO-Öle (tendenziell höher) und Mineralöle (tendenziell niedriger).

**Quelle:** Hiden Analytical Anwendungshinweise, NIST-Massenspektralbibliothek

**2. m71/m43-Verhältnis (Kohlenwasserstoff-Komplexitätsindikator)**
- **Schwellwert:** >0.3 zeigt Vorhandensein schwererer Kohlenwasserstoffe
- **Interpretation:** C₅H₁₁⁺ / C₃H₇⁺ Verhältnis deutet auf Vorhandensein von C5+ Alkanen hin
- **Aktuelle Implementierungslimitierung:** Kann "Turbopumpe" vs "Vorpumpe" Öle nicht zuverlässig unterscheiden (sowohl PAO- als auch Mineralöl-Spektren überlappen sich erheblich)
- **Empfohlene Verwendung:** "Schwere Kohlenwasserstoffe" Indikator statt Pumpentyp

**Kritische Validierungsmitteilung:** Beide KI-Validatoren (Gemini und Grok) bestätigten, dass der m71/m43-Schwellwert **nicht wissenschaftlich zuverlässig** für Pumpentyp-Differenzierung ist. PAO-Öle (Turbopumpen) und Mineralöle (Vorpumpen) haben überlappende Spektren. Diese Unterscheidung erfordert zusätzliche Informationen (chemische Zusammensetzung, nicht nur Fragmentierungsmuster).

**3. m/z 39 Prüfung (Propen-Kation - Vollständigkeit)**
- **Nachweis:** m/z 39 Vorhandensein (auch bei niedriger Intensität)
- **Bereich:** Typischerweise 2-5% von m43
- **Bedeutung:** Bestätigt Niedrigmassen-Alken/Alkan-Fragmentierung typischerweise für Öle
- **Konfidenz-Gewichtung:** 10%

#### Anti-Muster & Ausschlusskriterien

**PFPE (Fomblin) Ausschluss:**
- **Muster:** m69 > m43 UND m41 < Schwellwert
- **Begründung:** PFPE hat starkes m/z 69 (CF₃⁺) aber schwaches m/z 41 (kein C₃H₅⁺ aus fluorierten Spezies)
- **Aktion:** Return null (separater PFPE-Detektor behandelt Fomblin)

**Lösemittel-Interferenz (Zukünftige Verbesserung):**
- **Problem:** Kurzkettige Lösemittel (Heptan C₇, Hexan C₆) stimmen mit Δ14-Muster überein
- **Abhilfemaßnahme:** Optionale Prüfung für m/z 99, 113 (echter Öl-Indikator)
- **Status:** Empfohlen zur Implementierung (noch nicht enthalten)

### Konfidenz-Berechnung

Der Detektor kombiniert das Δ14-Mustervorkommen mit Ratio-Validierung zur Reduzierung von Falschalarmen:

```
Basis-Konfidenz = 0.0

Peak-Erkennung:
  WENN ≥3 Peaks aus [39,41,43,55,57,69,71,83,85] detektiert: +37.5% (Basis)

Verhältnis-Validierung (jede fügt Evidenz hinzu):
  WENN m57/m43 in [0.5, 1.4]:                              +40%
  WENN m71/m43 > 0.3:                                       +15%
  WENN m39 detektiert:                                      +10%

Maximale Konfidenz = 100%
Schwellwert für Erkennung = 30% (≥3 Peaks)

Schweregrad-Klassifikation:
  - Konfidenz > 60%: Kritisch (starke Kontamination)
  - Konfidenz 30-60%: Warnung (mäßige Kontamination)
```

**Beispielszenarien:**
- 3 Peaks detektiert, alle Verhältnisse gültig: 37.5 + 40 + 15 + 10 = 102.5% → begrenzt auf 100%, **KRITISCH**
- 3 Peaks detektiert, nur m57/m43 gültig: 37.5 + 40 = 77.5%, **KRITISCH**
- 3 Peaks detektiert, keine Verhältnisse gültig: 37.5%, **WARNUNG**

### Annahmen & Limitationen

#### Annahmen
1. **70 eV Elektronenstoß:** Fragmentierungsmuster basieren auf Standard-EI-Bedingungen
2. **Mineralöl oder PAO:** Erkennung optimiert für diese häufigen Schmierstoffe
3. **Keine Hintergrundkorrektur:** Verwendet rohe Ionenstromwerte ohne atmosphärische Normalisierung
4. **Einfache Ionisation:** Nimmt einfach geladene Ionen an (M⁺ Fragmentierung)

#### Limitationen
1. **Pumpentyp-Mehrdeutigkeit:** Kann Turbopumpen- vs Vorpumpen-Öl über einfache Verhältnisse nicht zuverlässig unterscheiden
2. **Lösemittel-Verwechslung:** Kurzkettige Lösemittel (C6-C8 Alkane) erzeugen identisches Δ14-Muster
3. **PDMS-Interferenz:** Silikonöl (PDMS) hat überlappende m/z 43, 57 Fragmente (nicht geprüft)
4. **Keine Quantifizierung:** Erkennt nur Vorhandensein, schätzt nicht Ölkonzentration oder Leckrate
5. **Argon-Korrektur Fehlend:** Verhältnisse nicht normalisiert für atmosphärische Luftverdünnung

### Bekannte Grenzfälle

| Szenario | Effekt | Gegenmaßnahme |
|----------|--------|---------------|
| **Lösemittelrückstände (Heptan)** | Falsch-positiv (Δ14-Mustermatch) | Optionale Prüfung m99, m113 hinzufügen |
| **PDMS-Kontamination** | Überlappende Peaks bei m43, m57 | Feature 1.8.3 fügt m/z 59 Marker hinzu |
| **PFPE (Fomblin)** | m69 dominant, Falsch-positiv-Risiko | Ausschlusslogik: m69>m43 && m41<thr |
| **Pumpentyp-Kennzeichnung** | "Turbopumpe" vs "Vorpumpe" unzuverlässig | Umbenennung zu "Schwere Kohlenwasserstoffe" |
| **Niedrige Ölintensität** | Kann ≥3-Peak-Schwellwert nicht erreichen | Schwellwert in Einstellungen reduzieren |

### Implementierungshinweise

**Aktueller Code-Status (Stand 2026-01-11):**

```typescript
// Ölmassen-Mustererkennung
const oilMasses = [41, 43, 55, 57, 69, 71, 83, 85]  // ⚠️ m39 fehlt
const detected = oilMasses.filter(m => getPeak(peaks, m) > threshold)

if (detected.length < 3) return null

// Kern-Verhältnis-Prüfung
const ratio_57_43 = m57 / m43
const ratioValid = ratio_57_43 >= 0.5 && ratio_57_43 <= 1.2  // ⚠️ Sollte auf 1.4 erweitert werden

// Pumpentyp (NICHT wissenschaftlich zuverlässig)
let oilType = 'Vorpumpe'
if (m71/m43 > 0.4) oilType = 'Turbopumpe'  // ⚠️ Umbenennung zu "Schwere Kohlenwasserstoffe"

confidence = detected.length / 8
severity = confidence > 0.6 ? 'critical' : 'warning'
```

**Von Validierung identifizierte Probleme:**

1. ⚠️ **m/z 39 Fehlt:** Zu oilMasses-Array hinzufügen: `[39, 41, 43, 55, 57, 69, 71, 83, 85]`
2. ⚠️ **m57/m43 Bereich:** Von [0.5-1.2] auf [0.5-1.4] erweitern (Hiden Analytical-Daten)
3. ⚠️ **Pumpentyp-Kennzeichnungen:** Von "Turbopumpe"/"Vorpumpe" auf "Schwere Kohlenwasserstoffe" umbenennen (unzuverlässige Unterscheidung)

**Optionale Verbesserungen (Zukünftig):**
- m/z 99, 113 Prüfung für Öl vs Lösemittel hinzufügen (derzeit fehlend)
- PDMS Anti-Muster hinzufügen (m/z 73, 147, 207)
- Konfidenz nach Peak-Intensität gewichten (nicht nur Zählung)
- Normalisierung für atmosphärische Luftverdünnung

### Validierung

**Cross-Validiert durch:** Gemini-3-Pro + Grok (Januar 2026)

**Ergebnis:** ⚠️ **BEDINGTE GENEHMIGUNG**
- Δ14 amu Muster: ✅ Physikalisch korrekt
- CₙH₂ₙ₊₁⁺ Alkyl-Serie: ✅ Gültig bei 70 eV EI
- m57/m43 Verhältnis-Bereich: ✅ Korrekt (0.6-1.0 typisch, 0.5-1.4 zulässig)
- Fomblin-Ausschluss: ✅ Logik korrekt
- **Pumpentyp-Differenzierung:** ❌ Nicht wissenschaftlich zuverlässig (beide KIs stimmen zu)

**Korrektionen erforderlich (vor Produktion):**
1. Pumpentyp-Kennzeichnungen zu "Schwere Kohlenwasserstoffe" umbenennen (eliminiert falsche Spezifizität)
2. m57/m43 Bereichsdokumentation auf 0.5-1.4 aktualisieren
3. m/z 39 zu Erkennungsmuster hinzufügen

**Empfohlene zukünftige Verbesserungen:**
- m/z 99, 113 für Öl vs Lösemittel Spezifizität hinzufügen
- PDMS-Interferenzprüfungen hinzufügen
- Intensitäts-gewichtete Konfidenz-Bewertung implementieren

### Referenzen

**Primäre Standards:**
- [NIST Chemistry WebBook](https://webbook.nist.gov/chemistry/) - EI-Fragmentierung (70 eV) für Alkane
- Hiden Analytical Anwendungshinweise - "Identifying Pump Oil Backstreaming"
- Pfeiffer Vacuum Fundamentals - Ölkontaminationserkennung
- Leybold Vacuum Fundamentals - Turbopumpen-Öle vs Drehschieber-Öle

**Fragmentierungsdaten:**
- O'Hanlon, J.F. (2005) - *A User's Guide to Vacuum Technology* - Kohlenwasserstoff-EI-Muster
- NIST-Massenspektralbibliothek - Alkan-Fragmentierungspfade

**Industriereferenzen:**
- Kurt J. Lesker - RGA-Anwendungshinweise
- ASTM E2105 - Massenspektrometrie-Standards

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Validation:** ⚠️ Conditional Approval (Gemini + Grok)
**Status:** Ready for Implementation (3 fixes required before production use)
