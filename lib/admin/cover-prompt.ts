/**
 * Prompt for the right-hand illustration of a post cover, to paste into any image tool
 * (ChatGPT, Gemini…) together with the style reference. The cover's text is drawn by the
 * admin (lib/admin/cover-canvas.ts), so the illustration must not contain any: AI-written
 * titles came out with typos ("Strattegies").
 */

/** Cropped from the "API Layer Architecture" cover: the look every new cover follows */
export const COVER_STYLE_REFERENCE = '/static/admin/cover-style-reference.jpg'

export function coverIllustrationPrompt(subject: string): string {
  return [
    `Create a square (1:1) illustration for the right side of a technical blog post cover. Subject: ${subject.trim()}.`,
    'Use the attached image as the style reference and match its art direction exactly: floating isometric glassmorphism panels or cards,',
    'thin glowing line icons, soft neon glows in blue (#3b82f6), violet (#8b5cf6) and emerald (#34d399),',
    'small coral (#ea5059) accents, matte depth, dashed connector lines between elements.',
    'Solid very dark navy background (#0b0f1c), smoothly fading to the same color at every edge,',
    'centered composition with generous empty margins.',
    'Absolutely no text, letters, numbers, labels, captions, logos or watermarks anywhere,',
    'even though the reference contains a label: replace any label with an icon.',
  ].join(' ')
}
