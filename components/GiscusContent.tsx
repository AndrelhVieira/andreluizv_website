'use client'

import { Giscus } from 'pliny/comments'
import type { JSX } from 'react'
import { useTheme } from './theme/ThemeContext'

export default function GiscusContent(): JSX.Element {
  const { theme } = useTheme()

  return (
    <>
      <span id="comment" />
      <Giscus
        category="Announcements"
        categoryId="DIC_kwDOMLpOXs4CgNSV"
        mapping="pathname"
        metadata="0"
        reactions="1"
        repo="AndrelhVieira/blog_discuss_base"
        repositoryId="R_kgDOMLpOXg"
        themeURL={theme}
      />
    </>
  )
}
