import siteMetadata from '@/data/siteMetadata'
import type { ReactElement } from 'react'

/**
 * schema.org Person for the about and CV pages, so search engines and AI screening tools
 * read the same name, title, location and profiles that the page shows.
 */
export function PersonJsonLd({ jobTitle }: { jobTitle?: string }): ReactElement {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'André Luiz Vieira',
    jobTitle,
    url: siteMetadata.siteUrl,
    image: `${siteMetadata.siteUrl}/static/images/avatar.png`,
    email: `mailto:${siteMetadata.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Curitiba', addressCountry: 'BR' },
    worksFor: { '@type': 'Organization', name: 'DB1 Global Software' },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Pontifical Catholic University of Paraná (PUCPR)',
    },
    knowsLanguage: ['pt', 'en', 'es'],
    knowsAbout: [
      'React',
      'React Native',
      'TypeScript',
      'Next.js',
      'Frontend development',
      'Mobile development',
      'Web accessibility',
      'Web performance',
    ],
    sameAs: [siteMetadata.linkedin, siteMetadata.github],
  }

  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(person)}
    </script>
  )
}
