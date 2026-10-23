import Image from '@/components/mdxcomponents/Image'
import type { ReactElement } from 'react'

/** Post cover in the post lists: always 2:1 like the banner, whatever the source image's shape */
export function PostCoverThumbnail({ src, title }: { src: string; title: string }): ReactElement {
  return (
    <div className="relative aspect-[2/1] w-64 overflow-hidden rounded-lg">
      <Image src={src} alt={`${title} cover`} fill sizes="256px" className="object-cover" />
    </div>
  )
}
