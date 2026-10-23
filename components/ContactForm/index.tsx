/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import emailjs from 'emailjs-com'
import siteMetadata from '@/data/siteMetadata'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LuCircleCheck, LuLoaderCircle } from 'react-icons/lu'
import * as yup from 'yup'
import { trackEvent } from '../util/analytics'
import { countries } from './countries'

type SendState =
  | { status: 'idle' | 'sending' | 'error' }
  | { status: 'sent'; firstName: string; email: string }

const ContactForm = (): React.ReactElement => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'contact')
  const [state, setState] = useState<SendState>({ status: 'idle' })
  const sending = state.status === 'sending'

  const schema = yup.object().shape({
    firstName: yup.string().required(t('validations.firstName')),
    lastName: yup.string().required(t('validations.lastName')),
    email: yup.string().email(t('validations.invalid_email')).required(t('validations.email')),
    confirmEmail: yup
      .string()
      .oneOf([yup.ref('email')], t('validations.emailMatch'))
      .required(t('validations.confirmEmail')),
    country: yup.string().required(t('validations.country')),
    subject: yup.string().required(t('validations.subject')),
    message: yup.string().required(t('validations.message')),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  interface ContactFormData {
    firstName: string
    lastName: string
    email: string
    confirmEmail: string
    country: string
    subject: string
    message: string
  }

  const sendEmail = async (data: ContactFormData): Promise<void> => {
    const serviceId = process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID!
    const templateId = process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID!
    const userId = process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY!

    if (!serviceId || !templateId || !userId) {
      setState({ status: 'error' })
      return
    }

    const templateParams = {
      to_name: 'André',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      confirmEmail: data.confirmEmail,
      country: data.country,
      subject: data.subject,
      message: data.message,
    }

    setState({ status: 'sending' })
    try {
      await emailjs.send(serviceId, templateId, templateParams, userId)
      trackEvent('generate_lead', {
        form: 'contact_page',
        subject: data.subject,
        country: data.country,
        locale,
      })
      setState({ status: 'sent', firstName: data.firstName, email: data.email })
      reset()
    } catch {
      trackEvent('lead_form_error', { form: 'contact_page', locale })
      setState({ status: 'error' })
    }
  }

  const onSubmit = (data: ContactFormData) => {
    if (!sending) void sendEmail(data)
  }

  const subjectOptions: string[] = t('fields.subject_options', { returnObjects: true }) as string[]

  return (
    <div className="flex flex-col gap-10" id="contact">
      <div className="flex flex-col gap-5">
        <h1 className="text-heading-700 dark:text-heading-400 text-3xl leading-9 font-extrabold tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          {t('title_text_1')}
          <br />
          {t('title_text_2')}
        </h1>
        <h2>{t('subtitle')}</h2>
      </div>
      {state.status === 'sent' ? (
        <div
          role="status"
          className="border-primary-500/40 bg-primary-500/5 flex flex-col items-center gap-3 rounded-md border px-6 py-10 text-center"
        >
          <LuCircleCheck className="text-primary-500 h-12 w-12" aria-hidden="true" />
          <p className="text-2xl font-bold">{t('sent_title', { name: state.firstName })}</p>
          <p className="text-gray-600 dark:text-gray-300">
            {t('sent_text', { email: state.email })}
          </p>
          <button
            type="button"
            onClick={() => setState({ status: 'idle' })}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mt-4 cursor-pointer font-semibold"
          >
            {t('send_another')}
          </button>
        </div>
      ) : (
        <div>
          <form
            className="flex flex-col gap-7"
            onSubmit={handleSubmit(onSubmit)}
            aria-busy={sending}
          >
            <div className="flex w-full flex-col gap-7 xl:flex-row xl:gap-10">
              <div className="flex w-full flex-col font-light">
                <p className="text-xs text-gray-500 dark:text-gray-400">01</p>
                <label htmlFor="firstName" className="font-semibold">
                  {t('fields.firstName')}
                </label>
                <input
                  type="text"
                  className="focus:border-b-heading-400 border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent pl-0 transition placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0"
                  id="firstName"
                  placeholder="John"
                  {...register('firstName')}
                />
                {errors.firstName ? (
                  <span className="text-primary-500">{errors.firstName.message}</span>
                ) : null}
              </div>
              <div className="flex w-full flex-col font-light">
                <p className="text-xs text-gray-500 dark:text-gray-400">02</p>
                <label htmlFor="lastName" className="font-semibold">
                  {t('fields.lastName')}
                </label>
                <input
                  type="text"
                  className="focus:border-b-heading-400 border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent pl-0 transition placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0"
                  id="lastName"
                  placeholder="Doe"
                  {...register('lastName')}
                />
                {errors.lastName ? (
                  <span className="text-primary-500">{errors.lastName.message}</span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col font-light">
              <p className="text-xs text-gray-500 dark:text-gray-400">03</p>
              <label htmlFor="email" className="font-semibold">
                {t('fields.email')}
              </label>
              <input
                type="text"
                className="focus:border-b-heading-400 border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent pl-0 transition placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0"
                id="email"
                placeholder="john.doe@email.com"
                {...register('email')}
              />
              {errors.email ? (
                <span className="text-primary-500">{errors.email.message}</span>
              ) : null}
            </div>
            <div className="flex flex-col font-light">
              <p className="text-xs text-gray-500 dark:text-gray-400">04</p>
              <label htmlFor="confirmEmail" className="font-semibold">
                {t('fields.confirmEmail')}
              </label>
              <input
                type="text"
                className="focus:border-b-heading-400 border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent pl-0 transition placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0"
                id="confirmEmail"
                placeholder="john.doe@email.com"
                {...register('confirmEmail')}
              />
              {errors.confirmEmail ? (
                <span className="text-primary-500">{errors.confirmEmail.message}</span>
              ) : null}
            </div>
            <div className="flex flex-col font-light">
              <p className="text-xs text-gray-500 dark:text-gray-400">05</p>
              <label htmlFor="country" className="font-semibold">
                {t('fields.country')}
              </label>
              <select
                className="focus:border-b-heading-400 border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent pl-0 transition placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0"
                id="country"
                defaultValue=""
                {...register('country')}
              >
                <option value="" disabled>
                  {t('fields.country')}
                </option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.country ? (
                <span className="text-primary-500">{errors.country.message}</span>
              ) : null}
            </div>
            <div className="flex flex-col font-light">
              <p className="text-xs text-gray-500 dark:text-gray-400">06</p>
              <label htmlFor="subject" className="font-semibold">
                {t('fields.subject')}
              </label>
              <select
                className="focus:border-b-heading-400 border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent pl-0 transition placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0"
                id="subject"
                defaultValue=""
                {...register('subject')}
              >
                <option value="" disabled>
                  {t('fields.subject_placeholder')}
                </option>
                {subjectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.subject ? (
                <span className="text-primary-500">{errors.subject.message}</span>
              ) : null}
            </div>
            <div className="flex flex-col font-light">
              <p className="text-xs text-gray-500 dark:text-gray-400">07</p>
              <label htmlFor="message" className="font-semibold">
                {t('fields.message')}
              </label>
              <textarea
                className="focus:border-b-heading-400 border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent pl-0 transition placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0"
                id="message"
                placeholder="Lorem ipsum dolor sit amet..."
                {...register('message')}
              />
              {errors.message ? (
                <span className="text-primary-500">{errors.message.message}</span>
              ) : null}
            </div>
            {state.status === 'error' ? (
              <div
                role="alert"
                className="rounded-md border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400"
              >
                {t('error_on_emailjs')}{' '}
                <a href={`mailto:${siteMetadata.email}`} className="font-semibold underline">
                  {siteMetadata.email}
                </a>
                {' · '}
                <a
                  href={siteMetadata.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  LinkedIn
                </a>
              </div>
            ) : null}
            <div className="mt-2 flex w-full rounded-md shadow-sm sm:mt-0">
              <button
                type="submit"
                disabled={sending}
                className="bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md p-10 px-4 py-2 font-medium text-white transition focus:ring-2 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70 dark:ring-offset-black"
              >
                {sending ? (
                  <LuLoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {sending ? t('fields.sending') : t('fields.send')}
              </button>
            </div>
          </form>
          <div className="pt-5 pb-10">
            <p>{t('note_about_respond')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactForm
