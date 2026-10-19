import {
  Css,
  Figma,
  Git,
  Github,
  Gitlab,
  Html,
  Java,
  Javascript,
  Jest,
  MaterialUI,
  MySQL,
  Next,
  Php,
  Postgresql,
  ReactIcon,
  ReactNavigation,
  Redux,
  Sass,
  SonarQube,
  Storybook,
  Tailwind,
  Typescript,
  Vercel,
  Yarn,
} from 'public/static/icons'
import type { SVGProps } from 'react'
import type { IconType } from 'react-icons'
import {
  SiAndroid,
  SiDrizzle,
  SiFastify,
  SiFirebase,
  SiGithubactions,
  SiNodedotjs,
  SiPrisma,
  SiPwa,
  SiTestinglibrary,
  SiVitest,
} from 'react-icons/si'

export type TechIcon = (props: SVGProps<SVGSVGElement>) => React.JSX.Element

export interface Tech {
  /** Key in `skills.json` → `tech_descriptions` */
  name: string
  label: string
  svg: TechIcon
}

export interface TechGroup {
  /** Key in `skills.json` → `groups` */
  key: 'frontend' | 'mobile' | 'quality' | 'backend' | 'tools' | 'others'
  techs: Tech[]
}

/** Simple Icons are single-color: brand color, or the text color for black logos (dark mode) */
function brandIcon(Icon: IconType, color?: string): TechIcon {
  return function BrandIcon({ width, className, ...props }) {
    return (
      <Icon
        size={Number(width ?? 75)}
        color={color}
        className={color ? className : `text-gray-900 dark:text-gray-100 ${className ?? ''}`}
        {...props}
      />
    )
  }
}

const TECHS = {
  React: { name: 'React', label: 'React', svg: ReactIcon },
  ReactNative: { name: 'ReactNative', label: 'React Native', svg: ReactIcon },
  Next: { name: 'Next', label: 'Next.js', svg: Next },
  Typescript: { name: 'Typescript', label: 'TypeScript', svg: Typescript },
  Javascript: { name: 'Javascript', label: 'JavaScript', svg: Javascript },
  Html: { name: 'Html', label: 'HTML', svg: Html },
  Css: { name: 'Css', label: 'CSS', svg: Css },
  Tailwind: { name: 'Tailwind', label: 'Tailwind CSS', svg: Tailwind },
  Redux: { name: 'Redux', label: 'Redux', svg: Redux },
  Storybook: { name: 'Storybook', label: 'Storybook', svg: Storybook },
  ReactNavigation: { name: 'ReactNavigation', label: 'React Navigation', svg: ReactNavigation },
  Android: { name: 'Android', label: 'Android (Java)', svg: brandIcon(SiAndroid, '#3DDC84') },
  Pwa: { name: 'Pwa', label: 'PWA', svg: brandIcon(SiPwa, '#5A0FC8') },
  Jest: { name: 'Jest', label: 'Jest', svg: Jest },
  Vitest: { name: 'Vitest', label: 'Vitest', svg: brandIcon(SiVitest, '#6E9F18') },
  TestingLibrary: {
    name: 'TestingLibrary',
    label: 'Testing Library',
    svg: brandIcon(SiTestinglibrary, '#E33332'),
  },
  SonarQube: { name: 'SonarQube', label: 'SonarQube', svg: SonarQube },
  Nodejs: { name: 'Nodejs', label: 'Node.js', svg: brandIcon(SiNodedotjs, '#5FA04E') },
  Fastify: { name: 'Fastify', label: 'Fastify', svg: brandIcon(SiFastify) },
  Postgresql: { name: 'Postgresql', label: 'PostgreSQL', svg: Postgresql },
  Prisma: { name: 'Prisma', label: 'Prisma', svg: brandIcon(SiPrisma) },
  Drizzle: { name: 'Drizzle', label: 'Drizzle', svg: brandIcon(SiDrizzle) },
  Firebase: { name: 'Firebase', label: 'Firebase', svg: brandIcon(SiFirebase, '#DD2C00') },
  Git: { name: 'Git', label: 'Git', svg: Git },
  Github: { name: 'Github', label: 'GitHub', svg: Github },
  GithubActions: {
    name: 'GithubActions',
    label: 'GitHub Actions',
    svg: brandIcon(SiGithubactions, '#2088FF'),
  },
  Vercel: { name: 'Vercel', label: 'Vercel', svg: Vercel },
  Figma: { name: 'Figma', label: 'Figma', svg: Figma },
  Yarn: { name: 'Yarn', label: 'Yarn', svg: Yarn },
  Sass: { name: 'Sass', label: 'Sass', svg: Sass },
  MaterialUI: { name: 'MaterialUI', label: 'Material UI', svg: MaterialUI },
  Java: { name: 'Java', label: 'Java', svg: Java },
  Php: { name: 'Php', label: 'PHP', svg: Php },
  MySQL: { name: 'MySQL', label: 'MySQL', svg: MySQL },
  Gitlab: { name: 'Gitlab', label: 'GitLab', svg: Gitlab },
} satisfies Record<string, Tech>

/** Home page: the stack I want to be hired for, in the same order as the CV */
export const MAIN_TECHNOLOGIES: Tech[] = [
  TECHS.Typescript,
  TECHS.React,
  TECHS.ReactNative,
  TECHS.Next,
  TECHS.Nodejs,
  TECHS.Postgresql,
  TECHS.Tailwind,
  TECHS.Jest,
  TECHS.Git,
  TECHS.Figma,
]

/** Skills page groups, mirroring the CV's Skills section */
export const TECH_GROUPS: TechGroup[] = [
  {
    key: 'frontend',
    techs: [
      TECHS.React,
      TECHS.Next,
      TECHS.Typescript,
      TECHS.Javascript,
      TECHS.Html,
      TECHS.Css,
      TECHS.Tailwind,
      TECHS.Redux,
      TECHS.Storybook,
    ],
  },
  {
    key: 'mobile',
    techs: [TECHS.ReactNative, TECHS.ReactNavigation, TECHS.Android, TECHS.Pwa],
  },
  {
    key: 'quality',
    techs: [TECHS.Jest, TECHS.Vitest, TECHS.TestingLibrary, TECHS.SonarQube],
  },
  {
    key: 'backend',
    techs: [
      TECHS.Nodejs,
      TECHS.Fastify,
      TECHS.Postgresql,
      TECHS.Prisma,
      TECHS.Drizzle,
      TECHS.Firebase,
    ],
  },
  {
    key: 'tools',
    techs: [TECHS.Git, TECHS.Github, TECHS.GithubActions, TECHS.Vercel, TECHS.Figma, TECHS.Yarn],
  },
  {
    key: 'others',
    techs: [TECHS.Sass, TECHS.MaterialUI, TECHS.Java, TECHS.Php, TECHS.MySQL, TECHS.Gitlab],
  },
]
