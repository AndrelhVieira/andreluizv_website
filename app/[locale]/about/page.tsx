'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { LocaleTypes } from '../i18n/settings'

const AboutPage: React.FC = () => {
  const router = useRouter()
  const locale = useParams()?.locale as LocaleTypes

  useEffect(() => {
    // Redirect to my personal about page
    router.replace(`/${locale}/about/andrevieira`)
  }, [])

  return null
}

export default AboutPage
