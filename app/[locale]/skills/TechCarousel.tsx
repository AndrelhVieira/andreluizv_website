/* eslint-disable no-duplicate-imports */
'use client'

import type { SVGProps } from 'react'
import React, { useEffect, useState } from 'react'
import Slider from 'react-slick'

import { motion } from 'framer-motion'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import {
  Canva,
  Css,
  Figma,
  Filezilla,
  Git,
  Github,
  Gitlab,
  Html,
  Java,
  Javascript,
  Jest,
  Markdown,
  MaterialUI,
  MySQL,
  Next,
  Npm,
  OhMyZsh,
  Php,
  Postgresql,
  Python,
  ReactIcon,
  ReactNavigation,
  Redux,
  Sass,
  SonarQube,
  Storybook,
  Tailwind,
  Typescript,
  Ubuntu,
  Vercel,
  Yarn,
} from 'public/static/icons'

const variants = {
  hidden: { opacity: 0, x: -50, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
}

type SVGType = (props: SVGProps<SVGSVGElement>) => React.JSX.Element

type TechType = {
  name: string
  svg: SVGType
}

const FRONTEND_TECHNOLOGIES: TechType[] = [
  { name: 'Css', svg: Css },
  { name: 'Html', svg: Html },
  { name: 'Javascript', svg: Javascript },
  { name: 'Jest', svg: Jest },
  { name: 'MaterialUI', svg: MaterialUI },
  { name: 'Next', svg: Next },
  { name: 'React', svg: ReactIcon },
  { name: 'ReactNavigation', svg: ReactNavigation },
  { name: 'Redux', svg: Redux },
  { name: 'Sass', svg: Sass },
  { name: 'Storybook', svg: Storybook },
  { name: 'Tailwind', svg: Tailwind },
  { name: 'Typescript', svg: Typescript },
]

const BACKEND_TECHNOLOGIES: TechType[] = [
  { name: 'Java', svg: Java },
  { name: 'MySQL', svg: MySQL },
  { name: 'Php', svg: Php },
  { name: 'Postgresql', svg: Postgresql },
  { name: 'Python', svg: Python },
]

const DESIGN_DEVOPS_TECHNOLOGIES: TechType[] = [
  { name: 'Canva', svg: Canva },
  { name: 'Figma', svg: Figma },
  { name: 'Filezilla', svg: Filezilla },
  { name: 'Git', svg: Git },
  { name: 'Github', svg: Github },
  { name: 'Gitlab', svg: Gitlab },
  { name: 'Markdown', svg: Markdown },
  { name: 'Npm', svg: Npm },
  { name: 'OhMyZsh', svg: OhMyZsh },
  { name: 'SonarQube', svg: SonarQube },
  { name: 'Ubuntu', svg: Ubuntu },
  { name: 'Vercel', svg: Vercel },
  { name: 'Yarn', svg: Yarn },
]

const ALL_TECHS = [
  {
    name: 'Frontend',
    techs: FRONTEND_TECHNOLOGIES,
  },
  {
    name: 'Backend',
    techs: BACKEND_TECHNOLOGIES,
  },
  {
    name: 'Design & Devops',
    techs: DESIGN_DEVOPS_TECHNOLOGIES,
  },
]

type TechCarouselPropsType = {
  params: { locale: LocaleTypes }
}

function TechCarousel({ params: { locale } }: TechCarouselPropsType): React.JSX.Element {
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
        slidesToShow={1}
        slidesToScroll={1}
        vertical
        verticalSwiping
        autoplay
        pauseOnHover
        autoplaySpeed={2500}
      >
        {ALL_TECHS.map((area) => (
          <div key={area.name} className="min-h-[400px] py-10">
            <h3 className="mb-4 text-xl font-bold">{area.name}</h3>
            <div>
              <div className="flex flex-col">
                <div className="flex h-full flex-wrap gap-10">
                  {area.techs.map((tech) => (
                    <div key={tech.name} className="border-primary-500 rounded-lg border-4 p-3">
                      <tech.svg
                        width={75}
                        height={75}
                        // eslint-disable-next-line react/jsx-no-bind
                        onMouseOver={() => handleTechDetails(tech)}
                      />
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
