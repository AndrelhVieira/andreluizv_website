/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-duplicate-imports */
'use client'

import type { SVGProps } from 'react'
import React, { useEffect, useState } from 'react'
import Slider from 'react-slick'

import { motion } from 'framer-motion'

import {
  Figma,
  Git,
  Java,
  Javascript,
  Next,
  Php,
  Python,
  ReactIcon,
  Tailwind,
  Typescript,
} from 'public/static/icons'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'

const variants = {
  hidden: { opacity: 0, x: -50, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
}

type SVGType = (props: SVGProps<SVGSVGElement>) => React.JSX.Element

type TechType = {
  name: string
  svg: SVGType
}

const MAIN_TECHNOLOGIES: TechType[] = [
  { name: 'Javascript', svg: Javascript },
  { name: 'Next', svg: Next },
  { name: 'React', svg: ReactIcon },
  { name: 'Typescript', svg: Typescript },
  { name: 'Tailwind', svg: Tailwind },
  { name: 'Java', svg: Java },
  { name: 'Python', svg: Python },
  { name: 'Php', svg: Php },
  { name: 'Git', svg: Git },
  { name: 'Figma', svg: Figma },
]

type TechCarouselForHomePropsType = {
  params: { locale: LocaleTypes }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function TechCarouselForHome({ params: { locale } }: TechCarouselForHomePropsType) {
  const { t } = useTranslation(locale, 'skills')
  const [selectedTech, setSelectedTech] = useState<string>()
  const [selectedTechLogo, setSelectedTechLogo] = useState<React.JSX.Element>()

  const handleTechDetails = (tech: TechType) => {
    setSelectedTech(tech.name)
    setSelectedTechLogo(<tech.svg width={150} height={150} />)
  }

  useEffect(() => {
    setSelectedTech(t('hover_text'))
  }, [])

  return (
    <div className="hidden w-full py-8 xl:block">
      {selectedTech === t('hover_text') ? (
        <p>{t('hover_text')}</p>
      ) : (
        <motion.div
          className="flex items-center gap-10 px-10"
          variants={variants}
          initial="hidden"
          animate="enter"
          transition={{ type: 'decay' }}
        >
          <div>{selectedTechLogo}</div>
          <div>
            <p className="mb-5 font-bold">{selectedTech}</p>
            <p className="mb-5">{t(`tech_descriptions.${selectedTech}`)}</p>
          </div>
        </motion.div>
      )}
      <Slider
        infinite
        slidesToShow={8}
        slidesToScroll={2}
        verticalSwiping
        autoplay
        pauseOnHover
        autoplaySpeed={2500}
      >
        {MAIN_TECHNOLOGIES.map((tech) => (
          <div className="mt-10 flex flex-col" key={tech.name}>
            <div className="flex h-full flex-wrap gap-10">
              <div className="border-primary-500 rounded-lg border-4 p-3">
                <tech.svg width={75} height={75} onMouseOver={() => handleTechDetails(tech)} />
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default TechCarouselForHome
