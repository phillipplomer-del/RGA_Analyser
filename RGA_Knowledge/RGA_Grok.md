# Zusammengefasste Auswertung der RGA-Spektren-Wissensdatenbank

Diese Markdown-Datei fasst die wesentlichen Inhalte der Vakuumphysik-Wissensdatenbank für die automatisierte Auswertung von RGA-Spektren in UHV-Kammern zusammen. Sie basiert auf einer tiefen Analyse von Herstellern (Pfeiffer, Inficon, Agilent, MKS) und Forschungseinrichtungen (CERN, GSI, DESY, ITER, ESRF). Die Zusammenfassung priorisiert Klarheit und Übertragbarkeit in Software (z. B. TypeScript), mit Fokus auf Massen-Bibliothek, Diagnose-Logik und Grenzwerte.

## 1. Massen-Bibliothek & Fragmentierungsmuster

### Kurze Übersicht
- **Relevante Massen**: m/z 1–100, mit Primärzuordnungen zu Gasen und Fragmenten.
- **Cracking Patterns**: Relative Verhältnisse zum Hauptpeak für Dekonvolution (z. B. Wasser: m/z 18=100%, 17=23–25%).
- **Isotope**: Berücksichtigung natürlicher Häufigkeiten (z. B. Ar-40=99,6%, Ar-36=0,34%).

### Zusammengefasste Tabelle der Massen-Zuordnungen

| m/z | Primäres Gas/Fragment | Häufige Fragmente/Isotope |
|-----|-----------------------|---------------------------|
| 1   | H⁺                   | Von H₂, H₂O              |
| 2   | H₂                   | Deuterium (0,015%)       |
| 4   | He                   | D₂                       |
| 12  | C⁺                   | Von CO, CO₂              |
| 14  | N⁺, CH₂⁺            | ¹⁴N (99,6%)              |
| 16  | O⁺, CH₄              | ¹⁶O (99,8%)              |
| 17  | OH⁺, NH₃             | -                        |
| 18  | H₂O                  | ¹⁸O (0,2%)               |
| 20  | Ar²⁺, Ne             | ²⁰Ne (90,5%)             |
| 28  | N₂, CO               | -                        |
| 32  | O₂                   | ¹⁶O₂                     |
| 36  | Ar-Isotop            | ³⁶Ar (0,34%)             |
| 40  | Ar                   | ⁴⁰Ar (99,6%)             |
| 44  | CO₂                  | -                        |
| 41,43,55,57 | Kohlenwasserstoff-Fragmente | Öl-Kontamination    |
| ... | (Vollständige Liste in detaillierter Version) | ...                  |

### Wichtige Cracking Patterns (Beispiele)
- **H₂O**: 18:100%, 17:23–25%, 16:1–2%.
- **N₂**: 28:100%, 14:7–15%.
- **O₂**: 32:100%, 16:11–22%.
- **CO₂**: 44:100%, 28:9–11%, 16:8–10%.
- **Ar**: 40:100%, 36:0,3%, 20:10–15%.
- **Kohlenwasserstoffe**: Periodische Peaks bei 41,43,55,57 (Δ14 amu).

Diese Patterns ermöglichen softwareseitige Trennung überlagerter Signale.

## 2. Diagnose-Logik & Fehlererkennung

### Kurze Übersicht
- **Signaturen**: Basierend auf Peak-Verhältnissen und Mustern für Lecks, Ausgasung usw.
- **Logik-Baum**: Strukturiert für Code-Implementierung (if-else).

### Zusammengefasste Diagnose-Schritte
- **Atmosphärenleck**: Ratio N₂/O₂ ≈3.7, Ar vorhanden. Logik: If I(28)/I(32) ∈ [3,4] && I(40)>0.
- **Virtuelles Leck**: Langsamer Druckanstieg >5×10⁻⁹ mbar/s, keine externe Reaktion.
- **Ausgasung**: H₂O-Dominanz (I(18)>80%), Abnahme bei Heizung.
- **Kohlenwasserstoff-Kontamination**: Peaks bei 41,43,55,57; Ratio zu H₂ >500.
- **Rückströmung Öl**: Plötzlicher Anstieg bei 43,55,57 korreliert mit Pumpen.
- **ESD-Artefakte**: Peaks verschwinden bei Energie-Änderung.

Implementiere als Decision Tree in TypeScript für automatisierte Analyse.

## 3. Grenzwerte & Akzeptanzkriterien

### Kurze Übersicht
- **Partialdrücke**: Strenge Limits nach Bakeout (z. B. H₂ <10⁻⁹ mbar).
- **Ratios**: Zu H₂ (CERN: CO/N₂ <10).

### Zusammengefasste Tabelle der Grenzwerte

