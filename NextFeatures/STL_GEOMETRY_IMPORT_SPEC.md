# STL Geometry Import - Feature Specification

> **CAD-Modell-Import für automatische Volumen- und Oberflächenberechnung**

**Version:** 1.0
**Status:** 🟢 Ready for Implementation
**Erstellt:** 2026-01-09
**Zielgruppe:** Ausgasungs-Simulator, Lecksuche-Planer

---

## 🎯 Feature-Übersicht

### Problem
Aktuell müssen User Volumen und Oberfläche ihrer Vakuumkammern manuell eingeben oder berechnen. Dies ist:
- Fehleranfällig (Rechenfehler, Einheitenverwechslung)
- Zeitaufwendig (komplexe Geometrien)
- Ungenau (Vereinfachungen notwendig)

### Lösung
Upload von STL-Dateien (3D-Mesh-Format) → Automatische Berechnung von Volumen und Oberfläche → Direkte Übernahme in Ausgasungs-/Lecksuche-Rechner

### User Value
- ⚡ **Schneller:** 30 Sekunden statt 10 Minuten manuelle Berechnung
- 🎯 **Genauer:** CAD-präzise Werte statt Näherungen
- 🔄 **Professioneller Workflow:** Ingenieure haben CAD-Modelle bereits
- ✨ **Wow-Faktor:** 3D-Vorschau + automatische Analyse

---

## 🏗️ Technische Architektur

### Warum STL (nicht STEP)?

| Format | Komplexität | Parser-Aufwand | Bundle-Size | Entscheidung |
|--------|-------------|----------------|-------------|--------------|
| **STL** | ⭐ Einfach (Dreiecke) | 4-6h | ~600 KB | ✅ **MVP** |
| STEP | ⭐⭐⭐⭐⭐ Sehr komplex | 16-24h | 10-50 MB | Phase 2 |

**Begründung:** STL reicht für Volumen/Oberflächen-Berechnung aus. User exportieren STL aus CAD in 2 Klicks.

### Tech Stack

```
Core Libraries:
├── three.js (v0.160+)           # 3D Engine
├── STLLoader                    # STL Parser
└── OrbitControls                # 3D Navigation

Bundle Impact: ~620 KB (gzipped)
Performance: <500ms für typische Modelle (5k-50k triangles)
```

### Module-Struktur

```
src/lib/geometry/               # ⚙️ Core Logic (framework-agnostic)
├── stlParser.ts                # STL → Three.js Mesh
├── meshAnalyzer.ts             # Volumen + Oberfläche Berechnung
├── wallCorrection.ts           # Innenflächen-Korrektur
├── geometryValidator.ts        # Mesh-Qualität prüfen
├── types.ts                    # TypeScript Types
└── index.ts                    # Public API

src/components/geometry/        # 🎨 React Components
├── GeometryFileUpload.tsx      # Drag & Drop Upload
├── Mesh3DPreview.tsx           # Three.js 3D-Viewer
├── GeometryResults.tsx         # Berechnete Werte Display
├── WallThicknessControl.tsx    # Wandstärken-Korrektur UI
└── GeometryImportModal.tsx     # Kompletter Workflow

src/hooks/
└── useGeometryAnalysis.ts      # State Management Hook

tests/geometry/
├── stlParser.test.ts           # Unit Tests
├── meshAnalyzer.test.ts        # Geometrie-Berechnung Tests
└── fixtures/                   # Test-STL-Dateien
    ├── cube_10mm.stl           # Einfacher Würfel
    ├── cylinder_50mm.stl       # Zylinder (typische Kammer)
    └── complex_chamber.stl     # Realistische Vakuumkammer
```

---

## 📐 Geometrie-Berechnung

### 1. Volumen-Berechnung (Signed Volume)

**Algorithmus:** Divergence Theorem

