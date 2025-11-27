/* eslint-disable no-duplicate-imports */
'use client'

import Card from '@/components/projectcard'
import type { ProjectOptions } from '@/data/projectsData'
import projectsData from '@/data/projectsData'
import { useParams } from 'next/navigation'
import type { ReactElement } from 'react'
import type { LocaleTypes } from '../i18n/settings'

type ProjectPropsType = {
  projectsToShow?: ProjectOptions[]
}

const Project = ({ projectsToShow }: ProjectPropsType): ReactElement => {
  const locale = useParams()?.locale as LocaleTypes
  const projectArray = projectsToShow
    ? projectsData[locale]?.filter((project) => projectsToShow.includes(project.title))
    : projectsData[locale]
  return (
    <>
      {projectArray.map((project) => (
        <Card
          key={project.title}
          title={project.title}
          description={project.description}
          imgSrc={project.imgSrc}
          href={project.href}
          githubLink={project.githubLink}
          soon={project.soon}
          freela={project.freela}
        />
      ))}
    </>
  )
}

export default Project
