import siteMetadata from '@/data/siteMetadata'
import React from 'react'
import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Mastodon,
  Reddit,
  Telegram,
  Threads,
  Twitter,
  Whatsapp,
  X,
  Youtube,
} from './icons'

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  x: X,
  mastodon: Mastodon,
  whatsapp: Whatsapp,
  telegram: Telegram,
  threads: Threads,
  instagram: Instagram,
  reddit: Reddit,
}

type SocialIconProps = {
  kind: keyof typeof components
  href?: string | undefined
  size?: number
  showUserPath?: boolean
}

const SocialIcon = ({
  kind,
  href,
  size = 8,
  showUserPath = false,
}: SocialIconProps): React.JSX.Element => {
  const SocialSvg = components[kind]

  return kind === 'mail' && !href && siteMetadata.formspree === true ? (
    <>
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer fill-current text-gray-700 dark:text-gray-200 h-${size} w-${size}`}
      />
    </>
  ) : (
    <a
      className="inline-flex gap-2 text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`hover:text-primary-500 dark:hover:text-primary-400 fill-current text-gray-700 dark:text-gray-200 h-${size} w-${size}`}
      />
      {showUserPath ? (
        <p className="text-base dark:text-gray-300">
          {href?.split('https://')[1].split('/')[href.split('https://')[1].split('/').length - 1]}
        </p>
      ) : null}
    </a>
  )
}

export default SocialIcon
