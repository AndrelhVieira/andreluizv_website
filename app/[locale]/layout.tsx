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
import type { ReactElement } from 'react'
import { locales, type LocaleTypes } from './i18n/settings'

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

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${space_grotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon-16x16.png" />
      <link rel="manifest" href="/static/favicons/site.webmanifest" />
      <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#000000" />
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
          <SectionContainer>
            <div className="flex h-screen flex-col justify-between font-sans">
              <SearchProvider>
                <Header />
                <main className="mb-auto">{children}</main>
              </SearchProvider>
              <Footer />
            </div>
          </SectionContainer>
        </ThemeProvider>
      </body>
    </html>
  )
}
