import type { JSX } from 'react'
import { createTranslation } from '../i18n/server'
import type { LocaleTypes } from '../i18n/settings'
import { TECH_GROUPS } from './technologies'

type TechsMobilePropsType = {
  params: { locale: LocaleTypes }
}

const TechsMobile = async ({ params: { locale } }: TechsMobilePropsType): Promise<JSX.Element> => {
  const { t } = await createTranslation(locale, 'skills')

  return (
    <div className="items-start space-y-2 pt-8 xl:hidden">
      <div className="flex flex-col gap-5">
        {TECH_GROUPS.map((group) => (
          <div key={group.key} className="mb-10">
            <h3 className="mb-4 text-xl font-bold">{t(`groups.${group.key}`)}</h3>
            <div className="flex flex-shrink-0 flex-wrap items-stretch gap-10">
              {group.techs.map((tech) => (
                <div key={tech.name} className="flex flex-col items-center gap-2">
                  <tech.svg width={75} height={75} aria-hidden="true" />
                  <p>{tech.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TechsMobile
