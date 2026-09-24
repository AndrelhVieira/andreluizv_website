import { useForm } from '@formspree/react'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { trackEvent } from '../util/analytics'

export const useContactForm = (
  source: 'contact_modal' | 'command_palette'
): {
  state: ReturnType<typeof useForm>[0]
  handleSubmit: ReturnType<typeof useForm>[1]
  name: string
  email: string
  message: string
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  t: (key: string) => string
} => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const [state, handleSubmit, reset] = useForm('xdojkndq')
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const leadTracked = useRef(false)

  useEffect(() => {
    if (state.succeeded && !state.submitting) {
      if (!leadTracked.current) {
        trackEvent('generate_lead', { form: source, locale })
        leadTracked.current = true
      }
      toast.success(t('thanks'), {
        position: 'bottom-right',
      })
      setTimeout(() => {
        setName('')
        setEmail('')
        setMessage('')
        reset()
        leadTracked.current = false
      }, 2000)
    }

    if (state.errors && Object.keys(state.errors).length > 0) {
      toast.error(t('error'))
      trackEvent('lead_form_error', { form: source, locale })
    }
  }, [state, reset, t, source, locale])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value)
  }

  return {
    state,
    handleSubmit,
    name,
    email,
    message,
    handleNameChange,
    handleEmailChange,
    handleMessageChange,
    t,
  }
}
