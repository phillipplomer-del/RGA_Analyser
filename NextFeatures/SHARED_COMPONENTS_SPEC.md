# Shared Components Spezifikation

## Übersicht

Dieses Dokument definiert wiederverwendbare UI-Komponenten, die in mehreren Features (RGA-Spektren, Zeitreihen, Rate-of-Rise) verwendet werden. Ziel: Konsistente UI, weniger Code-Duplikation.

---

## 1. Komponenten-Architektur

### 1.1 Verzeichnisstruktur

```
src/
├── components/
│   ├── shared/                    # Dieses Dokument
│   │   ├── charts/
│   │   │   ├── BaseChart.tsx      # Grundgerüst für alle Charts
│   │   │   ├── TimeSeriesChart.tsx
│   │   │   ├── SpectrumChart.tsx
│   │   │   └── ChartControls.tsx
│   │   ├── upload/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── DropZone.tsx
│   │   │   └── FilePreview.tsx
│   │   ├── export/
│   │   │   ├── ExportMenu.tsx
│   │   │   ├── PDFExport.tsx
│   │   │   └── CSVExport.tsx
│   │   ├── data/
│   │   │   ├── DataTable.tsx
│   │   │   ├── MetadataCard.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── inputs/
│   │   │   ├── NumberInput.tsx
│   │   │   ├── RangeSlider.tsx
│   │   │   ├── Toggle.tsx
│   │   │   └── Select.tsx
│   │   └── feedback/
│   │       ├── Toast.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorDisplay.tsx
│   ├── spectrum/                  # Feature-spezifisch
│   ├── timeseries/
│   └── rateofrise/
```

### 1.2 Design-Tokens

```typescript
// src/styles/tokens.ts
export const tokens = {
  // Farben (aus bestehendem Design)
  colors: {
    // Primär
    primary: '#0097E0',           // Cyan
    primaryHover: '#007BB8',
    
    // Akzent
    accent: '#00E097',            // Mint
    accentTeal: '#00DEE0',
    
    // Status
    success: '#00E097',
    warning: '#E0BD00',
    danger: '#F87171',
    
    // Oberflächen
    surface: '#FFFFFF',
    surfaceMuted: '#F2F3F7',
    background: '#F6F7FB',
    
    // Text
    textPrimary: '#1F2430',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    
    // Chart-Farben (10er Palette)
    chart: [
      '#0097E0', '#00E097', '#E0BD00', '#F87171', '#A78BFA',
      '#F472B6', '#FB923C', '#4ADE80', '#22D3EE', '#818CF8'
    ],
    
    // Grenzwert-Linien
    limitGSI: '#F59E0B',          // Orange
    limitCERN: '#EF4444',         // Rot
  },
  
  // Abstände
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Radien
  radius: {
    sm: '6px',
    md: '12px',
    lg: '20px',
    full: '9999px',
  },
  
  // Schatten
  shadows: {
    card: '0 12px 30px rgba(35, 40, 70, 0.08)',
    hover: '0 16px 36px rgba(35, 40, 70, 0.12)',
    dropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  
  // Typografie
  fonts: {
    display: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'SF Mono', Monaco, monospace",
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },
};
```

---

## 2. Chart-Komponenten

### 2.1 BaseChart (Grundgerüst)

