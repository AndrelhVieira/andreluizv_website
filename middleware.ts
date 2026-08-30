import { fallbackLng } from 'app/[locale]/i18n/locales'
import { locales, type LocaleTypes } from 'app/[locale]/i18n/settings'
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest): NextResponse | undefined {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl

  // Check if the default locale is in the pathname
  if (pathname.startsWith(`/${fallbackLng}/`) || pathname === `/${fallbackLng}`) {
    // e.g. incoming request is /en/about
    // The new URL is now /about
    return NextResponse.redirect(
      new URL(
        pathname.replace(`/${fallbackLng}`, pathname === `/${fallbackLng}` ? '/' : ''),
        request.url
      )
    )
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    // No locale in the URL. If the visitor previously chose a non-default
    // language (via the switcher, stored in NEXT_LOCALE), redirect them to it.
    const preferred = request.cookies.get('NEXT_LOCALE')?.value
    if (preferred && preferred !== fallbackLng && locales.includes(preferred as LocaleTypes)) {
      const target = `/${preferred}${pathname === '/' ? '' : pathname}`
      return NextResponse.redirect(new URL(target, request.url))
    }

    // Otherwise we are on the default locale.
    // Rewrite so Next.js understands.

    // e.g. incoming request is /about
    // Tell Next.js it should pretend it's /en/about
    return NextResponse.rewrite(new URL(`/${fallbackLng}${pathname}`, request.url))
  }
}

export const config = {
  // Do not run the middleware on the following paths
  // prettier-ignore
  matcher:
  '/((?!api|static|track|data|css|scripts|.*\\..*|_next).*|sitemap.xml)',
}
