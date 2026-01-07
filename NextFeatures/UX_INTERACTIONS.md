# UX Interactions Spezifikation

## Übersicht

Dieses Dokument definiert alle Benutzerinteraktionen für die RGA Analyser App: Maus, Tastatur, Touch, Gesten und Feedback-Verhalten.

---

## 1. Interaktions-Prinzipien

### 1.1 Design-Grundsätze

| Prinzip | Beschreibung |
|---------|--------------|
| **Vorhersagbar** | Gleiche Aktion = gleiches Ergebnis, überall |
| **Rückgängig machbar** | Jede Aktion kann rückgängig gemacht werden |
| **Feedback** | Sofortige visuelle Rückmeldung |
| **Erreichbar** | Wichtige Aktionen mit wenigen Klicks/Tasten |
| **Tolerant** | Fehler verzeihen, leicht korrigierbar |

### 1.2 Interaktions-Hierarchie

```
Primär:   Maus/Touch (visuell, intuitiv)
Sekundär: Tastatur (schnell, für Power-User)
Tertiär:  Touch-Gesten (mobil)
```

---

## 2. Maus-Interaktionen

### 2.1 Chart-Interaktionen

#### Zoom

| Aktion | Effekt | Bereich |
|--------|--------|---------|
| **Scroll-Rad** | Zoom in/out | Zentriert auf Cursor |
| **Shift + Scroll** | Nur X-Achse zoomen | - |
| **Ctrl + Scroll** | Nur Y-Achse zoomen | - |
| **Doppelklick** | Reset Zoom | Gesamter Chart |
| **Click + Drag (leer)** | Rechteck-Zoom | Ausgewählter Bereich |

```typescript
interface ZoomBehavior {
  // Scroll
  onWheel: (event: WheelEvent) => {
    const delta = event.deltaY > 0 ? 0.9 : 1.1;  // Zoom-Faktor
    const point = getMousePosition(event);
    
    if (event.shiftKey) {
      zoomX(delta, point.x);
    } else if (event.ctrlKey) {
      zoomY(delta, point.y);
    } else {
      zoomBoth(delta, point);
    }
  };
  
  // Doppelklick
  onDoubleClick: () => {
    resetZoom();
  };
  
  // Rechteck-Zoom
  onDragStart: (event: MouseEvent) => {
    if (isEmptyArea(event)) {
      startRectangleSelection(event);
    }
  };
  
  onDragEnd: (start: Point, end: Point) => {
    zoomToRectangle(start, end);
  };
}
```

#### Pan (Verschieben)

| Aktion | Effekt |
|--------|--------|
| **Mittlere Maustaste + Drag** | Pan in alle Richtungen |
| **Rechtsklick + Drag** | Pan (Alternative) |
| **Shift + Linksklick + Drag** | Pan (Alternative) |

```typescript
interface PanBehavior {
  onMiddleMouseDrag: (dx: number, dy: number) => {
    panChart(dx, dy);
  };
  
  onRightClickDrag: (dx: number, dy: number) => {
    panChart(dx, dy);
  };
}
```

#### Bereichsauswahl (Brush)

| Aktion | Effekt |
|--------|--------|
| **Linksklick + Drag** | Bereich auswählen |
| **Handles ziehen** | Bereich anpassen |
| **Bereich ziehen** | Bereich verschieben |
| **Klick außerhalb** | Auswahl aufheben |
| **Doppelklick auf Bereich** | Zoom auf Bereich |

```typescript
interface BrushBehavior {
  // Neuer Bereich
  onDragStart: (x: number) => {
    startBrush(x);
    setCursor('col-resize');
  };
  
  onDrag: (x: number) => {
    updateBrush(x);
    showPreview();
  };
  
  onDragEnd: () => {
    finalizeBrush();
    setCursor('default');
  };
  
  // Handle anpassen
  onHandleDrag: (handle: 'start' | 'end', x: number) => {
    updateBrushHandle(handle, x);
  };
  
  // Bereich verschieben
  onAreaDrag: (dx: number) => {
    moveBrush(dx);
  };
  
  // Aufheben
  onClickOutside: () => {
    clearBrush();
  };
}
```

#### Tooltip & Hover

| Aktion | Effekt |
|--------|--------|
| **Hover über Datenpunkt** | Tooltip mit Details |
| **Hover über Linie** | Nächster Punkt highlighten |
| **Hover über Grenzwert** | Grenzwert-Info anzeigen |

