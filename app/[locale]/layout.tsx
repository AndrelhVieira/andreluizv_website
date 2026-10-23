import 'css/prism.css'
import 'css/tailwind.css'
import 'pliny/search/algolia.css'

import ConsentAnalytics from '@/components/ConsentAnalytics'
import VercelInsights from '@/components/VercelInsights'
import CookieConsent from '@/components/CookieConsent'
import { adsenseClient } from 'lib/ads'
import FreelancerBanner from '@/components/FreelancerBanner'
import TwSizeIndicator from '@/components/helper/TwSizeIndicator'
import Footer from '@/components/navigation/Footer'
import Header from '@/components/navigation/Header'
import { SearchProvider } from '@/components/search/SearchProvider'
import SectionContainer from '@/components/SectionContainer'
import { ThemeProvider } from '@/components/theme/ThemeContext'
import ThemeScript from '@/components/theme/ThemeScript'
import { maindescription, maintitle } from '@/data/localeMetadata'
import siteMetadata from '@/data/siteMetadata'
import { feedUrl } from 'lib/rss'
import { dir } from 'i18next'
import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactElement } from 'react'
import { isLocale, locales, type LocaleTypes } from './i18n/settings'

// A render that never finishes burns Active CPU until the function times out (300s by
// default). An SSR loop in Oct 2026 used up the Hobby plan's monthly CPU in about a day.
export const maxDuration = 20

export async function generateStaticParams(): Promise<{ locale: LocaleTypes }[]> {
  return locales.map((locale) => ({ locale }))
}

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocaleTypes }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const adsense = adsenseClient()

  return {
    metadataBase: new URL(siteMetadata.siteUrl),
    // AdSense site verification (the meta tag method); absent until AdSense is set up
    ...(adsense ? { other: { 'google-adsense-account': adsense } } : {}),
    title: {
      default: maintitle[locale],
      template: `%s | ${maintitle[locale]}`,
    },
    description: maindescription[locale],
    openGraph: {
      title: maintitle[locale],
      description: maindescription[locale],
      url: './',
      siteName: maintitle[locale],
      images: [siteMetadata.socialBanner],
      locale,
      type: 'website',
    },
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': feedUrl(locale),
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    twitter: {
      title: maintitle[locale],
      description: maindescription[locale],
      site: siteMetadata.siteUrl,
      creator: siteMetadata.author,
      card: 'summary_large_image',
      images: [siteMetadata.socialBanner],
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: LocaleTypes }>
}): Promise<ReactElement> {
  const { locale } = await params
  // Paths with a dot skip the middleware, so /sitemaps.xml or /wp-login.php land here as a
  // "locale" and the render crashes with a 500 — answer 404 instead
  if (!isLocale(locale)) notFound()

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      // The html background matches the body's: with `h-screen` the body ended at the first
      // viewport and macOS painted the rest of the canvas a shade lighter in dark mode (a
      // visible line once a composited layer — giscus, blurred gradients — was on screen).
      // scroll-pt keeps #anchor targets clear of the sticky header
      className={`${space_grotesk.variable} scroll-pt-28 scroll-smooth bg-white dark:bg-gray-950`}
      suppressHydrationWarning
    >
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
      <body className="bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-950 dark:text-white">
        <TwSizeIndicator />
        <ThemeProvider>
          <ThemeScript />
          <ConsentAnalytics />
          <VercelInsights />
          <FreelancerBanner locale={locale} />
          <CookieConsent params={{ locale }} />
          {/* overflow-x-clip trims full-bleed (w-screen) backgrounds without creating a scroll
              container, so the sticky header keeps working */}
          <div className="flex min-h-screen flex-col overflow-x-clip font-sans">
            <SearchProvider>
              <Header />
              <main className="flex-1">
                <SectionContainer>{children}</SectionContainer>
              </main>
            </SearchProvider>
            <SectionContainer>
              <Footer />
            </SectionContainer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
