'use client'

import React, { useState } from 'react'
import Slider from 'react-slick'

import { motion } from 'framer-motion'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { TECH_GROUPS, type Tech } from './technologies'

const variants = {
  hidden: { opacity: 0, x: -50, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
}

type TechCarouselPropsType = {
  params: { locale: LocaleTypes }
}

function TechCarousel({ params: { locale } }: TechCarouselPropsType): React.JSX.Element {
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
        slidesToShow={1}
        slidesToScroll={1}
        vertical
        verticalSwiping
        autoplay
        pauseOnHover
        autoplaySpeed={2500}
      >
        {TECH_GROUPS.map((area) => (
          <div key={area.key} className="min-h-[400px] py-10">
            <h3 className="mb-4 text-xl font-bold">{t(`groups.${area.key}`)}</h3>
            <div>
              <div className="flex flex-col">
                <div className="flex h-full flex-wrap gap-10">
                  {area.techs.map((tech) => (
                    <div key={tech.name} className="flex flex-col items-center gap-2">
                      <div className="border-primary-500 rounded-lg border-4 p-3">
                        <tech.svg
                          width={75}
                          height={75}
                          aria-hidden="true"
                          // eslint-disable-next-line react/jsx-no-bind
                          onMouseOver={() => setSelectedTech(tech)}
                        />
                      </div>
                      <p className="text-center text-sm">{tech.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default TechCarousel
