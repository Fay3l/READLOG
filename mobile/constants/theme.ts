import { Platform, useColorScheme } from 'react-native';

// ─── Palette Dark — Warm Dark (thème original) ───────────────────────────────

const DarkColors = {
  bg: {
    shell:     '#0A0805', // Obsidian — fond de page
    primary:   '#13100C', // Charcoal — fond principal
    card:      '#1A1610', // Dark Peat — cartes / surfaces
    nav:       '#0F0D09', // Midnight — bottom nav
    banner:    '#2A1F14', // fond banner "en cours"
    input:     '#1E1A14', // fond champs de saisie
  },
  border: {
    card:      '#231F18', // Bark
    progress:  '#2A2218', // Umber — fond progress bar
    inactive:  '#2E2820', // Mocha
    separator: '#1E1812', // Espresso
    focus:     '#D4A96A', // Amber — bordure focus
  },
  accent: {
    default:   '#D4A96A', // Amber 500 — CTA, accent principal
    dark:      '#B5895A', // Amber 600 — gradient, hover
    ghost:     'rgba(212,169,106,0.12)', // boutons secondaires
    tint:      'rgba(212,169,106,0.20)', // badges, highlights
  },
  text: {
    primary:   '#F0E8DA', // Cream — titres, texte principal
    secondary: '#C4BAB0', // Linen — texte secondaire
    label:     '#9B8F7E', // Sand — labels, métadonnées
    hint:      '#6B6055', // Driftwood — placeholders
    muted:     '#4A4238', // Walnut — texte très discret
    onAccent:  '#13100C', // texte sur bouton accent
  },
  status: {
    reading:        '#D4A96A',
    readingBg:      'rgba(212,169,106,0.15)',
    finished:       '#7B9E87',
    finishedBg:     'rgba(123,158,135,0.15)',
    toRead:         '#8B9BB4',
    toReadBg:       'rgba(139,155,180,0.15)',
    abandoned:      '#A08080',
    abandonedBg:    'rgba(160,128,128,0.15)',
  },
  shadow: {
    color:     '#000000',
    opacity:   0.5,
  },
} as const;

// ─── Palette Light — Warm Light ───────────────────────────────────────────────

const LightColors = {
  bg: {
    shell:     '#FFF8F0', // Parchment — fond de page
    primary:   '#FFFFFF', // White — fond principal
    card:      '#FAF3EA', // Ivory — cartes / surfaces
    nav:       '#F2E8D8', // Linen — bottom nav
    banner:    '#FBF0E2', // fond banner "en cours"
    input:     '#F5EDE0', // fond champs de saisie
  },
  border: {
    card:      '#EDE0D0', // Wheat
    progress:  '#F5ECE0', // Sand — fond progress bar
    inactive:  '#E0CEBA', // Biscuit
    separator: '#E8DDD0', // Séparateurs
    focus:     '#B07D3A', // Amber foncé — bordure focus
  },
  accent: {
    default:   '#B07D3A', // Amber 600 — plus foncé pour contraste WCAG AA
    dark:      '#8F6028', // Amber 700 — gradient, hover
    ghost:     'rgba(176,125,58,0.10)', // boutons secondaires
    tint:      'rgba(176,125,58,0.15)', // badges, highlights
  },
  text: {
    primary:   '#2C1F0E', // Espresso — titres, texte principal
    secondary: '#5C4A30', // Tobacco — texte secondaire
    label:     '#8C7458', // Caramel — labels, métadonnées
    hint:      '#B8A48C', // Taupe — placeholders
    muted:     '#D4C4B0', // Dune — texte très discret
    onAccent:  '#FFFFFF', // texte sur bouton accent
  },
  status: {
    reading:        '#B07D3A',
    readingBg:      'rgba(176,125,58,0.12)',
    finished:       '#4A8C6A',
    finishedBg:     'rgba(74,140,106,0.12)',
    toRead:         '#5470A0',
    toReadBg:       'rgba(84,112,160,0.12)',
    abandoned:      '#A06060',
    abandonedBg:    'rgba(160,96,96,0.12)',
  },
  shadow: {
    color:     '#2C1F0E',
    opacity:   0.08,
  },
} as const;

// ─── Gradients ────────────────────────────────────────────────────────────────

export const Gradients = {
  dark: {
    progressBar: ['#D4A96A', '#B5895A'] as const,   // 90deg
    banner:      ['#2A1F14', '#3D2C1A'] as const,   // 135deg
    premium:     ['#D4A96A', '#B5895A'] as const,   // 135deg
    avatar:      ['#D4A96A', '#B5895A'] as const,   // 135deg
  },
  light: {
    progressBar: ['#B07D3A', '#C8923F'] as const,   // 90deg
    banner:      ['#FBF0E2', '#F2E0C8'] as const,   // 135deg
    premium:     ['#C8923F', '#B07D3A'] as const,   // 135deg
    avatar:      ['#C8923F', '#B07D3A'] as const,   // 135deg
  },
} as const;

// ─── Typographie ──────────────────────────────────────────────────────────────

export const Fonts = {
  playfair: {
    regular: 'PlayfairDisplay_400Regular',
    bold:    'PlayfairDisplay_700Bold',
    italic:  'PlayfairDisplay_400Regular_Italic',
  },
  dmSans: {
    light:   'DMSans_300Light',
    regular: 'DMSans_400Regular',
    medium:  'DMSans_500Medium',
  },
  system: Platform.select({
    ios: {
      sans:    'system-ui',
      serif:   'ui-serif',
      mono:    'ui-monospace',
    },
    default: {
      sans:    'normal',
      serif:   'serif',
      mono:    'monospace',
    },
    web: {
      sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      serif:   "Georgia, 'Times New Roman', serif",
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

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
  xs:    4,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    24,
  '2xl': 32,
  '3xl': 48,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const Radius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

// ─── Shadows (cross-platform) ─────────────────────────────────────────────────

export const Shadows = {
  dark: {
    sm: {
      shadowColor:   '#000000',
      shadowOffset:  { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius:  4,
      elevation:     2,
    },
    md: {
      shadowColor:   '#000000',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius:  12,
      elevation:     6,
    },
    lg: {
      shadowColor:   '#000000',
      shadowOffset:  { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius:  24,
      elevation:     12,
    },
  },
  light: {
    sm: {
      shadowColor:   '#2C1F0E',
      shadowOffset:  { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius:  4,
      elevation:     1,
    },
    md: {
      shadowColor:   '#2C1F0E',
      shadowOffset:  { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius:  8,
      elevation:     3,
    },
    lg: {
      shadowColor:   '#2C1F0E',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius:  16,
      elevation:     8,
    },
  },
} as const;

// ─── Thèmes complets ──────────────────────────────────────────────────────────

export const DarkTheme = {
  colors:      DarkColors,
  gradients:   Gradients.dark,
  shadows:     Shadows.dark,
  fonts:       Fonts,
  fontSizes:   FontSizes,
  lineHeights: LineHeights,
  spacing:     Spacing,
  radius:      Radius,
  isDark:      true,
} as const;

export const LightTheme = {
  colors:      LightColors,
  gradients:   Gradients.light,
  shadows:     Shadows.light,
  fonts:       Fonts,
  fontSizes:   FontSizes,
  lineHeights: LineHeights,
  spacing:     Spacing,
  radius:      Radius,
  isDark:      false,
} as const;

export type AppTheme = typeof DarkTheme | typeof LightTheme;


