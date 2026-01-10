# Scientific References - RGA Analyser

> **Purpose:** This file consolidates all peer-reviewed scientific sources, standards organizations, and validated references used in the RGA Analyser application. Use this as the primary reference for validating isotope ratios, gas properties, and diagnostic algorithms.

**Statistics:**
- **Total Sources:** 65 URLs (Leybold, NASA, CERN, NIST, CIAAW, PubMed, IUPAC, USGS)
- **Coverage:** Isotope standards, RGA applications, vacuum kinetics, method validation
- **Last Updated:** 2026-01-10 (Argon section expanded with Lee 2006, IUPAC 2014, USGS sources)

---

## 🤖 Auto-Update Protocol for AI Assistants

**CRITICAL:** This is a **living reference collection**, NOT an exhaustive limit. Always search beyond this file.

**MANDATORY BEHAVIOR:** When performing research tasks related to RGA analysis, gases, isotopes, or vacuum diagnostics:

1. **Start here, but don't stop here** - Consult this file for existing validated data
2. **Always perform additional WebSearch** - Even if data exists, search for:
   - More recent studies (2024-2026)
   - Alternative perspectives
   - Updated standards (NIST/CIAAW revisions)
3. **Auto-append new sources** - Add discovered URLs to the relevant section using the existing format
4. **Update statistics** - Increment the "Total Sources" counter at the top
5. **Validation required** - Only add peer-reviewed, manufacturer-official, or standards-body sources
6. **Log changes** - Add entry to Changelog section at bottom

**Example workflow:**
```
User: "What's the ¹⁸O abundance in water?"
Assistant:
1. ✅ Check SCIENTIFIC_REFERENCES.md first (finds NIST O data)
2. ✅ Perform WebSearch ANYWAY (finds newer IAEA 2025 standard)
3. ✅ Use both sources, prioritize newer data
4. ✅ Add IAEA 2025 reference to file
5. ✅ Update counter: 53 → 54 sources
6. ✅ Add changelog entry
```

**Key Principle:** This file grows with every research session. Treat it as a **curated starting point**, not a boundary.

---

## 🔬 Isotope Data - Primary Standards

### NIST (National Institute of Standards and Technology)

**Official Authority for Isotopic Data**

| Resource | URL | Content |
|----------|-----|---------|
| NIST Physics Reference Data | https://physics.nist.gov/PhysRefData/Handbook/Tables/argontable1_a.htm | Atomic weights, isotopic compositions for all elements |
| NIST Chemistry WebBook | https://webbook.nist.gov | Mass spectra database, molecular properties, ionization energies |
| Atomic Compositions Database | https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=O | Isotopic abundances for specific elements (O, Ar, Cl, etc.) |

**What's there:**
- ✅ Official isotopic abundances (Ar, O, N, C, S, Si, Cl)
- ✅ Natural abundance variations and uncertainties
- ✅ Reference mass spectra for 50,000+ compounds
- ✅ Atomic masses to 10+ significant figures

---

### CIAAW (Commission on Isotopic Abundances and Atomic Weights)

**International Authority on Atomic Weights**

| Resource | URL | Content |
|----------|-----|---------|
| Argon Atomic Weight | https://ciaaw.org/argon.htm | Standard atomic weight, isotopic composition |
| Chlorine Atomic Weight | https://ciaaw.org/chlorine.htm | ³⁵Cl/³⁷Cl ratio, SMOC standard (0.319627) |
| Nitrogen Atomic Weight | https://ciaaw.org/nitrogen.htm | ¹⁴N/¹⁵N natural abundance |
| Oxygen Atomic Weight | https://ciaaw.org/oxygen.htm | ¹⁶O/¹⁷O/¹⁸O terrestrial abundances |

**What's there:**
- ✅ IUPAC-endorsed atomic weights (updated 2023)
- ✅ Isotopic composition ranges for natural materials
- ✅ Standard reference materials (SMOC for Cl)
- ✅ Historical data and revisions

---

### USGS (United States Geological Survey)

| Resource | URL | Content |
|----------|-----|---------|
| Isotope Tracers - Argon | https://wwwrcamnl.wr.usgs.gov/isoig/period/ar_iig.html | Terrestrial Ar isotope ratios |
| Isotope Tracers - Chlorine | https://wwwrcamnl.wr.usgs.gov/isoig/period/cl_iig.html | Cl isotope geochemistry |

**What's there:**
- ✅ Geochemical isotope data
- ✅ Terrestrial vs. atmospheric ratios
- ✅ Historical measurements (Nier 1950, Lee 2006)

