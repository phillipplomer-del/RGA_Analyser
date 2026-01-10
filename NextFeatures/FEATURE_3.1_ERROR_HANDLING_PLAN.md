# Error Handling Spezifikation

## Übersicht

Dieses Dokument definiert alle Fehlerfälle, deren Erkennung und Behandlung für die RGA Analyser App. Ziel ist eine robuste Anwendung, die auch mit problematischen Daten umgehen kann.

---

## 1. Fehler-Kategorien

### 1.1 Klassifikation

| Kategorie | Schwere | Reaktion | Beispiel |
|-----------|---------|----------|----------|
| **Fatal** | Kritisch | Abbruch + Fehlermeldung | Datei nicht lesbar |
| **Error** | Hoch | Operation abbrechen, Daten verwerfen | Parser-Fehler |
| **Warning** | Mittel | Fortfahren mit Warnung | Fehlende Metadaten |
| **Info** | Niedrig | Hinweis anzeigen | Suboptimale Einstellungen |
| **Silent** | Keine | Automatisch korrigieren | Whitespace trimmen |

### 1.2 Fehler-Interface

```typescript
interface AppError {
  id: string;                    // Eindeutige ID (z.B. "PARSE_001")
  category: 'fatal' | 'error' | 'warning' | 'info';
  code: string;                  // Maschinenlesbarer Code
  message: string;               // User-freundliche Nachricht (i18n key)
  details?: string;              // Technische Details (für Entwickler)
  timestamp: Date;
  source: 'parser' | 'analysis' | 'export' | 'ui' | 'network';
  recoverable: boolean;
  recovery?: {
    action: string;              // z.B. "retry", "skip", "use_default"
    automatic: boolean;
    userPrompt?: string;         // Frage an User wenn nicht automatisch
  };
  context?: Record<string, unknown>;  // Zusätzliche Infos
}

// Error Store
interface ErrorState {
  errors: AppError[];
  hasBlockingError: boolean;
  
  addError: (error: AppError) => void;
  dismissError: (id: string) => void;
  clearAll: () => void;
}
```

---

## 2. Parser-Fehler

### 2.1 Datei-Ebene

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `PARSE_001` | Datei nicht lesbar | FileReader.onerror | Fatal: "Datei konnte nicht gelesen werden" |
| `PARSE_002` | Datei leer | content.length === 0 | Fatal: "Datei ist leer" |
| `PARSE_003` | Falsches Format | Kein sep=; oder kein Header | Fatal: "Ungültiges Dateiformat. Erwartet: Pfeiffer .asc/.csv" |
| `PARSE_004` | Falsche Kodierung | Nicht-UTF8 Zeichen | Warning: Versuche Latin-1, dann Fehler |
| `PARSE_005` | Datei zu groß | size > MAX_FILE_SIZE | Fatal: "Datei zu groß (max. 50 MB)" |
| `PARSE_006` | Datei zu klein | Weniger als 10 Datenpunkte | Error: "Zu wenige Datenpunkte für Analyse" |

### 2.2 Metadaten-Fehler

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `META_001` | Gerätename fehlt | Zeile "Gerät:" nicht gefunden | Warning: "Unbekannt" als Fallback |
| `META_002` | Datum ungültig | Regex-Match fehlgeschlagen | Warning: Aktuelles Datum verwenden |
| `META_003` | Intervall fehlt | Zeile "Messintervall:" nicht gefunden | Warning: Aus Zeitstempeln berechnen |
| `META_004` | Sensortyp unbekannt | Nicht in SENSOR_TYPES | Info: "UNKNOWN" verwenden |
| `META_005` | Inkonsistente Metadaten | Datum in Header ≠ Datum in Daten | Warning: Daten-Datum bevorzugen |

### 2.3 Datenzeilen-Fehler

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `DATA_001` | Zeile nicht parsebar | Split ergibt < 3 Felder | Skip: Zeile überspringen, Warning wenn > 5% |
| `DATA_002` | Druck nicht parsebar | parseFloat → NaN | Skip: Zeile überspringen |
| `DATA_003` | Zeitstempel ungültig | Date.parse → Invalid Date | Skip oder Interpolation |
| `DATA_004` | Negatives Druck | pressure < 0 | Error: Physikalisch unmöglich |
| `DATA_005` | Druck = 0 exakt | pressure === 0 | Warning: Sensor aus? Zeile markieren |
| `DATA_006` | Druck außer Bereich | pressure > 1000 oder < 1e-15 | Warning: Clipping auf Bereich |