```typescript
interface TooltipBehavior {
  // Verzögerung
  showDelay: 200;   // ms
  hideDelay: 100;   // ms
  
  // Positionierung
  position: 'auto';  // Folgt Cursor, bleibt im Viewport
  offset: { x: 10, y: 10 };
  
  // Inhalt
  content: (dataPoint: DataPoint) => {
    return {
      title: `Masse ${dataPoint.mass} AMU`,
      rows: [
        { label: 'Zeit', value: formatTime(dataPoint.time) },
        { label: 'Druck', value: formatPressure(dataPoint.pressure) },
        { label: 'Normiert', value: formatPercent(dataPoint.normalized) }
      ]
    };
  };
}
```

### 2.2 Tabellen-Interaktionen

| Aktion | Effekt |
|--------|--------|
| **Klick auf Spalte** | Sortieren (toggle asc/desc) |
| **Klick auf Zeile** | Zeile auswählen |
| **Ctrl + Klick** | Mehrfachauswahl |
| **Shift + Klick** | Bereich auswählen |
| **Doppelklick auf Zelle** | Wert kopieren |
| **Rechtsklick** | Kontextmenü |

### 2.3 Datei-Upload

| Aktion | Effekt |
|--------|--------|
| **Klick auf Dropzone** | Datei-Dialog öffnen |
| **Drag & Drop** | Datei(en) laden |
| **Drag über Dropzone** | Visuelles Feedback (Rahmen) |

```typescript
interface DropzoneBehavior {
  // Visual Feedback
  onDragEnter: () => {
    setHighlighted(true);
    showDropMessage('Datei hier ablegen');
  };
  
  onDragLeave: () => {
    setHighlighted(false);
  };
  
  onDrop: (files: FileList) => {
    setHighlighted(false);
    processFiles(files);
  };
  
  // Styling
  styles: {
    default: { border: '2px dashed #ccc' },
    highlighted: { border: '2px solid #0097E0', background: 'rgba(0,151,224,0.1)' },
    error: { border: '2px solid #F87171' }
  };
}
```

### 2.4 Cursor-Zustände

| Kontext | Cursor |
|---------|--------|
| Standard | `default` |
| Klickbar | `pointer` |
| Drag möglich | `grab` |
| Während Drag | `grabbing` |
| Bereichsauswahl | `col-resize` oder `crosshair` |
| Nicht erlaubt | `not-allowed` |
| Laden | `wait` oder `progress` |
| Text auswählbar | `text` |
| Zoom | `zoom-in` / `zoom-out` |

---

## 3. Tastatur-Interaktionen

### 3.1 Globale Shortcuts

| Shortcut | Aktion | Kontext |
|----------|--------|---------|
| `Ctrl + O` | Datei öffnen | Global |
| `Ctrl + S` | Speichern/Exportieren | Wenn Daten geladen |
| `Ctrl + Z` | Rückgängig | Global |
| `Ctrl + Shift + Z` | Wiederholen | Global |
| `Ctrl + P` | PDF exportieren | Wenn Daten geladen |
| `Escape` | Dialog schließen / Auswahl aufheben | Global |
| `F11` | Vollbild | Global |
| `?` oder `F1` | Hilfe anzeigen | Global |

### 3.2 Chart-Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Zoom reset |
| `L` | Log-Skala toggle |
| `G` | GSI-Grenzwert toggle |
| `C` | CERN-Grenzwert toggle |
| `←` `→` | Pan horizontal |
| `↑` `↓` | Pan vertikal (oder Zoom) |
| `Home` | Zum Anfang |
| `End` | Zum Ende |
| `Space` | Play/Pause (Animation) |

### 3.3 Tabellen-Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `↑` `↓` | Zeile wechseln |
| `Enter` | Zeile auswählen / Details |
| `Ctrl + A` | Alle auswählen |
| `Ctrl + C` | Ausgewählte kopieren |
| `Delete` | Ausgewählte ausschließen |

### 3.4 Eingabefeld-Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `Tab` | Nächstes Feld |
| `Shift + Tab` | Vorheriges Feld |
| `Enter` | Bestätigen |
| `Escape` | Abbrechen / Zurücksetzen |
| `↑` `↓` | Wert erhöhen/verringern (bei Zahlen) |

### 3.5 Shortcut-Hilfe Overlay