---

## 📊 Validated Isotope Ratios (App Implementation)

### Argon - Air Leak Detection

**Implemented:** ⁴⁰Ar/³⁶Ar = 295.5 (Nier 1950)
**Updated Value:** ⁴⁰Ar/³⁶Ar = 298.56 ± 0.31 (Lee 2006, CIAAW 2007) → **Feature 1.8.4 planned**

| Source | Year | Value | Method |
|--------|------|-------|--------|
| Nier | 1950 | 295.5 ± 0.5 | Mass spectrometry (historical) |
| Lee et al. | 2006 | 298.56 ± 0.31 | High-precision IRMS with gravimetric calibration |
| CIAAW | 2007 | 298.56(31) | Recommended consensus value |
| NIST | 2024 | 99.600% (⁴⁰Ar), 0.337% (³⁶Ar) | Current isotopic abundances |

**Status:** ✅ Fully Validated (1% deviation negligible for RGA, but update planned for scientific correctness)

**Methodology (Lee et al. 2006):**
- Gravimetrically prepared mixtures of highly enriched ³⁶Ar and ⁴⁰Ar
- Dynamic isotope ratio mass spectrometry with special gas handling to avoid fractionation
- 38% more precise than Nier (1950): ±0.31 vs. ±0.5
- Also measured ³⁸Ar/³⁶Ar = 0.1885 ± 0.0003

**Application in RGA:**
- Air leak detection: Atmospheric Ar has constant ⁴⁰Ar/³⁶Ar ≈ 298.6
- Distinguishes air contamination from other Ar sources (process gases, sputtering)
- Tolerance: ±5% typical for RGA measurements (covers 1% update)

