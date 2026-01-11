/**
 * Design Tokens for KnowledgePanel Component
 *
 * Centralized styling constants to ensure visual consistency across all tabs.
 * Use with the `cn()` utility from @/lib/utils/cn for class composition.
 */

export const KNOWLEDGE_PANEL_STYLES = {
  // Spacing
  spacing: {
    cardPadding: 'p-4',
    cardPaddingSmall: 'p-3',
    cardPaddingLarge: 'p-6',
    sectionGap: 'space-y-6',
    itemGap: 'space-y-3',
    itemGapSmall: 'space-y-2',
    itemGapLarge: 'space-y-4',
  },

  // Colors
  colors: {
    // Introduction/Info sections
    intro: 'from-aqua-500/10 to-aqua-600/5 border-aqua-500/20',
    infoBox: 'bg-aqua-500/10 text-aqua-700 dark:text-aqua-300',
    highlight: 'bg-mint-500/10 border-mint-500/20',

    // Severity levels
    success: 'bg-state-success/10 text-state-success',
    warning: 'bg-state-warning/10 text-state-warning',
    danger: 'bg-state-danger/10 text-state-danger',
    info: 'bg-aqua-500/20 text-aqua-500',
    neutral: 'bg-bg-secondary text-text-muted',

    // Badge variants
    successBadge: 'bg-state-success/20 text-state-success',
    warningBadge: 'bg-state-warning/20 text-state-warning',
    dangerBadge: 'bg-state-danger/20 text-state-danger',
    infoBadge: 'bg-aqua-500/20 text-aqua-500',
    okBadge: 'bg-state-success/20 text-state-success',

    // Validation status
    validated: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    conditional: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',

    // Mass/Gas highlighting
    massHighlight: 'bg-aqua-500/10 text-aqua-500',
  },

  // Typography
  typography: {
    // Headers
    pageTitle: 'text-h3 font-semibold text-text-primary',
    sectionTitle: 'font-semibold text-text-primary mb-3',
    cardTitle: 'font-medium text-text-primary',
    subTitle: 'font-medium text-text-secondary text-caption',

    // Body text
    body: 'text-body text-text-secondary',
    caption: 'text-caption text-text-secondary',
    captionMuted: 'text-caption text-text-muted',
    micro: 'text-micro text-text-muted',

    // Special
    mono: 'font-mono',
    link: 'text-aqua-600 dark:text-aqua-400 hover:text-aqua-700 dark:hover:text-aqua-300 hover:underline',
  },

  // Cards
  cards: {
    base: 'bg-surface-card-muted rounded-lg',
    basePadded: 'bg-surface-card-muted rounded-lg p-4',
    muted: 'bg-bg-secondary rounded-lg',
    mutedPadded: 'bg-bg-secondary rounded-lg p-3',
    interactive: 'hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
    interactiveFull: 'w-full text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
    elevated: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm',
    gradient: 'bg-gradient-to-r rounded-lg p-4 border',
  },

  // Badges
  badges: {
    base: 'text-micro px-1.5 py-0.5 rounded',
    large: 'text-caption px-2 py-0.5 rounded',
    pill: 'text-micro px-2 py-0.5 rounded-full',
  },

  // Borders
  borders: {
    subtle: 'border-subtle',
    subtleDivider: 'border-b border-subtle/50',
    light: 'border border-subtle/30',
    focus: 'border-aqua-500/50',
  },

  // Layout
  layout: {
    container: 'p-6 max-w-7xl mx-auto',
    grid: 'grid grid-cols-1 gap-2',
    gridWide: 'grid grid-cols-2 gap-2',
    gridThree: 'grid grid-cols-3 gap-2',
    flex: 'flex items-center gap-2',
    flexBetween: 'flex items-center justify-between',
    flexColumn: 'flex flex-col',
  },

  // Interactive elements
  interactions: {
    button: 'px-4 py-2 rounded transition-colors',
    buttonPrimary: 'px-4 py-2 rounded bg-aqua-500 text-white hover:bg-aqua-600 transition-colors',
    buttonSecondary: 'px-4 py-2 rounded border border-subtle hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
    expandIcon: 'transition-transform',
    expandIconRotated: 'transition-transform rotate-180',
  },

  // Tables
  tables: {
    table: 'w-full text-caption',
    headerRow: 'border-b border-subtle',
    headerCell: 'text-left py-2 px-2',
    row: 'border-b border-subtle/50',
    cell: 'py-1.5 px-2',
  },

  // Tab navigation
  tabs: {
    container: 'border-b border-subtle mb-6',
    scroller: 'flex overflow-x-auto',
    tab: 'px-4 py-2 border-b-2 transition-colors whitespace-nowrap',
    tabActive: 'border-aqua-500 text-aqua-600 dark:text-aqua-400',
    tabInactive: 'border-transparent text-text-muted hover:text-text-primary',
  },
} as const

// Helper types for TypeScript
export type KnowledgePanelStyleKey = keyof typeof KNOWLEDGE_PANEL_STYLES
export type SpacingKey = keyof typeof KNOWLEDGE_PANEL_STYLES.spacing
export type ColorKey = keyof typeof KNOWLEDGE_PANEL_STYLES.colors
export type TypographyKey = keyof typeof KNOWLEDGE_PANEL_STYLES.typography
export type CardKey = keyof typeof KNOWLEDGE_PANEL_STYLES.cards