```tsx
function ShortcutHelp() {
  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['Ctrl', 'O'], action: 'Datei öffnen' },
      { keys: ['Ctrl', 'S'], action: 'Exportieren' },
    ]},
    { category: 'Chart', items: [
      { keys: ['L'], action: 'Log-Skala' },
      { keys: ['+', '-'], action: 'Zoom' },
    ]},
    // ...
  ];
  
  return (
    <Dialog className="shortcut-help">
      <h2>Tastaturkürzel</h2>
      {shortcuts.map(cat => (
        <section key={cat.category}>
          <h3>{cat.category}</h3>
          <dl>
            {cat.items.map(item => (
              <div key={item.action}>
                <dt>{item.keys.map(k => <kbd key={k}>{k}</kbd>)}</dt>
                <dd>{item.action}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </Dialog>
  );
}
```

---

## 4. Touch-Interaktionen

### 4.1 Gesten

| Geste | Aktion |
|-------|--------|
| **Tap** | Klick (Auswahl) |
| **Double Tap** | Zoom reset / Details |
| **Long Press** | Kontextmenü |
| **Drag (1 Finger)** | Pan |
| **Pinch** | Zoom |
| **Pinch + Rotate** | - (nicht verwendet) |
| **Swipe** | Navigation zwischen Views |

### 4.2 Touch-Targets

Mindestgröße für Touch-Elemente:
- Buttons: 44 × 44 px
- Touch-Targets: 48 × 48 px (inkl. Padding)
- Abstände zwischen Targets: mindestens 8 px

### 4.3 Touch-spezifisches Verhalten

```typescript
interface TouchBehavior {
  // Pinch-to-Zoom
  onPinch: (scale: number, center: Point) => {
    zoomChart(scale, center);
  };
  
  // Long Press für Tooltip (kein Hover auf Touch)
  onLongPress: (point: Point, dataPoint?: DataPoint) => {
    if (dataPoint) {
      showTooltipFixed(dataPoint);
    } else {
      showContextMenu(point);
    }
  };
  
  // Tap dismisst Tooltip
  onTapOutside: () => {
    hideTooltip();
    hideContextMenu();
  };
}
```

---

## 5. Kontextmenü

### 5.1 Chart-Kontextmenü

```typescript
const chartContextMenu: MenuItem[] = [
  { label: 'Zoom zurücksetzen', action: 'resetZoom', icon: 'reset' },
  { divider: true },
  { label: 'Als PNG exportieren', action: 'exportPNG', icon: 'image' },
  { label: 'Als SVG exportieren', action: 'exportSVG', icon: 'vector' },
  { divider: true },
  { label: 'Punkt ausschließen', action: 'excludePoint', icon: 'remove', 
    condition: (ctx) => ctx.nearestPoint !== null },
  { label: 'Bereich als Baseline', action: 'setBaseline', icon: 'baseline',
    condition: (ctx) => ctx.hasSelection },
];
```

### 5.2 Tabellen-Kontextmenü

```typescript
const tableContextMenu: MenuItem[] = [
  { label: 'Kopieren', action: 'copy', icon: 'copy', shortcut: 'Ctrl+C' },
  { label: 'Details anzeigen', action: 'showDetails', icon: 'info' },
  { divider: true },
  { label: 'Im Chart markieren', action: 'highlightInChart', icon: 'highlight' },
  { label: 'Zeile ausschließen', action: 'excludeRow', icon: 'remove' },
  { divider: true },
  { label: 'Alle auswählen', action: 'selectAll', shortcut: 'Ctrl+A' },
];
```

---

## 6. Drag & Drop

### 6.1 Datei-Upload

```typescript
interface FileDropHandler {
  // Validierung
  validateFile: (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: 'Ungültiges Format' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'Datei zu groß' };
    }
    return { valid: true };
  };
  
  // Feedback während Drag
  onDragOver: (event: DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer?.items;
    if (files && files.length > 0) {
      const isValid = validateFile(files[0].getAsFile());
      setDropFeedback(isValid ? 'valid' : 'invalid');
    }
  };
}
```

### 6.2 Sortieren per Drag

```typescript
interface DragSortHandler {
  // Für Reihenfolge von Massen, Serien etc.
  onDragStart: (index: number) => {
    setDraggingIndex(index);
  };
  
  onDragOver: (targetIndex: number) => {
    if (targetIndex !== draggingIndex) {
      setDropPreview(targetIndex);
    }
  };
  
  onDrop: (targetIndex: number) => {
    reorderItems(draggingIndex, targetIndex);
    setDraggingIndex(null);
    setDropPreview(null);
  };
}
```

