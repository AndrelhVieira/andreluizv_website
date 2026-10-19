/* eslint-disable react/jsx-no-bind */
'use client'

import React, { useState } from 'react'
import Slider from 'react-slick'

import { motion } from 'framer-motion'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { MAIN_TECHNOLOGIES, type Tech } from './technologies'

const variants = {
  hidden: { opacity: 0, x: -50, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
}

type TechCarouselForHomePropsType = {
  params: { locale: LocaleTypes }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function TechCarouselForHome({ params: { locale } }: TechCarouselForHomePropsType) {
  const { t } = useTranslation(locale, 'skills')
  const [selectedTech, setSelectedTech] = useState<Tech>()

  return (
    <div className="hidden w-full py-8 xl:block">
      {!selectedTech ? (
        <p>{t('hover_text')}</p>
      ) : (
        <motion.div
          className="flex items-center gap-10 px-10"
          variants={variants}
          initial="hidden"
          animate="enter"
          transition={{ type: 'decay' }}
        >
          <div>
            <selectedTech.svg width={150} height={150} aria-hidden="true" />
          </div>
          <div>
            <p className="mb-5 font-bold">{selectedTech.label}</p>
            <p className="mb-5">{t(`tech_descriptions.${selectedTech.name}`)}</p>
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
            <div className="flex h-full flex-col items-center gap-2">
              <div className="border-primary-500 rounded-lg border-4 p-3">
                <tech.svg
                  width={75}
                  height={75}
                  aria-hidden="true"
                  onMouseOver={() => setSelectedTech(tech)}
                />
              </div>
              <p className="text-center text-sm">{tech.label}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default TechCarouselForHome