| Gas   | CERN/GSI (mbar) | ITER (Pa·m³/s·m²) | Pfeiffer (mbar) |
|-------|-----------------|-------------------|-----------------|
| H₂   | <10⁻⁹          | <10⁻⁷            | <10⁻⁹          |
| H₂O  | <10⁻¹⁰         | <10⁻⁹            | <10⁻¹⁰         |
| CO/N₂| <10⁻⁹          | <10⁻⁹            | <10⁻⁹          |
| CO₂  | <10⁻¹⁰         | <10⁻⁹            | <10⁻¹⁰         |

- **Akzeptanz**: Basisdruck <10⁻⁷ mbar; Leck-Rate <10⁻¹⁰ Pa·m³/s.
- **Bakeout**: 24–48h bei 120–250°C für Sauberkeit.

Diese Werte dienen als Benchmarks für Software-Validierung.

---

# Detaillierte Survey der Vakuumphysik-Wissensdatenbank für RGA-Spektren

Diese umfassende Survey fasst und erweitert die Wissensdatenbank basierend auf Quellen von führenden Herstellern und Forschungseinrichtungen. Sie dient als Grundlage für eine Backend-Logik in Software zur automatisierten RGA-Auswertung. Die Struktur folgt den drei geforderten Bereichen, mit Betonung auf praktische Implementierbarkeit. Alle Daten stammen aus technischen Dokumenten (z. B. Pfeiffer RGA-Handbücher, CERN Bakeout-Reports) und sind für UHV-Systeme (Ultra-High Vacuum) optimiert.

## Einleitung und Hintergrund
Restgasanalyse (RGA) in UHV-Kammern ist entscheidend für die Identifikation von Verunreinigungen, Lecks und Ausgasungsprozessen. RGA-Geräte (z. B. Quadrupol-Massenspektrometer von Pfeiffer PrismaPro oder Inficon Transpector) messen Partialdrücke von Gasen bei m/z 1–100. Die Software-Logik muss Cracking Patterns nutzen, um überlagerte Signale zu dekonvolieren, Diagnosen zu stellen und Akzeptanz zu prüfen. Basierend auf CERNs RGA-Tutorials und GSI-Vacuum-Tests variieren Patterns leicht mit Elektronenenergie (typ. 70 eV), daher Kalibrierung empfohlen.

## 1. Detaillierte Massen-Bibliothek & Fragmentierungsmuster
Die Bibliothek listet m/z-Werte mit Zuordnungen, Fragmenten und Isotopen. Cracking Patterns (aus Hiden Analytical und Bastiman-Blogs, validiert durch CERN) sind relativ zum Hauptpeak und ermöglichen Algorithmen zur Gassentrennung (z. B. Least-Squares-Fit).

### Erweiterte Massen-Tabelle
Die Tabelle erfasst primäre und sekundäre Zuordnungen, inklusive Isotopenhäufigkeiten aus NIST-Daten.

| m/z | Primäres Gas/Fragment | Mögliche Andere | Isotope/Häufigkeit |
|-----|-----------------------|-----------------|-------------------|
| 1   | H⁺ (von H₂, H₂O, Hydrocarbons) | - | - |
| 2   | H₂ | Deuterium | ²H: 0,015% |
| 3   | HD | - | - |
| 4   | He | D₂ | - |
| 5–11 | Seltene Fragmente (z. B. B aus Bor) | - | - |
| 12  | C⁺ (CO, CO₂) | CH₄-Frag. | ¹²C: 98,9% |
| 13  | CH⁺ | - | ¹³C: 1,1% |
| 14  | N⁺, CH₂⁺ | CO²⁺ | ¹⁴N: 99,6% |
| 15  | CH₃⁺ | NH₂⁺ | - |
| 16  | O⁺, CH₄ | CO⁺⁺ | ¹⁶O: 99,8% |
| 17  | OH⁺, NH₃ | - | - |
| 18  | H₂O | NH₄⁺ | ¹⁸O: 0,2% |
| 19  | F⁺, H₃O⁺ | - | ¹⁹F: 100% |
| 20  | Ar²⁺, Ne | HF | ²⁰Ne: 90,5% |
| 21–27 | Hydrocarbon-Frag. (C₂Hₓ) | CN⁺, HCN | - |
| 28  | N₂, CO, C₂H₄ | - | ²⁸N₂: 99,3% |
| 29  | C₂H₅⁺ | ¹⁵N | ¹⁵N: 0,4% |
| 30  | C₂H₆, NO | SiH₂ | - |
| 31  | CH₃O⁺, P⁺ | SiH₃ | ³¹P: 100% |
| 32  | O₂ | S, CH₃OH | ³²S: 95% |
| 33–34 | HS⁺, H₂S | PHₓ, ¹⁸O₂ | ³⁴S: 4,2% |
| 35–37 | Cl⁺, HCl | - | ³⁵Cl: 75,8%, ³⁷Cl: 24,2% |
| 36,38,40 | Ar-Isotope | - | ³⁶Ar: 0,34%, ³⁸Ar: 0,06%, ⁴⁰Ar: 99,6% |
| 41–44 | C₃Hₓ⁺, CO₂ | Öl, C₃H₈ | - |
| 45–46 | C₂H₅O⁺, C₂H₅OH | NO₂ | - |
| 47–54 | Halogene, Hydrocarbons | CH₂Cl, C₄H₆ | ⁵⁴Fe: 5,8% |
| 55–58 | C₄H₇⁺, C₄H₉⁺, C₃H₆O | Öl, Ni⁺ | ⁵⁸Ni: 68,1% |
| 59–63 | Seltene Frag. | Halogene | ⁶³Cu: 69,2% |
| 64–68 | SO₂, Zn⁺ | - | ⁶⁴Zn: 48,6% |
| 69–70 | CF₃⁺ (Fomblin), Cl₂ | Ga⁺ | ⁶⁹Ga: 60,1% |
| 71–78 | Aromaten (Benzol) | BCl₃ | - |
| 79–84 | Br⁺, Kr-Isotope | - | ⁷⁹Br: 50,7%, ⁸⁴Kr: 57% |
| 85–86 | CClF₂⁺ (Freon), Kr-Isotop | SiF₃ | ⁸⁶Kr: 17,3% |
| 87–99 | Rb⁺, Zr⁺, Halogene | Xe-Isotope | - |
| 100 | Seltene Frag. | - | - |

