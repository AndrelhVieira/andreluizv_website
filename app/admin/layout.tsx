import 'css/prism.css'
import 'css/tailwind.css'
import 'katex/dist/katex.css'

import { ThemeProvider } from '@/components/theme/ThemeContext'
import ThemeScript from '@/components/theme/ThemeScript'
import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import type { ReactElement, ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin' },
  robots: { index: false, follow: false, nocache: true },
}

// Every admin page reads the session cookie and live content API data
export const dynamic = 'force-dynamic'

// Caps runaway renders like the public layout does; image uploads need more than 20s
export const maxDuration = 60

/** Root layout for /admin, separate from the public [locale] layout (no header, footer, analytics). */
export default function AdminLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="pt-BR" className={space_grotesk.variable} suppressHydrationWarning>
      <body className="bg-white font-sans text-black antialiased dark:bg-gray-950 dark:text-white">
        <ThemeProvider>
          <ThemeScript />
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