```typescript
// src/components/shared/charts/BaseChart.tsx
interface BaseChartProps {
  // Dimensionen
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  
  // Achsen
  xDomain: [number, number];
  yDomain: [number, number];
  xLabel?: string;
  yLabel?: string;
  xTickFormat?: (value: number) => string;
  yTickFormat?: (value: number) => string;
  
  // Skalierung
  yScale: 'linear' | 'log';
  
  // Interaktion
  enableZoom?: boolean;
  enablePan?: boolean;
  enableTooltip?: boolean;
  onZoomChange?: (domain: [number, number]) => void;
  
  // Referenzlinien
  referenceLines?: ReferenceLine[];
  
  // Kinder (die eigentlichen Daten)
  children: React.ReactNode;
}

interface ReferenceLine {
  value: number;
  axis: 'x' | 'y';
  color: string;
  strokeDash?: string;
  label?: string;
}

// Implementierung mit D3
export function BaseChart({
  width,
  height,
  margin = { top: 20, right: 30, bottom: 50, left: 70 },
  xDomain,
  yDomain,
  xLabel,
  yLabel,
  xTickFormat,
  yTickFormat,
  yScale = 'linear',
  enableZoom = true,
  enablePan = true,
  enableTooltip = true,
  onZoomChange,
  referenceLines = [],
  children
}: BaseChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Skalen
  const xScale = useMemo(() => 
    d3.scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth]),
    [xDomain, innerWidth]
  );
  
  const yScaleBase = useMemo(() => 
    yScale === 'log'
      ? d3.scaleLog().domain(yDomain).range([innerHeight, 0]).clamp(true)
      : d3.scaleLinear().domain(yDomain).range([innerHeight, 0]),
    [yScale, yDomain, innerHeight]
  );
  
  // Zoom-Verhalten
  useEffect(() => {
    if (!enableZoom || !svgRef.current) return;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 20])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        setTransform(event.transform);
        if (onZoomChange) {
          const newXDomain = event.transform.rescaleX(xScale).domain();
          onZoomChange(newXDomain as [number, number]);
        }
      });
    
    d3.select(svgRef.current).call(zoom);
    
    return () => {
      d3.select(svgRef.current).on('.zoom', null);
    };
  }, [enableZoom, xScale, width, height, onZoomChange]);
  
  // Transformierte Skalen
  const xScaleZoomed = transform.rescaleX(xScale);
  const yScaleZoomed = yScaleBase; // Y-Zoom optional
  
  return (
    <svg ref={svgRef} width={width} height={height}>
      <defs>
        <clipPath id="chart-area">
          <rect width={innerWidth} height={innerHeight} />
        </clipPath>
      </defs>
      
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Achsen */}
        <XAxis 
          scale={xScaleZoomed} 
          height={innerHeight} 
          tickFormat={xTickFormat}
        />
        <YAxis 
          scale={yScaleZoomed} 
          tickFormat={yTickFormat}
        />
        
        {/* Achsenbeschriftungen */}
        {xLabel && (
          <text 
            x={innerWidth / 2} 
            y={innerHeight + 40} 
            textAnchor="middle"
            className="axis-label"
          >
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text 
            transform={`rotate(-90)`}
            x={-innerHeight / 2} 
            y={-50}
            textAnchor="middle"
            className="axis-label"
          >
            {yLabel}
          </text>
        )}
        
        {/* Referenzlinien */}
        {referenceLines.map((line, i) => (
          <ReferenceLine key={i} {...line} xScale={xScaleZoomed} yScale={yScaleZoomed} />
        ))}
        
        {/* Datenbereich mit Clipping */}
        <g clipPath="url(#chart-area)">
          {/* Kinder erhalten Skalen via Context */}
          <ChartContext.Provider value={{ xScale: xScaleZoomed, yScale: yScaleZoomed, innerWidth, innerHeight }}>
            {children}
          </ChartContext.Provider>
        </g>
        
        {/* Tooltip-Layer */}
        {enableTooltip && <TooltipLayer />}
      </g>
    </svg>
  );
}
```

### 2.2 TimeSeriesChart

```typescript
// src/components/shared/charts/TimeSeriesChart.tsx
interface TimeSeriesChartProps extends Omit<BaseChartProps, 'xDomain' | 'yDomain'> {
  data: TimeSeriesDataPoint[];
  xAccessor?: (d: TimeSeriesDataPoint) => number;
  yAccessor?: (d: TimeSeriesDataPoint) => number;
  
  // Mehrere Linien
  series?: {
    key: string;
    data: TimeSeriesDataPoint[];
    color: string;
    label: string;
  }[];
  
  // Bereichsauswahl
  enableBrush?: boolean;
  brushExtent?: [number, number];
  onBrushChange?: (extent: [number, number] | null) => void;
  
  // Marker
  markers?: {
    x: number;
    label: string;
    color?: string;
  }[];
}

interface TimeSeriesDataPoint {
  time: number;      // Unix timestamp oder Sekunden
  value: number;
  [key: string]: number;  // Zusätzliche Felder
}

export function TimeSeriesChart({
  data,
  series,
  xAccessor = d => d.time,
  yAccessor = d => d.value,
  enableBrush = false,
  brushExtent,
  onBrushChange,
  markers = [],
  ...baseProps
}: TimeSeriesChartProps) {
  
  // Automatische Domains
  const xDomain = useMemo(() => {
    const allData = series ? series.flatMap(s => s.data) : data;
    return d3.extent(allData, xAccessor) as [number, number];
  }, [data, series, xAccessor]);
  
  const yDomain = useMemo(() => {
    const allData = series ? series.flatMap(s => s.data) : data;
    const extent = d3.extent(allData, yAccessor) as [number, number];
    // Padding für Log-Skala
    if (baseProps.yScale === 'log') {
      return [extent[0] * 0.5, extent[1] * 2];
    }
    return [extent[0] * 0.9, extent[1] * 1.1];
  }, [data, series, yAccessor, baseProps.yScale]);
  
  return (
    <BaseChart {...baseProps} xDomain={xDomain} yDomain={yDomain}>
      {/* Einzelne Linie */}
      {!series && (
        <LinePath 
          data={data} 
          xAccessor={xAccessor} 
          yAccessor={yAccessor}
          color={tokens.colors.primary}
        />
      )}
      
      {/* Mehrere Linien */}
      {series?.map(s => (
        <LinePath
          key={s.key}
          data={s.data}
          xAccessor={xAccessor}
          yAccessor={d => d[s.key] ?? yAccessor(d)}
          color={s.color}
        />
      ))}
      
      {/* Marker */}
      {markers.map((marker, i) => (
        <VerticalMarker key={i} x={marker.x} label={marker.label} color={marker.color} />
      ))}
      
      {/* Brush für Bereichsauswahl */}
      {enableBrush && (
        <BrushOverlay 
          extent={brushExtent} 
          onChange={onBrushChange}
        />
      )}
    </BaseChart>
  );
}
```

