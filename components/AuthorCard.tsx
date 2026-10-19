import Image from '@/components/mdxcomponents/Image'
import Link from '@/components/mdxcomponents/Link'
import type { Authors } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { ReactElement } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa6'

interface AuthorCardProps {
  author: CoreContent<Authors>
  aboutHref: string
  labels: { heading: string; more: string }
}

/** "About the author" box at the end of a post: who wrote it and where to follow them */
export function AuthorCard({ author, aboutHref, labels }: AuthorCardProps): ReactElement {
  return (
    <section
      aria-labelledby="about-author"
      className="not-prose my-10 flex flex-col gap-5 rounded-lg border border-gray-200 bg-gray-50 p-6 sm:flex-row sm:items-start dark:border-gray-700 dark:bg-gray-900"
    >
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.name}
          width={80}
          height={80}
          className="h-20 w-20 shrink-0 rounded-full object-cover"
        />
      ) : null}
      <div className="flex flex-col gap-2">
        <p
          id="about-author"
          className="text-primary-500 text-xs font-semibold tracking-wider uppercase"
        >
          {labels.heading}
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{author.name}</p>
        {author.occupation ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{author.occupation}</p>
        ) : null}
        {author.bio ? <p className="text-gray-700 dark:text-gray-300">{author.bio}</p> : null}
        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link
            href={aboutHref}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            {labels.more} &rarr;
          </Link>
          {author.linkedin ? (
            <Link
              href={author.linkedin}
              aria-label="LinkedIn"
              className="hover:text-primary-500 text-gray-500 dark:text-gray-400"
            >
              <FaLinkedin className="h-5 w-5" />
            </Link>
          ) : null}
          {author.github ? (
            <Link
              href={author.github}
              aria-label="GitHub"
              className="hover:text-primary-500 text-gray-500 dark:text-gray-400"
            >
              <FaGithub className="h-5 w-5" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
