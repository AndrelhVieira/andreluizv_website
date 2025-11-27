import type { ComponentType, SvgProps } from 'react'

declare module '*.svg' {
  const content: ComponentType<SvgProps>

  export default content
}