### 2.3 ChartControls

```typescript
// src/components/shared/charts/ChartControls.tsx
interface ChartControlsProps {
  // Skalen-Toggle
  showLogToggle?: boolean;
  isLogScale: boolean;
  onLogScaleChange: (value: boolean) => void;
  
  // Grenzwert-Toggles
  showLimitToggles?: boolean;
  limits?: {
    key: string;
    label: string;
    enabled: boolean;
    color: string;
  }[];
  onLimitToggle?: (key: string, enabled: boolean) => void;
  
  // Zoom-Controls
  showZoomControls?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  
  // Export
  showExportButton?: boolean;
  onExport?: (format: 'png' | 'svg') => void;
}

export function ChartControls({
  showLogToggle = true,
  isLogScale,
  onLogScaleChange,
  showLimitToggles = true,
  limits = [],
  onLimitToggle,
  showZoomControls = true,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  showExportButton = true,
  onExport
}: ChartControlsProps) {
  return (
    <div className="chart-controls">
      {/* Log-Skala Toggle */}
      {showLogToggle && (
        <Toggle
          label="Log-Skala"
          checked={isLogScale}
          onChange={onLogScaleChange}
        />
      )}
      
      {/* Grenzwert-Toggles */}
      {showLimitToggles && limits.map(limit => (
        <Toggle
          key={limit.key}
          label={limit.label}
          checked={limit.enabled}
          onChange={(checked) => onLimitToggle?.(limit.key, checked)}
          color={limit.color}
        />
      ))}
      
      {/* Zoom-Buttons */}
      {showZoomControls && (
        <div className="zoom-controls">
          <IconButton icon="zoom-in" onClick={onZoomIn} title="Zoom +" />
          <IconButton icon="zoom-out" onClick={onZoomOut} title="Zoom -" />
          <IconButton icon="reset" onClick={onZoomReset} title="Reset" />
        </div>
      )}
      
      {/* Export */}
      {showExportButton && (
        <DropdownButton label="Export">
          <MenuItem onClick={() => onExport?.('png')}>Als PNG</MenuItem>
          <MenuItem onClick={() => onExport?.('svg')}>Als SVG</MenuItem>
        </DropdownButton>
      )}
    </div>
  );
}
```

---

## 3. Upload-Komponenten

### 3.1 FileUpload

```typescript
// src/components/shared/upload/FileUpload.tsx
interface FileUploadProps {
  // Akzeptierte Formate
  accept: string[];                    // z.B. ['.asc', '.csv']
  acceptDescription?: string;          // z.B. "Pfeiffer .asc oder .csv Dateien"
  
  // Verhalten
  multiple?: boolean;
  maxSize?: number;                    // Bytes
  maxFiles?: number;
  
  // Callbacks
  onUpload: (files: File[]) => void;
  onError?: (error: UploadError) => void;
  
  // Zustand
  isLoading?: boolean;
  progress?: number;                   // 0-100
  
  // Styling
  variant?: 'default' | 'compact' | 'inline';
}

interface UploadError {
  type: 'format' | 'size' | 'count' | 'read';
  message: string;
  file?: File;
}

export function FileUpload({
  accept,
  acceptDescription,
  multiple = false,
  maxSize = 50 * 1024 * 1024,  // 50 MB
  maxFiles = 10,
  onUpload,
  onError,
  isLoading = false,
  progress,
  variant = 'default'
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Validierung
    for (const file of fileArray) {
      // Format prüfen
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!accept.includes(ext)) {
        onError?.({
          type: 'format',
          message: `Ungültiges Format: ${ext}. Erlaubt: ${accept.join(', ')}`,
          file
        });
        return;
      }
      
      // Größe prüfen
      if (file.size > maxSize) {
        onError?.({
          type: 'size',
          message: `Datei zu groß: ${formatBytes(file.size)}. Maximum: ${formatBytes(maxSize)}`,
          file
        });
        return;
      }
    }
    
    // Anzahl prüfen
    if (fileArray.length > maxFiles) {
      onError?.({
        type: 'count',
        message: `Zu viele Dateien. Maximum: ${maxFiles}`
      });
      return;
    }
    
    onUpload(multiple ? fileArray : [fileArray[0]]);
  }, [accept, maxSize, maxFiles, multiple, onUpload, onError]);
  
  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  
  return (
    <div 
      className={cn(
        'file-upload',
        `file-upload--${variant}`,
        isDragging && 'file-upload--dragging',
        isLoading && 'file-upload--loading'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        hidden
      />
      
      {isLoading ? (
        <div className="file-upload__loading">
          <LoadingSpinner />
          {progress !== undefined && (
            <ProgressBar value={progress} />
          )}
        </div>
      ) : (
        <div className="file-upload__content">
          <UploadIcon className="file-upload__icon" />
          <p className="file-upload__title">
            Datei hierher ziehen oder klicken
          </p>
          <p className="file-upload__description">
            {acceptDescription || `Akzeptiert: ${accept.join(', ')}`}
          </p>
        </div>
      )}
    </div>
  );
}
```

