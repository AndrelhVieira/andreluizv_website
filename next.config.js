const { withContentlayer } = require('next-contentlayer2')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// You might need to insert additional domains in script-src if you are using external services.
// The googlesyndication/doubleclick/adtrafficquality/fundingchoices entries are Google AdSense
// (ads, ad frames, fraud checks and the consent message for the EEA, UK and Switzerland).
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app statichunt.com http://www.youtube.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://adservice.google.com https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://www.google.com;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data: statichunt.com;
  media-src 'self' *.s3.amazonaws.com;
  connect-src * statichunt.com;
  font-src 'self';
  frame-src giscus.app https://www.youtube.com/ https://www.youtube-nocookie.com/ https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://www.google.com
`

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    reactStrictMode: true,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    // uglify-js (via rehype-preset-minify, used to compile API posts) reads its own source
    // files at import time, which breaks once webpack bundles it
    serverExternalPackages: ['uglify-js'],
    experimental: {
      // Admin image uploads go through a server action; images are WebP-converted in the
      // browser first, and the content API caps them at 4 MB
      serverActions: { bodySizeLimit: '5mb' },
    },
    // Bumped on every merge to main by .github/workflows/release.yml
    env: {
      NEXT_PUBLIC_APP_VERSION: require('./package.json').version,
    },
    eslint: {
      dirs: ['app', 'components', 'layouts', 'scripts'],
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          pathname: '**',
        },
        {
          // Post images uploaded by the content API (Vercel Blob)
          protocol: 'https',
          hostname: '*.public.blob.vercel-storage.com',
          pathname: '/blog/**',
        },
      ],
    },
    // Post images moved from public/static/blog to Vercel Blob. Old URLs live on in social
    // previews and other sites, so they redirect to the same file in the Blob store.
    async redirects() {
      return [
        // The skills page was folded into the home page's tech cards (Oct 2026)
        { source: '/skills', destination: '/', permanent: true },
        { source: '/:locale(en|pt|es)/skills', destination: '/:locale', permanent: true },
        {
          source: '/static/blog/:file',
          destination: 'https://yto1tt1tdw9ztwz8.public.blob.vercel-storage.com/blog/:file',
          permanent: true,
        },
      ]
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
        // The admin is never framed, cached or indexed
        ...['/admin/:path*', '/api/admin/:path*'].map((source) => ({
          source,
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'Cache-Control', value: 'private, no-store' },
            { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          ],
        })),
      ]
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
  })
}
