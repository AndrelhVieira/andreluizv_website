import 'server-only'

import { generateImage } from 'ai'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Illustrations for the right half of a post cover, through Vercel AI Gateway (OIDC on
 * Vercel, VERCEL_OIDC_TOKEN from `vercel env pull` locally). The cover's text is drawn by
 * the admin itself (components/admin/cover-canvas.ts), so the model never writes letters:
 * AI-rendered titles came out with typos ("Strattegies").
 */
const MODEL = process.env.ADMIN_IMAGE_MODEL || 'openai/gpt-image-2'

/** Cropped from the "API Layer Architecture" cover: the look every new cover follows */
const REFERENCE_PATH = path.join(process.cwd(), 'lib/admin/assets/cover-style-reference.jpg')

function prompt(subject: string): string {
  return [
    `Square illustration for the right side of a technical blog post cover. Subject: ${subject}.`,
    'Match the art direction of the reference image exactly: floating isometric glassmorphism panels or cards,',
    'thin glowing line icons, soft neon glows in blue (#3b82f6), violet (#8b5cf6) and emerald (#34d399),',
    'small coral (#ea5059) accents, matte depth, dashed connector lines between elements.',
    'Solid very dark navy background (#0b0f1c), smoothly fading to the same color at every edge,',
    'centered composition with generous empty margins.',
    'Absolutely no text, letters, numbers, labels, captions, logos or watermarks anywhere,',
    'even though the reference contains a label: replace any label with an icon.',
  ].join(' ')
}

export type IllustrationResult = { ok: true; images: string[] } | { ok: false; message: string }

export async function generateCoverIllustrations(
  subject: string,
  count: number
): Promise<IllustrationResult> {
  try {
    const reference = await readFile(REFERENCE_PATH)
    const { images } = await generateImage({
      model: MODEL,
      prompt: { text: prompt(subject), images: [reference] },
      n: count,
      size: '1024x1024',
    })
    return {
      ok: true,
      images: images.map((image) => `data:${image.mediaType};base64,${image.base64}`),
    }
  } catch (error) {
    const message = (error as Error).message || String(error)
    console.error(`Cover illustration failed: ${message}`)
    return { ok: false, message }
  }
}