### 3.2 FilePreview

```typescript
// src/components/shared/upload/FilePreview.tsx
interface FilePreviewProps {
  file: {
    name: string;
    size: number;
    type?: string;
    status: 'pending' | 'loading' | 'success' | 'error';
    progress?: number;
    error?: string;
  };
  onRemove?: () => void;
  onRetry?: () => void;
}

export function FilePreview({ file, onRemove, onRetry }: FilePreviewProps) {
  return (
    <div className={cn('file-preview', `file-preview--${file.status}`)}>
      <FileIcon type={file.type} />
      
      <div className="file-preview__info">
        <span className="file-preview__name">{file.name}</span>
        <span className="file-preview__size">{formatBytes(file.size)}</span>
        
        {file.status === 'loading' && file.progress !== undefined && (
          <ProgressBar value={file.progress} size="small" />
        )}
        
        {file.status === 'error' && (
          <span className="file-preview__error">{file.error}</span>
        )}
      </div>
      
      <div className="file-preview__actions">
        {file.status === 'error' && onRetry && (
          <IconButton icon="retry" onClick={onRetry} title="Erneut versuchen" />
        )}
        {onRemove && (
          <IconButton icon="close" onClick={onRemove} title="Entfernen" />
        )}
      </div>
    </div>
  );
}
```

---

## 4. Export-Komponenten

### 4.1 ExportMenu

```typescript
// src/components/shared/export/ExportMenu.tsx
interface ExportMenuProps {
  // Verfügbare Formate
  formats: ExportFormat[];
  
  // Callbacks
  onExport: (format: ExportFormat, options?: ExportOptions) => void;
  
  // Zustand
  isExporting?: boolean;
  exportProgress?: number;
}

type ExportFormat = 'pdf' | 'csv' | 'html' | 'png' | 'svg' | 'xlsx';

interface ExportOptions {
  filename?: string;
  includeChart?: boolean;
  includeTable?: boolean;
  includeDiagnosis?: boolean;
  includeAI?: boolean;
}

export function ExportMenu({ formats, onExport, isExporting, exportProgress }: ExportMenuProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [options, setOptions] = useState<ExportOptions>({
    includeChart: true,
    includeTable: true,
    includeDiagnosis: true,
    includeAI: true
  });
  
  const formatInfo: Record<ExportFormat, { icon: string; label: string; description: string }> = {
    pdf: { icon: 'file-pdf', label: 'PDF', description: 'Professioneller Bericht' },
    csv: { icon: 'file-csv', label: 'CSV', description: 'Rohdaten für Excel' },
    html: { icon: 'file-html', label: 'HTML', description: 'Interaktive Präsentation' },
    png: { icon: 'image', label: 'PNG', description: 'Chart als Bild' },
    svg: { icon: 'vector', label: 'SVG', description: 'Vektorgrafik' },
    xlsx: { icon: 'file-excel', label: 'Excel', description: 'Formatierte Tabelle' }
  };
  
  const handleExport = (format: ExportFormat) => {
    if (format === 'pdf' || format === 'html') {
      // Optionen-Dialog für komplexe Formate
      setSelectedFormat(format);
      setShowOptions(true);
    } else {
      onExport(format);
    }
  };
  
  return (
    <div className="export-menu">
      <DropdownButton 
        label="Export" 
        icon="download"
        disabled={isExporting}
      >
        {formats.map(format => (
          <MenuItem 
            key={format}
            icon={formatInfo[format].icon}
            onClick={() => handleExport(format)}
          >
            <span className="export-menu__label">{formatInfo[format].label}</span>
            <span className="export-menu__description">{formatInfo[format].description}</span>
          </MenuItem>
        ))}
      </DropdownButton>
      
      {isExporting && (
        <div className="export-menu__progress">
          <LoadingSpinner size="small" />
          {exportProgress !== undefined && (
            <span>{exportProgress}%</span>
          )}
        </div>
      )}
      
      {/* Optionen-Dialog */}
      <Dialog 
        open={showOptions} 
        onClose={() => setShowOptions(false)}
        title={`${selectedFormat?.toUpperCase()} Export-Optionen`}
      >
        <div className="export-options">
          <Checkbox 
            label="Chart einbeziehen" 
            checked={options.includeChart}
            onChange={(checked) => setOptions({ ...options, includeChart: checked })}
          />
          <Checkbox 
            label="Peak-Tabelle einbeziehen" 
            checked={options.includeTable}
            onChange={(checked) => setOptions({ ...options, includeTable: checked })}
          />
          <Checkbox 
            label="Diagnose einbeziehen" 
            checked={options.includeDiagnosis}
            onChange={(checked) => setOptions({ ...options, includeDiagnosis: checked })}
          />
          <Checkbox 
            label="KI-Interpretation einbeziehen" 
            checked={options.includeAI}
            onChange={(checked) => setOptions({ ...options, includeAI: checked })}
          />
        </div>
        
        <DialogActions>
          <Button variant="secondary" onClick={() => setShowOptions(false)}>
            Abbrechen
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              onExport(selectedFormat!, options);
              setShowOptions(false);
            }}
          >
            Exportieren
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
```

