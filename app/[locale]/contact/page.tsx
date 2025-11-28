import type { Metadata } from 'next'
import type { LocaleTypes } from '../i18n/settings'
import { genPageMetadata } from '../seo'

import Image from 'next/image'

import { personalData } from '@/data/contactData'
import siteMetadata from '@/data/siteMetadata'
import AvatarImage from 'public/static/images/avatar.png'

import ContactForm from '@/components/ContactForm'
import CustomLink from '@/components/mdxcomponents/Link'
import SocialIcon from '@/components/social-icons'
import { createTranslation } from 'app/[locale]/i18n/server'
import type { JSX } from 'react'
import { FaRegFileLines } from 'react-icons/fa6'
import { IoCallOutline } from 'react-icons/io5'
import { LuMapPin } from 'react-icons/lu'
import { MdOutlineEmail } from 'react-icons/md'

type ContactPagePropsType = {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export async function generateMetadata({ params }: ContactPagePropsType): Promise<Metadata> {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'contact')
  return genPageMetadata({
    title: t('contact'),
    params: { locale },
  })
}

export default async function Page({ params }: ContactPagePropsType): Promise<JSX.Element> {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'contact')

  return (
    <div className="flex flex-col md:flex-row-reverse md:gap-20">
      <ContactForm />
      <div className="flex flex-col items-center">
        <Image
          src={AvatarImage}
          alt="avatar"
          title="avatar"
          width={192}
          height={192}
          className="inset-border border-primary-500 hidden h-48 w-48 rounded-full border-4 md:block"
        />
        <div className="flex flex-col gap-4 pt-5 text-center">
          <div>
            <p className="text-primary-500 text-lg font-bold uppercase">{t('details.contact')}</p>
            <div className="flex items-center justify-center gap-3">
              <MdOutlineEmail /> <p className="leading-10">{siteMetadata.email}</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <IoCallOutline /> <p className="leading-10">{personalData.phoneNumber}</p>
            </div>
          </div>
          <div>
            <p className="text-primary-500 text-lg font-bold uppercase">{t('details.personal')}</p>
            <div className="flex items-center justify-center gap-3">
              🇧🇷 <p className="leading-10">{t('details.nationality')}</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <LuMapPin />
              <p className="leading-10">{t('details.location')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-primary-500 text-lg font-bold uppercase">{t('details.socials')}</p>
            <div className="mt-4 flex space-x-4">
              <div className="flex items-center">
                <SocialIcon kind="github" href={siteMetadata.github} size={6} />
              </div>
              {/* <div className="flex items-center">
              <SocialIcon kind="youtube" href={siteMetadata.youtube} size={6} />
            </div> */}
              <div className="flex items-center">
                <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
              </div>
              <div className="flex items-center">
                <SocialIcon kind="instagram" href={siteMetadata.instagram} size={6} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5 pt-15">
            <CustomLink
              href={`/${locale}/curriculum`}
              className="bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md p-10 px-4 py-2 font-bold text-white transition focus:ring-2 focus:ring-offset-2 dark:ring-offset-black"
            >
              <FaRegFileLines />
              CURRICULUM
            </CustomLink>
          </div>
        </div>
      </div>
    </div>
  )
}
