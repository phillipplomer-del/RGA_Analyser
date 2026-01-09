# Feature 1.5.6 "Erweiterte Öl-Diagnose" - VERWORFEN

**Status:** ❌ Nicht implementiert - wissenschaftlich nicht valide
**Datum:** 2026-01-09
**Grund:** Web-Recherche ergab, dass die Spec-Anforderungen wissenschaftlich nicht haltbar sind

---

## Original-Spec aus RGA_APP_VERBESSERUNGEN.md

Die Spec schlug vor, drei verschiedene Öl-Typen anhand von RGA-Spektren zu unterscheiden:

1. **Mineralöl (leicht)**: m/z 57, 71, 85 (C₄H₉⁺, C₅H₁₁⁺, C₆H₁₃⁺)
2. **Diffusionspumpen-Öl**: m/z 27, 39, 55 (C₂H₃⁺, C₃H₃⁺, C₄H₇⁺)
3. **Turbo-Pumpen Backing-Öl**: m/z 57, 71, 129 + **"FOMBLIN, Santovac"**

---

## Kritische Probleme gefunden

### Problem 1: FOMBLIN-Kategorisierungs-Fehler ❌

**Behauptung:** FOMBLIN ist ein "Turbo-Pumpen Backing-Öl" mit Kohlenwasserstoff-Pattern

**Realität:**
- FOMBLIN = **Perfluoropolyether (PFPE)**, KEIN Kohlenwasserstoff
- Typisches RGA-Pattern: **CF₃⁺ bei m/z 69** (fluoriert!)
- Völlig anderes Fragmentierungsmuster als Mineralöle

