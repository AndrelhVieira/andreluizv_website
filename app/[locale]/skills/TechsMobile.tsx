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
import type { JSX } from 'react'
import { createTranslation } from '../i18n/server'
import type { LocaleTypes } from '../i18n/settings'

type TechsMobilePropsType = {
  params: { locale: LocaleTypes }
}

const TechsMobile = async ({ params: { locale } }: TechsMobilePropsType): Promise<JSX.Element> => {
  const { t } = await createTranslation(locale, 'skills')

  return (
    <div className="items-start space-y-2 pt-8 xl:hidden">
      <div className="flex flex-col gap-5">
        <div className="mb-10">
          <h3 className="mb-4 text-xl font-bold">{t('main')}</h3>
          <div className="flex flex-shrink-0 flex-wrap items-stretch justify-between gap-10">
            <div className="flex flex-col items-center gap-2">
              <ReactIcon width={75} height={75} />
              <p>React</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Javascript width={75} height={75} />
              <p>Javascript</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Typescript width={75} height={75} />
              <p>Typescript</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Next width={75} height={75} />
              <p>Next</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Css width={75} height={75} />
              <p>Css</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Git width={75} height={75} />
              <p>Git</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Html width={75} height={75} />
              <p>Html</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Java width={75} height={75} />
              <p>Java</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Jest width={75} height={75} />
              <p>Jest</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MySQL width={75} height={75} />
              <p>MySQL</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Php width={75} height={75} />
              <p>Php</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Postgresql width={75} height={75} />
              <p>Postgresql</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Sass width={75} height={75} />
              <p>Sass</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Tailwind width={75} height={75} />
              <p>Tailwind</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Github width={75} height={75} />
              <p>Github</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Gitlab width={75} height={75} />
              <p>Gitlab</p>
            </div>
          </div>
        </div>
        <div className="mb-10">
          <h3 className="mb-4 text-xl font-bold">Design</h3>
          <div className="justify- flex flex-shrink-0 flex-wrap gap-10">
            <div className="flex flex-col items-center gap-2">
              <Canva width={75} height={75} />
              <p>Canva</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Figma width={75} height={75} />
              <p>Figma</p>
            </div>
          </div>
        </div>
        <div className="mb-10">
          <h3 className="mb-4 text-xl font-bold">{t('others')}</h3>
          <div className="flex flex-shrink-0 flex-wrap items-stretch justify-between gap-10">
            <div className="flex flex-col items-center gap-2">
              <OhMyZsh width={75} height={75} />
              <p>OhMyZsh</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Redux width={75} height={75} />
              <p>Redux</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SonarQube width={75} height={75} />
              <p>SonarQube</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Storybook width={75} height={75} />
              <p>Storybook</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Ubuntu width={75} height={75} />
              <p>Ubuntu</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Vercel width={75} height={75} />
              <p>Vercel</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Yarn width={75} height={75} />
              <p>Yarn</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Npm width={75} height={75} />
              <p>Npm</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ReactNavigation width={75} height={75} />
              <p>React Navigation</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Markdown width={75} height={75} />
              <p>Markdown</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MaterialUI width={75} height={75} />
              <p>MaterialUI</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Filezilla width={75} height={75} />
              <p>Filezilla</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechsMobile
