import type { AnalysisResult } from '@/types/rga'
import { generateAnimationSequence } from './animation'

function formatAIContent(text: string): string {
  return text.split('\n').map(line => {
    if (line.startsWith('## ')) {
      return `<h4 class="ai-h2">${line.replace('## ', '')}</h4>`
    }
    if (line.startsWith('### ')) {
      return `<h5 class="ai-h3">${line.replace('### ', '')}</h5>`
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return `<p class="ai-bold">${line.replace(/\*\*/g, '')}</p>`
    }
    if (line.startsWith('- ')) {
      return `<li class="ai-list-item">${line.replace('- ', '')}</li>`
    }
    if (line.trim() === '') {
      return '<br>'
    }
    return `<p class="ai-paragraph">${line}</p>`
  }).join('\n')
}

const labels = {
  de: {
    title: 'RGA Spektrum Analyse',
    play: 'Abspielen',
    pause: 'Pause',
    restart: 'Neustart',
    speed: 'Geschwindigkeit',
    file: 'Datei',
    date: 'Datum',
    pressure: 'Druck',
    chamber: 'Kammer',
    massRange: 'Massenbereich',
    gsi: 'GSI Standard',
    cern: 'CERN Standard',
    passed: 'Bestanden',
    failed: 'Nicht bestanden',
    peaks: 'Detektierte Peaks',
    qualityChecks: 'Qualitätsprüfungen',
    mass: 'Masse',
    intensity: 'Intensität',
    xAxis: 'Masse [AMU]',
    yAxis: 'Relative Intensität',
    showGSI: 'GSI Limit',
    showCERN: 'CERN Limit',
    logScale: 'Log-Skala',
    aiInterpretation: 'KI-Interpretation',
    generatedBy: 'Erstellt mit Spectrum RGA Analyser',
    // Diagnosis labels
    diagnosis: 'Automatische Diagnose',
    confidence: 'Konfidenz',
    recommendation: 'Empfehlung',
    affectedMasses: 'Betroffene Massen',
    critical: 'Kritisch',
    warning: 'Warnung',
    info: 'Info',
    clean: 'Sauber',
    systemStates: {
      unbaked: 'Nicht ausgeheizt',
      baked: 'Ausgeheizt',
      contaminated: 'Kontaminiert',
      air_leak: 'Luftleck',
      unknown: 'Unbekannt',
    },
  },
  en: {
    title: 'RGA Spectrum Analysis',
    play: 'Play',
    pause: 'Pause',
    restart: 'Restart',
    speed: 'Speed',
    file: 'File',
    date: 'Date',
    pressure: 'Pressure',
    chamber: 'Chamber',
    massRange: 'Mass Range',
    gsi: 'GSI Standard',
    cern: 'CERN Standard',
    passed: 'Passed',
    failed: 'Failed',
    peaks: 'Detected Peaks',
    qualityChecks: 'Quality Checks',
    mass: 'Mass',
    intensity: 'Intensity',
    xAxis: 'Mass [AMU]',
    yAxis: 'Relative Intensity',
    showGSI: 'GSI Limit',
    showCERN: 'CERN Limit',
    logScale: 'Log Scale',
    aiInterpretation: 'AI Interpretation',
    generatedBy: 'Generated with Spectrum RGA Analyser',
    // Diagnosis labels
    diagnosis: 'Automatic Diagnosis',
    confidence: 'Confidence',
    recommendation: 'Recommendation',
    affectedMasses: 'Affected Masses',
    critical: 'Critical',
    warning: 'Warning',
    info: 'Info',
    clean: 'Clean',
    systemStates: {
      unbaked: 'Unbaked',
      baked: 'Baked',
      contaminated: 'Contaminated',
      air_leak: 'Air Leak',
      unknown: 'Unknown',
    },
  },
}

