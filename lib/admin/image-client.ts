/**
 * Browser-side image handling for the admin: everything is resized and re-encoded before
 * upload, so the content API's 4 MB limit and the blog's page weight are never an issue.
 */

export interface EncodeOptions {
  maxWidth: number
  maxHeight: number
  /** 0–1 */
  quality?: number
}

export const BODY_IMAGE: EncodeOptions = { maxWidth: 1600, maxHeight: 1600, quality: 0.82 }

export async function loadImage(source: Blob | string): Promise<HTMLImageElement> {
  const url = typeof source === 'string' ? source : URL.createObjectURL(source)
  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = url
    await image.decode()
    return image
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(url)
  }
}

/**
 * WebP when the browser can encode it (Chrome, Firefox, Edge, Safari 17+); JPEG otherwise.
 * GIFs are passed through so animations survive.
 */
export async function canvasToImage(canvas: HTMLCanvasElement, quality = 0.82): Promise<Blob> {
  const encode = (type: string): Promise<Blob | null> =>
    new Promise((resolve) => canvas.toBlob(resolve, type, quality))
  const webp = await encode('image/webp')
  if (webp?.type === 'image/webp') return webp
  const jpeg = await encode('image/jpeg')
  if (!jpeg) throw new Error('O navegador não conseguiu converter a imagem')
  return jpeg
}

export async function prepareImage(file: Blob, options: EncodeOptions = BODY_IMAGE): Promise<Blob> {
  if (file.type === 'image/gif') return file
  const image = await loadImage(file)
  const scale = Math.min(
    1,
    options.maxWidth / image.naturalWidth,
    options.maxHeight / image.naturalHeight
  )
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.naturalWidth * scale)
  canvas.height = Math.round(image.naturalHeight * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas indisponível')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvasToImage(canvas, options.quality)
}

/** First image file in a paste or drop, if any */
export function imageFromTransfer(data: DataTransfer | null): File | null {
  if (!data) return null
  return Array.from(data.files).find((file) => file.type.startsWith('image/')) ?? null
}