**Beweis:**
- Kurt Lesker: ["FOMBLIN® Z PFPE Lubricants"](https://www.lesker.com/newweb/fluids/fomblin-specialty-pfpe-z-lubricant/)
- PMC: ["High Resolution Mass Spectrometry of Polyfluorinated Polyether"](https://pmc.ncbi.nlm.nih.gov/articles/PMC4723628/)

**Bereits korrekt implementiert:**
- `detectFomblinContamination()` in [detectors.ts:219](../src/lib/diagnosis/detectors.ts#L219)
- Prüft m/z 69 (CF₃⁺), 20, 31, 47, 50
- Anti-Pattern: KEINE Alkyl-Peaks (41, 43, 57)

---

### Problem 2: Öl-Typ-Unterscheidung nicht wissenschaftlich belegt ❌

**Behauptung:** Man kann Mineralöl, Diffusionspumpen-Öl, und Backing-Öl unterscheiden

**Realität nach Literatur-Recherche:**

RGAs erkennen **generelle Kohlenwasserstoff-Kontamination**, aber:
- Alle Mineralöle/Kohlenwasserstoff-Öle zeigen **Δ14 amu Pattern** (CH₂-Verlust)
- Typische Peaks: **41/43, 55/57, 69/71, 83/85, 97/99**
- **KEINE zuverlässige Typ-Unterscheidung** zwischen verschiedenen Kohlenwasserstoff-Ölen

**Zitat Kurt Lesker (Advanced RGA Interpretation):**
> "The document does not provide information distinguishing between different oil types (mineral oil, synthetic oils, etc.) based on RGA spectra. It identifies hydrocarbon presence generally but doesn't address comparative analysis of specific oil chemistries."

**Quellen:**
- [Kurt Lesker - Advanced RGA Spectra Interpretation](https://de.lesker.com/newweb/technical_info/vacuumtech/rga_04_advanceinterpret.cfm)
- [Hiden Analytical - Mass Spectral Fragments of Hydrocarbons](https://www.hidenanalytical.com/wp-content/uploads/2016/08/hydrocarbon_fragments-1-1.pdf)
- [Mass Spectrometry Molecular Fingerprinting of Mineral/Synthetic Oils](https://pubmed.ncbi.nlm.nih.gov/36916159/)

**Was wissenschaftlich validiert ist:**
- ✅ Kohlenwasserstoff-Kontamination generell erkennen (Δ14 amu Pattern)
- ✅ Schweregrad beurteilen (Anzahl Peaks, Intensität)
- ❌ Spezifischen Öl-Typ bestimmen (nicht zuverlässig)

---

### Problem 3: Existierender Detektor bereits wissenschaftlich korrekt ✅

**Bereits implementiert:** `detectOilBackstreaming()` in [detectors.ts:135](../src/lib/diagnosis/detectors.ts#L135)

**Was der Detektor macht:**
- Prüft Δ14 amu Pattern: m/z **41, 55, 69, 83, 97**
- Mindestens 3 Peaks erforderlich für Diagnose
- Konfidenz steigt mit Anzahl Peaks
- Severity: `critical` wenn ≥4 Peaks

**Basiert auf validierter Wissenschaft:**
- Hiden Analytical Cracking Patterns
- Kurt Lesker RGA Interpretation Guides
- MKS Residual Gas Analysis Documentation

---

## Verwerfungsentscheidung

**Feature 1.5.6 wird NICHT implementiert**, weil:

1. **FOMBLIN-Fehler:** Die Spec kategorisiert FOMBLIN falsch (ist bereits korrekt als separater Detektor implementiert)

2. **Pseudo-Präzision:** Behauptung, verschiedene Kohlenwasserstoff-Öle unterscheiden zu können, ist wissenschaftlich nicht belegt

3. **Bereits implementiert:** `detectOilBackstreaming()` macht das Richtige - erkennt Kohlenwasserstoff-Kontamination ohne irreführende Typ-Behauptungen

4. **User-Interesse:** Wissenschaftliche Validität > Feature-Count. User kommt aus dem Vakuum-Bereich und validiert kritisch.

---

## Alternative: Was man stattdessen tun KÖNNTE (nicht umgesetzt)

Falls zukünftig gewünscht - **nur Schweregrad-Bewertung** des existierenden Detektors erweitern:

```typescript
// Hypothetische Erweiterung (NICHT implementiert)
if (peakCount >= 5 && maxIntensity > 0.5) {
  severity = 'critical'  // Massive Öl-Kontamination
  recommendation = 'Diffusionspumpe sofort prüfen, Kammer intensiv reinigen, Pumpe warten'
} else if (peakCount >= 4) {
  severity = 'warning'   // Schwere Kontamination
  recommendation = 'Pumpe prüfen, Cold Trap einsetzen, Kammer reinigen'
} else if (peakCount >= 3) {
  severity = 'warning'   // Moderate Kontamination
  recommendation = 'Cold Trap prüfen, Pumpenhintergrund checken'
}
```

**Aber:** Aktueller Detektor ist bereits gut kalibriert, keine Änderung nötig.

---

## Lessons Learned

**Positive Auswirkungen der Validierung:**
1. ✅ Helium-Leck-Indikator wurde von quantitativ → qualitativ korrigiert (1.5.5)
2. ✅ Öl-Diagnose-Feature wurde als pseudowissenschaftlich identifiziert (1.5.6)
3. ✅ User-Vertrauen durch wissenschaftliche Sorgfalt gestärkt

**Prozess für zukünftige Features:**
- **Immer Web-Recherche VOR Implementierung** bei wissenschaftlichen Features
- Herstellerangaben kritisch hinterfragen
- Peer-reviewed Literatur bevorzugen
- Bei Unsicherheit: User (Domänenexperte) einbeziehen

---

## Referenzen (vollständig)

**Öl-Kontamination allgemein:**
- [Hiden Analytical - RGA Series](https://www.hidenanalytical.com/products/residual-gas-analysis/rga-series/)
- [SRS - Vacuum Diagnosis with RGA (PDF)](https://www.thinksrs.com/downloads/pdfs/applicationnotes/Vac_diag_RGA.pdf)
- [MKS - Residual Gas Analysis](https://www.mks.com/n/residual-gas-analysis)
- [Kurt Lesker - RGA Spectra by AMU](https://www.lesker.com/newweb/technical_info/vacuumtech/rga-spectra-amu-guide.cfm)
- [Kurt Lesker - Advanced RGA Interpretation](https://de.lesker.com/newweb/technical_info/vacuumtech/rga_04_advanceinterpret.cfm)

**Kohlenwasserstoff-Fragmentierung:**
- [Hiden Analytical - Mass Spectral Fragments of Hydrocarbons (PDF)](https://www.hidenanalytical.com/wp-content/uploads/2016/08/hydrocarbon_fragments-1-1.pdf)
- [Hiden Analytical - Cracking Patterns](https://www.hidenanalytical.com/tech-data/cracking-patterns/)
- [PubMed - Mass Spectrometry Fingerprinting of Mineral/Synthetic Oils](https://pubmed.ncbi.nlm.nih.gov/36916159/)

**FOMBLIN/PFPE:**
- [Kurt Lesker - FOMBLIN Z PFPE Lubricants](https://www.lesker.com/newweb/fluids/fomblin-specialty-pfpe-z-lubricant/)
- [PMC - High Resolution Mass Spectrometry of PFPE](https://pmc.ncbi.nlm.nih.gov/articles/PMC4723628/)
- [Syensqo - FOMBLIN PFPE FAQ](https://www.syensqo.com/en/brands/fomblin-pfpe-lubricants/faq)

**Diffusionspumpen-Öle:**
- [Fusor Forums - RGA Spectrum Oil Backstreaming Discussion](https://fusor.net/board/viewtopic.php?t=14250)
- [Semitracks - Residual Gas Analysis Reference](https://www.semitracks.com/reference-material/failure-and-yield-analysis/failure-analysis-package-level/residual-gas-analysis.php)

---

**Fazit:** Feature 1.5.6 ist wissenschaftlich nicht valide und wird nicht implementiert. Existierender `detectOilBackstreaming()` Detektor ist korrekt und ausreichend.