---

## 5. Daten-Komponenten

### 5.1 DataTable

```typescript
// src/components/shared/data/DataTable.tsx
interface DataTableProps<T> {
  // Daten
  data: T[];
  columns: Column<T>[];
  
  // Sortierung
  sortable?: boolean;
  defaultSort?: { key: keyof T; direction: 'asc' | 'desc' };
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  
  // Selektion
  selectable?: boolean;
  selectedRows?: number[];
  onSelectionChange?: (indices: number[]) => void;
  
  // Pagination
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  
  // Virtualisierung (für große Datenmengen)
  virtualized?: boolean;
  rowHeight?: number;
  
  // Styling
  compact?: boolean;
  striped?: boolean;
  highlightOnHover?: boolean;
  
  // Leerer Zustand
  emptyMessage?: string;
}

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  sortable = true,
  defaultSort,
  onSort,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pageSize,
  currentPage = 0,
  onPageChange,
  virtualized = false,
  rowHeight = 48,
  compact = false,
  striped = true,
  highlightOnHover = true,
  emptyMessage = 'Keine Daten vorhanden'
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState(defaultSort);
  
  // Sortierte Daten
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);
  
  // Paginierte Daten
  const paginatedData = useMemo(() => {
    if (!pageSize) return sortedData;
    const start = currentPage * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageSize, currentPage]);
  
  const handleSort = (key: keyof T) => {
    const newDirection = 
      sortConfig?.key === key && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    setSortConfig({ key, direction: newDirection });
    onSort?.(key, newDirection);
  };
  
  // Virtualisierte oder normale Tabelle
  if (virtualized && data.length > 100) {
    return (
      <VirtualizedTable
        data={paginatedData}
        columns={columns}
        rowHeight={rowHeight}
        // ... andere Props
      />
    );
  }
  
  return (
    <div className="data-table-container">
      <table className={cn(
        'data-table',
        compact && 'data-table--compact',
        striped && 'data-table--striped',
        highlightOnHover && 'data-table--hover'
      )}>
        <thead>
          <tr>
            {selectable && (
              <th className="data-table__checkbox">
                <Checkbox
                  checked={selectedRows.length === data.length}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                  onChange={(checked) => 
                    onSelectionChange?.(checked ? data.map((_, i) => i) : [])
                  }
                />
              </th>
            )}
            {columns.map(col => (
              <th 
                key={String(col.key)}
                style={{ width: col.width, textAlign: col.align }}
                className={cn(
                  col.className,
                  sortable && col.sortable !== false && 'data-table__sortable'
                )}
                onClick={() => sortable && col.sortable !== false && handleSort(col.key as keyof T)}
              >
                {col.header}
                {sortConfig?.key === col.key && (
                  <SortIcon direction={sortConfig.direction} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="data-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, i) => (
              <tr 
                key={i}
                className={cn(selectedRows.includes(i) && 'data-table__row--selected')}
              >
                {selectable && (
                  <td className="data-table__checkbox">
                    <Checkbox
                      checked={selectedRows.includes(i)}
                      onChange={(checked) => {
                        const newSelection = checked
                          ? [...selectedRows, i]
                          : selectedRows.filter(idx => idx !== i);
                        onSelectionChange?.(newSelection);
                      }}
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td 
                    key={String(col.key)}
                    style={{ textAlign: col.align }}
                    className={col.className}
                  >
                    {col.render 
                      ? col.render(row[col.key as keyof T], row, i)
                      : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Pagination */}
      {pageSize && data.length > pageSize && (
        <Pagination
          totalItems={data.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
```