### 2.4 Zeitstempel-Probleme

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `TIME_001` | Nicht monoton steigend | t[i] <= t[i-1] | Warning + Sortieren oder Ablehnen |
| `TIME_002` | Duplikate | t[i] === t[i-1] | Silent: Zweiten Wert verwerfen |
| `TIME_003` | Große Lücke | Δt > 10 × erwartetes Intervall | Warning: "Lücke von X min bei Zeitpunkt Y" |
| `TIME_004` | Zeitsprung rückwärts | t[i] << t[i-1] | Error: "Zeitsprung erkannt - Uhr verstellt?" |
| `TIME_005` | Inkonsistentes Intervall | Standardabweichung > 20% | Info: "Unregelmäßige Abtastung" |

### 2.5 Parser Recovery-Strategien

```typescript
interface ParserOptions {
  // Wie viele fehlerhafte Zeilen tolerieren?
  maxSkippedLines: number;        // Default: 10% der Gesamtzeilen
  maxConsecutiveSkips: number;    // Default: 5 (dann abbrechen)
  
  // Automatische Korrekturen
  autoSortTimestamps: boolean;    // Default: true
  autoRemoveDuplicates: boolean;  // Default: true
  autoInterpolateGaps: boolean;   // Default: false (User-Entscheidung)
  
  // Strenge
  strictMode: boolean;            // Default: false (bei true: jeder Fehler = Abbruch)
}

interface ParseResult {
  success: boolean;
  data?: RateOfRiseData | TimeSeriesData;
  errors: AppError[];
  warnings: AppError[];
  stats: {
    totalLines: number;
    parsedLines: number;
    skippedLines: number;
    interpolatedPoints: number;
    correctedTimestamps: number;
  };
}
```

---

## 3. Analyse-Fehler

### 3.1 Allgemeine Analyse

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `ANAL_001` | Zu wenige Punkte für Fit | n < 3 | Error: "Mindestens 3 Punkte für Regression nötig" |
| `ANAL_002` | Fit konvergiert nicht | Iterationen > Max | Error: "Regression nicht möglich" |
| `ANAL_003` | R² zu niedrig | r2 < 0.5 | Warning: "Schlechte Fit-Qualität" |
| `ANAL_004` | Division durch Null | Volumen = 0 | Error: "Volumen muss > 0 sein" |
| `ANAL_005` | Numerischer Überlauf | Infinity oder NaN | Error: "Numerischer Fehler" |

### 3.2 Rate-of-Rise spezifisch

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `ROR_001` | Keine Baseline erkannt | Varianz überall hoch | Warning: "Keine stabile Baseline" |
| `ROR_002` | Kein Anstieg erkannt | dp/dt ≈ 0 | Info: "Kein signifikanter Druckanstieg" |
| `ROR_003` | Negativer Anstieg | dp/dt < 0 | Warning: "Druck fällt - Pumpdown statt RoR?" |
| `ROR_004` | Baseline länger als Daten | baselineEnd > 90% | Warning: "Keine Anstiegsphase erkannt" |
| `ROR_005` | Sensor-Drift in Baseline | Steigung in Baseline > Threshold | Warning: "Sensor-Drift erkannt" |
| `ROR_006` | Sprung statt Anstieg | Einzelner Sprung > 10× | Warning: "Drucksprung - Ventil-Event?" |

### 3.3 Zeitreihen spezifisch

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `TS_001` | Keine Scans gefunden | scans.length === 0 | Fatal: "Keine Scan-Daten" |
| `TS_002` | Scan ohne Daten | masses.length === 0 | Error: Scan überspringen |
| `TS_003` | Inkonsistente Massen | Massen variieren zwischen Scans | Warning: Nur gemeinsame Massen |
| `TS_004` | Zeitüberlappung | Scans überlappen sich zeitlich | Warning: Letzten Wert verwenden |
| `TS_005` | Alle Werte identisch | stdDev === 0 | Warning: "Keine Variation in Daten" |

---

