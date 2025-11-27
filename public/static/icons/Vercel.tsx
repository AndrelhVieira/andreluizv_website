'use client'

import { useTheme } from '@/components/theme/ThemeContext'
import * as React from 'react'
import { SVGProps } from 'react'

const Vercel = (props: SVGProps<SVGSVGElement>) => {
  const { theme } = useTheme()
  const color = theme === 'light' ? '#000' : '#fff'

  return (
    <svg viewBox="0 0 128 128" {...props}>
      <path d="M64.002 8.576 128 119.424H0Zm0 0" fill={color} />
    </svg>
  )
}

export default Vercel
