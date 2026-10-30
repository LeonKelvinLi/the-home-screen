/** BEASTY's page silhouette: three soft corners and a square folded corner. */
export const PAGE_ICON_PATH = 'M24 0H100V76C100 94 94 100 76 100H24C6 100 0 94 0 76V24C0 6 6 0 24 0Z'

/** Both inks keep the fold visible on white artwork and dark artwork alike. */
export const PAGE_FOLD_DARK = 'M78 0V22H100Z'
export const PAGE_FOLD_LIGHT = 'M78 .75H99.25V22Z'
export const PAGE_FOLD_SVG = `<g class='beasty-page-fold' pointer-events='none'><path d='${PAGE_FOLD_DARK}' fill='#151515'/><path d='${PAGE_FOLD_LIGHT}' fill='#fff' stroke='#151515' stroke-width='1.5' stroke-linejoin='round'/></g>`