---

## 7. Undo/Redo System

### 7.1 Aktionen die Undo unterstützen

| Aktion | Undo möglich | Beschreibung |
|--------|--------------|--------------|
| Bereichsauswahl ändern | ✓ | Zurück zur vorherigen Auswahl |
| Punkt ausschließen | ✓ | Punkt wieder einschließen |
| Zoom/Pan | ✓ | Zurück zur vorherigen Ansicht |
| Datei laden | ✗ | Nicht rückgängig (neue Session) |
| Export | ✗ | Nicht rückgängig |
| Grenzwert ändern | ✓ | Zum vorherigen Wert |

### 7.2 Implementation

```typescript
interface UndoState {
  // Stack
  past: AppState[];
  present: AppState;
  future: AppState[];
  
  // Max History
  maxHistory: 50;
}

interface UndoActions {
  push: (state: AppState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

// Zustand Store mit Undo
const useUndoStore = create<UndoState & UndoActions>((set, get) => ({
  past: [],
  present: initialState,
  future: [],
  maxHistory: 50,
  
  push: (state) => set((s) => ({
    past: [...s.past.slice(-s.maxHistory), s.present],
    present: state,
    future: []
  })),
  
  undo: () => set((s) => {
    if (s.past.length === 0) return s;
    const previous = s.past[s.past.length - 1];
    const newPast = s.past.slice(0, -1);
    return {
      past: newPast,
      present: previous,
      future: [s.present, ...s.future]
    };
  }),
  
  redo: () => set((s) => {
    if (s.future.length === 0) return s;
    const next = s.future[0];
    const newFuture = s.future.slice(1);
    return {
      past: [...s.past, s.present],
      present: next,
      future: newFuture
    };
  }),
  
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  clear: () => set({ past: [], future: [] })
}));
```

---

## 8. Feedback-Verhalten

### 8.1 Lade-Zustände

| Kontext | Feedback |
|---------|----------|
| Datei parsen | Spinner + Progress (%) |
| Analyse berechnen | Spinner + Text |
| Export generieren | Spinner + Progress |
| KI-Anfrage | Typing-Indikator |

```tsx
// Skeleton während Laden
function ChartSkeleton() {
  return (
    <div className="chart-skeleton">
      <div className="skeleton-pulse chart-area" />
      <div className="skeleton-pulse x-axis" />
      <div className="skeleton-pulse y-axis" />
    </div>
  );
}

// Progress-Indikator
function LoadingOverlay({ progress, message }: { progress?: number; message: string }) {
  return (
    <div className="loading-overlay">
      <Spinner />
      <p>{message}</p>
      {progress !== undefined && (
        <ProgressBar value={progress} />
      )}
    </div>
  );
}
```

### 8.2 Erfolgs-/Fehler-Feedback

| Aktion | Erfolg | Fehler |
|--------|--------|--------|
| Datei laden | Toast "Geladen" + Grün | Toast + Fehlermeldung |
| Export | Toast "Gespeichert" | Dialog mit Details |
| Analyse | Smooth Transition | Inline-Fehler |

### 8.3 Validierungs-Feedback

```tsx
// Inline-Validierung
function ValidatedInput({ value, validation, ...props }) {
  const [touched, setTouched] = useState(false);
  const error = touched && validation(value);
  
  return (
    <div className={cn('input-wrapper', error && 'has-error')}>
      <input 
        value={value}
        onBlur={() => setTouched(true)}
        {...props}
      />
      {error && (
        <span className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

### 8.4 Transitions & Animationen

| Element | Animation | Dauer |
|---------|-----------|-------|
| Toast erscheinen | Slide in + Fade | 200ms |
| Toast verschwinden | Slide out + Fade | 150ms |
| Dialog öffnen | Scale + Fade | 200ms |
| Dialog schließen | Scale + Fade | 150ms |
| Chart-Daten ändern | Morph/Transition | 300ms |
| Hover-Effekte | Color/Shadow | 150ms |
| Button-Klick | Scale down | 100ms |

```css
/* Beispiel Transitions */
.btn {
  transition: transform 100ms ease, box-shadow 150ms ease;
}

.btn:active {
  transform: scale(0.97);
}

.chart-line {
  transition: d 300ms ease-out;  /* SVG path morphing */
}

