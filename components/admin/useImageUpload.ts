'use client'

import { uploadImageAction } from 'app/admin/actions'
import { BODY_IMAGE, prepareImage, type EncodeOptions } from 'lib/admin/image-client'
import { useCallback, useState } from 'react'

export interface ImageUploader {
  /** Converts (unless `encoded`), uploads and returns the public URL */
  upload: (file: Blob, options?: { encode?: EncodeOptions; encoded?: boolean }) => Promise<string>
  uploading: boolean
}

/** `baseName` names the files (the post slug), so the gallery stays readable. */
export function useImageUpload(baseName: string): ImageUploader {
  const [pending, setPending] = useState(0)

  const upload = useCallback<ImageUploader['upload']>(
    async (file, options = {}) => {
      setPending((count) => count + 1)
      try {
        const prepared = options.encoded
          ? file
          : await prepareImage(file, options.encode ?? BODY_IMAGE)
        const form = new FormData()
        form.append('name', baseName || 'imagem')
        form.append('file', prepared)
        const result = await uploadImageAction(form)
        if (!result.ok) throw new Error(result.message)
        return result.url
      } finally {
        setPending((count) => count - 1)
      }
    },
    [baseName]
  )

  return { upload, uploading: pending > 0 }
}
