'use client'

import type { EditorView } from '@uiw/react-codemirror'
import { useEffect, type RefObject } from 'react'

interface Anchor {
  editor: number
  preview: number
}

const FENCE = /^\s*(```|~~~)/
const HEADING = /^#{1,6}\s/
const UNLOCK_DELAY_MS = 120

/** Line numbers (1-based) of the markdown headings, skipping fenced code blocks */
function headingLines(body: string): number[] {
  const lines: number[] = []
  let inFence = false
  body.split('\n').forEach((text, index) => {
    if (FENCE.test(text)) inFence = !inFence
    else if (!inFence && HEADING.test(text)) lines.push(index + 1)
  })
  return lines
}

/** Position of `element` inside the scroll container, in the container's scrollTop units */
function offsetIn(container: HTMLElement, element: Element): number {
  return (
    element.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop
  )
}

/**
 * Pairs of matching scroll positions: the top of both panes, where the post body starts
 * (the editor sits below the settings, the preview below the banner), each heading, and the
 * bottom of both panes. Pairs that would go backwards are dropped.
 */
function buildAnchors(
  editorPane: HTMLElement,
  previewPane: HTMLElement,
  view: EditorView
): Anchor[] {
  const prose = previewPane.querySelector('.prose')
  const editorMax = editorPane.scrollHeight - editorPane.clientHeight
  const previewMax = previewPane.scrollHeight - previewPane.clientHeight
  if (!prose || editorMax <= 0 || previewMax <= 0) return []

  const documentTop =
    view.documentTop - editorPane.getBoundingClientRect().top + editorPane.scrollTop
  const candidates: Anchor[] = [{ editor: documentTop, preview: offsetIn(previewPane, prose) }]

  const previewHeadings = prose.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headingLines(view.state.doc.toString()).forEach((lineNumber, index) => {
    const heading = previewHeadings[index]
    if (!heading || lineNumber > view.state.doc.lines) return
    const block = view.lineBlockAt(view.state.doc.line(lineNumber).from)
    candidates.push({ editor: documentTop + block.top, preview: offsetIn(previewPane, heading) })
  })

  const anchors: Anchor[] = [{ editor: 0, preview: 0 }]
  for (const anchor of candidates) {
    const last = anchors[anchors.length - 1]
    if (
      anchor.editor > last.editor &&
      anchor.preview > last.preview &&
      anchor.editor < editorMax &&
      anchor.preview < previewMax
    ) {
      anchors.push(anchor)
    }
  }
  anchors.push({ editor: editorMax, preview: previewMax })
  return anchors
}

function interpolate(
  anchors: Anchor[],
  from: keyof Anchor,
  to: keyof Anchor,
  value: number
): number {
  for (let i = 1; i < anchors.length; i++) {
    const start = anchors[i - 1]
    const end = anchors[i]
    if (value <= end[from]) {
      const span = end[from] - start[from]
      const progress = span > 0 ? (value - start[from]) / span : 0
      return start[to] + progress * (end[to] - start[to])
    }
  }
  return anchors[anchors.length - 1]?.[to] ?? 0
}

/**
 * Keeps the editor and preview panes scrolled to the same part of the post, in both
 * directions, matching them heading by heading. Only does anything when both panes are
 * their own scroll containers (the side-by-side desktop layout).
 */
export function useScrollSync(
  editorPane: RefObject<HTMLElement | null>,
  previewPane: RefObject<HTMLElement | null>,
  editorView: RefObject<EditorView | null>
): void {
  useEffect(() => {
    const left = editorPane.current
    const right = previewPane.current
    if (!left || !right) return

    // The pane the user is scrolling; the other one's scroll events are our own echo
    let driver: 'editor' | 'preview' | null = null
    let unlockTimer: ReturnType<typeof setTimeout> | undefined
    let frame = 0

    const follow = (source: 'editor' | 'preview'): void => {
      if (driver && driver !== source) return
      driver = source
      clearTimeout(unlockTimer)
      unlockTimer = setTimeout(() => {
        driver = null
      }, UNLOCK_DELAY_MS)

      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const view = editorView.current
        if (!view) return
        const anchors = buildAnchors(left, right, view)
        if (anchors.length < 2) return
        if (source === 'editor') {
          right.scrollTop = interpolate(anchors, 'editor', 'preview', left.scrollTop)
        } else {
          left.scrollTop = interpolate(anchors, 'preview', 'editor', right.scrollTop)
        }
      })
    }

    const onEditorScroll = (): void => follow('editor')
    const onPreviewScroll = (): void => follow('preview')
    left.addEventListener('scroll', onEditorScroll, { passive: true })
    right.addEventListener('scroll', onPreviewScroll, { passive: true })
    return () => {
      left.removeEventListener('scroll', onEditorScroll)
      right.removeEventListener('scroll', onPreviewScroll)
      clearTimeout(unlockTimer)
      cancelAnimationFrame(frame)
    }
  }, [editorPane, previewPane, editorView])
}