## 4. Export-Fehler

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `EXP_001` | PDF-Erstellung fehlgeschlagen | jsPDF Exception | Error: "PDF konnte nicht erstellt werden" |
| `EXP_002` | Chart-Rendering fehlgeschlagen | Canvas/SVG leer | Error: "Chart konnte nicht gerendert werden" |
| `EXP_003` | Download blockiert | Blob URL nicht erstellt | Error: "Download fehlgeschlagen - Popup-Blocker?" |
| `EXP_004` | Dateiname ungültig | Sonderzeichen | Silent: Automatisch bereinigen |
| `EXP_005` | Zu viele Daten für Export | > 1M Zeilen CSV | Warning: "Export wird unterteilt" |

---

## 5. UI-Fehler

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `UI_001` | Ungültige Eingabe | Validation fehlgeschlagen | Inline-Fehler am Feld |
| `UI_002` | Bereich ungültig | start > end | Error: "Ungültiger Bereich" |
| `UI_003` | Wert außer Bereich | value < min oder > max | Warning + Clipping |
| `UI_004` | Chart-Container zu klein | width < 200 oder height < 100 | Warning: "Fenster zu klein" |
| `UI_005` | Browser nicht unterstützt | Fehlende APIs | Fatal: "Browser nicht unterstützt" |

---

## 6. Netzwerk-Fehler (für KI-Integration)

| Code | Fehler | Erkennung | Behandlung |
|------|--------|-----------|------------|
| `NET_001` | Keine Verbindung | fetch rejected | Error: "Keine Internetverbindung" |
| `NET_002` | API-Key ungültig | 401 Response | Error: "API-Key ungültig" |
| `NET_003` | Rate Limit | 429 Response | Warning: "Zu viele Anfragen - warte X Sekunden" |
| `NET_004` | Server-Fehler | 5xx Response | Error: "Server nicht erreichbar" |
| `NET_005` | Timeout | AbortController timeout | Warning: "Anfrage abgebrochen - erneut versuchen?" |

---

## 7. Error-UI Komponenten

### 7.1 Toast-Benachrichtigungen

```typescript
interface ToastConfig {
  position: 'top-right' | 'bottom-right' | 'bottom-center';
  duration: {
    info: 3000,
    warning: 5000,
    error: 0,      // Manuell schließen
    fatal: 0
  };
  maxVisible: 3;   // Älteste ausblenden
}
```

### 7.2 Inline-Fehler (Formularfelder)

```tsx
// Beispiel: Volumen-Eingabe
<InputField
  label="Kammervolumen"
  value={volume}
  error={volumeError}  // z.B. "Muss größer als 0 sein"
  onChange={setVolume}
/>
```

### 7.3 Error-Boundary (React)

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Logging an Sentry/Analytics
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
```

### 7.4 Leere Zustände

```tsx
// Wenn keine Daten geladen
<EmptyState
  icon={<FileIcon />}
  title="Keine Daten"
  description="Laden Sie eine .asc oder .csv Datei"
  action={<UploadButton />}
/>

// Wenn Analyse fehlgeschlagen
<EmptyState
  icon={<AlertIcon />}
  title="Analyse nicht möglich"
  description="Die Daten konnten nicht analysiert werden"
  error={analysisError}
  action={<RetryButton />}
/>
```

---

## 8. Validierungs-Regeln

### 8.1 Eingabefelder

```typescript
const validationRules = {
  // Kammervolumen
  volume: {
    type: 'number',
    required: false,           // Optional für reine dp/dt Berechnung
    min: 0.001,                // 1 mL
    max: 100000,               // 100 m³
    warnings: {
      below: { value: 0.1, message: "Sehr kleines Volumen" },
      above: { value: 1000, message: "Sehr großes Volumen" }
    }
  },
  
  // Leckraten-Grenzwert
  leakRateLimit: {
    type: 'number',
    required: false,
    min: 1e-14,
    max: 1e-3,
    format: 'scientific'       // Akzeptiert "1e-9" und "1×10⁻⁹"
  },
  
  // Zeitbereich
  timeRange: {
    type: 'range',
    validate: (start, end, data) => {
      if (start >= end) return "Startzeit muss vor Endzeit liegen";
      if (start < 0) return "Startzeit muss >= 0 sein";
      if (end > data.duration) return "Endzeit überschreitet Datenlänge";
      if ((end - start) < 10) return "Mindestens 10 Sekunden auswählen";
      return null;
    }
  },
  
  // Massen-Auswahl
  massSelection: {
    type: 'array',
    minItems: 1,
    maxItems: 20,
    message: "Wählen Sie 1-20 Massen aus"
  }
};
```

### 8.2 Validierungs-Hooks

```typescript
function useValidation<T>(value: T, rules: ValidationRules): ValidationResult {
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  
  useEffect(() => {
    const result = validate(value, rules);
    setError(result.error);
    setWarning(result.warning);
  }, [value, rules]);
  
  return { error, warning, isValid: !error };
}

