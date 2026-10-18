import { adsTxt, adsenseClient } from 'lib/ads'

// Built once per deploy: the publisher id comes from a build-time env var
export const dynamic = 'force-static'

/** https://andreluizv.dev.br/ads.txt, which AdSense checks before serving ads */
export function GET(): Response {
  const client = adsenseClient()
  if (!client) {
    return new Response('Not found\n', { status: 404 })
  }
  return new Response(adsTxt(client), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
