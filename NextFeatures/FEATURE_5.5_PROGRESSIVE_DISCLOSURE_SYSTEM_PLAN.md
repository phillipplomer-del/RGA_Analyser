# Plan: Progressive Disclosure System (5.5)

## Ausgangslage

**Aktueller Stand:** RGA Analyser hat 46 geplante Features, davon sind bereits 18+ implementiert. Alle Features sind gleichwertig sichtbar, was zu kognitiver Überlastung führen kann.

**Problem:**
- User werden mit zu vielen Features gleichzeitig konfrontiert
- Wissenschaftliche Power-Features (Kinetic Fingerprinting, Robust Regression) sind für Basic-User überwältigend
- Keine Unterscheidung zwischen "immer nötig" vs. "nur manchmal relevant"
- Risk: Je mehr Features wir hinzufügen, desto unübersichtlicher wird die App

---

## Was ist Progressive Disclosure?

**Definition:** UI/UX-Prinzip, das Komplexität schrittweise enthüllt - User sehen nur was sie aktuell brauchen.

**Drei-Stufen-Modell für RGA Analyser:**

### Basic Mode (Default, 80% der User)
- RGA Spektrum mit automatischer Diagnose
- Top 3 wichtigste Findings prominent angezeigt
- Konfidenz-Score Badge
- "Learn More" Buttons zu Details

### Advanced Mode (Toggle in Settings)
- Alle Detektoren sichtbar
- Isotopen-Analyse aktiv
- Peak-Deconvolution verfügbar
- Statistical Uncertainty Anzeige

### Expert Mode (Power Users)
- Kinetic Fingerprinting
- Background Subtraction
- Custom LOD Settings
- Alle Parameter editierbar

**Anwendungsfall:** Wissenschaftler/Ingenieure brauchen unterschiedliche Feature-Tiefen je nach:
- Erfahrungslevel (Neuling vs. Experte)
- Anwendungsfall (Schnell-Check vs. wissenschaftliche Publikation)
- Zeitbudget (5 Minuten vs. 2 Stunden Analyse)

---

## Wissenschaftliche Validierung

**Status:** - NICHT WISSENSCHAFTLICH (UI/UX Design Pattern)

**Recherchiert am:** 2026-01-10

### Quellen

| Source | URL | Type | Key Finding |
|--------|-----|------|-------------|
| Nielsen Norman Group | https://www.nngroup.com/articles/progressive-disclosure/ | UX Research Authority | "Show only what's necessary, hide the rest" - reduces cognitive load |
| Interaction Design Foundation | https://www.interaction-design.org/literature/article/progressive-disclosure | UX Encyclopedia | 3 Levels: Minimum (always), Medium (on demand), Maximum (expert) |
| Microsoft Design Guidelines | https://learn.microsoft.com/en-us/windows/apps/design/basics/progressive-disclosure | Industry Standard | "Reveal features gradually as users need them" |

**Validierungs-Zusammenfassung:**
- ✅ Etabliertes UX-Prinzip seit 1990er Jahren
- ✅ Reduziert kognitive Belastung nachweisbar
- ✅ Wird von professioneller Software genutzt (MATLAB, Photoshop, Hiden MASsoft)

**Limitationen:**
- Feature-Discovery kann leiden (User finden Features nicht)
- Onboarding-Flow kritisch wichtig
- Balance zwischen "zu viel versteckt" und "zu viel sichtbar"

---

## Geplante Implementierung

### Dateien zu ändern

| Datei | Änderung | Zeilen |
|-------|----------|--------|
| `src/stores/settingsStore.ts` | `analysisMode: 'basic' \| 'advanced' \| 'expert'` hinzufügen | ~10 |
| `src/components/Settings.tsx` | Mode-Switcher UI (Segmented Control) | ~50 |
| `src/components/DiagnosisPanel.tsx` | Conditional Feature Rendering basierend auf Mode | ~100 |
| `src/components/KnowledgePanel.tsx` | Advanced-Features in collapsible sections | ~80 |
| `src/lib/hooks/useVisibleFeatures.ts` | Custom Hook für Feature-Visibility-Logic | ~60 |

### Implementierungs-Schritte

