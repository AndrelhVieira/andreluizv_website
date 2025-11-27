import { createTranslation } from 'app/[locale]/i18n/server'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'

type BackgroundContentPropsType = {
  params: { locale: LocaleTypes }
}

type BlurOpacityProps = Array<{
  blur: number
  opacity: number
}>

const blurOpacities: BlurOpacityProps = [
  { blur: 3, opacity: 10 },
  { blur: 3, opacity: 20 },
  { blur: 3, opacity: 30 },
  { blur: 3, opacity: 40 },
  { blur: 3, opacity: 50 },
  { blur: 2, opacity: 60 },
  { blur: 1.5, opacity: 70 },
  { blur: 1, opacity: 80 },
  { blur: 0, opacity: 90 },
]

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const BackgroundContent = async ({ params: { locale } }: BackgroundContentPropsType) => {
  const { t } = await createTranslation(locale, 'home')

  const renderText = (blur: number, opacity: number) => (
    <div
      className={`text-center filter blur-[${blur}px] ${opacity ? `opacity-[${opacity}%] ` : ''} md:text-xl`}
    >
      {t('backgroundContent.I')}{' '}
      <p className="text-primary-500 inline">{t('backgroundContent.solve_problems')}</p>{' '}
      {t('backgroundContent.and_build_solutions_to_help_others_and_make')}{' '}
      <p className="inline text-[#3891A6]">{t('backgroundContent.dreams')}</p>{' '}
      {t('backgroundContent.come_true_with')}{' '}
      <p className="inline text-emerald-500">{t('backgroundContent.technology')}</p>
    </div>
  )

  return (
    <div className="flex justify-center lg:mt-64">
      <section className="flex flex-col">
        {blurOpacities.map(({ blur, opacity }) => (
          <div key={`${blur}-${opacity}`}>{renderText(blur, opacity)}</div>
        ))}
      </section>
    </div>
  )
}

export default BackgroundContent
