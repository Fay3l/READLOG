import { Platform } from 'react-native';

// ─── Couleurs Warm Dark ───────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg: {
    shell:    '#0A0805', // Obsidian — fond de page
    primary:  '#13100C', // Charcoal — fond principal
    card:     '#1A1610', // Dark Peat — cartes / surfaces
    nav:      '#0F0D09', // Midnight — bottom nav
  },

  // Borders & separators
  border: {
    card:     '#231F18', // Bark
    progress: '#2A2218', // Umber — fond progress bar
    inactive: '#2E2820', // Mocha
    separator:'#1E1812', // Espresso
  },

  // Accent — Golden Amber
  accent: {
    default:  '#D4A96A', // Amber 500 — CTA, accent principal
    dark:     '#B5895A', // Amber 600 — gradient, hover
    ghost:    'rgba(212,169,106,0.12)', // boutons secondaires
    tint:     'rgba(212,169,106,0.20)', // badges, highlights
  },

  // Textes
  text: {
    primary:   '#F0E8DA', // Cream — titres, texte principal
    secondary: '#C4BAB0', // Linen — texte secondaire
    label:     '#9B8F7E', // Sand — labels, métadonnées
    hint:      '#6B6055', // Driftwood — placeholders
    muted:     '#4A4238', // Walnut — texte très discret
  },

  // Statuts
  status: {
    reading:   '#D4A96A', // En cours
    finished:  '#7B9E87', // Terminé
    toRead:    '#8B9BB4', // À lire
    abandoned: '#A08080', // Abandonné
  },
} as const;

// ─── Gradients ────────────────────────────────────────────────────────────────
// (à utiliser avec expo-linear-gradient)

export const Gradients = {
  progressBar: ['#D4A96A', '#B5895A'] as const,        // 90deg
  banner:      ['#2A1F14', '#3D2C1A'] as const,        // 135deg
  premium:     ['#D4A96A', '#B5895A'] as const,        // 135deg
} as const;

// ─── Typographie — Playfair Display ──────────────────────────────────────────

export const Fonts = {
  playfair: {
    regular: 'PlayfairDisplay_400Regular',
    bold:    'PlayfairDisplay_700Bold',
    italic:  'PlayfairDisplay_400Regular_Italic',
  },
  // Fallbacks système par plateforme
  system: Platform.select({
    ios: {
      sans:    'system-ui',
      serif:   'ui-serif',
      rounded: 'ui-rounded',
      mono:    'ui-monospace',
    },
    default: {
      sans:    'normal',
      serif:   'serif',
      rounded: 'normal',
      mono:    'monospace',
    },
    web: {
      sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      serif:   "Georgia, 'Times New Roman', serif",
      rounded: "'SF Pro Rounded', sans-serif",
      mono:    "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
  }),
} as const;

export const FontSizes = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  '2xl': 30,
  '3xl': 36,
} as const;

export const LineHeights = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.75,
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  '2xl': 32,
  '3xl': 48,
} as const;

// ─── Border radius ───────────────────────────────────────────────────────────

export const Radius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

// ─── Thème consolidé ─────────────────────────────────────────────────────────

export const Theme = {
  colors:      Colors,
  gradients:   Gradients,
  fonts:       Fonts,
  fontSizes:   FontSizes,
  lineHeights: LineHeights,
  spacing:     Spacing,
  radius:      Radius,
} as const;

export type AppTheme = typeof Theme;