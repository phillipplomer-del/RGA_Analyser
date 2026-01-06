/**
 * Vollständige Massenreferenz für m/z 1-100
 * Basierend auf konsolidierten Daten aus CERN, Pfeiffer, MKS, NIST
 */

export interface MassAssignment {
  mass: number
  primaryAssignment: string           // Haupt-Zuordnung (de)
  primaryAssignmentEn: string         // Haupt-Zuordnung (en)
  possibleSources: string[]           // Mögliche Quellen/Gase
  fragmentOf: string[]                // Fragment von welchen Molekülen
  isotopes?: IsotopeInfo[]            // Isotopen-Information
  notes?: string                      // Zusätzliche Hinweise
  diagnosticValue: DiagnosticValue    // Diagnostischer Wert
}

export interface IsotopeInfo {
  element: string
  massNumber: number
  abundance: number  // Natürliche Häufigkeit in %
}

export type DiagnosticValue = 'critical' | 'important' | 'minor' | 'rare'

/**
 * Vollständige Massenreferenz-Tabelle
 */
export const MASS_REFERENCE: MassAssignment[] = [
  // ============================================
  // m/z 1-10: Leichte Gase
  // ============================================
  {
    mass: 1,
    primaryAssignment: 'H⁺',
    primaryAssignmentEn: 'H⁺',
    possibleSources: ['H₂', 'H₂O', 'Kohlenwasserstoffe'],
    fragmentOf: ['H₂', 'H₂O', 'CH₄', 'alle KW'],
    notes: 'Fragment, 2-5% des H₂-Peaks',
    diagnosticValue: 'minor'
  },
  {
    mass: 2,
    primaryAssignment: 'H₂⁺',
    primaryAssignmentEn: 'H₂⁺',
    possibleSources: ['Wasserstoff', 'Deuterium'],
    fragmentOf: [],
    isotopes: [{ element: 'D', massNumber: 2, abundance: 0.015 }],
    notes: 'Dominantes Restgas nach Bakeout',
    diagnosticValue: 'critical'
  },
  {
    mass: 3,
    primaryAssignment: 'HD⁺/H₃⁺',
    primaryAssignmentEn: 'HD⁺/H₃⁺',
    possibleSources: ['Deuterium-Wasserstoff'],
    fragmentOf: [],
    notes: 'Sehr selten, Ionen-Molekül-Reaktion bei hohem Druck',
    diagnosticValue: 'rare'
  },
  {
    mass: 4,
    primaryAssignment: 'He⁺',
    primaryAssignmentEn: 'He⁺',
    possibleSources: ['Helium', 'D₂'],
    fragmentOf: [],
    isotopes: [{ element: 'He', massNumber: 4, abundance: 99.999 }],
    notes: 'Lecktest-Tracergas',
    diagnosticValue: 'critical'
  },

  // m/z 5-11 meist Rauschen oder exotisch
  {
    mass: 11,
    primaryAssignment: 'B⁺',
    primaryAssignmentEn: 'B⁺',
    possibleSources: ['BCl₃', 'B₂H₆'],
    fragmentOf: ['Borverbindungen'],
    notes: 'Halbleiter-Prozessgas',
    diagnosticValue: 'rare'
  },

  // ============================================
  // m/z 12-22: C-N-O Gruppe
  // ============================================
  {
    mass: 12,
    primaryAssignment: 'C⁺',
    primaryAssignmentEn: 'C⁺',
    possibleSources: ['CO', 'CO₂', 'Kohlenwasserstoffe'],
    fragmentOf: ['CO', 'CO₂', 'CH₄', 'alle KW'],
    isotopes: [{ element: 'C', massNumber: 12, abundance: 98.9 }],
    notes: 'KRITISCH: Unterscheidet CO von N₂!',
    diagnosticValue: 'critical'
  },
  {
    mass: 13,
    primaryAssignment: 'CH⁺',
    primaryAssignmentEn: 'CH⁺',
    possibleSources: ['Kohlenwasserstoffe'],
    fragmentOf: ['CH₄', 'alle KW'],
    isotopes: [{ element: 'C', massNumber: 13, abundance: 1.1 }],
    notes: 'KW-Indikator',
    diagnosticValue: 'minor'
  },
  {
    mass: 14,
    primaryAssignment: 'N⁺/CH₂⁺',
    primaryAssignmentEn: 'N⁺/CH₂⁺',
    possibleSources: ['N₂', 'Kohlenwasserstoffe', 'CO²⁺'],
    fragmentOf: ['N₂', 'CH₄', 'CO'],
    isotopes: [{ element: 'N', massNumber: 14, abundance: 99.6 }],
    notes: 'Hoher Peak = N₂ (Luftleck), 28/14 Ratio prüfen',
    diagnosticValue: 'critical'
  },
  {
    mass: 15,
    primaryAssignment: 'CH₃⁺',
    primaryAssignmentEn: 'CH₃⁺',
    possibleSources: ['Methan', 'Kohlenwasserstoffe', 'NH⁺'],
    fragmentOf: ['CH₄', 'alle KW'],
    notes: '"Sauberer" Methan-Marker ohne O⁺ Überlagerung',
    diagnosticValue: 'important'
  },
  {
    mass: 16,
    primaryAssignment: 'O⁺/CH₄⁺',
    primaryAssignmentEn: 'O⁺/CH₄⁺',
    possibleSources: ['O₂', 'H₂O', 'CO₂', 'Methan', 'CO'],
    fragmentOf: ['O₂', 'H₂O', 'CO₂', 'CO'],
    isotopes: [{ element: 'O', massNumber: 16, abundance: 99.76 }],
    notes: 'Ambivalent! ESD-Artefakt möglich',
    diagnosticValue: 'important'
  },
  {
    mass: 17,
    primaryAssignment: 'OH⁺',
    primaryAssignmentEn: 'OH⁺',
    possibleSources: ['H₂O', 'NH₃'],
    fragmentOf: ['H₂O', 'NH₃'],
    isotopes: [{ element: 'O', massNumber: 17, abundance: 0.038 }],
    notes: 'Schlüsselindikator für H₂O, 18/17 ≈ 4.3',
    diagnosticValue: 'critical'
  },
  {
    mass: 18,
    primaryAssignment: 'H₂O⁺',
    primaryAssignmentEn: 'H₂O⁺',
    possibleSources: ['Wasser'],
    fragmentOf: [],
    isotopes: [{ element: 'O', massNumber: 18, abundance: 0.2 }],
    notes: 'Dominant in ungeheizten Systemen',
    diagnosticValue: 'critical'
  },
  {
    mass: 19,
    primaryAssignment: 'F⁺/H₃O⁺',
    primaryAssignmentEn: 'F⁺/H₃O⁺',
    possibleSources: ['Fluorverbindungen', 'Wasser'],
    fragmentOf: ['HF', 'CF₄', 'Fomblin'],
    isotopes: [{ element: 'F', massNumber: 19, abundance: 100 }],
    notes: 'Oft ESD-Artefakt von gereinigten Oberflächen',
    diagnosticValue: 'important'
  },
  {
    mass: 20,
    primaryAssignment: 'Ne⁺/Ar²⁺/HF⁺',
    primaryAssignmentEn: 'Ne⁺/Ar²⁺/HF⁺',
    possibleSources: ['Neon', 'Argon (doppelt)', 'HF'],
    fragmentOf: [],
    isotopes: [{ element: 'Ne', massNumber: 20, abundance: 90.5 }],
    notes: 'Ar²⁺ ist 10-15% von m/z 40!',
    diagnosticValue: 'important'
  },
  {
    mass: 22,
    primaryAssignment: '²²Ne⁺/CO₂²⁺',
    primaryAssignmentEn: '²²Ne⁺/CO₂²⁺',
    possibleSources: ['Neon-Isotop', 'CO₂ (doppelt)'],
    fragmentOf: [],
    isotopes: [{ element: 'Ne', massNumber: 22, abundance: 9.9 }],
    notes: 'Bestätigt Ne oder CO₂ Doppelionisation',
    diagnosticValue: 'minor'
  },

  // ============================================
  // m/z 26-32: Atmosphären-Gruppe
  // ============================================
  {
    mass: 26,
    primaryAssignment: 'C₂H₂⁺/CN⁺',
    primaryAssignmentEn: 'C₂H₂⁺/CN⁺',
    possibleSources: ['Acetylen', 'Cyanid'],
    fragmentOf: ['C₂H₆', 'Öle'],
    notes: 'Zersetzung am heißen Filament',
    diagnosticValue: 'minor'
  },
  {
    mass: 27,
    primaryAssignment: 'C₂H₃⁺',
    primaryAssignmentEn: 'C₂H₃⁺',
    possibleSources: ['Kohlenwasserstoffe', 'Aluminium'],
    fragmentOf: ['Ethen', 'Propan', 'Öle'],
    notes: 'KW-Fragment',
    diagnosticValue: 'minor'
  },
  {
    mass: 28,
    primaryAssignment: 'N₂⁺/CO⁺',
    primaryAssignmentEn: 'N₂⁺/CO⁺',
    possibleSources: ['Stickstoff', 'Kohlenmonoxid', 'Ethen', 'Silizium'],
    fragmentOf: ['CO₂'],
    isotopes: [{ element: 'Si', massNumber: 28, abundance: 92.2 }],
    notes: 'GRÖSSTE AMBIGUITÄT! Prüfe m/z 14 (N₂) und m/z 12 (CO)',
    diagnosticValue: 'critical'
  },
  {
    mass: 29,
    primaryAssignment: '¹⁵N¹⁴N⁺/C₂H₅⁺/CHO⁺',
    primaryAssignmentEn: '¹⁵N¹⁴N⁺/C₂H₅⁺/CHO⁺',
    possibleSources: ['N₂-Isotop', 'Kohlenwasserstoffe', '¹³CO'],
    fragmentOf: ['Ethanol', 'Propan'],
    isotopes: [{ element: 'N2', massNumber: 29, abundance: 0.7 }],
    notes: '>0.7% von m/z 28 = KW-Kontamination',
    diagnosticValue: 'important'
  },
  {
    mass: 30,
    primaryAssignment: 'NO⁺/C₂H₆⁺/SiH₂⁺',
    primaryAssignmentEn: 'NO⁺/C₂H₆⁺/SiH₂⁺',
    possibleSources: ['Stickoxid', 'Ethan', 'Silan'],
    fragmentOf: ['N₂O'],
    isotopes: [{ element: 'Si', massNumber: 30, abundance: 3.1 }],
    notes: 'Selten in Restgas',
    diagnosticValue: 'minor'
  },
  {
    mass: 31,
    primaryAssignment: 'CH₂OH⁺/P⁺',
    primaryAssignmentEn: 'CH₂OH⁺/P⁺',
    possibleSources: ['Methanol', 'Ethanol', 'Phosphor'],
    fragmentOf: ['Alkohole'],
    isotopes: [{ element: 'P', massNumber: 31, abundance: 100 }],
    notes: 'ALKOHOL-MARKER! Base Peak für Methanol/Ethanol',
    diagnosticValue: 'important'
  },
  {
    mass: 32,
    primaryAssignment: 'O₂⁺/S⁺',
    primaryAssignmentEn: 'O₂⁺/S⁺',
    possibleSources: ['Sauerstoff', 'Schwefel', 'Methanol'],
    fragmentOf: ['H₂S', 'SO₂'],
    isotopes: [{ element: 'S', massNumber: 32, abundance: 95 }],
    notes: 'Luftleck-Indikator, N₂/O₂ ≈ 3.7 bei Luft',
    diagnosticValue: 'critical'
  },

  // ============================================
  // m/z 33-40: Halogene und Argon
  // ============================================
  {
    mass: 33,
    primaryAssignment: 'HS⁺',
    primaryAssignmentEn: 'HS⁺',
    possibleSources: ['H₂S'],
    fragmentOf: ['H₂S'],
    notes: 'Schwefelwasserstoff-Fragment',
    diagnosticValue: 'minor'
  },
  {
    mass: 34,
    primaryAssignment: 'H₂S⁺/¹⁸O¹⁶O⁺',
    primaryAssignmentEn: 'H₂S⁺/¹⁸O¹⁶O⁺',
    possibleSources: ['Schwefelwasserstoff', 'O₂-Isotop'],
    fragmentOf: [],
    isotopes: [{ element: 'S', massNumber: 34, abundance: 4.2 }],
    notes: 'Schwefel-Indikator',
    diagnosticValue: 'minor'
  },
  {
    mass: 35,
    primaryAssignment: '³⁵Cl⁺',
    primaryAssignmentEn: '³⁵Cl⁺',
    possibleSources: ['Chlorverbindungen'],
    fragmentOf: ['HCl', 'TCE', 'alle Cl-Verbindungen'],
    isotopes: [{ element: 'Cl', massNumber: 35, abundance: 75.8 }],
    notes: 'Cl-Isotopenmuster: 35/37 = 3:1',
    diagnosticValue: 'important'
  },
  {
    mass: 36,
    primaryAssignment: 'HCl⁺/³⁶Ar⁺',
    primaryAssignmentEn: 'HCl⁺/³⁶Ar⁺',
    possibleSources: ['Salzsäure', 'Argon-Isotop'],
    fragmentOf: [],
    isotopes: [{ element: 'Ar', massNumber: 36, abundance: 0.34 }],
    notes: 'Ar-36 sehr schwach',
    diagnosticValue: 'minor'
  },
  {
    mass: 37,
    primaryAssignment: '³⁷Cl⁺',
    primaryAssignmentEn: '³⁷Cl⁺',
    possibleSources: ['Chlorverbindungen'],
    fragmentOf: ['HCl', 'TCE'],
    isotopes: [{ element: 'Cl', massNumber: 37, abundance: 24.2 }],
    notes: 'Cl-Isotop, "Partner" zu m/z 35',
    diagnosticValue: 'important'
  },
  {
    mass: 38,
    primaryAssignment: '³⁸Ar⁺/C₃H₂⁺',
    primaryAssignmentEn: '³⁸Ar⁺/C₃H₂⁺',
    possibleSources: ['Argon-Isotop', 'Kohlenwasserstoffe'],
    fragmentOf: [],
    isotopes: [{ element: 'Ar', massNumber: 38, abundance: 0.06 }],
    notes: 'Sehr schwach',
    diagnosticValue: 'rare'
  },
  {
    mass: 39,
    primaryAssignment: 'C₃H₃⁺/K⁺',
    primaryAssignmentEn: 'C₃H₃⁺/K⁺',
    possibleSources: ['Kohlenwasserstoffe', 'Kalium'],
    fragmentOf: ['Propan', 'Öle'],
    isotopes: [{ element: 'K', massNumber: 39, abundance: 93.3 }],
    notes: 'Öl-Marker, K⁺ aus Glas/Filament',
    diagnosticValue: 'important'
  },
  {
    mass: 40,
    primaryAssignment: 'Ar⁺',
    primaryAssignmentEn: 'Ar⁺',
    possibleSources: ['Argon', 'Kohlenwasserstoffe'],
    fragmentOf: [],
    isotopes: [{ element: 'Ar', massNumber: 40, abundance: 99.6 }],
    notes: 'BESTER LUFTLECK-BEWEIS (chemisch inert)',
    diagnosticValue: 'critical'
  },

  // ============================================
  // m/z 41-50: Öl- und Lösemittel-Bereich
  // ============================================
  {
    mass: 41,
    primaryAssignment: 'C₃H₅⁺',
    primaryAssignmentEn: 'C₃H₅⁺',
    possibleSources: ['Öl', 'Kohlenwasserstoffe'],
    fragmentOf: ['Propan', 'Öle'],
    notes: 'ÖL-MARKER zusammen mit 43/55/57',
    diagnosticValue: 'important'
  },
  {
    mass: 42,
    primaryAssignment: 'C₃H₆⁺/C₂H₂O⁺',
    primaryAssignmentEn: 'C₃H₆⁺/C₂H₂O⁺',
    possibleSources: ['Propen', 'Keten'],
    fragmentOf: ['Aceton'],
    notes: 'KW-Fragment',
    diagnosticValue: 'minor'
  },
  {
    mass: 43,
    primaryAssignment: 'C₃H₇⁺/CH₃CO⁺',
    primaryAssignmentEn: 'C₃H₇⁺/CH₃CO⁺',
    possibleSources: ['Öl', 'Aceton', 'Kohlenwasserstoffe'],
    fragmentOf: ['Aceton', 'Öle', 'Butane'],
    notes: 'ÖL/ACETON-MARKER. Prüfe m/z 58 für Aceton',
    diagnosticValue: 'critical'
  },
  {
    mass: 44,
    primaryAssignment: 'CO₂⁺/C₃H₈⁺',
    primaryAssignmentEn: 'CO₂⁺/C₃H₈⁺',
    possibleSources: ['Kohlendioxid', 'Propan', 'N₂O'],
    fragmentOf: [],
    notes: 'Hauptindikator für CO₂',
    diagnosticValue: 'critical'
  },
  {
    mass: 45,
    primaryAssignment: '¹³CO₂⁺/C₂H₅O⁺',
    primaryAssignmentEn: '¹³CO₂⁺/C₂H₅O⁺',
    possibleSources: ['CO₂-Isotop', 'Isopropanol', 'Ethanol'],
    fragmentOf: ['Alkohole', 'CO₂'],
    notes: 'IPA-MARKER (Base Peak)',
    diagnosticValue: 'important'
  },
  {
    mass: 46,
    primaryAssignment: 'C₂H₅OH⁺/NO₂⁺',
    primaryAssignmentEn: 'C₂H₅OH⁺/NO₂⁺',
    possibleSources: ['Ethanol (Parent)', 'NO₂'],
    fragmentOf: [],
    notes: 'Ethanol-Parent-Peak',
    diagnosticValue: 'minor'
  },
  {
    mass: 47,
    primaryAssignment: 'PO⁺/CHO₂⁺',
    primaryAssignmentEn: 'PO⁺/CHO₂⁺',
    possibleSources: ['Phosphorverbindungen', 'Ameisensäure'],
    fragmentOf: ['PH₃', 'HCOOH'],
    notes: 'Selten in UHV, Prozessgas-Indikator',
    diagnosticValue: 'rare'
  },
  {
    mass: 48,
    primaryAssignment: 'SO⁺',
    primaryAssignmentEn: 'SO⁺',
    possibleSources: ['SO₂'],
    fragmentOf: ['SO₂'],
    notes: 'Schwefel-Fragment',
    diagnosticValue: 'minor'
  },
  {
    mass: 49,
    primaryAssignment: 'CH₂Cl⁺',
    primaryAssignmentEn: 'CH₂Cl⁺',
    possibleSources: ['Dichlormethan', 'Chloroform'],
    fragmentOf: ['CH₂Cl₂', 'CHCl₃'],
    notes: 'DCM-Fragment, Lösemittel-Indikator',
    diagnosticValue: 'important'
  },
  {
    mass: 50,
    primaryAssignment: 'CF₂⁺',
    primaryAssignmentEn: 'CF₂⁺',
    possibleSources: ['Fluorverbindungen'],
    fragmentOf: ['CF₄', 'Fomblin'],
    notes: 'Fluor-Indikator',
    diagnosticValue: 'minor'
  },
  {
    mass: 51,
    primaryAssignment: 'CHF₂⁺/CH₂³⁷Cl⁺',
    primaryAssignmentEn: 'CHF₂⁺/CH₂³⁷Cl⁺',
    possibleSources: ['HFC-Verbindungen', 'Chlorverbindungen'],
    fragmentOf: ['CHF₃', 'CH₂Cl₂'],
    notes: 'Cl-Isotop von m/z 49',
    diagnosticValue: 'minor'
  },
  {
    mass: 52,
    primaryAssignment: 'C₄H₄⁺/CCl₂⁺',
    primaryAssignmentEn: 'C₄H₄⁺/CCl₂⁺',
    possibleSources: ['Kohlenwasserstoffe', 'Chlorverbindungen'],
    fragmentOf: ['Aromaten', 'CCl₄'],
    notes: 'Chloroform-Fragment',
    diagnosticValue: 'minor'
  },
  {
    mass: 53,
    primaryAssignment: 'C₄H₅⁺',
    primaryAssignmentEn: 'C₄H₅⁺',
    possibleSources: ['Kohlenwasserstoffe'],
    fragmentOf: ['Butadien', 'Öle'],
    notes: 'KW-Fragment',
    diagnosticValue: 'minor'
  },
  {
    mass: 54,
    primaryAssignment: 'C₄H₆⁺',
    primaryAssignmentEn: 'C₄H₆⁺',
    possibleSources: ['Butadien', 'Kohlenwasserstoffe'],
    fragmentOf: ['C₄H₆', 'Öle'],
    notes: 'Acetylen-Dimer m/z 26×2, KW-Fragment',
    diagnosticValue: 'minor'
  },

  // ============================================
  // m/z 55-71: Schwere KW / Öle
  // ============================================
  {
    mass: 55,
    primaryAssignment: 'C₄H₇⁺',
    primaryAssignmentEn: 'C₄H₇⁺',
    possibleSources: ['Öl', 'Kohlenwasserstoffe'],
    fragmentOf: ['Öle', 'Alkane'],
    notes: 'ÖL-MARKER (Δ14 Serie)',
    diagnosticValue: 'important'
  },
  {
    mass: 57,
    primaryAssignment: 'C₄H₉⁺',
    primaryAssignmentEn: 'C₄H₉⁺',
    possibleSources: ['Öl', 'Kohlenwasserstoffe'],
    fragmentOf: ['Öle', 'Alkane'],
    notes: 'ÖL-MARKER (Butyl-Kation)',
    diagnosticValue: 'critical'
  },
  {
    mass: 58,
    primaryAssignment: 'C₃H₆O⁺',
    primaryAssignmentEn: 'C₃H₆O⁺',
    possibleSources: ['Aceton (Parent)'],
    fragmentOf: [],
    notes: 'ACETON-Parent! Unterscheidet Aceton von Öl',
    diagnosticValue: 'important'
  },
  {
    mass: 59,
    primaryAssignment: 'C₃H₇O⁺/(CH₃)₃Si⁺',
    primaryAssignmentEn: 'C₃H₇O⁺/(CH₃)₃Si⁺',
    possibleSources: ['Siloxan', 'Alkohole'],
    fragmentOf: ['PDMS'],
    notes: 'Silikon-Fragment',
    diagnosticValue: 'minor'
  },
  {
    mass: 60,
    primaryAssignment: 'C₃H₈O⁺/COS⁺',
    primaryAssignmentEn: 'C₃H₈O⁺/COS⁺',
    possibleSources: ['Isopropanol', 'Carbonylsulfid'],
    fragmentOf: [],
    notes: 'IPA-Parent-Peak (schwach)',
    diagnosticValue: 'minor'
  },
  {
    mass: 61,
    primaryAssignment: 'C₂H₅S⁺/(CH₃)₂SiH⁺',
    primaryAssignmentEn: 'C₂H₅S⁺/(CH₃)₂SiH⁺',
    possibleSources: ['Thiole', 'Silane'],
    fragmentOf: ['Ethanthiol', 'Siloxane'],
    notes: 'Schwefel- oder Silikon-Fragment',
    diagnosticValue: 'rare'
  },
  {
    mass: 62,
    primaryAssignment: 'H₂³⁴S⁺/CH₃SH⁺',
    primaryAssignmentEn: 'H₂³⁴S⁺/CH₃SH⁺',
    possibleSources: ['H₂S-Isotop', 'Methylmercaptan'],
    fragmentOf: [],
    isotopes: [{ element: 'S', massNumber: 34, abundance: 4.2 }],
    notes: 'Mercaptan-Indikator',
    diagnosticValue: 'rare'
  },
  {
    mass: 63,
    primaryAssignment: 'PF₂⁺/C₂H₄Cl⁺',
    primaryAssignmentEn: 'PF₂⁺/C₂H₄Cl⁺',
    possibleSources: ['Phosphorfluoride', 'Chlorethyl'],
    fragmentOf: ['PF₃', 'Chloralkane'],
    notes: 'Selten, Prozessgas-Fragment',
    diagnosticValue: 'rare'
  },
  {
    mass: 64,
    primaryAssignment: 'SO₂⁺',
    primaryAssignmentEn: 'SO₂⁺',
    possibleSources: ['Schwefeldioxid'],
    fragmentOf: [],
    notes: 'Schwefel-Hauptpeak',
    diagnosticValue: 'minor'
  },
  {
    mass: 69,
    primaryAssignment: 'CF₃⁺/C₅H₉⁺',
    primaryAssignmentEn: 'CF₃⁺/C₅H₉⁺',
    possibleSources: ['Fomblin/PFPE', 'Kohlenwasserstoffe'],
    fragmentOf: ['CF₄', 'Fomblin', 'Öle'],
    notes: 'KRITISCH: Fomblin (kein 41/43/57) vs KW-Öl (mit 41/43/57)',
    diagnosticValue: 'critical'
  },
  {
    mass: 71,
    primaryAssignment: 'C₅H₁₁⁺',
    primaryAssignmentEn: 'C₅H₁₁⁺',
    possibleSources: ['Öl'],
    fragmentOf: ['Öle', 'Alkane'],
    notes: 'ÖL-MARKER (Δ14 Serie)',
    diagnosticValue: 'important'
  },

  // ============================================
  // m/z 73-100: Silikon, Aromaten, Halogene
  // ============================================
  {
    mass: 73,
    primaryAssignment: '(CH₃)₃Si⁺',
    primaryAssignmentEn: '(CH₃)₃Si⁺',
    possibleSources: ['PDMS/Silikonfett'],
    fragmentOf: ['PDMS', 'Siloxane'],
    notes: 'SILIKON-MARKER (Trimethylsilyl)',
    diagnosticValue: 'important'
  },
  {
    mass: 77,
    primaryAssignment: 'C₆H₅⁺',
    primaryAssignmentEn: 'C₆H₅⁺',
    possibleSources: ['Benzol-Fragment', 'Aromaten'],
    fragmentOf: ['Benzol', 'Toluol', 'DC705'],
    notes: 'Phenyl-Kation',
    diagnosticValue: 'important'
  },
  {
    mass: 78,
    primaryAssignment: 'C₆H₆⁺',
    primaryAssignmentEn: 'C₆H₆⁺',
    possibleSources: ['Benzol', 'Diffusionspumpenöl DC705'],
    fragmentOf: [],
    notes: 'Benzol-Parent oder DC705',
    diagnosticValue: 'important'
  },
  {
    mass: 79,
    primaryAssignment: '⁷⁹Br⁺/C₆H₇⁺',
    primaryAssignmentEn: '⁷⁹Br⁺/C₆H₇⁺',
    possibleSources: ['Bromverbindungen', 'Methylbenzol'],
    fragmentOf: ['HBr', 'CH₃Br', 'Toluol'],
    isotopes: [{ element: 'Br', massNumber: 79, abundance: 50.5 }],
    notes: 'BROM-MARKER! Isotopenmuster 79/81 ≈ 1:1',
    diagnosticValue: 'important'
  },
  {
    mass: 81,
    primaryAssignment: '⁸¹Br⁺/C₆H₉⁺',
    primaryAssignmentEn: '⁸¹Br⁺/C₆H₉⁺',
    possibleSources: ['Bromverbindungen', 'Kohlenwasserstoffe'],
    fragmentOf: ['HBr', 'CH₃Br', 'Öle'],
    isotopes: [{ element: 'Br', massNumber: 81, abundance: 49.5 }],
    notes: 'Brom-Isotop "Partner" zu m/z 79',
    diagnosticValue: 'important'
  },
  {
    mass: 83,
    primaryAssignment: 'C₆H₁₁⁺/⁸³Kr⁺',
    primaryAssignmentEn: 'C₆H₁₁⁺/⁸³Kr⁺',
    possibleSources: ['Öl', 'Krypton'],
    fragmentOf: ['Öle'],
    isotopes: [{ element: 'Kr', massNumber: 83, abundance: 11.5 }],
    notes: 'Öl-Fragment in Δ14 Serie',
    diagnosticValue: 'minor'
  },
  {
    mass: 84,
    primaryAssignment: '⁸⁴Kr⁺/C₆H₁₂⁺',
    primaryAssignmentEn: '⁸⁴Kr⁺/C₆H₁₂⁺',
    possibleSources: ['Krypton', 'Kohlenwasserstoffe'],
    fragmentOf: [],
    isotopes: [{ element: 'Kr', massNumber: 84, abundance: 57 }],
    notes: 'Krypton-Hauptpeak',
    diagnosticValue: 'minor'
  },
  {
    mass: 85,
    primaryAssignment: 'C₆H₁₃⁺/CCl₂F⁺',
    primaryAssignmentEn: 'C₆H₁₃⁺/CCl₂F⁺',
    possibleSources: ['Öl', 'Freon-12'],
    fragmentOf: ['Öle', 'Freone'],
    notes: 'Öl-Fragment',
    diagnosticValue: 'minor'
  },
  {
    mass: 86,
    primaryAssignment: '⁸⁶Kr⁺/CCl₂F₂⁺',
    primaryAssignmentEn: '⁸⁶Kr⁺/CCl₂F₂⁺',
    possibleSources: ['Krypton-Isotop', 'Freon-12'],
    fragmentOf: [],
    isotopes: [{ element: 'Kr', massNumber: 86, abundance: 17.3 }],
    notes: 'Freon-12 Parent-Peak oder Kr-Isotop',
    diagnosticValue: 'minor'
  },
  {
    mass: 91,
    primaryAssignment: 'C₇H₇⁺',
    primaryAssignmentEn: 'C₇H₇⁺',
    possibleSources: ['Toluol', 'DC705'],
    fragmentOf: ['Toluol', 'DC705'],
    notes: 'Tropylium/Benzyl-Kation',
    diagnosticValue: 'important'
  },
  {
    mass: 95,
    primaryAssignment: 'C₂Cl₃⁺',
    primaryAssignmentEn: 'C₂Cl₃⁺',
    possibleSources: ['Trichlorethylen (TCE)'],
    fragmentOf: ['TCE'],
    notes: 'TCE-Hauptpeak mit Cl-Muster bei 97',
    diagnosticValue: 'important'
  },
  {
    mass: 97,
    primaryAssignment: 'C₂³⁷Cl³⁵Cl₂⁺',
    primaryAssignmentEn: 'C₂³⁷Cl³⁵Cl₂⁺',
    possibleSources: ['Trichlorethylen (Isotop)'],
    fragmentOf: ['TCE'],
    notes: 'TCE Cl-Isotopenpeak',
    diagnosticValue: 'minor'
  }
]

/**
 * Schneller Lookup nach Masse
 */
export const MASS_BY_NUMBER: Record<number, MassAssignment> = Object.fromEntries(
  MASS_REFERENCE.map(m => [m.mass, m])
)

/**
 * Gibt die Massenzuordnung für eine bestimmte Masse zurück
 */
export function getMassAssignment(mass: number): MassAssignment | undefined {
  return MASS_BY_NUMBER[Math.round(mass)]
}

/**
 * Findet alle Massen mit kritischem diagnostischen Wert
 */
export function getCriticalMasses(): MassAssignment[] {
  return MASS_REFERENCE.filter(m => m.diagnosticValue === 'critical')
}

/**
 * Findet alle Massen, die zu einem bestimmten Gas gehören (als Fragment oder Hauptpeak)
 */
export function getMassesForGas(gasKey: string): MassAssignment[] {
  return MASS_REFERENCE.filter(
    m => m.possibleSources.some(s => s.toLowerCase().includes(gasKey.toLowerCase())) ||
         m.fragmentOf.some(f => f.toLowerCase().includes(gasKey.toLowerCase()))
  )
}
