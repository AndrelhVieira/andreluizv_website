import type { ReactElement, ReactNode } from 'react'

/** Entrance animation for pages without their own (CSS only, so it runs before hydration) */
export function FadeIn({ children }: { children: ReactNode }): ReactElement {
  return <div className="motion-safe:animate-fade-in-down">{children}</div>
}
