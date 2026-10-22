/**
 * Draws a post cover in the blog's standard layout (taken from the 2026 covers): dark navy
 * background, a "▎BLOG POST" label and the title on the left — first words in coral, the
 * rest in white — and an illustration on the right. 2:1, like PostBanner's aspect-[2/1].
 */

export const COVER_WIDTH = 1600
export const COVER_HEIGHT = 800

const BACKGROUND = '#0b0f1c'
const CORAL = '#ea5059' // --color-primary-400
const WHITE = '#f5f6f8'
const PADDING_X = 96
const TEXT_MAX_WIDTH = 720
const ILLUSTRATION = { x: 840, y: 20, size: 760 }

export interface CoverOptions {
  title: string
  /** How many leading words are coral */
  highlightWords: number
  label: string
  illustration: CanvasImageSource | null
  /** A loaded font-family, e.g. the admin's Space Grotesk */
  fontFamily: string
}

interface Line {
  words: Array<{ text: string; coral: boolean }>
}

function layoutTitle(
  context: CanvasRenderingContext2D,
  words: string[],
  highlight: number,
  fontSize: number,
  fontFamily: string
): Line[] {
  context.font = `700 ${fontSize}px ${fontFamily}`
  const space = context.measureText(' ').width
  const lines: Line[] = []
  let current: Line = { words: [] }
  let width = 0
  words.forEach((text, index) => {
    const wordWidth = context.measureText(text).width
    const next = current.words.length === 0 ? wordWidth : width + space + wordWidth
    if (current.words.length > 0 && next > TEXT_MAX_WIDTH) {
      lines.push(current)
      current = { words: [] }
      width = wordWidth
    } else {
      width = next
    }
    current.words.push({ text, coral: index < highlight })
  })
  if (current.words.length > 0) lines.push(current)
  return lines
}

/** Biggest font size whose title fits in 5 lines inside the left column */
function fitTitle(
  context: CanvasRenderingContext2D,
  words: string[],
  highlight: number,
  fontFamily: string
): { lines: Line[]; fontSize: number } {
  for (let fontSize = 96; fontSize >= 52; fontSize -= 4) {
    const lines = layoutTitle(context, words, highlight, fontSize, fontFamily)
    const fits = lines.length <= 5 && lines.length * fontSize * 1.08 <= 520
    const noOverflow = lines.every(
      (line) =>
        line.words.length > 1 || context.measureText(line.words[0].text).width <= TEXT_MAX_WIDTH
    )
    if (fits && noOverflow) return { lines, fontSize }
  }
  return { lines: layoutTitle(context, words, highlight, 52, fontFamily), fontSize: 52 }
}

function drawIllustration(context: CanvasRenderingContext2D, image: CanvasImageSource): void {
  const { x, y, size } = ILLUSTRATION
  // Fade the edges into the background so the illustration never shows a seam
  const layer = document.createElement('canvas')
  layer.width = size
  layer.height = size
  const layerContext = layer.getContext('2d')
  if (!layerContext) return
  // AI illustrations come at ~1024–1536px; the default (low) smoothing blurs the downscale
  layerContext.imageSmoothingQuality = 'high'
  layerContext.drawImage(image, 0, 0, size, size)
  const mask = layerContext.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.32,
    size / 2,
    size / 2,
    size * 0.52
  )
  mask.addColorStop(0, 'rgba(0,0,0,1)')
  mask.addColorStop(1, 'rgba(0,0,0,0)')
  layerContext.globalCompositeOperation = 'destination-in'
  layerContext.fillStyle = mask
  layerContext.fillRect(0, 0, size, size)
  context.drawImage(layer, x, y)
}

export function drawCover(canvas: HTMLCanvasElement, options: CoverOptions): void {
  canvas.width = COVER_WIDTH
  canvas.height = COVER_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) return

  context.fillStyle = BACKGROUND
  context.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT)
  const glow = context.createRadialGradient(1220, 400, 0, 1220, 400, 620)
  glow.addColorStop(0, 'rgba(59,130,246,0.10)')
  glow.addColorStop(1, 'rgba(59,130,246,0)')
  context.fillStyle = glow
  context.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT)

  if (options.illustration) drawIllustration(context, options.illustration)

  const words = options.title.trim().split(/\s+/).filter(Boolean)
  const { lines, fontSize } = fitTitle(context, words, options.highlightWords, options.fontFamily)
  const lineHeight = fontSize * 1.08
  const labelSize = 28
  const labelGap = 44
  const blockHeight = labelSize + labelGap + lines.length * lineHeight
  let y = (COVER_HEIGHT - blockHeight) / 2

  context.textBaseline = 'top'
  context.fillStyle = CORAL
  context.fillRect(PADDING_X, y - 2, 5, labelSize + 4)
  context.font = `500 ${labelSize}px ${options.fontFamily}`
  context.letterSpacing = '3px'
  context.fillText(options.label.toUpperCase(), PADDING_X + 30, y)
  context.letterSpacing = '0px'
  y += labelSize + labelGap

  context.font = `700 ${fontSize}px ${options.fontFamily}`
  const space = context.measureText(' ').width
  for (const line of lines) {
    let x = PADDING_X
    for (const word of line.words) {
      context.fillStyle = word.coral ? CORAL : WHITE
      context.fillText(word.text, x, y)
      x += context.measureText(word.text).width + space
    }
    y += lineHeight
  }
}

/** Two words for short titles, roughly the first third for longer ones (like the current covers) */
export function defaultHighlight(title: string): number {
  const count = title.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.min(3, Math.round(count / 3)))
}