.toast-enter {
  animation: slideIn 200ms ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## 9. Barrierefreiheit (Accessibility)

### 9.1 Keyboard Navigation

- Alle interaktiven Elemente mit Tab erreichbar
- Fokus-Ring sichtbar (nicht entfernen!)
- Logische Tab-Reihenfolge
- Skip-Links für Hauptinhalt

### 9.2 ARIA-Labels

```tsx
// Chart
<svg role="img" aria-label="RGA Spektrum: Druck über Masse">
  <title>RGA Spektrum</title>
  <desc>Zeigt die normalisierten Druckwerte für Massen 1-100 AMU</desc>
</svg>

// Interaktive Elemente
<button 
  aria-label="Zoom vergrößern"
  aria-keyshortcuts="+"
>
  +
</button>

// Status
<div role="status" aria-live="polite">
  Analyse abgeschlossen: 12 Peaks erkannt
</div>

// Fehler
<div role="alert" aria-live="assertive">
  Fehler beim Laden der Datei
</div>
```

### 9.3 Screenreader-Support

```tsx
// Daten-Beschreibung für Charts
function ChartDescription({ data }) {
  return (
    <div className="sr-only" aria-live="polite">
      Das Spektrum zeigt {data.peaks.length} signifikante Peaks.
      Der höchste Peak ist bei Masse {data.maxPeak.mass} AMU 
      mit {formatPercent(data.maxPeak.normalized)} des Referenzwertes.
      {data.violations.length > 0 && (
        `${data.violations.length} Grenzwertüberschreitungen erkannt.`
      )}
    </div>
  );
}
```

### 9.4 Farbenblind-freundlich

```typescript
// Farben mit ausreichend Kontrast
const accessibleColors = {
  // Rot-Grün Problematik vermeiden
  success: '#0097E0',      // Blau statt Grün
  error: '#F59E0B',        // Orange statt Rot
  
  // Oder: Muster zusätzlich zu Farben
  patterns: {
    success: 'solid',
    warning: 'dashed',
    error: 'dotted'
  }
};
```

---

## 10. Responsive Verhalten

### 10.1 Breakpoints

| Breakpoint | Breite | Verhalten |
|------------|--------|-----------|
| Mobile | < 640px | Single-Column, Touch-optimiert |
| Tablet | 640-1024px | Zwei-Spalten möglich |
| Desktop | > 1024px | Volles Layout |

### 10.2 Anpassungen pro Breakpoint

#### Mobile (< 640px)

- Chart: Volle Breite, reduzierte Höhe
- Tabelle: Horizontal scrollbar oder Karten-Ansicht
- Buttons: Volle Breite, größer
- Navigation: Hamburger-Menü
- Touch-Targets: Vergrößert

#### Tablet (640-1024px)

- Chart: 60% Breite, Controls seitlich oder darunter
- Tabelle: Scrollbar
- Buttons: Gruppiert

#### Desktop (> 1024px)

- Chart: Flexibel, mit seitlichen Controls
- Tabelle: Volle Funktionalität
- Split-View möglich

### 10.3 Adaptive Charts

```tsx
function ResponsiveChart({ data }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(300, width),
        height: Math.max(200, Math.min(height, width * 0.6))  // Aspect Ratio
      });
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={containerRef} className="chart-container">
      <Chart 
        width={dimensions.width} 
        height={dimensions.height}
        data={data}
      />
    </div>
  );
}
```

---

## 11. Implementierungs-Checkliste

### Phase 1: Grundlegende Interaktionen
- [ ] Maus-Events auf Charts (Click, Drag, Wheel)
- [ ] Tastatur-Navigation (Tab, Arrow)
- [ ] Globale Shortcuts
- [ ] Cursor-Zustände

### Phase 2: Chart-Interaktionen
- [ ] Zoom (Scroll, Rechteck, Buttons)
- [ ] Pan (Drag, Keyboard)
- [ ] Bereichsauswahl (Brush)
- [ ] Tooltips

### Phase 3: Kontextmenüs & Drag
- [ ] Rechtsklick-Menüs
- [ ] Datei Drag & Drop
- [ ] Sortieren per Drag

### Phase 4: Touch & Responsive
- [ ] Touch-Gesten (Tap, Pinch, Swipe)
- [ ] Responsive Breakpoints
- [ ] Touch-optimierte Targets

### Phase 5: Accessibility & Polish
- [ ] ARIA-Labels
- [ ] Keyboard-vollständig navigierbar
- [ ] Screenreader-Tests
- [ ] Animationen & Transitions

---

*Spezifikation erstellt: Januar 2026*
*Für: RGA Analyser App*
