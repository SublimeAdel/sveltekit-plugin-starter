export const PLUGIN_CACHE_TTL_MS = 5 * 60 * 1000

// browse section display order, lower renders first.
// core sections use low numbers; plugins use PLUGIN_SECTIONS (50) and up.
export const BROWSE_SECTION_ORDER = {
  FEATURED: 40,
  PLUGIN_SECTIONS: 50,
} as const