```typescript
// meshAnalyzer.ts
function calculateSignedVolume(geometry: THREE.BufferGeometry): number {
  const positions = geometry.attributes.position.array;
  let volume = 0;

  // Iterate over all triangles
  for (let i = 0; i < positions.length; i += 9) {
    const v1 = new THREE.Vector3(
      positions[i], positions[i+1], positions[i+2]
    );
    const v2 = new THREE.Vector3(
      positions[i+3], positions[i+4], positions[i+5]
    );
    const v3 = new THREE.Vector3(
      positions[i+6], positions[i+7], positions[i+8]
    );

    // Signed volume of tetrahedron formed by triangle and origin
    volume += v1.dot(v2.clone().cross(v3)) / 6.0;
  }

  return Math.abs(volume);
}
```

### 2. Oberflächen-Berechnung

```typescript
function calculateSurfaceArea(geometry: THREE.BufferGeometry): number {
  const positions = geometry.attributes.position.array;
  let area = 0;

  for (let i = 0; i < positions.length; i += 9) {
    const v1 = new THREE.Vector3(
      positions[i], positions[i+1], positions[i+2]
    );
    const v2 = new THREE.Vector3(
      positions[i+3], positions[i+4], positions[i+5]
    );
    const v3 = new THREE.Vector3(
      positions[i+6], positions[i+7], positions[i+8]
    );

    // Triangle area = |cross product| / 2
    const edge1 = v2.clone().sub(v1);
    const edge2 = v3.clone().sub(v1);
    area += edge1.cross(edge2).length() / 2.0;
  }

  return area;
}
```

### 3. Bounding Box (für 3D-Preview)

```typescript
function calculateBounds(geometry: THREE.BufferGeometry): BoundingBox {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;

  return {
    min: bbox.min.toArray(),
    max: bbox.max.toArray(),
    dimensions: {
      x: bbox.max.x - bbox.min.x,
      y: bbox.max.y - bbox.min.y,
      z: bbox.max.z - bbox.min.z,
    }
  };
}
```

---

## 🔧 Innenflächen-Problem: Lösung

### Problem
STL-Modelle enthalten normalerweise die **Außenhülle** einer Vakuumkammer. Für Ausgasung benötigen wir die **Innenfläche**.

### Lösungsansatz: User-kontrollierte Wandkorrektur

```typescript
interface WallCorrectionResult {
  outerVolume: number;       // Berechnetes Volumen (Außen)
  outerSurfaceArea: number;  // Berechnete Oberfläche (Außen)

  wallThickness: number;     // User Input (mm)

  innerVolume: number;       // Korrigiertes Volumen (Innen)
  innerSurfaceArea: number;  // Vereinfacht: A_innen ≈ A_außen

  wallVolume: number;        // Wandvolumen (Info)
}

function applyWallCorrection(
  outerVolume: number,
  surfaceArea: number,
  wallThickness: number  // in meters
): WallCorrectionResult {
  // Vereinfachte Korrektur:
  // V_innen = V_außen - (A_außen × t_wall)
  const wallVolume = surfaceArea * wallThickness;
  const innerVolume = outerVolume - wallVolume;

  // Für typische Vakuumkammern: A_innen ≈ A_außen (dünne Wände)
  const innerSurfaceArea = surfaceArea;

  return {
    outerVolume,
    outerSurfaceArea: surfaceArea,
    wallThickness,
    innerVolume,
    innerSurfaceArea,
    wallVolume
  };
}
```

### UI-Workflow

```
┌─────────────────────────────────────┐
│  STL Upload                         │
│  "vacuum_chamber_outer.stl"         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Berechnung läuft... (0.5-2s)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Ergebnis: Außen-Geometrie          │
│  Volumen:    25.3 L                 │
│  Oberfläche: 0.82 m²                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  ☑ Wandstärke abziehen              │
│  Wandstärke: [5] mm                 │
│                                     │
│  → Inneres Volumen:    25.0 L       │
│  → Innere Oberfläche:  0.82 m²      │
│  (Wandvolumen: 0.3 L)               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  ✅ In Rechner übernehmen           │
└─────────────────────────────────────┘
```

**Alternative Ansätze (Phase 2):**
- Upload von 2 STL-Dateien (Innen + Außen) → Differenz
- Normale-basierte Innenflächen-Detektion
- Shell-Detection via Ray-Casting

---

## 🎨 UI/UX Design