export function generateAnimatedHTML(
  analysis: AnalysisResult,
  language: 'de' | 'en' = 'de',
  aiInterpretation?: string | null
): string {
  const l = labels[language]
  const sequence = generateAnimationSequence(analysis)
  const dateStr = analysis.metadata.startTime?.toLocaleDateString(
    language === 'de' ? 'de-DE' : 'en-US'
  ) || 'Unknown'

  // Prepare data for embedding
  const chartData = analysis.normalizedData.map(d => ({
    mass: d.mass,
    value: d.normalizedToH2,
  }))

  const peakData = analysis.peaks
    .sort((a, b) => b.normalizedValue - a.normalizedValue)
    .slice(0, 15)
    .map(p => ({
      mass: p.mass,
      gas: p.gasIdentification,
      value: p.normalizedValue,
    }))

  const gsiPassed = analysis.limitChecks.every(c => c.gsiPassed)
  const cernPassed = analysis.limitChecks.every(c => c.cernPassed)

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${l.title} - ${analysis.metadata.sourceFile || 'RGA Data'}</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    :root {
      --primary: #0050E0;
      --primary-light: #00DEE0;
      --success: #00E097;
      --warning: #E0BD00;
      --danger: #F87171;
      --surface: #F6F7FB;
      --card: #FFFFFF;
      --text: #1F2430;
      --text-muted: #6B7280;
      --gsi-color: #f59e0b;
      --cern-color: #ef4444;
      --spectrum-color: #3b82f6;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--surface);
      color: var(--text);
      line-height: 1.5;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      background: linear-gradient(135deg, var(--success) 0%, var(--primary-light) 50%, var(--primary) 100%);
      padding: 32px;
      border-radius: 20px;
      color: white;
      margin-bottom: 24px;
      box-shadow: 0 12px 30px rgba(35, 40, 70, 0.15);
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      font-size: 14px;
      opacity: 0.95;
    }

    .status-badges {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .badge {
      padding: 8px 16px;
      border-radius: 999px;
      font-weight: 600;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .badge-success { background: rgba(255,255,255,0.2); color: white; }
    .badge-danger { background: rgba(248, 113, 113, 0.3); color: white; }

    .controls {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px 24px;
      background: var(--card);
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(35, 40, 70, 0.08);
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--success) 0%, var(--primary-light) 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 222, 224, 0.3);
    }

    .btn-secondary {
      background: var(--surface);
      color: var(--text);
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .progress-container {
      flex: 1;
      min-width: 200px;
    }

    .progress-bar {
      height: 8px;
      background: var(--surface);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--success), var(--primary));
      width: 0%;
      transition: width 0.1s linear;
    }

    .speed-control {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .speed-control input {
      width: 100px;
      accent-color: var(--primary);
    }

    .chart-options {
      display: flex;
      gap: 16px;
      margin-left: auto;
    }

    .chart-options label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-muted);
      cursor: pointer;
    }

    .chart-options input[type="checkbox"] {
      accent-color: var(--primary);
    }

    .card {
      background: var(--card);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 12px 30px rgba(35, 40, 70, 0.08);
      margin-bottom: 24px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 36px rgba(35, 40, 70, 0.12);
    }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
      color: var(--text);
    }

    #chart-container {
      width: 100%;
      height: 450px;
      position: relative;
    }

    .annotation-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 20px 32px;
      border-radius: 16px;
      font-size: 20px;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
      z-index: 10;
    }

    .annotation-overlay.visible { opacity: 1; }

    .peak-label {
      font-size: 11px;
      font-weight: 600;
      fill: var(--text);
      opacity: 0;
      transition: opacity 0.4s;
    }

    .peak-label.active { opacity: 1; }

    .highlight-circle {
      fill: none;
      stroke: var(--primary);
      stroke-width: 2;
      opacity: 0;
    }

    .highlight-circle.active {
      opacity: 1;
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); stroke-opacity: 1; }
      50% { transform: scale(1.3); stroke-opacity: 0.6; }
    }

    .grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .grid { grid-template-columns: 1fr; }
    }

    .peak-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .peak-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border-radius: 10px;
      margin-bottom: 6px;
      transition: all 0.25s;
    }

    .peak-item:nth-child(odd) { background: var(--surface); }
    .peak-item:hover { transform: translateX(4px); }

    .peak-mass {
      font-weight: 600;
      color: var(--primary);
    }

    .peak-gas {
      color: var(--text-muted);
      font-size: 13px;
    }

    .peak-value {
      font-weight: 600;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
    }

    .footer {
      text-align: center;
      padding: 24px;
      color: var(--text-muted);
      font-size: 13px;
    }

    .axis path, .axis line { stroke: #e5e7eb; }
    .axis text { fill: var(--text-muted); font-size: 11px; }
    .grid-line { stroke: #f0f0f5; stroke-dasharray: 2,2; }

    /* Diagnosis Styles */
    .diagnosis-section {
      margin-top: 24px;
    }

    .diagnosis-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .diagnosis-status {
      padding: 6px 14px;
      border-radius: 999px;
      font-weight: 600;
      font-size: 12px;
    }

    .diagnosis-status.clean { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
    .diagnosis-status.warning { background: rgba(245, 158, 11, 0.15); color: #d97706; }
    .diagnosis-status.critical { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

    .diagnosis-system-state {
      color: var(--text-muted);
      font-size: 13px;
    }

    .diagnosis-counts {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    .diagnosis-count {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .diagnosis-count .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .diagnosis-count .dot.critical { background: #ef4444; }
    .diagnosis-count .dot.warning { background: #f59e0b; }
    .diagnosis-count .dot.info { background: #22c55e; }

    .diagnosis-item {
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 12px;
      border-left: 4px solid;
      transition: transform 0.2s;
    }

    .diagnosis-item:hover { transform: translateX(4px); }

    .diagnosis-item.critical {
      background: rgba(239, 68, 68, 0.08);
      border-color: #ef4444;
    }

    .diagnosis-item.warning {
      background: rgba(245, 158, 11, 0.08);
      border-color: #f59e0b;
    }

    .diagnosis-item.info {
      background: rgba(34, 197, 94, 0.08);
      border-color: #22c55e;
    }

    .diagnosis-item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .diagnosis-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .diagnosis-icon {
      font-size: 18px;
    }

    .diagnosis-confidence {
      font-size: 12px;
      color: var(--text-muted);
      background: var(--surface);
      padding: 4px 10px;
      border-radius: 999px;
    }

    .diagnosis-description {
      color: var(--text-muted);
      font-size: 13px;
      margin-bottom: 8px;
    }

    .diagnosis-recommendation {
      font-size: 13px;
      color: var(--text);
      font-style: italic;
      padding: 8px 12px;
      background: rgba(0,0,0,0.03);
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .diagnosis-masses {
      font-size: 12px;
      color: var(--text-muted);
    }

    .diagnosis-masses span {
      font-family: 'Monaco', 'Menlo', monospace;
      background: var(--surface);
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 4px;
    }

    /* AI Interpretation Styles */
    .ai-interpretation {
      margin-top: 24px;
    }

    .ai-content {
      line-height: 1.7;
      color: var(--text);
    }

    .ai-h2 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
      margin-top: 20px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--primary-light);
    }

    .ai-h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .ai-bold {
      font-weight: 600;
      color: var(--text);
      margin-top: 12px;
      margin-bottom: 6px;
    }

    .ai-paragraph {
      color: var(--text-muted);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .ai-list-item {
      color: var(--text-muted);
      margin-left: 20px;
      margin-bottom: 6px;
      font-size: 14px;
      list-style-type: disc;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${l.title}</h1>
      <div class="metadata">
        <div><strong>${l.file}:</strong> ${analysis.metadata.sourceFile || 'Unknown'}</div>
        <div><strong>${l.date}:</strong> ${dateStr}</div>
        <div><strong>${l.pressure}:</strong> ${analysis.metadata.pressure || 'Unknown'}</div>
        <div><strong>${l.chamber}:</strong> ${analysis.metadata.chamberName || 'Unknown'}</div>
      </div>
      <div class="status-badges">
        <span class="badge ${gsiPassed ? 'badge-success' : 'badge-danger'}">
          ${gsiPassed ? '✓' : '✗'} ${l.gsi}: ${gsiPassed ? l.passed : l.failed}
        </span>
        <span class="badge ${cernPassed ? 'badge-success' : 'badge-danger'}">
          ${cernPassed ? '✓' : '✗'} ${l.cern}: ${cernPassed ? l.passed : l.failed}
        </span>
      </div>
    </header>

    <div class="controls">
      <button id="playBtn" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        ${l.play}
      </button>
      <button id="restartBtn" class="btn btn-secondary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        ${l.restart}
      </button>
      <div class="progress-container">
        <div class="progress-bar">
          <div id="progressFill" class="progress-fill"></div>
        </div>
      </div>
      <div class="speed-control">
        <label>${l.speed}:</label>
        <input type="range" id="speedSlider" min="0.5" max="2" step="0.25" value="1">
        <span id="speedValue">1x</span>
      </div>
      <div class="chart-options">
        <label><input type="checkbox" id="showGSI" checked> ${l.showGSI}</label>
        <label><input type="checkbox" id="showCERN" checked> ${l.showCERN}</label>
        <label><input type="checkbox" id="logScale" checked> ${l.logScale}</label>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div id="chart-container">
          <div id="annotation" class="annotation-overlay"></div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">${l.peaks}</h3>
        <div class="peak-list">
          ${peakData.map(p => `
            <div class="peak-item">
              <div>
                <span class="peak-mass">${l.mass} ${p.mass}</span>
                <span class="peak-gas">${p.gas}</span>
              </div>
              <span class="peak-value">${(p.value * 100).toFixed(3)}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    ${analysis.diagnostics && analysis.diagnostics.length > 0 && analysis.diagnosisSummary ? `
    <div class="card diagnosis-section">
      <h3 class="card-title">${l.diagnosis}</h3>
      <div class="diagnosis-header">
        <span class="diagnosis-status ${analysis.diagnosisSummary.overallStatus}">
          ${analysis.diagnosisSummary.overallStatus === 'clean' ? l.clean :
            analysis.diagnosisSummary.overallStatus === 'warning' ? l.warning : l.critical}
        </span>
        <span class="diagnosis-system-state">
          ${l.systemStates[analysis.diagnosisSummary.systemState]}
        </span>
      </div>
      ${(analysis.diagnosisSummary.criticalCount > 0 || analysis.diagnosisSummary.warningCount > 0) ? `
      <div class="diagnosis-counts">
        ${analysis.diagnosisSummary.criticalCount > 0 ? `
        <div class="diagnosis-count">
          <div class="dot critical"></div>
          <span>${analysis.diagnosisSummary.criticalCount} ${l.critical.toLowerCase()}</span>
        </div>` : ''}
        ${analysis.diagnosisSummary.warningCount > 0 ? `
        <div class="diagnosis-count">
          <div class="dot warning"></div>
          <span>${analysis.diagnosisSummary.warningCount} ${l.warning.toLowerCase()}</span>
        </div>` : ''}
        ${analysis.diagnosisSummary.infoCount > 0 ? `
        <div class="diagnosis-count">
          <div class="dot info"></div>
          <span>${analysis.diagnosisSummary.infoCount} ${l.info.toLowerCase()}</span>
        </div>` : ''}
      </div>` : ''}
      ${analysis.diagnostics.map(diag => `
      <div class="diagnosis-item ${diag.severity}">
        <div class="diagnosis-item-header">
          <span class="diagnosis-name">
            <span class="diagnosis-icon">${diag.icon}</span>
            ${language === 'de' ? diag.name : diag.nameEn}
          </span>
          <span class="diagnosis-confidence">${(diag.confidence * 100).toFixed(0)}% ${l.confidence}</span>
        </div>
        <p class="diagnosis-description">${language === 'de' ? diag.description : diag.descriptionEn}</p>
        <p class="diagnosis-recommendation">→ ${language === 'de' ? diag.recommendation : diag.recommendationEn}</p>
        ${diag.affectedMasses.length > 0 ? `
        <p class="diagnosis-masses">m/z: ${diag.affectedMasses.map(m => `<span>${m}</span>`).join('')}</p>
        ` : ''}
      </div>
      `).join('')}
    </div>
    ` : ''}

    ${aiInterpretation ? `
    <div class="card ai-interpretation">
      <h3 class="card-title">${l.aiInterpretation}</h3>
      <div class="ai-content">
        ${formatAIContent(aiInterpretation)}
      </div>
    </div>
    ` : ''}

    <footer class="footer">
      ${l.generatedBy} | ${new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
    </footer>
  </div>

  <script>
    // Data
    const chartData = ${JSON.stringify(chartData)};
    const sequence = ${JSON.stringify(sequence)};
    const labels = ${JSON.stringify(l)};

    // GSI Limit function
    function getGSILimit(mass) {
      if (mass <= 12) return 1.0;
      if (mass > 12 && mass < 19.5) return 0.1;
      if (mass > 27.5 && mass < 28.5) return 0.1;
      if (mass > 43.5 && mass < 44.75) return 0.1;
      if (mass > 45) return 0.001;
      return 0.02;
    }

    // CERN Limit function
    function getCERNLimit(mass) {
      if (mass <= 3) return 1.0;
      if (mass > 3 && mass < 20.5) return 0.1;
      if (mass > 20.4 && mass < 27.5) return 0.01;
      if (mass > 27.4 && mass < 28.5) return 0.1;
      if (mass > 28.45 && mass < 32.5) return 0.01;
      if (mass > 32.4 && mass < 43.5) return 0.002;
      if (mass > 43.4 && mass < 45.1) return 0.05;
      if (mass > 45) return 0.0001;
      return 1.0;
    }

    // Animation state
    let isPlaying = false;
    let currentStep = 0;
    let speed = 1;

    // DOM Elements
    const playBtn = document.getElementById('playBtn');
    const restartBtn = document.getElementById('restartBtn');
    const progressFill = document.getElementById('progressFill');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const showGSI = document.getElementById('showGSI');
    const showCERN = document.getElementById('showCERN');
    const logScale = document.getElementById('logScale');
    const annotation = document.getElementById('annotation');

    // Chart setup
    const container = document.getElementById('chart-container');
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    const svg = d3.select('#chart-container')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', \`0 0 \${width + margin.left + margin.right} \${height + margin.top + margin.bottom}\`);

    const g = svg.append('g')
      .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

    // Scales
    let xScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.mass)])
      .range([0, width]);

    let yScale = d3.scaleLog()
      .domain([1e-6, 2])
      .range([height, 0])
      .clamp(true);

    // Axes
    const xAxis = g.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', \`translate(0,\${height})\`);

    const yAxis = g.append('g')
      .attr('class', 'axis y-axis');

    // Axis labels
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('x', margin.left + width / 2)
      .attr('y', height + margin.top + 40)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--text-muted)')
      .text(labels.xAxis);

    svg.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + height / 2))
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--text-muted)')
      .text(labels.yAxis);

    // Clip path for zoom
    g.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    const chartArea = g.append('g')
      .attr('clip-path', 'url(#clip)');

    // Limit lines
    const gsiLine = chartArea.append('path')
      .attr('class', 'limit-line gsi')
      .style('fill', 'none')
      .style('stroke', 'var(--gsi-color)')
      .style('stroke-width', 2)
      .style('stroke-dasharray', '6,3')
      .style('opacity', 0.7);

    const cernLine = chartArea.append('path')
      .attr('class', 'limit-line cern')
      .style('fill', 'none')
      .style('stroke', 'var(--cern-color)')
      .style('stroke-width', 2)
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.7);

    // Spectrum line
    const spectrumLine = chartArea.append('path')
      .attr('class', 'spectrum-line')
      .style('fill', 'none')
      .style('stroke', 'var(--spectrum-color)')
      .style('stroke-width', 1.5);

    // Highlight elements
    const highlightCircle = chartArea.append('circle')
      .attr('class', 'highlight-circle')
      .attr('r', 15);

    const peakLabel = chartArea.append('text')
      .attr('class', 'peak-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -25);

    function updateChart() {
      const useLog = logScale.checked;

      if (useLog) {
        yScale = d3.scaleLog().domain([1e-6, 2]).range([height, 0]).clamp(true);
      } else {
        yScale = d3.scaleLinear().domain([0, 1.1]).range([height, 0]);
      }

      xAxis.transition().duration(300).call(d3.axisBottom(xScale).ticks(10));
      yAxis.transition().duration(300).call(
        d3.axisLeft(yScale)
          .ticks(useLog ? 6 : 5)
          .tickFormat(d => useLog ? d3.format('.0e')(d) : d3.format('.0%')(d))
      );

      // Update spectrum
      const line = d3.line()
        .x(d => xScale(d.mass))
        .y(d => yScale(Math.max(1e-7, d.value)))
        .curve(d3.curveMonotoneX);

      spectrumLine.transition().duration(300).attr('d', line(chartData));

      // Update limit lines
      if (showGSI.checked) {
        const gsiData = [];
        for (let m = 0; m <= 100; m += 0.5) {
          gsiData.push({ mass: m, value: getGSILimit(m) });
        }
        const gsiLineFn = d3.line()
          .x(d => xScale(d.mass))
          .y(d => yScale(d.value))
          .curve(d3.curveStepAfter);
        gsiLine.transition().duration(300).attr('d', gsiLineFn(gsiData)).style('opacity', 0.7);
      } else {
        gsiLine.style('opacity', 0);
      }

      if (showCERN.checked) {
        const cernData = [];
        for (let m = 0; m <= 100; m += 0.5) {
          cernData.push({ mass: m, value: getCERNLimit(m) });
        }
        const cernLineFn = d3.line()
          .x(d => xScale(d.mass))
          .y(d => yScale(d.value))
          .curve(d3.curveStepAfter);
        cernLine.transition().duration(300).attr('d', cernLineFn(cernData)).style('opacity', 0.7);
      } else {
        cernLine.style('opacity', 0);
      }
    }

    function zoomTo(massStart, massEnd, duration = 500) {
      xScale.domain([massStart, massEnd]);

      const relevantData = chartData.filter(d => d.mass >= massStart && d.mass <= massEnd);
      const maxVal = d3.max(relevantData, d => d.value) || 1;

      if (!logScale.checked) {
        yScale.domain([0, Math.min(maxVal * 1.2, 1.1)]);
      }

      xAxis.transition().duration(duration).call(d3.axisBottom(xScale).ticks(10));
      yAxis.transition().duration(duration).call(
        d3.axisLeft(yScale)
          .ticks(logScale.checked ? 6 : 5)
          .tickFormat(d => logScale.checked ? d3.format('.0e')(d) : d3.format('.0%')(d))
      );

      updateChart();
    }

    function resetZoom() {
      xScale.domain([0, d3.max(chartData, d => d.mass)]);
      if (!logScale.checked) {
        yScale.domain([0, 1.1]);
      }
      updateChart();
    }

    function highlightPeak(mass, text) {
      const point = chartData.find(d => Math.abs(d.mass - mass) < 0.5);
      if (!point) return;

      const x = xScale(point.mass);
      const y = yScale(point.value);

      highlightCircle
        .attr('cx', x)
        .attr('cy', y)
        .classed('active', true);

      peakLabel
        .attr('x', x)
        .attr('y', y)
        .text(text)
        .classed('active', true);
    }

    function clearHighlight() {
      highlightCircle.classed('active', false);
      peakLabel.classed('active', false);
    }

    function showAnnotation(text) {
      annotation.textContent = text;
      annotation.classList.add('visible');
    }

    function hideAnnotation() {
      annotation.classList.remove('visible');
    }

    async function executeStep(step) {
      clearHighlight();
      hideAnnotation();

      switch (step.type) {
        case 'overview':
          resetZoom();
          break;
        case 'zoom':
          zoomTo(step.target.massStart, step.target.massEnd, step.duration * 0.4);
          break;
        case 'highlight':
          highlightPeak(step.peak, step.text);
          break;
        case 'annotation':
          showAnnotation(step.text);
          break;
      }
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function runAnimation() {
      while (isPlaying && currentStep < sequence.steps.length) {
        const step = sequence.steps[currentStep];
        await executeStep(step);
        await sleep(step.duration / speed);
        currentStep++;
        updateProgress();
      }

      if (currentStep >= sequence.steps.length) {
        isPlaying = false;
        playBtn.innerHTML = \`
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          \${labels.play}
        \`;
      }
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      playBtn.innerHTML = isPlaying
        ? \`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> \${labels.pause}\`
        : \`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> \${labels.play}\`;

      if (isPlaying) runAnimation();
    }

    function restart() {
      currentStep = 0;
      progressFill.style.width = '0%';
      clearHighlight();
      hideAnnotation();
      resetZoom();

      if (!isPlaying) {
        isPlaying = true;
        playBtn.innerHTML = \`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> \${labels.pause}\`;
        runAnimation();
      }
    }

    function updateProgress() {
      const percent = (currentStep / sequence.steps.length) * 100;
      progressFill.style.width = percent + '%';
    }

    // Event listeners
    playBtn.addEventListener('click', togglePlay);
    restartBtn.addEventListener('click', restart);

    speedSlider.addEventListener('input', (e) => {
      speed = parseFloat(e.target.value);
      speedValue.textContent = speed + 'x';
    });

    showGSI.addEventListener('change', updateChart);
    showCERN.addEventListener('change', updateChart);
    logScale.addEventListener('change', updateChart);

    // Initial render
    updateChart();
  </script>
</body>
</html>`
}

export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