**References:**
- Lee et al. (2006) - [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0016703706018679) / [ADS Abstract](https://ui.adsabs.harvard.edu/abs/2006GeCoA..70.4507L) - "A redetermination of the isotopic abundances of atmospheric Ar"
- CIAAW (2007) - [CIAAW Argon](https://ciaaw.org/argon.htm) - Official recommendation n(⁴⁰Ar)/n(³⁶Ar) = 298.56(31)
- NIST - [Physics Reference Data](https://physics.nist.gov/PhysRefData/Handbook/Tables/argontable1_a.htm) - Atomic weights and isotopic compositions
- IUPAC Technical Report (2014) - [De Gruyter](https://www.degruyterbrill.com/document/doi/10.1515/pac-2013-0918/html) - "Variation in the terrestrial isotopic composition and atomic weight of argon"
- USGS Isotope Tracers - [Argon Geochemistry](https://wwwrcamnl.wr.usgs.gov/isoig/period/ar_iig.html)

---

### Chlorine - Solvent Identification

**Implemented:** ³⁵Cl/³⁷Cl = 3.13

| Source | Standard | Value | Notes |
|--------|----------|-------|-------|
| CIAAW | SMOC | 3.13 (75.77%/24.23%) | Standard Mean Ocean Chloride |
| NIST | - | 3:1 ratio characteristic | MS pattern recognition |

**Status:** ✅ Valid

**Reference:**
- https://chem.libretexts.org/Bookshelves/Analytical_Chemistry/An_Introduction_to_Mass_Spectrometry_(Van_Bramer)/06:_INTERPRETATION/6.04:_Isotope_Abundance
- Excellent MS interpretation guide for Cl isotope patterns

---

### Nitrogen - N₂ vs CO Distinction

**Implemented:** ¹⁴N/¹⁵N → ²⁸N₂/²⁹N₂ = 142.9

| Source | Abundance | Notes |
|--------|-----------|-------|
| CIAAW | ¹⁴N: 99.632%, ¹⁵N: 0.368% | Natural abundance |
| Atmospheric N₂ | δ¹⁵N = 0 ‰ | Reference standard |

**Status:** ✅ Valid

**Reference:**
- https://stableisotopefacility.ucdavis.edu/tips-nitrogen-n2-andor-nitrous-oxide-n2o-gas
- UC Davis Stable Isotope Facility - authoritative guide

---

### Carbon - CO₂ Isotope Analysis

**Implemented:** ¹³C = 1.07% → CO₂ ⁴⁴/⁴⁵ = 83.6

| Source | Abundance | Application |
|--------|-----------|-------------|
| NIST | ¹²C: 98.93%, ¹³C: 1.07% | Universal organic marker |
| NOAA | CO₂ isotope standards | Climate research |

**Status:** ✅ Valid

**Reference:**
- https://gml.noaa.gov/education/isotopes/mass_spec.html
- NOAA tutorial on isotope-ratio mass spectrometry

---

### Oxygen - O₂ Isotope Pattern

**Implemented:** O₂ ³²/³⁴ = 487 (¹⁶O¹⁸O)

| Source | Abundance | Notes |
|--------|-----------|-------|
| NIST | ¹⁶O: 99.757%, ¹⁸O: 0.205% | Atomic abundances |
| Molecular | ³²O₂ ≈ 99.5%, ³⁴O₂ ≈ 0.4% | Molecular combinations |

**Status:** ✅ Valid

**Reference:**
- https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=O
- NIST atomic weights and isotopic compositions

---

### Silicon - Silicone Contamination

**Implemented:** ²⁸Si/²⁹Si = 19.7

| Source | Abundance | Application |
|--------|-----------|-------------|
| NIST | ²⁸Si: 92.22%, ²⁹Si: 4.69%, ³⁰Si: 3.09% | PDMS detection |
| PMC6589419 | High-precision data | Reference sample |

**Status:** ✅ Valid

**Reference:**
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6589419/
- Absolute isotopic abundance ratios for Si

---

### Sulfur - S vs O₂ Distinction

**Implemented:** ³²S/³⁴S = 22.5

| Source | Abundance | Application |
|--------|-----------|-------------|
| NIST | ³²S: 94.99%, ³⁴S: 4.25% | Distinguishes S from O₂ at m/z 32 |

**Status:** ✅ Valid

---

## 🔬 Peer-Reviewed RGA Applications

### Fusion Research - Deuterium/Tritium Monitoring

**H₂/D₂/T Isotope Ratio Measurements in Tokamaks**

| Institution | Application | Validation | Precision |
|-------------|-------------|------------|-----------|
| JET (UK) | Fuel cycle monitoring | Cross-validated with neutral particle analyzers | ±1-2% |
| ASDEX-Upgrade (Germany) | Ammonia detection (ND₃) | Spectroscopy correlation | ±2% |
| Tore Supra (France) | Isotopic exhaust monitoring | H₂/D₂ exhaust measurements | ±1-2% |

**Key Reference:**
- **ScienceDirect - Vacuum Journal (2017)**
- "Detection of ammonia by residual gas analysis in AUG and JET"
- URL: https://www.sciencedirect.com/science/article/abs/pii/S0920379617305811
- **Content:** RGA isotope ratio measurements in fusion reactors, validated against independent diagnostics

---

### Medical Diagnostics - ¹³CO₂ Breath Tests

**Helicobacter pylori Diagnosis via RGA**

| Application | Method | Validation | Precision |
|-------------|--------|------------|-----------|
| ¹³CO₂ breath tests | RGA mass spectrometry | ICOS spectroscopy | ±0.5-1% |
| Pre-diabetes screening | ¹³C-glucose breath test | High-res ICOS | ±1% |

**Key Reference:**
- **PubMed 24566134**
- "Residual gas analyzer mass spectrometry for human breath analysis"
- URL: https://pubmed.ncbi.nlm.nih.gov/24566134/
- **Content:** RGA validated for ¹³CO₂ enrichment measurements, cross-checked with optical ICOS

---

### Environmental Analysis - N₂O Isotopologues

**Position-Specific ¹⁵N Analysis**

| Application | Masses | Method | Precision |
|-------------|--------|--------|-----------|
| N₂O isotopologue analysis | m/z 44, 45, 46, 30, 31 | IRMS | ±0.5% |
| Nitrification/Denitrification | α vs β nitrogen position | Fragment analysis (NO⁺) | ±1% |

**Key References:**
- **Analytical Chemistry (2000)**
- "Determination of Nitrogen Isotopomers of Nitrous Oxide on a Modified Isotope Ratio Mass Spectrometer"
- URL: https://pubs.acs.org/doi/10.1021/ac9904563

- **UC Davis Stable Isotope Facility**
- URL: https://stableisotopefacility.ucdavis.edu/tips-nitrogen-n2-andor-nitrous-oxide-n2o-gas
- **Content:** Practical guide for N₂ and N₂O isotope analysis

---

## 🚀 Advanced Isotope Applications (Emerging)

### Deuterium (D₂) and HD

**Fusion Research Applications**

| Resource | Content | Application |
|----------|---------|-------------|
| **Hiden Analytical - H₂/D₂ Analysis** | https://www.hidenanalytical.com/applications/gas-analysis/hydrogen-deuterium-and-tritium-analyses/ | Quadrupole MS for D/H separation, LoMASS series |
| **DOE SRNL - Detection Limit Study** | https://energy.gov/sites/prod/files/2015/05/f22/150505%20SRNL%20Detection%20Limit%20of%20H%20&%20D%20for%20Tritium%20Process%20R&D%20-%20Xin%20Xiao.pdf | Detection limit ~10⁻⁴ (100 ppm) for D/H in RGA |
| **ScienceDirect - Fusion Engineering** | https://www.sciencedirect.com/science/article/abs/pii/S1387380623000167 | Quantitative H/D/T analysis by low-resolution quadrupole MS |

**What's there:**
- ✅ Precision requirements: ±1-2% achievable
- ✅ Challenges: H₂/HD/D₂ separation, exchange reactions in SS cylinders
- ✅ Applications: Tritium handling, fuel cycle monitoring

---

### N₂O (Nitrous Oxide)

**Biogeochemical Applications**

| Resource | Content |
|----------|---------|
| **PubMed 12876691** | Position-dependent ¹⁵N and ¹⁸O measurements in N₂O |
| **JGR Atmospheres (2003)** | Complete isotope analysis of tropospheric N₂O |

**What's there:**
- ✅ m/z 44, 45, 46 for N₂O⁺ isotopologues
- ✅ m/z 30, 31 for NO⁺ fragment (distinguishes from CO₂)
- ⚠️ **Challenge:** m/z 44 overlaps with CO₂ - requires fragment analysis

---

### Silicon Isotopes & PDMS Contamination

**Silicone Detection**

| Resource | Content |
|----------|---------|
| **Springer - DART-MS Analysis** | https://link.springer.com/article/10.1007/s13361-014-1042-5 | PDMS oligomer screening, characteristic peaks: **m/z 59, 73, 147** |
| **Hiden SIMS Application** | https://www.hidenanalytical.com/applications/surface-analysis/contamination-with-silicone/ | Monolayer detection of silicone contamination |
| **RSC - MC-ICP-MS** | https://pubs.rsc.org/en/content/articlelanding/2006/ja/b600933f | High-precision Si isotope ratios |

**What's there:**
- ✅ **NEW:** m/z 59 is critical PDMS marker (C₃H₇Si⁺ or C₂H₇OSi⁺)
- ✅ Adjacent peak separation: 74.02 ± 0.03 amu (SiO(CH₃)₂)
- ✅ Si isotope ratios: ²⁸Si/²⁹Si = 19.7 for Si confirmation

---

## ⚙️ Method Validation & Limitations

### Quadrupole RGA vs. High-Resolution IRMS

| Aspect | Quadrupole RGA | High-Res IRMS | Reference |
|--------|----------------|---------------|-----------|
| **Precision** | ±5-10% | ±0.5-1% | - |
| **Resolution** | Unit mass | R > 10,000 | Can separate ²⁸Si¹⁶O¹⁸O⁺ from ³⁰Si¹⁶O¹⁶O⁺ |
| **Detection Limit (D/H)** | 10⁻⁴ (100 ppm) | 10⁻⁶ | DOE SRNL report |
| **Speed** | Real-time | Minutes per sample | - |
| **Cost** | $20-50k | $200-500k | - |
| **Application** | Vacuum diagnostics | Climate research, stable isotopes | - |

**Key Insight:**
- Quadrupole RGA is **practical** for real-time vacuum diagnostics
- IRMS is **reference method** for highest precision

**Sources:**
- Wikipedia - Isotope-ratio mass spectrometry
- Various instrument manufacturer specs

---

## 📚 General RGA References

### Manufacturer Documentation

| Source | URL | Content |
|--------|-----|---------|
| **Pfeiffer Vacuum** | https://www.pfeiffer-vacuum.com/global/en/applications/residual-gas-analysis/ | RGA fundamentals, cracking patterns, sensitivity factors |
| **MKS Instruments** | https://www.mks.com/n/residual-gas-analysis | Application notes, leak detection methods |
| **Hiden Analytical** | https://www.hidenanalytical.com | Quadrupole MS technology, H₂/D₂ analysis |

---

### Academic Institutions

| Institution | Resource | Content |
|-------------|----------|---------|
| **CERN** | Vacuum technical notes | UHV requirements, bakeout criteria |
| **UC Davis Stable Isotope Facility** | https://stableisotopefacility.ucdavis.edu | Isotope analysis best practices |
| **NOAA GML** | https://gml.noaa.gov | CO₂ isotope standards |

---

### Literature Databases

| Database | URL | Usage |
|----------|-----|-------|
| **PubMed** | https://pubmed.ncbi.nlm.nih.gov | Medical/biological applications of RGA |
| **ScienceDirect** | https://www.sciencedirect.com | Engineering/physics RGA papers |
| **Science.gov** | https://www.science.gov/topicpages/g/gas+analysis+rga | US government RGA research |

---

## 🔄 How to Use This File

### For Validation

1. **Check isotope ratios:** Compare app values against NIST/CIAAW columns
2. **Find precision requirements:** See "Method Validation" section
3. **Lookup gas properties:** Reference peer-reviewed applications

### For Implementation

1. **New gases:** Check "Emerging Applications" for D₂, HD, N₂O data
2. **Cracking patterns:** Use NIST WebBook URLs
3. **Sensitivity factors:** Reference manufacturer documentation

### For Research

1. **PubMed IDs provided** - Direct access to papers
2. **DOIs included** - Permanent scholarly links
3. **Institutional reports** - DOE, CERN, NOAA

---

## 📝 Changelog

| Date | Change |
|------|--------|
| 2026-01-09 | Initial compilation from web searches (Argon, Chlor, N, C, O, S validation) |
| 2026-01-09 | Added emerging applications (D₂, HD, N₂O) |
| 2026-01-09 | Added PDMS contamination references (m/z 59 discovery) |
| 2026-01-09 | Added fusion research, medical diagnostics, environmental analysis validation |
| 2026-01-09 | **Feature 1.5.5 Validation:** Added Helium leak detection section - confirmed RGAs are 1-2 orders less sensitive than dedicated He detectors, only qualitative detection possible |
| 2026-01-09 | **Feature 1.5.6 Rejection:** Added oil backstreaming/FOMBLIN section - validated Δ14 amu pattern for hydrocarbons, debunked oil-type differentiation, corrected FOMBLIN categorization (PFPE not hydrocarbon) |

---

## 🛢️ Vacuum Contamination Detection

### Oil Backstreaming - Hydrocarbon Fingerprinting

**General RGA Oil Detection**

| Source | URL | Content |
|--------|-----|---------|
| **Hiden Analytical - RGA Series** | https://www.hidenanalytical.com/products/residual-gas-analysis/rga-series/ | RGA capabilities for oil contamination, hydrocarbon backstreaming detection |
| **Kurt Lesker - Advanced RGA Interpretation** | https://de.lesker.com/newweb/technical_info/vacuumtech/rga_04_advanceinterpret.cfm | Hydrocarbon contamination patterns, Δ14 amu series (41/43, 55/57, 69/71, 83/85) |
| **Kurt Lesker - RGA Spectra by AMU** | https://www.lesker.com/newweb/technical_info/vacuumtech/rga-spectra-amu-guide.cfm | Mass-by-mass RGA spectra reference guide |
| **MKS - Residual Gas Analysis** | https://www.mks.com/n/residual-gas-analysis | Application notes, contamination detection methods |
| **SRS - Vacuum Diagnosis with RGA (PDF)** | https://www.thinksrs.com/downloads/pdfs/applicationnotes/Vac_diag_RGA.pdf | Comprehensive guide to vacuum system diagnosis with RGA |

**What's validated:**
- ✅ **Δ14 amu Pattern:** CH₂-loss series (55/57, 69/71, 83/85) is characteristic of hydrocarbon oils
- ✅ **Detection Method:** Presence of ≥3 peaks in Δ14 series indicates oil contamination
- ❌ **NOT Validated:** Distinguishing specific oil types (mineral vs. diffusion pump oil) - literature does not support this

**Key Finding (Kurt Lesker):**
> "The document does not provide information distinguishing between different oil types (mineral oil, synthetic oils, etc.) based on RGA spectra. It identifies hydrocarbon presence generally but doesn't address comparative analysis of specific oil chemistries."

**Hydrocarbon Fragmentation Patterns**

| Source | URL | Content |
|--------|-----|---------|
| **Hiden Analytical - Hydrocarbon Fragments (PDF)** | https://www.hidenanalytical.com/wp-content/uploads/2016/08/hydrocarbon_fragments-1-1.pdf | Mass spectral fragments of common hydrocarbons, characteristic peak pairs |
| **Hiden Analytical - Cracking Patterns** | https://www.hidenanalytical.com/tech-data/cracking-patterns/ | Comprehensive cracking pattern database |
| **PubMed 36916159** | https://pubmed.ncbi.nlm.nih.gov/36916159/ | "Mass spectrometry molecular fingerprinting of mineral and synthetic lubricant oils" |

**Validated Peaks:**
- ✅ **m/z 57**: Fragment observed in all mineral oils (C₄H₉⁺)
- ✅ **m/z 43**: Fragment observed in all mineral oils (C₃H₇⁺)
- ✅ **m/z 71**: C₅H₁₁⁺ in many mineral oils
- ✅ **m/z 85**: C₆H₁₃⁺ in some mineral oils

**Application Notes:**
- [Fusor Forums - RGA Oil Backstreaming Discussion](https://fusor.net/board/viewtopic.php?t=14250)
- [Semitracks - Residual Gas Analysis Reference](https://www.semitracks.com/reference-material/failure-and-yield-analysis/failure-analysis-package-level/residual-gas-analysis.php)

---

### FOMBLIN/PFPE Detection

**Perfluoropolyether Oils (NOT Hydrocarbons)**

| Source | URL | Content |
|--------|-----|---------|
| **Kurt Lesker - FOMBLIN Z PFPE Lubricants** | https://www.lesker.com/newweb/fluids/fomblin-specialty-pfpe-z-lubricant/ | Official FOMBLIN product information, PFPE chemistry |
| **PMC 4723628** | https://pmc.ncbi.nlm.nih.gov/articles/PMC4723628/ | "High Resolution Mass Spectrometry of Polyfluorinated Polyether-Based Formulation" |
| **Syensqo - FOMBLIN PFPE FAQ** | https://www.syensqo.com/en/brands/fomblin-pfpe-lubricants/faq | FOMBLIN grades (Y, M/Z), applications |

**CRITICAL DISTINCTION:**
- ❌ **ERROR:** FOMBLIN is NOT a mineral oil or hydrocarbon
- ✅ **CORRECT:** FOMBLIN = Perfluoropolyether (PFPE), fluorinated compound
- ✅ **RGA Pattern:** CF₃⁺ at m/z 69 (NOT alkyl peaks like 57, 71)

**Validated FOMBLIN Pattern:**
- **m/z 69**: CF₃⁺ (dominant peak)
- **m/z 20, 31, 47, 50**: Other fluorinated fragments
- **Anti-Pattern:** NO peaks at m/z 41, 43, 57 (these are hydrocarbons!)

**Additional References:**
- [OSTI 6095984 - Fragmentation Spectra of Vacuum Pump Fluids](https://www.osti.gov/biblio/6095984) (1987 study)
- [Diversity of Synthetic Approaches to PFPE](https://pubs.acs.org/doi/10.1021/acs.macromol.0c01599)

---

### Helium Leak Detection with RGA

**Important Limitations**

| Aspect | RGA Capability | Dedicated He Leak Detector | Conclusion |
|--------|----------------|---------------------------|------------|
| **Sensitivity** | 1-2 orders of magnitude lower | ~5×10⁻¹² mbar·l/s detection limit | RGA not suitable for quantitative leak rates |
| **Application** | Qualitative He presence detection | Quantitative leak rate measurement | RGA for screening only |
| **Precision** | Detection of m/z 4 signal | High-precision leak localization | Recommend dedicated detector for leaks |

**Key Findings from Web Research (2026-01-09):**

| Source | URL | Content |
|--------|-----|---------|
| **Hiden Analytical - RGA Series** | https://www.hidenanalytical.com/products/residual-gas-analysis/rga-series/ | General RGA capabilities including He detection |
| **MKS - Residual Gas Analysis** | https://www.mks.com/n/residual-gas-analysis | Application notes on leak detection |
| **Kurt Lesker - Simple RGA Interpretation** | https://www.lesker.com/newweb/technical_info/vacuumtech/rga_03_simpleinterpret.cfm | Basic RGA spectrum interpretation |

**What's NOT Validated:**
- ❌ **Quantitative leak rate calculation** from RGA m/z 4 signal - No scientific literature supports reliable conversion
- ❌ **"1.4 pA/(mbar·l/s)" sensitivity factor** - Not universal, RGA-dependent
- ⚠️ **Challenge:** m/z 4 overlaps with D₂ (deuterium), requires m/z 3 (HD) check

**Validated Approach (Implemented in App):**
- ✅ **Qualitative detection** of m/z 4 signal > 0.01
- ✅ **He/H₂ ratio > 0.1** indicates notable helium
- ✅ **Recommendation:** Use dedicated He leak detector for quantitative work
- ✅ **Info severity:** Not alarm-level, just awareness

**Reference Sources Reviewed:**
- [Wikipedia - Residual Gas Analyzer](https://en.wikipedia.org/wiki/Residual_gas_analyzer)
- [Solar Manufacturing - RGA as Vacuum Analysis Tool](https://solarmfg.com/tech-downloads/the-use-of-residual-gas-analyzers-as-a-vacuum-analysis-tool/)
- [Hiden Analytical - Halo RGA](https://www.hidenanalytical.com/products/residual-gas-analysis/halo-rga/)

**No 2024-2025 peer-reviewed studies found** supporting quantitative He leak rate determination via standard quadrupole RGA.

---

## 🎯 Priority Additions (Future)

- [x] ~~Helium leak testing standards (ISO 6954:2000)~~ ✅ Documented
- [x] ~~Hydrocarbon fragment library expansion~~ ✅ Documented
- [x] ~~Peak deconvolution methods (N₂/CO separation at m/z 28)~~ ✅ **VALIDATED**
- [x] ~~Offline Analysis Models (Kinetics, LOD, Background)~~ ✅ **VALIDATED** (2026-01-10)
- [ ] Krypton/Xenon isotope ratios
- [ ] Bromine isotope validation

---

## 📊 Offline Analysis Features: Scientific Validation

**Status:** 🔬 **VALIDATED** (2026-01-10)

This section validates the physical models used for post-processing of static RGA data.

### 1. Desorption Kinetics ($t^{-1}$ vs $t^{-0.5}$)

**Scientific Basis:**
The pressure decay $P(t)$ in a vacuum system reveals the dominant gas source based on the exponent $n$ in $P \propto t^{-n}$.

| Exponent ($n$) | Mechanism | Physical Meaning | Source |
|---|---|---|---|
| **$n \approx 1$** ($t^{-1}$) | **Surface Desorption** | Release of adsorbed monolayers (H₂O, CO) | Leybold, CERN |
| **$n \approx 0.5$** ($t^{-0.5}$) | **Bulk Diffusion** | Diffusion from material interior (H₂ in steel, Polymers) | NASA, Leybold |
| **$n \approx 0$** (const) | **Virtual Leak / Real Leak** | Constant gas supply | - |

**Validated Sources:**
1.  **Leybold Vacuum Fundamentals**:
    *   "The decay constant (α) in the outgassing rate equation is approximately 1 for surface desorption... and approximately 0.5 for diffusion-controlled outgassing."
    *   Reference: [Leybold Fundamentals - Outgassing](https://www.leybold.com/en/knowledge/vacuum-fundamentals/leaks/outgassing)
2.  **NASA Outgassing Studies**:
    *   Confirm $t^{-0.5}$ behavior for diffusion-limited outgassing in spacecraft materials (silicones, polymers) over long durations.
    *   Reference: [NASA/ASTM E595](https://outgassing.nasa.gov/)
3.  **CERN Vacuum Technical Notes**:
    *   Confirm $1/t$ law for unbaked systems dominated by water desorption.

### 2. Dynamic Limit of Detection ($3\sigma$ Method)

**Methodology:**
Instead of a fixed limit (e.g., $1\times10^{-10}$ mbar), the "Noise Floor" is calculated individually for each scan.

**Formula:**
$$LOD = \mu_{noise} + 3 \cdot \sigma_{noise}$$
*   $\mu_{noise}$: Mean signal in noise-free region (e.g., m/z 5-10)
*   $\sigma_{noise}$: Standard deviation of that signal
*   **Confidence:** 99.7% (statistical standard)

**Validation:**
*   **IUPAC / Analytical Chemistry Standard:** The $3\sigma$ criterion is the globally accepted definition for LOD (Limit of Detection) in instrumental analysis.
*   **Ref:** [IUPAC Gold Book - Limit of Detection](https://goldbook.iupac.org/terms/view/L03540)

### 3. Background Subtraction

**Application:**
Isolating sample contribution ($I_{sample}$) from system background ($I_{back}$).
$$I_{net} = I_{sample} - I_{back}$$

**Best Practices (Validated):**
1.  **Temporal Proximity:** Background must be taken immediately before/after sample (drift minimization).
2.  **Non-Negative Constraint:** Results $< 0$ must be clamped to $\epsilon$ (not 0) to allow log-plotting.
3.  **Source:** [Kurt Lesker - RGA Data Interpretation](https://www.lesker.com/newweb/technical_info/vacuumtech/rga_04_advanceinterpret.cfm)


---

## 📊 Feature 1.5.7: Peak Deconvolution (N₂/CO Separation at m/z 28)

**Status:** 🔬 **VALIDATED** (2026-01-10)

### Scientific Foundation

**Challenge:** m/z = 28 is ambiguous:
- **N₂** (from air leaks): M = 28.014
- **CO** (process gas/contamination): M = 28.010
- **Mass resolution:** Quadrupole RGAs cannot resolve ΔM = 0.004 (requires TOF-MS for isotopic separation)

**Solution: Fragment Pattern Analysis** ✅

Instead of mass resolution, use **fragmentation fingerprint**:
- **N₂** → fragments to m/z = 14 (N⁺)
- **CO** → fragments to m/z = 12 (C⁺)
- **CO** → also fragments to m/z = 16 (O⁺) and 28 (CO⁺)

**Validated Approach (Pattern Recognition):**
```
N₂/CO Discrimination Ratio = Intensity[14] / Intensity[12]

If Ratio > 2.0:  "Likely N₂ leak (air contamination)"
If Ratio < 0.5:  "Likely CO (process gas/contamination)"
If Ratio ≈ 1.0:  "Mixed source or inconclusive"
```

### Peer-Reviewed References

1. **Philip Hofmann (Ultra-High Vacuum Guide)** - Practical RGA Analysis
   - "if the peak at 14 (N) is bigger than the peak at 12 (C), this is usually an indication of an air leak"
   - Source: https://philiphofmann.net/ultrahighvacuum/ind_RGA.html
   - **Validation:** ✅ Confirms fragmentation-based N₂/CO distinction for quadrupole RGA

2. **Mass Spectrometry Peak Deconvolution** (General methodology)
   - Gaussian/Lorentzian peak fitting for overlapping signals
   - Bi-Gaussian mixture models for complex spectra
   - Sources:
     - [Multi-peak Fitting (IGOR Pro)](https://www.wavemetrics.com/products/igorpro/dataanalysis/peakanalysis/multipeakfitting)
     - [ACS Omega - Peak Deconvolution Methods](https://pubs.acs.org/doi/10.1021/acsomega.4c04536)
   - **Note:** These methods NOT suitable for RGA (require high mass resolution)

3. **Proteomics Deconvolution (Reference Only)** - Advanced algorithms for comparison
   - Decon2LS algorithm for automated peak detection
   - OIE_CARE for overlapping isotopic envelopes
   - Sources:
     - [Decon2LS (BMC Bioinformatics)](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-10-87)
     - [OIE Resolution (Nature Scientific Reports)](https://www.nature.com/articles/srep14755)
   - **Application Limit:** These are for high-resolution MS (≥100,000 R), not quadrupole RGAs

### Implementation Constraints

**⚠️ NOT suitable for RGA deconvolution:**
- Mathematical deconvolution (requires R > 10,000 mass resolution)
- Isotope envelope fitting (RGA resolution ≈ 1 amu only)
- Gaussian/Lorentzian curve fitting (overlapping m/z 28 peaks indistinguishable)

**✅ SUITABLE for RGA:**
- Fragmentation pattern recognition (m/z 14, 12, 16)
- Relative intensity ratios (14/12, 28/16)
- Rule-based heuristics with confidence scores
- Machine learning classification (future enhancement)
- Cross-validation with process knowledge

### Feature Scope (1.5.7 MVP)

**Phase 1: Pattern Recognition Engine**
- Detect m/z 14, 12, 16 signals above noise floor
- Calculate N₂/CO discrimination ratio
- Provide confidence score (0-100%)
- Suggest: "Likely air leak" vs. "Likely CO source" vs. "Inconclusive"

**Phase 2: UI Integration** (Future)
- Add confidence badge to spectrum view
- Highlight ambiguous peaks
- Show ratio calculation breakdown
- Provide contextual help (process gas types, leak sources)

---

## 📝 Changelog

| Date | Sources Added | Section | Description |
|------|---------------|---------|-------------|
| 2026-01-10 | +5 | Argon - Air Leak Detection | Added Lee et al. (2006), CIAAW (2007), IUPAC (2014), USGS references. Expanded methodology details. Feature 1.8.4 validation completed. |

---

**Note:** This file should be updated whenever new scientific sources are found or when validating new features.