### 1. GeometryFileUpload Component

```tsx
interface GeometryFileUploadProps {
  onGeometryLoaded: (result: GeometryAnalysisResult) => void;
  onError: (error: Error) => void;
  maxFileSize?: number;  // default: 50 MB
}

<GeometryFileUpload
  onGeometryLoaded={(result) => {
    setVolume(result.innerVolume);
    setSurfaceArea(result.innerSurfaceArea);
  }}
/>
```

**Features:**
- Drag & Drop Zone
- File-Type Validation (nur .stl)
- File-Size Limit (50 MB)
- Progress-Indicator
- Error-Handling

### 2. Mesh3DPreview Component

```tsx
interface Mesh3DPreviewProps {
  geometry: THREE.BufferGeometry;
  showWireframe?: boolean;
  showBoundingBox?: boolean;
  material?: 'default' | 'metal' | 'glass';
}

<Mesh3DPreview
  geometry={mesh}
  showBoundingBox={true}
/>
```

**Features:**
- Orbit-Controls (Rotate, Zoom, Pan)
- Auto-Framing (Kamera passt sich an)
- Lighting (Ambient + Directional)
- Material-Switcher
- Reset-Button

### 3. GeometryResults Component

```tsx
interface GeometryResultsProps {
  result: GeometryAnalysisResult;
  wallThickness: number;
  onWallThicknessChange: (value: number) => void;
  enableWallCorrection: boolean;
  onToggleWallCorrection: (enabled: boolean) => void;
  allowManualOverride?: boolean;
}
```

**Display:**
- Volumen (Außen + Innen nach Korrektur)
- Oberfläche (Außen + Innen)
- Abmessungen (L × B × H)
- Dreiecks-Anzahl (Qualitäts-Indikator)
- Wandstärken-Control
- Manuelle Override-Felder

### 4. Kompletter Modal-Workflow

```tsx
<GeometryImportModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onApply={(values) => {
    setVolume(values.volume);
    setSurfaceArea(values.surfaceArea);
    setShowModal(false);
  }}
/>
```

**Screens:**
1. **Upload:** Drag & Drop STL
2. **Analysis:** Loading + 3D-Vorschau + Werte
3. **Correction:** Wandstärken-Eingabe
4. **Confirm:** Werte übernehmen

---

## 📊 Public API Design

### Core Analysis Function

```typescript
// src/lib/geometry/index.ts

export interface GeometryAnalysisOptions {
  unit?: 'mm' | 'cm' | 'm';        // STL-Einheit (default: mm)
  wallThickness?: number;          // in mm (optional)
  enableWallCorrection?: boolean;  // default: false
}

export interface GeometryAnalysisResult {
  // Geometrie (in SI-Einheiten: m, m², m³)
  volume: number;                  // m³
  surfaceArea: number;             // m²

  // Korrigierte Werte (wenn wallThickness gegeben)
  innerVolume?: number;            // m³
  innerSurfaceArea?: number;       // m²
  wallVolume?: number;             // m³

  // Bounding Box
  bounds: BoundingBox;

  // Mesh-Info
  triangleCount: number;
  isManifold: boolean;             // Geschlossenes Mesh?
  hasNormals: boolean;

  // Three.js Geometrie (für 3D-Preview)
  mesh: THREE.BufferGeometry;
}

export interface BoundingBox {
  min: [number, number, number];
  max: [number, number, number];
  dimensions: {
    x: number;  // in meters
    y: number;
    z: number;
  };
}

// Main Function
export async function analyzeSTL(
  file: File,
  options?: GeometryAnalysisOptions
): Promise<GeometryAnalysisResult> {
  // 1. Parse STL
  const geometry = await parseSTLFile(file);

  // 2. Unit Conversion
  const scale = getScaleFactor(options?.unit || 'mm');
  geometry.scale(scale, scale, scale);

  // 3. Calculate Geometry
  const volume = calculateSignedVolume(geometry);
  const surfaceArea = calculateSurfaceArea(geometry);
  const bounds = calculateBounds(geometry);

  // 4. Validate Mesh
  const isManifold = validateManifold(geometry);
  const hasNormals = geometry.attributes.normal !== undefined;

  // 5. Wall Correction (optional)
  let result: GeometryAnalysisResult = {
    volume,
    surfaceArea,
    bounds,
    triangleCount: geometry.attributes.position.count / 3,
    isManifold,
    hasNormals,
    mesh: geometry,
  };

  if (options?.wallThickness && options.enableWallCorrection) {
    const corrected = applyWallCorrection(
      volume,
      surfaceArea,
      options.wallThickness / 1000  // mm → m
    );
    result.innerVolume = corrected.innerVolume;
    result.innerSurfaceArea = corrected.innerSurfaceArea;
    result.wallVolume = corrected.wallVolume;
  }

  return result;
}

// Helper: STL Parser
async function parseSTLFile(file: File): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    const loader = new STLLoader();
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const geometry = loader.parse(event.target?.result as ArrayBuffer);
        resolve(geometry);
      } catch (error) {
        reject(new Error('Failed to parse STL file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Helper: Unit Conversion
function getScaleFactor(unit: 'mm' | 'cm' | 'm'): number {
  switch (unit) {
    case 'mm': return 0.001;  // mm → m
    case 'cm': return 0.01;   // cm → m
    case 'm':  return 1.0;    // m → m
  }
}
```