// Verwendung
function VolumeInput() {
  const [volume, setVolume] = useState<number | null>(null);
  const { error, warning, isValid } = useValidation(volume, validationRules.volume);
  
  return (
    <InputField
      value={volume}
      onChange={setVolume}
      error={error}
      warning={warning}
    />
  );
}
```

---

## 9. Logging & Telemetrie

### 9.1 Error-Logging

```typescript
interface ErrorLog {
  error: AppError;
  userAgent: string;
  appVersion: string;
  sessionId: string;
  stackTrace?: string;
  screenshot?: string;        // Base64 bei UI-Fehlern
}

function logError(error: AppError, context?: unknown) {
  // Lokales Logging
  console.error(`[${error.code}] ${error.message}`, context);
  
  // Remote Logging (optional, GDPR-konform)
  if (userConsentedToTelemetry) {
    sendToAnalytics({
      event: 'error',
      category: error.category,
      code: error.code,
      // Keine personenbezogenen Daten!
    });
  }
}
```

### 9.2 Error-Export für Support

```typescript
function exportErrorReport(): string {
  const report = {
    timestamp: new Date().toISOString(),
    appVersion: APP_VERSION,
    errors: errorStore.errors,
    systemInfo: {
      browser: navigator.userAgent,
      language: navigator.language,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    },
    recentActions: actionHistory.slice(-20)  // Letzte 20 Aktionen
  };
  
  return JSON.stringify(report, null, 2);
}
```

---

## 10. Recovery-Strategien

### 10.1 Automatische Recovery

| Fehler | Recovery |
|--------|----------|
| Zeitstempel nicht sortiert | Automatisch sortieren |
| Duplikate | Automatisch entfernen |
| Leere Zeilen | Überspringen |
| Whitespace | Trimmen |
| Deutsches Zahlenformat | Komma → Punkt |
| Fehlende Metadaten | Defaults verwenden |

### 10.2 User-Entscheidung erforderlich

| Fehler | Optionen für User |
|--------|-------------------|
| Große Datenlücke | "Interpolieren" / "Lücke lassen" / "Abbrechen" |
| Sensor-Ausfall | "Bereich ausschließen" / "Trotzdem analysieren" |
| Niedriges R² | "Anderen Bereich wählen" / "Akzeptieren" |
| Grenzwert überschritten | "Report trotzdem erstellen" / "Abbrechen" |

### 10.3 Recovery-Dialog

```tsx
function RecoveryDialog({ error, options, onSelect }) {
  return (
    <Dialog title="Problem erkannt">
      <p>{error.message}</p>
      
      {error.details && (
        <details>
          <summary>Technische Details</summary>
          <pre>{error.details}</pre>
        </details>
      )}
      
      <div className="options">
        {options.map(option => (
          <button key={option.action} onClick={() => onSelect(option)}>
            {option.label}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
```

---

## 11. Implementierungs-Checkliste

### Phase 1: Grundgerüst
- [ ] Error-Interface definieren
- [ ] Error-Store erstellen
- [ ] Toast-Komponente
- [ ] Error-Boundary

### Phase 2: Parser-Fehler
- [ ] Alle PARSE_* Fehler implementieren
- [ ] Alle DATA_* Fehler implementieren
- [ ] Alle TIME_* Fehler implementieren
- [ ] Recovery-Optionen

### Phase 3: Analyse-Fehler
- [ ] Alle ANAL_* Fehler implementieren
- [ ] Alle ROR_* Fehler implementieren
- [ ] Alle TS_* Fehler implementieren

### Phase 4: UI-Fehler
- [ ] Validierung für alle Eingabefelder
- [ ] Inline-Fehlermeldungen
- [ ] Leere Zustände

### Phase 5: Polish
- [ ] i18n für alle Fehlermeldungen
- [ ] Logging implementieren
- [ ] Error-Export für Support

---

*Spezifikation erstellt: Januar 2026*
*Für: RGA Analyser App*