### 5.2 MetadataCard

```typescript
// src/components/shared/data/MetadataCard.tsx
interface MetadataCardProps {
  title?: string;
  items: MetadataItem[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;  // Für grid layout
}

interface MetadataItem {
  label: string;
  value: string | number | React.ReactNode;
  icon?: string;
  tooltip?: string;
  copyable?: boolean;
  highlight?: boolean;
}

export function MetadataCard({ 
  title, 
  items, 
  layout = 'grid',
  columns = 2 
}: MetadataCardProps) {
  return (
    <div className="metadata-card">
      {title && <h3 className="metadata-card__title">{title}</h3>}
      
      <dl className={cn(
        'metadata-card__list',
        `metadata-card__list--${layout}`,
        layout === 'grid' && `metadata-card__list--cols-${columns}`
      )}>
        {items.map((item, i) => (
          <div 
            key={i} 
            className={cn(
              'metadata-card__item',
              item.highlight && 'metadata-card__item--highlight'
            )}
          >
            <dt className="metadata-card__label">
              {item.icon && <Icon name={item.icon} />}
              {item.label}
              {item.tooltip && <Tooltip content={item.tooltip}><InfoIcon /></Tooltip>}
            </dt>
            <dd className="metadata-card__value">
              {item.value}
              {item.copyable && (
                <CopyButton value={String(item.value)} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

### 5.3 StatusBadge

```typescript
// src/components/shared/data/StatusBadge.tsx
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
  icon?: boolean;
  size?: 'small' | 'medium' | 'large';
  pulse?: boolean;  // Animierter Punkt
}

export function StatusBadge({ 
  status, 
  label, 
  icon = true, 
  size = 'medium',
  pulse = false 
}: StatusBadgeProps) {
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✗',
    info: 'ℹ',
    neutral: '•'
  };
  
  return (
    <span className={cn(
      'status-badge',
      `status-badge--${status}`,
      `status-badge--${size}`,
      pulse && 'status-badge--pulse'
    )}>
      {icon && <span className="status-badge__icon">{icons[status]}</span>}
      {label}
    </span>
  );
}

// Spezifische Varianten
export function PassFailBadge({ passed, standard }: { passed: boolean; standard: string }) {
  return (
    <StatusBadge
      status={passed ? 'success' : 'error'}
      label={`${passed ? '✓' : '✗'} ${standard}`}
    />
  );
}
```

---

## 6. Input-Komponenten

### 6.1 NumberInput

```typescript
// src/components/shared/inputs/NumberInput.tsx
interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  
  // Grenzen
  min?: number;
  max?: number;
  step?: number;
  
  // Format
  format?: 'decimal' | 'scientific' | 'percent';
  precision?: number;
  
  // Einheit
  unit?: string;
  
  // Validierung
  error?: string;
  warning?: string;
  
  // Styling
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  format = 'decimal',
  precision = 2,
  unit,
  error,
  warning,
  label,
  placeholder,
  disabled,
  size = 'medium'
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Formatierung für Anzeige
  const formatValue = (val: number | null): string => {
    if (val === null) return '';
    
    switch (format) {
      case 'scientific':
        return val.toExponential(precision);
      case 'percent':
        return (val * 100).toFixed(precision) + '%';
      default:
        return val.toFixed(precision);
    }
  };
  
  // Parsing von User-Input
  const parseValue = (input: string): number | null => {
    if (!input.trim()) return null;
    
    // Akzeptiere verschiedene Formate
    let normalized = input
      .replace(',', '.')           // Deutsches Format
      .replace(/\s/g, '')          // Whitespace
      .replace('×10', 'e')         // Unicode scientific
      .replace('%', '');           // Prozent
    
    const parsed = parseFloat(normalized);
    if (isNaN(parsed)) return null;
    
    // Bei Prozent: zurückrechnen
    if (format === 'percent' && !input.includes('e')) {
      return parsed / 100;
    }
    
    return parsed;
  };
  
  // Sync mit externem value
  useEffect(() => {
    setInputValue(formatValue(value));
  }, [value, format, precision]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleBlur = () => {
    const parsed = parseValue(inputValue);
    
    // Grenzen anwenden
    let clamped = parsed;
    if (clamped !== null) {
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
    }
    
    onChange(clamped);
    setInputValue(formatValue(clamped));
  };
  
  return (
    <div className={cn(
      'number-input',
      `number-input--${size}`,
      error && 'number-input--error',
      warning && 'number-input--warning',
      disabled && 'number-input--disabled'
    )}>
      {label && <label className="number-input__label">{label}</label>}
      
      <div className="number-input__wrapper">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="number-input__field"
        />
        
        {unit && <span className="number-input__unit">{unit}</span>}
        
        {/* Stepper-Buttons (optional) */}
        <div className="number-input__stepper">
          <button 
            type="button"
            onClick={() => onChange((value ?? 0) + step)}
            disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
          >
            +
          </button>
          <button 
            type="button"
            onClick={() => onChange((value ?? 0) - step)}
            disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
          >
            −
          </button>
        </div>
      </div>
      
      {error && <span className="number-input__error">{error}</span>}
      {warning && !error && <span className="number-input__warning">{warning}</span>}
    </div>
  );
}
```

### 6.2 RangeSlider

```typescript
// src/components/shared/inputs/RangeSlider.tsx
interface RangeSliderProps {
  // Werte
  value: [number, number];
  onChange: (value: [number, number]) => void;
  
