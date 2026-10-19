/* eslint-disable react/jsx-no-bind */
'use client'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Jest, Next, Postgresql, ReactIcon, Tailwind, Typescript } from 'public/static/icons'
import { useState, type ReactElement, type SVGProps } from 'react'
import { SiNodedotjs } from 'react-icons/si'

type TechIcon = (props: SVGProps<SVGSVGElement>) => ReactElement

interface Tech {
  /** Key in `home.json` → `tech_stack.items` */
  key: string
  label: string
  svg: TechIcon
}

function NodeIcon({ width }: SVGProps<SVGSVGElement>): ReactElement {
  return <SiNodedotjs size={Number(width ?? 64)} color="#5FA04E" aria-hidden="true" />
}

/** The stack I want to be hired for, in the same order as the CV */
const TECHS: Tech[] = [
  { key: 'typescript', label: 'TypeScript', svg: Typescript },
  { key: 'react', label: 'React', svg: ReactIcon },
  { key: 'reactNative', label: 'React Native', svg: ReactIcon },
  { key: 'next', label: 'Next.js', svg: Next },
  { key: 'node', label: 'Node.js', svg: NodeIcon },
  { key: 'postgresql', label: 'PostgreSQL', svg: Postgresql },
  { key: 'tailwind', label: 'Tailwind CSS', svg: Tailwind },
  { key: 'testing', label: 'Jest', svg: Jest },
]

const detailsMotion = {
  hidden: { opacity: 0, x: -30 },
  enter: { opacity: 1, x: 0 },
}

/** Landing page tech cards: hover, focus or tap a card to read how I use that technology */
export function TechStack(): ReactElement {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'home')
  const [selected, setSelected] = useState<Tech>()

  return (
    <div className="flex flex-col gap-6">
      <div className="min-h-24" aria-live="polite">
        {selected ? (
          <motion.div
            key={selected.key}
            className="flex items-center gap-6"
            variants={detailsMotion}
            initial="hidden"
            animate="enter"
          >
            <div className="shrink-0">
              <selected.svg width={72} height={72} aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold">{selected.label}</p>
              <p className="text-gray-600 dark:text-gray-300">
                {t(`tech_stack.items.${selected.key}`)}
              </p>
            </div>
          </motion.div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">{t('tech_stack.hint')}</p>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TECHS.map((tech) => (
          <li key={tech.key}>
            <button
              type="button"
              aria-pressed={selected?.key === tech.key}
              onMouseEnter={() => setSelected(tech)}
              onFocus={() => setSelected(tech)}
              onClick={() => setSelected(tech)}
              className="border-primary-500 aria-pressed:bg-primary-500/10 hover:bg-primary-500/5 focus-visible:ring-primary-500 flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg border-4 p-4 transition focus:outline-none focus-visible:ring-2"
            >
              <tech.svg width={64} height={64} aria-hidden="true" />
              <span className="text-sm font-medium">{tech.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