#### Schritt 1: Settings Store erweitern

**Beschreibung:** Analysis Mode als User Preference speichern

**Code-Beispiel:**
```typescript
// src/stores/settingsStore.ts
interface SettingsState {
  analysisMode: 'basic' | 'advanced' | 'expert';
  // ... existing settings
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      analysisMode: 'basic', // default
      setAnalysisMode: (mode) => set({ analysisMode: mode }),
      // ...
    }),
    { name: 'rga-settings' }
  )
);
```

#### Schritt 2: Feature-Kategorisierung

**Beschreibung:** Jedes Feature einer Sichtbarkeits-Kategorie zuordnen

**Code-Beispiel:**
```typescript
// src/lib/hooks/useVisibleFeatures.ts
export const FEATURE_VISIBILITY = {
  // Automatisch (immer aktiv, nur Ergebnisse zeigen)
  automatic: [
    'rsfCorrection',
    'confidenceScore',
    'allDetectors', // laufen, zeigen nur Top 3 Findings
  ],

  // Basic Mode
  basic: [
    'topFindings',
    'confidenceBadge',
    'gasIdentification',
  ],

  // Advanced Mode
  advanced: [
    'allFindings', // nicht nur Top 3
    'isotopeAnalysis',
    'peakDeconvolution',
    'esdArtefacts',
  ],

  // Expert Mode
  expert: [
    'kineticFingerprinting',
    'backgroundSubtraction',
    'customLOD',
    'robustRegression',
    'statisticalUncertainty',
  ],

  // Kontext-sensitiv (nur wenn relevant)
  contextual: {
    esdPanel: (data) => hasESDArtefacts(data),
    isotopeWarning: (data) => hasIsotopeAnomaly(data),
  }
};

export function useVisibleFeatures() {
  const mode = useSettingsStore(state => state.analysisMode);
  const data = useRGAStore(state => state.data);

  return useMemo(() => {
    const features = [...FEATURE_VISIBILITY.basic];

    if (mode === 'advanced' || mode === 'expert') {
      features.push(...FEATURE_VISIBILITY.advanced);
    }

    if (mode === 'expert') {
      features.push(...FEATURE_VISIBILITY.expert);
    }

    // Kontext-sensitive Features
    Object.entries(FEATURE_VISIBILITY.contextual).forEach(([key, condition]) => {
      if (condition(data)) features.push(key);
    });

    return features;
  }, [mode, data]);
}
```

#### Schritt 3: DiagnosisPanel umbauen

**Beschreibung:** Conditional Rendering basierend auf Mode

**Code-Beispiel:**
```typescript
// src/components/DiagnosisPanel.tsx
export function DiagnosisPanel() {
  const visibleFeatures = useVisibleFeatures();
  const mode = useSettingsStore(state => state.analysisMode);

  return (
    <div>
      {/* Immer sichtbar */}
      <ConfidenceScore />
      <TopFindings limit={mode === 'basic' ? 3 : undefined} />

      {/* Advanced Mode */}
      {visibleFeatures.includes('isotopeAnalysis') && (
        <IsotopeAnalysisPanel />
      )}

      {/* Expert Mode */}
      {mode === 'expert' && (
        <Collapsible title="🔬 Advanced Analysis" defaultClosed>
          <KineticFingerprintingPanel />
          <StatisticalUncertaintyPanel />
          <BackgroundSubtractionPanel />
        </Collapsible>
      )}

      {/* Kontext-sensitiv */}
      {visibleFeatures.includes('esdPanel') && (
        <Alert severity="warning">
          <ESDArtefactPanel />
        </Alert>
      )}
    </div>
  );
}
```

#### Schritt 4: Settings UI

**Beschreibung:** Mode-Switcher in Settings

**Code-Beispiel:**
```typescript
// src/components/Settings.tsx
export function Settings() {
  const { analysisMode, setAnalysisMode } = useSettingsStore();

  return (
    <div>
      <h3>Analysis Depth</h3>
      <p className="text-sm text-gray-600">
        Control which features are visible in the analysis
      </p>

      <SegmentedControl
        value={analysisMode}
        onChange={setAnalysisMode}
        options={[
          {
            value: 'basic',
            label: 'Basic',
            description: 'Essential features only',
          },
          {
            value: 'advanced',
            label: 'Advanced',
            description: 'All standard features',
          },
          {
            value: 'expert',
            label: 'Expert',
            description: 'All features including experimental',
          },
        ]}
      />

      {/* Feature Preview */}
      <FeaturePreviewCard mode={analysisMode} />
    </div>
  );
}
```