  // Bereich
  min: number;
  max: number;
  step?: number;
  
  // Format
  formatLabel?: (value: number) => string;
  
  // Styling
  label?: string;
  showValues?: boolean;
  showTicks?: boolean;
  tickCount?: number;
}

export function RangeSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatLabel = (v) => String(v),
  label,
  showValues = true,
  showTicks = false,
  tickCount = 5
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  
  const getPosition = (val: number) => ((val - min) / (max - min)) * 100;
  
  const handleMouseDown = (handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(handle);
  };
  
  useEffect(() => {
    if (!dragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newValue = min + percent * (max - min);
      const snapped = Math.round(newValue / step) * step;
      
      if (dragging === 'start') {
        onChange([Math.min(snapped, value[1] - step), value[1]]);
      } else {
        onChange([value[0], Math.max(snapped, value[0] + step)]);
      }
    };
    
    const handleMouseUp = () => setDragging(null);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, min, max, step, value, onChange]);
  
  return (
    <div className="range-slider">
      {label && <label className="range-slider__label">{label}</label>}
      
      <div className="range-slider__container">
        {showValues && (
          <span className="range-slider__value range-slider__value--start">
            {formatLabel(value[0])}
          </span>
        )}
        
        <div ref={trackRef} className="range-slider__track">
          {/* Ausgewählter Bereich */}
          <div 
            className="range-slider__range"
            style={{
              left: `${getPosition(value[0])}%`,
              width: `${getPosition(value[1]) - getPosition(value[0])}%`
            }}
          />
          
          {/* Handles */}
          <div 
            className={cn('range-slider__handle', dragging === 'start' && 'active')}
            style={{ left: `${getPosition(value[0])}%` }}
            onMouseDown={handleMouseDown('start')}
          />
          <div 
            className={cn('range-slider__handle', dragging === 'end' && 'active')}
            style={{ left: `${getPosition(value[1])}%` }}
            onMouseDown={handleMouseDown('end')}
          />
          
          {/* Ticks */}
          {showTicks && (
            <div className="range-slider__ticks">
              {Array.from({ length: tickCount }, (_, i) => {
                const val = min + (i / (tickCount - 1)) * (max - min);
                return (
                  <div 
                    key={i} 
                    className="range-slider__tick"
                    style={{ left: `${getPosition(val)}%` }}
                  >
                    <span>{formatLabel(val)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {showValues && (
          <span className="range-slider__value range-slider__value--end">
            {formatLabel(value[1])}
          </span>
        )}
      </div>
    </div>
  );
}
```

### 6.3 Toggle

```typescript
// src/components/shared/inputs/Toggle.tsx
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  color?: string;
  size?: 'small' | 'medium';
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  color,
  size = 'medium'
}: ToggleProps) {
  return (
    <label className={cn(
      'toggle',
      `toggle--${size}`,
      checked && 'toggle--checked',
      disabled && 'toggle--disabled'
    )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="toggle__input"
      />
      
      <span 
        className="toggle__track"
        style={checked && color ? { backgroundColor: color } : undefined}
      >
        <span className="toggle__thumb" />
      </span>
      
      {(label || description) && (
        <span className="toggle__content">
          {label && <span className="toggle__label">{label}</span>}
          {description && <span className="toggle__description">{description}</span>}
        </span>
      )}
    </label>
  );
}
```

---

## 7. Feedback-Komponenten

### 7.1 Toast

```typescript
// src/components/shared/feedback/Toast.tsx
interface ToastProps {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: (id: string) => void;
  duration?: number;  // 0 = manuell schließen
}

export function Toast({
  id,
  type,
  title,
  message,
  action,
  onDismiss,
  duration = 5000
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);
  
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✗',
    info: 'ℹ'
  };
  
  return (
    <div className={cn('toast', `toast--${type}`)}>
      <span className="toast__icon">{icons[type]}</span>
      
      <div className="toast__content">
        {title && <strong className="toast__title">{title}</strong>}
        <p className="toast__message">{message}</p>
      </div>
      
      {action && (
        <button className="toast__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      
      <button className="toast__dismiss" onClick={() => onDismiss(id)}>
        ×
      </button>
    </div>
  );
}

// Toast-Container
export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          >
            <Toast {...toast} onDismiss={dismiss} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### 7.2 LoadingSpinner

```typescript
// src/components/shared/feedback/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  label?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({
  size = 'medium',
  color,
  label,
  fullscreen = false
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('loading-spinner', `loading-spinner--${size}`)}>
      <svg viewBox="0 0 50 50" className="loading-spinner__svg">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
          stroke={color || 'currentColor'}
          strokeLinecap="round"
          className="loading-spinner__circle"
        />
      </svg>
      {label && <span className="loading-spinner__label">{label}</span>}
    </div>
  );
  
  if (fullscreen) {
    return (
      <div className="loading-spinner__overlay">
        {spinner}
      </div>
    );
  }
  
  return spinner;
}
```

### 7.3 EmptyState

```typescript
// src/components/shared/feedback/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      
      <h3 className="empty-state__title">{title}</h3>
      
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      
      {(action || secondaryAction) && (
        <div className="empty-state__actions">
          {action && (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 8. CSS-Styles (Grundgerüst)

```css
/* src/styles/shared.css */

/* ===== Design Tokens ===== */
:root {
  /* Farben */
  --color-primary: #0097E0;
  --color-primary-hover: #007BB8;
  --color-accent: #00E097;
  --color-accent-teal: #00DEE0;
  
  --color-success: #00E097;
  --color-warning: #E0BD00;
  --color-danger: #F87171;
  
  --color-surface: #FFFFFF;
  --color-surface-muted: #F2F3F7;
  --color-background: #F6F7FB;
  
  --color-text-primary: #1F2430;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  
  --color-border: #E5E7EB;
  
  /* Abstände */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Radien */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  
  /* Schatten */
  --shadow-card: 0 12px 30px rgba(35, 40, 70, 0.08);
  --shadow-hover: 0 16px 36px rgba(35, 40, 70, 0.12);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
}

/* ===== Base Components ===== */

/* Cards */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-lg);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn--primary {
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
  color: white;
  border: none;
}

.btn--primary:hover {
  filter: brightness(1.1);
}

.btn--secondary {
  background: var(--color-surface-muted);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* ===== Chart Styles ===== */
.chart-container {
  position: relative;
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.axis-label {
  font-size: 12px;
  fill: var(--color-text-secondary);
}

.grid-line {
  stroke: var(--color-border);
  stroke-opacity: 0.5;
}

/* ===== Table Styles ===== */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  font-weight: 600;
  background: var(--color-surface-muted);
}

.data-table--striped tbody tr:nth-child(even) {
  background: var(--color-surface-muted);
}

.data-table--hover tbody tr:hover {
  background: rgba(0, 151, 224, 0.05);
}

/* ===== Toast Styles ===== */
.toast-container {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  min-width: 300px;
  max-width: 450px;
}

.toast--success { border-left: 4px solid var(--color-success); }
.toast--warning { border-left: 4px solid var(--color-warning); }
.toast--error { border-left: 4px solid var(--color-danger); }

/* ===== Loading Spinner ===== */
.loading-spinner__circle {
  animation: spinner-dash 1.5s ease-in-out infinite;
  transform-origin: center;
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
```

---

## 9. Implementierungs-Checkliste

### Phase 1: Basis-Komponenten
- [ ] Design-Tokens definieren
- [ ] Button, Card, Badge
- [ ] Toggle, Checkbox, Select
- [ ] NumberInput mit Validation

### Phase 2: Charts
- [ ] BaseChart mit D3
- [ ] TimeSeriesChart
- [ ] ChartControls
- [ ] Zoom/Pan Verhalten

### Phase 3: Upload & Export
- [ ] FileUpload mit Drag & Drop
- [ ] FilePreview
- [ ] ExportMenu
- [ ] PDF/CSV/HTML Export

### Phase 4: Daten-Display
- [ ] DataTable (virtualisiert)
- [ ] MetadataCard
- [ ] StatusBadge

### Phase 5: Feedback
- [ ] Toast-System
- [ ] LoadingSpinner
- [ ] EmptyState
- [ ] ErrorDisplay

---

*Spezifikation erstellt: Januar 2026*
*Für: RGA Analyser App*
