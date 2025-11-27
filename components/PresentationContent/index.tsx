import Image from 'next/image'
import { FaReact } from 'react-icons/fa'

import { createTranslation } from 'app/[locale]/i18n/server'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import logo from 'public/static/images/logo.png'
import BackgroundContent from './BackgroundContent'
import TechTitle from './TechTitle'

type PresentationContentPropsType = {
  params: { locale: LocaleTypes }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const PresentationContent = async ({ params: { locale } }: PresentationContentPropsType) => {
  const { t } = await createTranslation(locale, 'home')

  return (
    <section className="flex flex-col items-center">
      <BackgroundContent params={{ locale }} />
      <div className="absolute flex w-full flex-col items-center justify-between gap-10 px-1 sm:top-72 sm:flex-row xl:max-w-screen-xl">
        <div className="mx-auto flex flex-col items-center self-baseline sm:mx-0 sm:items-baseline sm:self-auto">
          <div className="text-[40px] lg:text-[100px]">
            <FaReact color="#61DAFB" className="animate-spin360" />
          </div>
          <div className="flex flex-col-reverse items-center gap-5 sm:flex-row">
            <TechTitle />
          </div>
          <p className="text-xl md:text-2xl">{t('greeting')} André Luiz Vieira</p>
          <p className="font-jost text-4xl leading-snug font-extrabold uppercase sm:text-5xl md:text-7xl lg:text-9xl">
            Developer
          </p>
        </div>
        <div>
          <Image
            src={logo}
            alt="André Luiz profile image"
            width={300}
            className="w-[200px] md:w-[250px] xl:w-[300px]"
          />
        </div>
      </div>
    </section>
  )
}

export default PresentationContent