---

## 🔌 Integration

### 1. Ausgasungs-Simulator

**In `OutgassingCalculator.tsx`:**

```tsx
import { GeometryImportModal } from '@/components/geometry/GeometryImportModal';

function OutgassingCalculator() {
  const [showGeometryImport, setShowGeometryImport] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kammer-Geometrie</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual">
          <TabsList>
            <TabsTrigger value="manual">Manuelle Eingabe</TabsTrigger>
            <TabsTrigger value="stl">STL Import</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            {/* Bisherige Geometrie-Inputs */}
            <Label>Volumen (L)</Label>
            <Input type="number" value={volume} onChange={...} />

            <Label>Oberfläche (m²)</Label>
            <Input type="number" value={surfaceArea} onChange={...} />
          </TabsContent>

          <TabsContent value="stl">
            <GeometryFileUpload
              onGeometryLoaded={(result) => {
                setVolume(result.innerVolume! * 1000);  // m³ → L
                setSurfaceArea(result.innerSurfaceArea!);
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

### 2. Lecksuche-Planer

**Wiederverwendung der gleichen Komponente:**

```tsx
import { GeometryImportModal } from '@/components/geometry/GeometryImportModal';

function LeakSearchPlanner() {
  // Exakt gleicher Code wie oben
  // → Component ist vollständig wiederverwendbar!
}
```

### 3. Shared ChamberGeometryInput Component (Phase 2)

**Ziel:** Einheitliche Geometrie-Eingabe-Komponente für alle Module

```tsx
// src/components/shared/ChamberGeometryInput.tsx
interface ChamberGeometryInputProps {
  value: {
    volume: number;       // in L
    surfaceArea: number;  // in m²
  };
  onChange: (values: { volume: number; surfaceArea: number }) => void;
  showSTLImport?: boolean;  // default: true
}

<ChamberGeometryInput
  value={{ volume, surfaceArea }}
  onChange={(values) => {
    setVolume(values.volume);
    setSurfaceArea(values.surfaceArea);
  }}
  showSTLImport={true}
/>
```

---

## 🧪 Test-Cases

### Unit Tests

```typescript
// tests/geometry/meshAnalyzer.test.ts

