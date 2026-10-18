/**
 * Google AdSense settings. Ads are off unless NEXT_PUBLIC_ADSENSE_CLIENT holds a valid
 * publisher id, so local dev and previews never load them. NEXT_PUBLIC_* values are inlined
 * at build time: changing them needs a redeploy.
 */
const CLIENT_PATTERN = /^ca-pub-\d{10,20}$/

/** "ca-pub-1234…", or null while AdSense isn't set up */
export function adsenseClient(): string | null {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() ?? ''
  return CLIENT_PATTERN.test(client) ? client : null
}

/** Ad unit ids created in the AdSense dashboard (Ads → By ad unit) */
export const adSlots = {
  postEnd: process.env.NEXT_PUBLIC_ADSENSE_SLOT_POST_END?.trim() ?? '',
}

/** The ads.txt line that authorizes Google to sell this site's inventory */
export function adsTxt(client: string): string {
  // f08c47fec0942fa0 is Google's certification authority id, the same for every publisher
  return `google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`
}
