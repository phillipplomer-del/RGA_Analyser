/**
 * Wissenschaftliche Validierungsmetadaten für alle Diagnose-Detektoren
 *
 * Basierend auf der Dokumentation in DOCUMENTATION/SCIENTIFIC/DETECTORS.md
 */

import { ValidationMetadata, DiagnosisType } from './types'

/**
 * Validierungsmetadaten für alle 22 Diagnose-Detektoren
 */
export const DETECTOR_VALIDATIONS: Record<DiagnosisType, ValidationMetadata> = {
  [DiagnosisType.AIR_LEAK]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://physics.nist.gov/PhysRefData/Handbook/Tables/argontable1_a.htm',
      'https://ciaaw.org/argon.htm',
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7727379&Mask=200'
    ],
    lastValidated: '2026-01-11',
    notes: 'N2/O2-Verhältnis 3.0-4.5 (Luft: 3.73), Ar-Isotope 40Ar/36Ar = 298.56 (Lee 2006), Ar²⁺/Ar⁺ (m20/m40) = 0.05-0.2 (expected: 0.1-0.15 für RGA Ionizer). Limitation: m/z 28 CO/N2-Überlappung.',
    crossValidation: {
      unanimous: true,
      gemini: true,
      grok: true,
      grokScore: 95
    },
    physicsDoc: 'DOCUMENTATION/PHYSICS/detectAirLeak.md',
    fixes: {
      count: 0,
      applied: true,
      severity: 'low'
    }
  },

  [DiagnosisType.OIL_BACKSTREAMING]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://de.lesker.com/newweb/technical_info/vacuumtech/rga_04_advanceinterpret.cfm',
      'https://www.hidenanalytical.com/wp-content/uploads/2016/08/hydrocarbon_fragments-1-1.pdf',
      'https://www.thinksrs.com/downloads/pdfs/applicationnotes/Vac_diag_RGA.pdf'
    ],
    lastValidated: '2026-01-11',
    notes: 'Delta-14 Pattern (m/z 39/41/43/55/57/69/71/83/85), min. 3 Peaks. Thresholds: C₄H₉⁺/C₃H₇⁺ (m57/m43) = 0.5-1.4 (typical 0.6-1.0). Fixed: Renamed to "Heavy Hydrocarbons", adjusted m57/m43 range, added m/z 39.',
    crossValidation: {
      unanimous: false,
      gemini: true,
      grok: true
    },
    physicsDoc: 'DOCUMENTATION/PHYSICS/FEATURE_1.5.3_OIL_BACKSTREAMING_DETECTION.md',
    fixes: {
      count: 3,
      applied: true,
      severity: 'high'
    }
  },

  [DiagnosisType.FOMBLIN_CONTAMINATION]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://www.lesker.com/newweb/fluids/fomblin-specialty-pfpe-z-lubricant/',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC4723628/',
      'https://www.syensqo.com/en/brands/fomblin-pfpe-lubricants/faq'
    ],
    lastValidated: '2026-01-11',
    notes: 'CF₃⁺ (m/z 69) dominant, CF₂⁺ (m/z 50) 2nd strongest. Anti-Pattern: keine Alkyl-Peaks (m41 < m69×0.3, m43 < m69×0.5, m57 < m69×0.5). Fixed: Added m/z 50 check, raised secondary thresholds to 1%.',
    crossValidation: {
      unanimous: false,
      gemini: true,
      grok: true
    },
    physicsDoc: 'DOCUMENTATION/PHYSICS/FEATURE_1.5.4_FOMBLIN_PFPE_DETECTION.md',
    fixes: {
      count: 1,
      applied: true,
      severity: 'critical'
    }
  },

  [DiagnosisType.SOLVENT_RESIDUE]: {
    validated: true,
    confidence: 'medium',
    sources: [
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C67641&Mask=200',
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C67630&Mask=608',
      'https://chem.libretexts.org/Bookshelves/Analytical_Chemistry/Supplemental_Modules_(Analytical_Chemistry)/Instrumentation_and_Analysis/Mass_Spectrometry/Fragmentation_Patterns_in_Mass_Spectra'
    ],
    lastValidated: '2026-01-09',
    notes: 'Aceton: m43/m58 = 2-5 (expected 3-4), IPA: m45 (Base Peak) > m43×0.5, Ethanol: m31 + m46, Methanol: m31 + m32 (m32 > m31×0.5). Überlappungen mit Öl-Fragmenten möglich.'
  },

  [DiagnosisType.CHLORINATED_SOLVENT]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://ciaaw.org/chlorine.htm',
      'https://chem.libretexts.org/Bookshelves/Analytical_Chemistry/An_Introduction_to_Mass_Spectrometry_(Van_Bramer)/06:_INTERPRETATION/6.04:_Isotope_Abundance',
      'https://webbook.nist.gov'
    ],
    lastValidated: '2026-01-09',
    notes: '35Cl/37Cl = 3.13. TCE m/z 95. Keine Unterscheidung zwischen verschiedenen chlorierten Lösemitteln.'
  },

  [DiagnosisType.WATER_OUTGASSING]: {
    validated: true,
    confidence: 'medium',
    sources: [
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Mask=200',
      'https://en.wikipedia.org/wiki/Ultra-high_vacuum',
      'https://indico.cern.ch/event/565314/contributions/2285743/attachments/1466415/2277367/Outgassing-CAS-Lund-final.pdf'
    ],
    lastValidated: '2026-01-09',
    notes: 'H2O/OH (m18/m17) = 3.5-5.0 (typical 4.3), Dominance: m18 ≥ 80% of max peak. Bakeout-Erkennung basiert auf Dateinamen-Parsing.'
  },

  [DiagnosisType.HYDROGEN_DOMINANT]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://www.sciencedirect.com/science/article/abs/pii/S2214785320385795',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC5226402/',
      'https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=922647'
    ],
    lastValidated: '2026-01-09',
    notes: 'Dominance: m2 ≥ 80% of max peak, H2/H2O > 5 (UHV-Kriterium: H2O/H2 < 0.2), CO/CO2 niedrig (m28 < m2×0.2, m44 < m2×0.1). H2-Quelle kann mehrdeutig sein (Bulk-Diffusion, Permeation).'
  },

  [DiagnosisType.ESD_ARTIFACT]: {
    validated: true,
    confidence: 'medium',
    sources: [
      'https://www.researchgate.net/publication/248491253_The_electron-stimulated_desorption_ions_from_the_ionizer_of_a_quadrupole_mass_spectrometer',
      'https://pubs.aip.org/avs/jva/article-abstract/11/4/1620/834935/',
      'https://nvlpubs.nist.gov/nistpubs/sp958-lide/219-223.pdf'
    ],
    lastValidated: '2026-01-11',
    notes: 'Anomale Fragment-Verhältnisse: O⁺/O₂⁺ > 0.50, N⁺/N₂⁺ > 0.25, C⁺/CO > 0.12, H⁺/H₂⁺ > 0.20. Fixed: Adjusted N⁺/N₂⁺ (0.15→0.25) and H⁺/H₂⁺ (0.01→0.10, anomaly 0.05→0.20) thresholds.',
    crossValidation: {
      unanimous: false,
      gemini: true,
      grok: true
    },
    physicsDoc: 'DOCUMENTATION/PHYSICS/FEATURE_1.5.6_ESD_ARTIFACT_DETECTION.md',
    fixes: {
      count: 2,
      applied: true,
      severity: 'critical'
    }
  },

  [DiagnosisType.HELIUM_LEAK_INDICATOR]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://www.hidenanalytical.com/products/residual-gas-analysis/rga-series/',
      'https://www.mks.com/n/residual-gas-analysis',
      'https://en.wikipedia.org/wiki/Residual_gas_analyzer'
    ],
    lastValidated: '2026-01-11',
    notes: 'NUR QUALITATIV! m/z 4 (He oder D₂), RSF-corrected He/H₂ > 3%. Fixed: Added RSF correction (He: 0.15, H₂: 0.44), reduced threshold to 3%, increased m/z 3 penalty, updated disclaimer to "1-3 orders less sensitive".',
    crossValidation: {
      unanimous: false,
      gemini: true,
      grok: true
    },
    physicsDoc: 'DOCUMENTATION/PHYSICS/FEATURE_1.5.7_HELIUM_LEAK_DETECTION.md',
    fixes: {
      count: 2,
      applied: true,
      severity: 'critical'
    }
  },

  [DiagnosisType.SILICONE_CONTAMINATION]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://link.springer.com/article/10.1007/s13361-014-1042-5',
      'https://www.hidenanalytical.com/applications/surface-analysis/contamination-with-silicone/',
      'https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=Si'
    ],
    lastValidated: '2026-01-09',
    notes: 'PDMS-Marker: m/z 73 (TMS), m/z 59 (kritisch), m/z 147 (Dimer). Extrem schwer zu entfernen.'
  },

  [DiagnosisType.VIRTUAL_LEAK]: {
    validated: true,
    confidence: 'medium',
    sources: [
      'https://www.thinksrs.com/downloads/pdfs/applicationnotes/Vac_diag_RGA.pdf',
      'https://www.hidenanalytical.com/blog/how-residual-gas-analysis-rga-factors-leak-detection/',
      'https://www.heattreattoday.com/how-to-find-both-real-and-virtual-vacuum-leaks/'
    ],
    lastValidated: '2026-01-09',
    notes: 'Luftähnlich, aber Ar niedrig/fehlend, H2O erhöht. He-Lecktest erforderlich zur Bestätigung.'
  },

  [DiagnosisType.CLEAN_UHV]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://indico.cern.ch/event/565314/',
      'https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=922647'
    ],
    lastValidated: '2026-01-09',
    notes: 'H2-Dominanz, HC < 0.1% (DESY-Kriterium), CO2/H2 < 0.05. Nur Verhältnisse, keine absoluten Drücke.'
  },

  [DiagnosisType.N2_CO_MIXTURE]: {
    validated: true,
    confidence: 'medium',  // FIXED: was 'medium-high' (invalid type)
    sources: [
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7727379&Mask=200',
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C630080&Mask=200',
      'https://www.hidenanalytical.com/tech-data/cracking-patterns/',
      'https://indico.cern.ch/event/565314/contributions/2285748/attachments/1467497/2273709/RGA_tutorial-interpretation.pdf',
      'https://philiphofmann.net/ultrahighvacuum/ind_RGA.html'
    ],
    lastValidated: '2026-01-10',
    notes: 'Enhanced detector: N2: m28/m14 ~14, CO: m28/m12 ~20, ¹³CO: m29/m28 >1.2% (adjusted), ¹⁴N¹⁵N: m29/m28 0.6-0.9% for N2 confirmation, N+/C+ ratio (m14/m12) discrimination. Thresholds validated against NIST/Hofmann.'
  },

  [DiagnosisType.CO_DOMINANT]: {
    validated: true,
    confidence: 'medium',
    sources: [
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C630080&Mask=200',
      'https://www.hidenanalytical.com/tech-data/cracking-patterns/'
    ],
    lastValidated: '2026-01-09',
    notes: 'Verwendet N2/CO-Unterscheidung. Siehe N2_CO_MIXTURE für Details.'
  },

  [DiagnosisType.AMMONIA_CONTAMINATION]: {
    validated: true,
    confidence: 'medium',
    sources: [
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7664417&Mask=200',
      'https://chem.libretexts.org/Bookshelves/Analytical_Chemistry/An_Introduction_to_Mass_Spectrometry_(Van_Bramer)/06:_INTERPRETATION/6.05:_Amine_Fragmentation',
      'https://cires1.colorado.edu/jimenez/Papers/Allan_Frag_Table_Published.pdf'
    ],
    lastValidated: '2026-01-09',
    notes: 'NH3: m17/m18 > 0.30 (H2O: ~0.23), m16/m17 ~0.80. Überlappung mit H2O und CH3+.'
  },

  [DiagnosisType.METHANE_CONTAMINATION]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C74828&Mask=200',
      'https://chem.libretexts.org/Bookshelves/Analytical_Chemistry/Supplemental_Modules_(Analytical_Chemistry)/Instrumentation_and_Analysis/Mass_Spectrometry/Fragmentation_Patterns_in_Mass_Spectra',
      'https://www.hidenanalytical.com/tech-data/cracking-patterns/'
    ],
    lastValidated: '2026-01-09',
    notes: 'CH4: m/z 15 (CH3+) sauberer Indikator, m15/m16 ~0.85. Bewährte Praxis.'
  },

  [DiagnosisType.SULFUR_CONTAMINATION]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7783064&Mask=200',
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7446095&Mask=200',
      'https://spectrabase.com/compound/9cyBI3kJz6J'
    ],
    lastValidated: '2026-01-09',
    notes: 'H2S: m34 (100%), m33/m34 ~0.42. SO2: m64 (100%), m48/m64 ~0.49. S-Isotope zur Unterscheidung von O2.'
  },

  [DiagnosisType.AROMATIC_CONTAMINATION]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://webbook.nist.gov/cgi/inchi?ID=C71432&Mask=200',
      'https://webbook.nist.gov/cgi/cbook.cgi?ID=C108883&Mask=200',
      'https://www.docbrown.info/page06/spectra/benzene-ms.htm'
    ],
    lastValidated: '2026-01-09',
    notes: 'Benzol: m/z 78 (100%), m77/m78 ~0.22. Toluol: m/z 91 (Tropylium, stabil), m92/m91 ~0.69.'
  },

  [DiagnosisType.POLYMER_OUTGASSING]: {
    validated: true,
    confidence: 'medium',
    sources: [
      'https://indico.cern.ch/event/1031708/contributions/4355322/attachments/2267727/3850553/Outgassing_of_Polymers_workshop_final.pdf',
      'https://indico.cern.ch/event/1031708/contributions/4355322/attachments/2267727/3964487/Outgassing%20rates%20of%20PEEK%20Kapton%20and%20Vespel%20foils%20ATS%20NoteFinal.pdf',
      'https://www.mtm-inc.com/plastics-in-vacuum-applications.html'
    ],
    lastValidated: '2026-01-11',
    notes: 'H₂O-dominant ohne Luftleck. Fixed: Added polymer-specific markers (CO₂ check m44, O⁺ fragment m16, hydrocarbon traces), adjusted N₂/O₂ threshold to >4.5. PEEK, Viton, Kapton gasen hauptsächlich H₂O + CO₂ aus.',
    crossValidation: {
      unanimous: false,
      gemini: true,
      grok: true
    },
    physicsDoc: 'DOCUMENTATION/PHYSICS/FEATURE_1.5.5_POLYMER_OUTGASSING_DETECTION.md',
    fixes: {
      count: 1,
      applied: true,
      severity: 'critical'
    }
  },

  [DiagnosisType.PLASTICIZER_CONTAMINATION]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://www.sciencedirect.com/science/article/pii/S1044030502003860',
      'https://www.lipidmaps.org/resources/lipidweb/lipidweb_html/ms/others/msartefacts/index.htm',
      'https://pubs.rsc.org/en/content/articlehtml/2020/cp/d0cp00538j'
    ],
    lastValidated: '2026-01-11',
    notes: 'Phthalate: m/z 149 (C₈H₅O₃⁺, base peak 100%) + m/z 167 (2nd strongest, 15-45%). Fixed: Added m/z 167 check (>15% of m149), corrected ion formula to C₈H₅O₃⁺, added m/z 43 to alkyl fragment check. O-Ringe, Vinyl-Handschuhe.',
    crossValidation: {
      unanimous: false,
      gemini: true,
      grok: true
    },
    physicsDoc: 'DOCUMENTATION/PHYSICS/FEATURE_1.5.8_PLASTICIZER_PHTHALATE_DETECTION.md',
    fixes: {
      count: 2,
      applied: true,
      severity: 'high'
    }
  },

  [DiagnosisType.PROCESS_GAS_RESIDUE]: {
    validated: true,
    confidence: 'medium',
    sources: [
      'https://www.ipcc-nggip.iges.or.jp/public/gp/bgp/3_6_PFC_HFC_NF3_SF6_Semiconductor_Manufacturing.pdf',
      'https://www.epa.gov/eps-partnership/semiconductor-industry',
      'https://amt.copernicus.org/preprints/amt-2019-127/amt-2019-127.pdf'
    ],
    lastValidated: '2026-01-09',
    notes: 'NF3: m52 (NF2+, intensivster), SF6: m127 (SF5+), WF6: m279. Halbleiter-CVD Prozessgase.'
  },

  [DiagnosisType.COOLING_WATER_LEAK]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://www.engineeringtoolbox.com/water-vapor-saturation-pressure-d_599.html',
      'https://www.engineeringtoolbox.com/water-evacuation-pressure-temperature-d_1686.html',
      'https://www.normandale.edu/academics/degrees-certificates/vacuum-and-thin-film-technology/articles/the-effects-of-humidity-on-vacuum-systems.html'
    ],
    lastValidated: '2026-01-09',
    notes: 'Druck stabilisiert bei H2O-Sättigungsdampfdruck: 20°C = 23.4 mbar, 25°C = 31.7 mbar. H2O > 90%.'
  },

  [DiagnosisType.ISOTOPE_VERIFICATION]: {
    validated: true,
    confidence: 'high',
    sources: [
      'https://ciaaw.org',
      'https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl'
    ],
    lastValidated: '2026-01-11',
    notes: 'Isotope ratios: ⁴⁰Ar/³⁶Ar = 298.56 (Lee 2006), ³⁵Cl/³⁷Cl = 3.13, ⁷⁹Br/⁸¹Br = 1.028, ³²S/³⁴S = 22.35, ³²O₂/³⁴O₂ = 244 (molecular). Fixed: Updated O₂ ratio from 487 to 244 (was using atomic instead of molecular ratio), Ar ratio updated to 298.56. IUPAC/CIAAW standards.',
    crossValidation: {
      unanimous: false,
      gemini: true,
      grok: true
    },
    physicsDoc: 'DOCUMENTATION/PHYSICS/FEATURE_1.8.2_ISOTOPE_RATIO_VERIFICATION.md',
    fixes: {
      count: 1,
      applied: true,
      severity: 'critical'
    }
  },

  [DiagnosisType.NEEDS_BAKEOUT]: {
    validated: true,
    confidence: 'medium',
    sources: [
      'https://en.wikipedia.org/wiki/Ultra-high_vacuum',
      'https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=922647'
    ],
    lastValidated: '2026-01-09',
    notes: 'Abgeleitet von WATER_OUTGASSING und HYDROGEN_DOMINANT. H2O/H2 > 0.5 → Bakeout erforderlich.'
  }
}