#### Schritt 5: Onboarding Flow

**Beschreibung:** First-time User Wizard

**Code-Beispiel:**
```typescript
// src/components/OnboardingWizard.tsx
export function OnboardingWizard() {
  return (
    <Dialog>
      <h2>Welcome to RGA Analyser!</h2>

      <Step1>
        <p>We'll start with <strong>Basic Mode</strong></p>
        <ul>
          <li>✓ Automatic gas identification</li>
          <li>✓ Top 3 most important findings</li>
          <li>✓ Quality score</li>
        </ul>
      </Step1>

      <Step2>
        <p>You can unlock more features anytime in Settings:</p>
        <Badge>⚙️ Settings → Analysis Depth</Badge>
      </Step2>
    </Dialog>
  );
}
```

---

## Geschätzter Aufwand

- **Planung & Design:** 2h
- **Implementation:**
  - Settings Store Extension: 1h
  - useVisibleFeatures Hook: 2h
  - DiagnosisPanel Refactoring: 2h
  - Settings UI: 1.5h
  - Onboarding Wizard: 1.5h
- **Testing:** 1h
- **Dokumentation:** 0.5h
- **Gesamt:** **~11.5h** (aufgerundet: **12h**)

**Phasierung:**
- Phase 1 (MVP): Basic/Advanced Toggle (6h)
- Phase 2 (Polish): Expert Mode + Onboarding (4h)
- Phase 3 (Refinement): Feature-Discovery Hints (2h)

---

## Verifikation

**Test-Szenarien:**

1. **Test 1: Basic Mode User**
   - Input: New user, first file upload
   - Expected: Sieht nur Top 3 Findings + Confidence Score
   - Actual: [TBD]

2. **Test 2: Mode Switching**
   - Input: Basic → Advanced → Expert
   - Expected: Features erscheinen graduell, keine Crashes
   - Actual: [TBD]

3. **Test 3: Context-Sensitive Features**
   - Input: File mit ESD-Artefakten
   - Expected: ESD-Panel erscheint automatisch, auch in Basic Mode
   - Actual: [TBD]

4. **Test 4: Settings Persistence**
   - Input: Expert Mode → App reload
   - Expected: Bleibt im Expert Mode
   - Actual: [TBD]

**Erfolgs-Kriterien:**
- [ ] Basic Mode zeigt max. 3-5 UI-Elemente
- [ ] Advanced Mode zeigt 8-12 UI-Elemente
- [ ] Expert Mode zeigt alle Features (15+)
- [ ] Kontext-sensitive Features erscheinen unabhängig vom Mode
- [ ] Settings werden persistiert (localStorage)
- [ ] Onboarding erscheint für neue User
- [ ] Keine Regressions in bestehenden Features

---

## Integration mit bestehenden Features

**Features die IMMER laufen (unsichtbar):**
- RSF-Korrekturen
- Alle Detektoren (nur Ergebnisse filtern nach Mode)
- Konfidenz-Score Berechnung

**Features die NUR in Advanced/Expert sichtbar sind:**
- Isotopen-Analyse Panel (Advanced)
- Peak-Deconvolution Details (Advanced)
- Kinetic Fingerprinting (Expert)
- Robust Regression Options (Expert)
- Statistical Uncertainty (Expert)

**Features die KONTEXT-SENSITIV sind:**
- ESD-Artefakt Panel (wenn detektiert)
- Helium-Leck Warnung (wenn m/z 4 erhöht)
- Oil Backstreaming Warnung (wenn Pattern erkannt)

---

## Changelog

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-01-10 | ⬜ Geplant | Initiale Planung - Feature 5.5 erstellt |

---

**Template-Version:** 1.0
**Erstellt:** 2026-01-10
**Autor:** Claude Code
