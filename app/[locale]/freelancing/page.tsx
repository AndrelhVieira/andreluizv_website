import DetailsSectionWithIcon from '@/components/DetailsSectionWithIcon'
import { FaHandshakeSimple } from 'react-icons/fa6'
import { HiOutlineComputerDesktop } from 'react-icons/hi2'
import { MdOutlineDesignServices } from 'react-icons/md'
import { TbBrandWechat } from 'react-icons/tb'
import { createTranslation } from '../i18n/server'
import type { LocaleTypes } from '../i18n/settings'
import Header from './Header'

import ContactForm from '@/components/ContactForm'
import Project from '../projects/project'
import Faq from './Faq'

import Image from '@/components/mdxcomponents/Image'
import CustomLink from '@/components/mdxcomponents/Link'
import type { Metadata } from 'next'
import { genPageMetadata } from '../seo'
import FreelaImage from '/public/static/freelancing/freela-image.jpg'

type FreelancingPagePropsType = {
  params: { locale: LocaleTypes }
}

export async function generateMetadata({
  params: { locale },
}: FreelancingPagePropsType): Promise<Metadata> {
  return genPageMetadata({
    title: 'Freelancing',
    params: { locale },
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const FreelancingPage = async ({ params: { locale } }: FreelancingPagePropsType) => {
  const { t } = await createTranslation(locale, 'freelancing')

  return (
    <section>
      <Header locale={locale} />
      <div className="flex flex-col gap-20 pt-64 pb-16">
        <div className="text-center" id="services">
          <p className="text-primary-500 font-bold">{t('services_section.section_title')}</p>
          <p className="mt-1 mb-5 text-4xl font-bold">{t('services_section.title')}</p>
          <p className="text-gray-600 dark:text-gray-300">{t('services_section.subtitle')}</p>
        </div>
        <div className="grid-row-2 grid gap-x-8 gap-y-10 md:grid-cols-2">
          <DetailsSectionWithIcon
            icon={<HiOutlineComputerDesktop className="h-6 w-6" aria-hidden="true" />}
            title={t('services_section.services.development.title')}
            text={t('services_section.services.development.text')}
            filled
            horizontal
          />
          <DetailsSectionWithIcon
            icon={<TbBrandWechat className="h-6 w-6" aria-hidden="true" />}
            title={t('services_section.services.consulting.title')}
            text={t('services_section.services.consulting.text')}
            filled
            horizontal
          />
          <DetailsSectionWithIcon
            icon={<MdOutlineDesignServices className="h-6 w-6" aria-hidden="true" />}
            title={t('services_section.services.design.title')}
            text={t('services_section.services.design.text')}
            filled
            horizontal
          />
          <DetailsSectionWithIcon
            icon={<FaHandshakeSimple className="h-6 w-6" aria-hidden="true" />}
            title={t('services_section.services.others.title')}
            text={t('services_section.services.others.text')}
            filled
            horizontal
          />
        </div>
      </div>

      <div className="relative mb-12">
        <Image
          className="h-56 w-full rounded-xl object-cover sm:h-96"
          src={FreelaImage}
          alt="André Luiz Vieira - My values freelancing page"
          width={1080}
          height={1080}
        />
        <div className="absolute inset-0 rounded-xl bg-gray-900 opacity-50" />
      </div>

      <div className="flex flex-col" id="portfolio">
        <h2 className="text-4xl font-bold">{t('portfolio')}</h2>
        <div className="flex flex-col items-center md:flex-row md:items-stretch">
          <Project projectsToShow={['Barberstone', 'USS Informática']} />
        </div>
        <CustomLink
          className={
            'bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 mx-auto mt-4 cursor-pointer rounded-md px-4 py-2 font-medium text-white transition focus:ring-2 focus:ring-offset-2 dark:ring-offset-black'
          }
          href={`/${locale}/projects`}
        >
          {t('more_projects')}
        </CustomLink>
      </div>

      <div className="my-12" id="values">
        <div className="mx-auto flex flex-col px-4 py-16 sm:max-w-xl md:max-w-full md:px-24 lg:max-w-screen-xl lg:flex-row lg:px-8 lg:py-20">
          <div className="mb-5 lg:mr-20 lg:mb-0 lg:w-1/3">
            <h2 className="relative mb-4 font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-none dark:text-white">
              <span className="relative inline-block">
                <svg
                  viewBox="0 0 52 24"
                  fill="currentColor"
                  className="text-blue-gray-100 absolute top-0 left-0 z-0 -mt-8 -ml-20 hidden w-32 sm:block lg:-mt-10 lg:-ml-28 lg:w-32"
                >
                  <defs>
                    <pattern
                      id="6bfa0e57-faa2-4bb2-ac0e-310782e5eb2d"
                      x="0"
                      y="0"
                      width=".135"
                      height=".30"
                    >
                      <circle cx="1" cy="1" r=".7" />
                    </pattern>
                  </defs>
                  <rect fill="url(#6bfa0e57-faa2-4bb2-ac0e-310782e5eb2d)" width="52" height="24" />
                </svg>
                <span className="relative">{t('values_section.title.my')}</span>
              </span>{' '}
              {t('values_section.title.values')}
            </h2>
            <p className="mb-4 text-gray-900 lg:mb-6 dark:text-white">
              {t('values_section.subtitle')}
            </p>
          </div>
          <div className="flex-grow pt-1">
            <div className="mb-3 flex items-center">
              <span className="font-bold tracking-wide text-gray-900 dark:text-white">
                {t('values_section.values_text')}
              </span>
              <span className="ml-1">
                <svg
                  className="text-deep-purple-accent-400 mt-px h-5 w-5"
                  stroke="currentColor"
                  viewBox="0 0 52 52"
                >
                  <polygon
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    points="29 13 14 29 25 29 23 39 38 23 27 23"
                  />
                </svg>
              </span>
            </div>
            <div className="row-gap-6 text-primary-500 grid grid-cols-1 xl:grid-cols-3">
              <ul className="space-y-4">
                <li>{t('values_section.values.value1')}</li>
                <li>{t('values_section.values.value2')}</li>
                <li>{t('values_section.values.value3')}</li>
                <li>{t('values_section.values.value4')}</li>
              </ul>
              <ul className="space-y-4">
                <li>{t('values_section.values.value5')}</li>
                <li>{t('values_section.values.value6')}</li>
                <li>{t('values_section.values.value7')}</li>
                <li>{t('values_section.values.value8')}</li>
              </ul>
              <ul className="space-y-4">
                <li>{t('values_section.values.value9')}</li>
                <li>{t('values_section.values.value10')}</li>
                <li>{t('values_section.values.value11')}</li>
                <li>{t('values_section.values.value12')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <ContactForm />
      <Faq locale={locale} />
    </section>
  )
}

export default FreelancingPage