### Vollständige Cracking Patterns
Patterns aus kombinierten Quellen (Pfeiffer, CERN, SRS Vacuum Diagnosis). Implementiere als Lookup-Objekte.

- **H₂**: 2:100%, 1:2–10%.
- **He**: 4:100%.
- **CH₄**: 16:100%, 15:80–86%, 14:15–21%, 13:8–11%, 12:3–4%.
- **NH₃**: 17:100%, 16:80%, 15:7–8%.
- **Ne**: 20:100%, 22:10%.
- **N₂**: 28:100%, 14:7–15%, 29:0,7–0,8%.
- **CO**: 28:100%, 12:4–5%, 16:0,9–2%.
- **C₂H₆**: 28:100%, 27:33%, 30:26%, 26:23%.
- **O₂**: 32:100%, 16:11–22%, 34:0,4–0,8%.
- **Ar**: 40:100%, 20:10–15%, 36:0,3–0,34%, 38:0,06%.
- **CO₂**: 44:100%, 28:9–11%, 16:8–10%, 12:4–5%.
- **C₃H₈**: 29:100%, 28:59%, 27:42%, 44:28%.
- **C₃H₆O (Aceton)**: 43:100%, 58:27%, 15:12%.
- **C₂H₅OH**: 31:100%, 45:34–52%, 29:23%.
- **C₆H₆ (Benzol)**: 78:100%, 52:19%, 51:19%.
- **H₂S**: 34:100%, 32:42%, 33:21%.
- **Öl-Kontamination**: 57:100%, 43:73%, 55:73%, 41:50%, 69:30% (periodisch Δ14).

Weitere Patterns für HF, HCl, SO₂ etc. in Quellen verfügbar. In Software: Nutze Matrix-Inversion für Dekonvolution.

## 2. Diagnose-Logik & Fehlererkennung
Diagnose basiert auf Signaturen aus Lesker RGA-Interpretation und CERN-Tutorials. Strukturiert als Logik-Bäume für programmierbare Entscheidungen.

### Detaillierter Logik-Baum
- **Start**: Peak-Scan und Ratio-Berechnung.
- **Atmosphärenleck**:
  - Hohe I(28) und I(32), Ratio 3.5–4.
  - Ar (40) ≈1% von N₂.
  - Code: if (3 < I28/I32 < 4.5 && I40/I28 ≈0.01) → Leck; Helium-Test bestätigen.
- **Virtuelles Leck**:
  - Verzögerter Anstieg, ähnlich Luft-Peaks.
  - Code: if (DruckΔ >5e-9 && !HeliumReaktion && ZeitDelay >10min) → Virtuell.
- **Ausgasung**:
  - H₂O (18)>80%, H₂ (2) hoch, Abnahme bei Bakeout.
  - Untertypen: Wasser (neue Teile), H₂ (Metalle).
  - Code: if (I18/total >0.8 && DruckAbnahmeBeiHeiz) → Ausgasung.
- **Kohlenwasserstoff-Kontamination**:
  - Gruppen-Peaks (41,43,55,57,69), Δ14 amu.
  - Hohe Massen >44, Ratio >H₂*500.
  - Code: count = PeaksIn[39-45,53-59]; if (count>3 && I>44 / I2 >500) → Kontamination.
