/*
  One line drawing per BEASTY category, for its tile on BEASTY • Pages and its
  row in Search. Glenn, 2026-10-03: "What if we make the Home Screen BEASTY •
  Pages? Then have 24 top categories spots as the BEASTY categories on each
  spot? … Actually, finding icons isn't as hard as I thought."

  Drawn here, on a 24-unit grid, as stroked paths (round caps, no fill), so
  there is no icon set to license. A `dot` is a filled circle: [cx, cy, r].
*/
export interface CategoryGlyph {
  paths: string[]
  dots?: [number, number, number][]
}

const ring = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`

export const CATEGORY_GLYPHS: Record<string, CategoryGlyph> = {
  eats: { paths: ['M6 3v5a2 2 0 0 0 4 0V3', 'M8 3v18', 'M17 3c-2 2-3 5-3 9h3v9'] },
  sweets: { paths: ['M5 12c0-4 3-6 7-6s7 2 7 6Z', 'M6 12l1.5 9h9L18 12', 'M10 12l.5 9', 'M14 12l-.5 9'], dots: [[12, 3.5, 1.4]] },
  ayce: { paths: ['M3 12h18a9 9 0 0 1-18 0Z', 'M14 9l6-7', 'M17 9l5-5'] },
  coffee: { paths: ['M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z', 'M16 10h2a2 2 0 0 1 0 4h-2', 'M8 3v3', 'M12 3v3', 'M3 22h14'] },
  podcast: { paths: ['M10 3h4v9a2 2 0 0 1-4 0Z', 'M7 10a5 5 0 0 0 10 0', 'M12 15v5', 'M9 20h6', 'M4.5 7.5a9 9 0 0 0 0 7', 'M19.5 7.5a9 9 0 0 1 0 7'] },
  bakery: { paths: ['M4 12c0-4 3.6-6 8-6s8 2 8 6v7H4Z', 'M8.5 8.5l1.5 3', 'M12 7.5l1.5 3', 'M15.5 8.5l1.5 3'] },
  foodtrucks: { paths: ['M2 6h12v11H2Z', 'M14 10h4l3 3.5V17h-7', 'M4 9h7'], dots: [[6, 18.5, 2], [17.5, 18.5, 2]] },
  boutiques: { paths: ['M5 8h14l-1 13H6Z', 'M9 8V6a3 3 0 0 1 6 0v2'] },
  services: { paths: ['M15 3a5 5 0 0 0-4.6 6.9L3 17.3 6.7 21l7.4-7.4A5 5 0 0 0 21 9l-3.2 1.1-2.4-2.4L16.5 4.5A5 5 0 0 0 15 3Z'] },
  online: { paths: [ring(12, 12, 9), 'M3 12h18', 'M12 3c3.5 3.5 3.5 14.5 0 18', 'M12 3c-3.5 3.5-3.5 14.5 0 18'] },
  individuals: { paths: [ring(12, 8, 4), 'M4 21c0-4.5 3.6-7 8-7s8 2.5 8 7'] },
  tattoo: { paths: ['M14.5 3.5l6 6-9.5 9.5H5v-6Z', 'M5 19l-2 2', 'M11 7l6 6'] },
  barbershops: { paths: [ring(6, 18, 3), ring(18, 18, 3), 'M8.2 15.8L19 4', 'M15.8 15.8L5 4'] },
  salons: { paths: ['M10 3h4v5h-4Z', 'M7 10h10a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8a1 1 0 0 1 1-1Z', 'M9 15h6'] },
  gyms: { paths: ['M3 10v4', 'M6 6v12', 'M9 8v8', 'M9 12h6', 'M15 8v8', 'M18 6v12', 'M21 10v4'] },
  automotive: { paths: ['M3 16v-4l2.5-5h13L21 12v4Z', 'M6.5 11.5h11'], dots: [[7, 17.5, 2], [17, 17.5, 2]] },
  whips: { paths: [ring(12, 12, 9), ring(12, 12, 2.2), 'M3.4 10.5h6.4', 'M14.2 10.5h6.4', 'M12 14.2V21'] },
  realtors: { paths: ['M3 11l9-8 9 8', 'M5 9.5V21h14V9.5', 'M10 21v-6h4v6'] },
  photographers: { paths: ['M3 8h4l2-3h6l2 3h4v12H3Z', ring(12, 13.5, 4)] },
  djs: { paths: ['M4 15v-3a8 8 0 0 1 16 0v3', 'M4 15h3v6H4Z', 'M17 15h3v6h-3Z'] },
  artists: {
    paths: ['M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-3 1-2 3-2h2a3 3 0 0 0 3-3c0-4.5-4-8-9-8Z'],
    dots: [[7.5, 11, 1.3], [10, 7, 1.3], [15, 7, 1.3]],
  },
  cooks: { paths: ['M7 14a4 4 0 0 1-1-7.9A5 5 0 0 1 12 3a5 5 0 0 1 6 3.1A4 4 0 0 1 17 14', 'M7 14v7h10v-7', 'M7 17.5h10'] },
  foodies: { paths: ['M7 2h10v20H7Z', 'M11 9l4 3-4 3Z'] },
  ai: { paths: ['M6 6h12v12H6Z', 'M9.5 9.5h5v5h-5Z', 'M9 2v4', 'M15 2v4', 'M9 18v4', 'M15 18v4', 'M2 9h4', 'M2 15h4', 'M18 9h4', 'M18 15h4'] },
  athletes: { paths: [ring(12, 12, 9), 'M12 3v18', 'M3 12h18', 'M5.6 5.6c3 3 3 9.8 0 12.8', 'M18.4 5.6c-3 3-3 9.8 0 12.8'] },
  meats: { paths: ['M15 3c4 0 6 3 6 7 0 6-6 11-12 11-4 0-6-2-6-5 0-4 4-5 6-7s2-6 6-6Z', ring(15, 9, 2)] },
  dancers: { paths: ['M9 18V5l12-2v13', ring(6, 18, 3), ring(18, 16, 3)] },
  donations: { paths: ['M10 12C7 9 8 3 12 3s5 6 2 9', 'M9.5 21l5-9', 'M14.5 21l-5-9'] },
  pets: { paths: [ring(5.5, 9.5, 2.5), ring(5.5, 14.5, 2.5), ring(18.5, 9.5, 2.5), ring(18.5, 14.5, 2.5), 'M7.6 10.8h8.8', 'M7.6 13.2h8.8'] },
  pits: { paths: [], dots: [[12, 16, 4], [5.5, 10, 2], [9.5, 6, 2], [14.5, 6, 2], [18.5, 10, 2]] },
  models: { paths: ['M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7Z'] },
  media: { paths: ['M9 3h6v11a3 3 0 0 1-6 0Z', 'M5 11a7 7 0 0 0 14 0', 'M12 18v3', 'M9 21h6'] },
}

/**
 * The 24 tiles on BEASTY • Pages, in order. Every other category is on More pages
 * and in Search. Bakery (Glenn, 2026-10-11) sits with the food pages after Coffee,
 * opening with ten bakeries; Meats, with one business, moved to More pages for it.
 */
export const PAGES_TILES: string[] = [
  'eats', 'sweets', 'ayce', 'coffee', 'bakery', 'foodtrucks',
  'boutiques', 'services', 'online', 'individuals', 'tattoo', 'barbershops',
  'salons', 'gyms', 'automotive', 'whips', 'realtors', 'photographers',
  'djs', 'artists', 'cooks', 'foodies', 'ai', 'athletes',
]