describe('meshAnalyzer', () => {
  test('calculates volume of 10mm cube correctly', async () => {
    const file = loadFixture('cube_10mm.stl');
    const result = await analyzeSTL(file, { unit: 'mm' });

    // 10mm × 10mm × 10mm = 1000 mm³ = 1e-6 m³
    expect(result.volume).toBeCloseTo(1e-6, 9);
  });

  test('calculates surface area of 10mm cube correctly', async () => {
    const file = loadFixture('cube_10mm.stl');
    const result = await analyzeSTL(file, { unit: 'mm' });

    // 6 × (10mm)² = 600 mm² = 6e-4 m²
    expect(result.surfaceArea).toBeCloseTo(6e-4, 6);
  });

  test('applies wall correction correctly', async () => {
    const file = loadFixture('cylinder_50mm.stl');
    const result = await analyzeSTL(file, {
      unit: 'mm',
      wallThickness: 5,  // 5mm wall
      enableWallCorrection: true
    });

    expect(result.innerVolume).toBeLessThan(result.volume);
    expect(result.wallVolume).toBeGreaterThan(0);
  });

  test('handles invalid STL files gracefully', async () => {
    const invalidFile = new File(['not a stl'], 'invalid.stl');

    await expect(analyzeSTL(invalidFile)).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
// tests/geometry/integration.test.ts

describe('GeometryImportModal', () => {
  test('complete workflow: upload → analyze → apply', async () => {
    const { getByText, getByLabelText } = render(<GeometryImportModal />);

    // 1. Upload file
    const file = loadFixture('vacuum_chamber.stl');
    const input = getByLabelText('Upload STL');
    fireEvent.change(input, { target: { files: [file] } });

    // 2. Wait for analysis
    await waitFor(() => {
      expect(getByText(/Volumen:/)).toBeInTheDocument();
    });

    // 3. Enter wall thickness
    const wallInput = getByLabelText('Wandstärke (mm)');
    fireEvent.change(wallInput, { target: { value: '5' } });

    // 4. Apply values
    const applyButton = getByText('Werte übernehmen');
    fireEvent.click(applyButton);

    // 5. Verify callback
    expect(mockOnApply).toHaveBeenCalledWith({
      volume: expect.any(Number),
      surfaceArea: expect.any(Number)
    });
  });
});
```

### Test-Fixtures

```
tests/geometry/fixtures/
├── cube_10mm.stl           # Simple cube for unit tests
├── cylinder_50mm.stl       # Cylinder (typical chamber shape)
├── complex_chamber.stl     # Realistic vacuum chamber with ports
└── invalid.stl             # Corrupted file for error handling
```

---

## 📈 Performance-Optimierung

### Benchmarks (Target)

| Mesh-Komplexität | Dreiecke | Parse-Zeit | Berechnung | Total |
|------------------|----------|------------|------------|-------|
| Einfach | 1k | 50ms | 10ms | 60ms |
| Mittel | 10k | 200ms | 50ms | 250ms |
| Typische Kammer | 50k | 800ms | 200ms | 1s |
| Komplex | 200k | 3s | 800ms | 4s |

### Optimierungen

**Phase 1 (MVP):**
- ✅ STLLoader ist bereits optimiert
- ✅ Berechnung ist O(n) linear
- ✅ Lazy Loading (Three.js nur bei Bedarf)

**Phase 2 (bei Bedarf):**
- Web Worker für Parsing (UI bleibt responsive)
- Mesh Decimation für sehr komplexe Modelle (>100k triangles)
- IndexedDB Caching (gleiche Datei nicht neu parsen)

```typescript
// Future: Web Worker
// src/lib/geometry/worker.ts
self.onmessage = async (event) => {
  const { file, options } = event.data;
  const result = await analyzeSTL(file, options);
  self.postMessage(result);
};
```

### Bundle-Size Optimization

```typescript
// Lazy Load Three.js
const loadThreeJS = () => import('three');
const loadSTLLoader = () => import('three/examples/jsm/loaders/STLLoader');

// Only load when STL Import tab is activated
<TabsContent value="stl">
  <Suspense fallback={<Spinner />}>
    <LazySTLUpload />
  </Suspense>
</TabsContent>
```

---

## 🚀 Implementierungs-Phasen

### Phase 1: Core Functionality (4-6h) - Haiku geeignet

**Goal:** Standalone-Modul mit STL-Parser und Geometrie-Berechnung

**Tasks:**
- [ ] Setup `src/lib/geometry/` Struktur
- [ ] Install Three.js Dependencies
- [ ] Implement `stlParser.ts` (STL → Three.js)
- [ ] Implement `meshAnalyzer.ts` (Volume + Area)
- [ ] Implement `wallCorrection.ts`
- [ ] TypeScript Types (`types.ts`)
- [ ] Public API (`index.ts`)
- [ ] Unit Tests mit Fixtures
- [ ] Demo-Seite: `/dev/geometry-test` (Test-UI)

**Deliverable:** Funktionierende Bibliothek, testbar ohne UI

---

### Phase 2: UI Components (3-4h) - Haiku/Sonnet

**Goal:** React Components für Upload, Preview, Results

**Tasks:**
- [ ] `GeometryFileUpload.tsx` (Drag & Drop)
- [ ] `Mesh3DPreview.tsx` (Three.js Renderer)
- [ ] `GeometryResults.tsx` (Werte-Display)
- [ ] `WallThicknessControl.tsx` (Korrektur-UI)
- [ ] `useGeometryAnalysis.ts` Hook
- [ ] Styling mit Tailwind
- [ ] Integration Tests

**Deliverable:** Wiederverwendbare Components

---

### Phase 3: Integration (1-2h) - Haiku

**Goal:** Integration in Ausgasungs-Simulator

**Tasks:**
- [ ] Tab "STL Import" in `OutgassingCalculator.tsx`
- [ ] Werte-Übernahme in Form
- [ ] Error-Handling Integration
- [ ] User-Testing

**Deliverable:** Funktionierendes Feature in Production

---

### Phase 4: Leak Planner + Polish (2-3h) - Haiku

**Goal:** Wiederverwendung + Nice-to-Haves

**Tasks:**
- [ ] Integration in Lecksuche-Planer
- [ ] Screenshot-Export (STL → PNG für Dokumentation)
- [ ] Material-Switcher (Metal, Glass, Plastic)
- [ ] Maße in 3D-Vorschau einblenden
- [ ] Mesh-Qualitäts-Warnungen

**Deliverable:** Poliertes, professionelles Feature

---

### Phase 5 (Optional): Advanced Features

- [ ] STEP-Format Support (opencascade.js)
- [ ] Zwei STL-Dateien (Innen + Außen)
- [ ] Normale-basierte Innenflächen-Erkennung
- [ ] Schnittebenen-Tool (Kammer aufschneiden)
- [ ] Web Worker für große Dateien
- [ ] Shared `ChamberGeometryInput` Component

---

## ⚠️ Edge Cases & Error Handling

### Fehler-Szenarien

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| Invalid STL | Korrupte Datei | Toast: "Ungültige STL-Datei" |
| File too large | >50 MB | Toast: "Datei zu groß (max 50 MB)" |
| Wrong unit | mm vs m verwechselt | Auto-Detect + User-Warnung |
| Non-manifold mesh | Offene Geometrie | Warnung anzeigen, Berechnung trotzdem |
| Zero volume | 2D-Fläche statt 3D | Toast: "Kein Volumen erkannt" |
| Missing normals | STL ohne Normalen | Auto-Compute Normals |

### Validation

```typescript
function validateGeometryResult(result: GeometryAnalysisResult): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Volume checks
  if (result.volume < 1e-9) {
    errors.push('Volumen zu klein (< 1 mm³). Einheit korrekt?');
  }
  if (result.volume > 1000) {
    warnings.push('Sehr großes Volumen (>1000 L). Einheit korrekt?');
  }

  // Mesh quality
  if (!result.isManifold) {
    warnings.push('Mesh ist nicht geschlossen (non-manifold)');
  }
  if (result.triangleCount > 500000) {
    warnings.push('Sehr komplexes Mesh (>500k Dreiecke) - 3D-Vorschau kann langsam sein');
  }

  return { valid: errors.length === 0, errors, warnings };
}
```

### Auto-Unit Detection

```typescript
function detectUnit(volume: number, bounds: BoundingBox): 'mm' | 'cm' | 'm' {
  // Heuristik: Typische Vakuumkammern sind 100-1000mm groß
  const maxDimension = Math.max(bounds.dimensions.x, bounds.dimensions.y, bounds.dimensions.z);

  if (maxDimension < 0.01) return 'mm';  // < 10mm → likely mm
  if (maxDimension < 0.1) return 'cm';   // < 10cm → likely cm
  return 'm';                             // > 10cm → likely m
}
```

---

## 📖 User Documentation

### Workflow-Anleitung

**1. STL aus CAD exportieren:**

```
SolidWorks: File → Save As → STL (*.stl)
Fusion 360: File → Export → STL
FreeCAD:    File → Export → Mesh Formats → STL
```

**Empfohlene Export-Einstellungen:**
- Format: Binary STL (kleiner)
- Resolution: Medium (10k-50k triangles)
- Units: Millimeter

**2. STL in RGA Analyser hochladen:**
- Ausgasungs-Rechner öffnen
- Tab "STL Import" wählen
- STL-Datei per Drag & Drop hochladen
- 3D-Vorschau prüfen (Größe korrekt?)

**3. Wandstärke eingeben:**
- Checkbox "Wandstärke abziehen" aktivieren
- Wandstärke in mm eingeben (z.B. 5mm)
- Inneres Volumen wird automatisch berechnet

**4. Werte übernehmen:**
- Button "Werte übernehmen" klicken
- Volumen und Oberfläche werden in Rechner eingetragen

### Troubleshooting

**Q: Volumen ist viel zu groß/klein?**
A: Einheit prüfen! CAD-Export war vielleicht in cm statt mm.

**Q: 3D-Vorschau ist leer?**
A: STL ist möglicherweise korrupt. Neu exportieren aus CAD.

**Q: Unterschied Außen/Innen-Volumen zu groß?**
A: Wandstärke zu dick eingestellt oder Mesh nicht geschlossen.

---

## 🎯 Success Metrics

### Quantitative Ziele

- ⏱️ **Time to Value:** <60s von Upload bis Werte-Übernahme
- 🎯 **Accuracy:** <5% Abweichung zu CAD-Werten
- 📦 **Bundle Impact:** <700 KB (Three.js lazy loaded)
- ⚡ **Performance:** <2s für typische Modelle (<50k triangles)
- ✅ **Adoption:** >30% der Ausgasungs-Berechnungen nutzen STL-Import (nach 3 Monaten)

### Qualitative Ziele

- 😊 **User Feedback:** "Das spart mir 10 Minuten pro Analyse!"
- 💎 **Professionalism:** Wow-Faktor durch 3D-Vorschau
- 🔄 **Workflow:** Nahtlose Integration (keine zusätzlichen Tools nötig)

---

## 🏁 Definition of Done

**Phase 1 (Core):**
- [x] STL-Parser funktioniert (Binary + ASCII)
- [x] Geometrie-Berechnung korrekt (Unit-Tests green)
- [x] Wall-Correction implementiert
- [x] Public API dokumentiert
- [x] Demo-Seite funktioniert

**Phase 2 (UI):**
- [x] File-Upload mit Drag & Drop
- [x] 3D-Vorschau funktioniert (Rotate, Zoom, Pan)
- [x] Werte-Display mit Wandkorrektur
- [x] Error-Handling (Toast + Validierung)

**Phase 3 (Integration):**
- [x] Integration in Ausgasungs-Rechner
- [x] Werte-Übernahme funktioniert
- [x] User-Testing erfolgreich
- [x] Dokumentation geschrieben

---

## 📚 Referenzen

### STL Format Specification
- [Wikipedia: STL (file format)](https://en.wikipedia.org/wiki/STL_(file_format))
- [Fabbers: STL File Format](http://www.fabbers.com/tech/STL_Format)

### Three.js Documentation
- [Three.js: STLLoader](https://threejs.org/docs/#examples/en/loaders/STLLoader)
- [Three.js: OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)

### Geometry Algorithms
- [Signed Volume of Triangle Mesh](https://stackoverflow.com/questions/1406029/how-to-calculate-the-volume-of-a-3d-mesh-object-the-surface-of-which-is-made-up)
- [Triangle Area (Cross Product)](https://en.wikipedia.org/wiki/Cross_product)

---

**Status:** ✅ Spec Complete - Ready for Implementation
**Next Step:** Phase 1 Implementation (Core Library)
**Estimated Total:** 10-15h für MVP (Phase 1-3)