- **Rückströmung Vorpumpenöl**:
  - Plötzlich Öl-Peaks (43:73%,55:73%,57:100%).
  - Korrelation mit Pumpen-Zyklus.
  - Code: if (Anstieg && I57 hoch && PumpKorr) → Rückströmung.
- **Ghost Peaks/ESD**:
  - Unzuordbare Peaks >45, energieabhängig.
  - Code: if (PeaksVerschwindenBeiEChange && !GasMatch) → Artefakt.

Fehlerbehandlung: Unbekannte → Manuelle Analyse flaggen. Integriere Zeitverläufe für dynamische Diagnose.

## 3. Grenzwerte & Akzeptanzkriterien
Aus CERN Vacuum Acceptance Criteria, ITER Handbook und Pfeiffer-Empfehlungen. Nach Bakeout (120–250°C, 24–48h) gelten strenge Limits für Partialdrücke und Ratios.

### Erweiterte Grenzwert-Tabellen

#### Partialdrücke (mbar)

| Gas         | CERN        | GSI/DESY    | ITER (Outgassing Pa·m³/s·m²) | Pfeiffer/MKS |
|-------------|-------------|-------------|------------------------------|--------------|
| H₂         | <1×10⁻⁹   | <1×10⁻⁹   | <1×10⁻⁷                     | <1×10⁻⁹    |
| H₂O        | <1×10⁻¹⁰  | <1×10⁻¹⁰  | <1×10⁻⁹                     | <1×10⁻¹⁰   |
| CO/N₂      | <1×10⁻⁹   | <1×10⁻⁹   | <1×10⁻⁹                     | <1×10⁻⁹    |
| CO₂        | <1×10⁻¹⁰  | <1×10⁻¹⁰  | <1×10⁻⁹                     | <1×10⁻¹⁰   |
| CH₄        | <1×10⁻¹⁰  | <1×10⁻¹⁰  | <1×10⁻¹⁰                    | <1×10⁻¹⁰   |
| Ar         | <1×10⁻¹¹  | <1×10⁻¹¹  | -                            | <1×10⁻¹¹   |
| Hydrocarbons (>44) | <1×10⁻¹² | <1×10⁻¹² | <1×10⁻¹⁰                  | <1×10⁻¹²   |

#### Ratio-Kriterien (zu H₂, CERN/GSI)

| Bereich     | Ratio-Limit |
|-------------|-------------|
| 3–20 amu (außer H₂O) | <10    |
| m/z 28 (CO/N₂) | <10     |
| m/z 21–32  | <100    |
| m/z 44 (CO₂) | <20    |
| m/z >45    | <10.000 |

- **Gesamtkriterien**: Basisdruck <1×10⁻⁷ mbar; Leck-Rate <1×10⁻¹⁰ Pa·m³/s; Outgassing <1×10⁻⁷ Pa·m³/s·m².
- **Hersteller-Spezifika**: Pfeiffer: Keine Ar-Spuren nach Bakeout; MKS: RGA-Normalisierung zu N₂.
- **Bakeout-Reports**: CERN LHC-Tests zeigen Abnahme von H₂O um 2–3 Ordnungen; ITER priorisiert H-Isotope.

In Software: Threshold-Checks implementieren, z. B. function validate(partials: Record<string, number>): boolean { ... }.

## Implementierungsempfehlungen
- **TypeScript-Beispiel für Patterns**: const patterns = { H2O: {18:100, 17:23} };
- **Dekonvolution**: Nutze math.js für Regression.
- **Diagnose**: DecisionTreeClassifier-ähnlich.
- **Grenzprüfung**: Vergleichsfunktionen mit Alerts.

Diese Survey deckt alle Aspekte ab und ist erweiterbar durch weitere Quellen.

## Key Citations
- CERN RGA Tutorial Interpretation: https://indico.cern.ch/event/565314/contributions/2285748/attachments/1467497/2273709/RGA_tutorial-interpretation.pdf
- Hiden Analytical Cracking Patterns: https://www.hidenanalytical.com/tech-data/cracking-patterns/
- Bastiman Leak Detection: https://faebianbastiman.wordpress.com/2014/02/12/mbe-maintenance-leak-detection/
- CERN Vacuum Acceptance Criteria: https://indico.cern.ch/event/765714/contributions/3178599/attachments/1736680/2848639/VSC_Criteria_for_Vacuum_Acceptance_Tests.pdf
- ITER Vacuum Handbook: https://www.iter.org/sites/default/files/media/2024-04/iter_vacuum_handbook.pdf
- SRS Vacuum Diagnosis: https://www.thinksrs.com/downloads/pdfs/applicationnotes/Vac_diag_RGA.pdf
- Lesker RGA Interpretation: https://www.lesker.com/newweb/technical_info/vacuumtech/rga_03_simpleinterpret.cfm