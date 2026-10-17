/**
 * Newsletter emails in the site's look (navy header, coral accent, Space Grotesk), rendered
 * as HTML fragments to paste into a Buttondown email (Markdown editor mode accepts raw HTML).
 *
 * Email clients ignore <style> blocks and modern CSS, so everything is inline and laid out
 * with tables. Buttondown variables ({{ unsubscribe_url }}) are left for Buttondown to fill.
 */
import type { Locale, PostSummary } from '@andreluizv/shared'

export interface EmailPost {
  post: PostSummary
  url: string
}

export interface RenderedEmail {
  subject: string
  html: string
}

const NAVY = '#0b0f1c'
const CORAL = '#ea5059' // --color-primary-400, the covers' accent
const BUTTON = '#c24a56' // --color-primary-600: white text on it passes WCAG AA
const TEXT = '#1f2937'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'
const FONT = "'Space Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const strings = {
  pt: {
    dateLocale: 'pt-BR',
    newPostLabel: 'NOVO POST',
    roundupLabel: 'RESUMO DO BLOG',
    welcomeLabel: 'BEM-VINDO(A)',
    readPost: 'Ler o post',
    readTime: (minutes: number) => `${minutes} min de leitura`,
    roundupSubject: 'Os últimos posts do blog',
    roundupIntro:
      'Separei aqui o que saiu no blog desde a última vez que a gente se falou. Pega um café e escolhe por onde começar.',
    welcomeSubject: 'Que bom ter você por aqui 👋',
    welcomeTitle: 'Oi! Que bom ter você por aqui.',
    welcomeBody: [
      'Obrigado por assinar a minha newsletter. Eu sou o André, desenvolvedor web, e escrevo sobre React, Next.js, system design, código limpo e experiência de desenvolvimento.',
      'A regra aqui é simples: você só recebe e-mail quando sai post novo. Nada de spam, nada de promoção.',
    ],
    welcomeLatest: 'Para começar, os posts mais recentes:',
    welcomeReply:
      'Se quiser sugerir um tema ou só dizer oi, é só responder este e-mail. Eu leio todos.',
    visitBlog: 'Ver todos os posts',
    signOff: 'Abraço,',
    footer: 'Você recebeu este e-mail porque assinou a newsletter em andreluizv.dev.br.',
    unsubscribe: 'Cancelar inscrição',
  },
  en: {
    dateLocale: 'en-US',
    newPostLabel: 'NEW POST',
    roundupLabel: 'BLOG ROUNDUP',
    welcomeLabel: 'WELCOME',
    readPost: 'Read the post',
    readTime: (minutes: number) => `${minutes} min read`,
    roundupSubject: 'The latest posts from the blog',
    roundupIntro: "Here's what went up on the blog since my last email. Pick one and start there.",
    welcomeSubject: 'Thanks for subscribing 👋',
    welcomeTitle: 'Hey, thanks for subscribing.',
    welcomeBody: [
      "I'm André, a web developer. I write about React, Next.js, system design, clean code and developer experience.",
      'One rule: you only get an email when a new post is out. No spam, no promotions.',
    ],
    welcomeLatest: 'To get started, here are the latest posts:',
    welcomeReply: 'Want to suggest a topic or just say hi? Reply to this email. I read every one.',
    visitBlog: 'See all posts',
    signOff: 'Cheers,',
    footer: "You're getting this email because you subscribed at andreluizv.dev.br.",
    unsubscribe: 'Unsubscribe',
  },
  es: {
    dateLocale: 'es-ES',
    newPostLabel: 'NUEVO POST',
    roundupLabel: 'RESUMEN DEL BLOG',
    welcomeLabel: 'BIENVENIDO(A)',
    readPost: 'Leer el post',
    readTime: (minutes: number) => `${minutes} min de lectura`,
    roundupSubject: 'Los últimos posts del blog',
    roundupIntro:
      'Aquí tienes lo que salió en el blog desde la última vez que hablamos. Sírvete un café y elige por dónde empezar.',
    welcomeSubject: 'Qué bueno tenerte por aquí 👋',
    welcomeTitle: '¡Hola! Qué bueno tenerte por aquí.',
    welcomeBody: [
      'Gracias por suscribirte a mi newsletter. Soy André, desarrollador web, y escribo sobre React, Next.js, system design, código limpio y experiencia de desarrollo.',
      'La regla es simple: solo recibes un correo cuando sale un post nuevo. Nada de spam, nada de promociones.',
    ],
    welcomeLatest: 'Para empezar, los posts más recientes:',
    welcomeReply: 'Si quieres sugerir un tema o solo saludar, responde este correo. Los leo todos.',
    visitBlog: 'Ver todos los posts',
    signOff: 'Un abrazo,',
    footer: 'Recibiste este correo porque te suscribiste a la newsletter en andreluizv.dev.br.',
    unsubscribe: 'Cancelar suscripción',
  },
} satisfies Record<Locale, unknown>

type Strings = (typeof strings)[Locale]

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function absolute(url: string, siteUrl: string): string {
  return url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function formatMeta(post: PostSummary, t: Strings): string {
  const date = new Intl.DateTimeFormat(t.dateLocale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(post.date)
  )
  return `${date} · ${t.readTime(Math.max(1, Math.round(post.readingTime.minutes)))}`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="border-radius:8px;background:${BUTTON};">
<a href="${href}" style="display:inline-block;padding:12px 24px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)} &rarr;</a>
</td></tr></table>`
}

function header(label: string, siteUrl: string): string {
  return `<tr><td style="background:${NAVY};padding:28px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="56" style="vertical-align:middle;">
<a href="${siteUrl}"><img src="${siteUrl}/static/images/logo-email.png" width="48" height="61" alt="André Luiz Vieira" style="display:block;width:48px;height:61px;border:0;"></a>
</td>
<td style="vertical-align:middle;padding-left:12px;font-family:${FONT};">
<div style="font-size:18px;font-weight:700;color:#f5f6f8;">André Luiz Vieira</div>
<div style="font-size:14px;color:#9ca3af;">andreluizv.dev.br</div>
</td>
</tr></table>
<div style="margin-top:24px;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:2px;color:#f5f6f8;"><span style="color:${CORAL};">&#9614;</span>${label}</div>
</td></tr>`
}

function footer(t: Strings, siteUrl: string): string {
  return `<tr><td style="padding:24px 32px;border-top:1px solid ${BORDER};font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">
${escapeHtml(t.footer)}<br>
<a href="${siteUrl}" style="color:${MUTED};">andreluizv.dev.br</a> &middot; <a href="{{ unsubscribe_url }}" style="color:${MUTED};">${escapeHtml(t.unsubscribe)}</a>
</td></tr>`
}

function signature(t: Strings): string {
  return `<p style="margin:24px 0 0;font-family:${FONT};font-size:16px;line-height:1.6;color:${TEXT};">${escapeHtml(t.signOff)}<br><strong>André Luiz Vieira</strong></p>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:${TEXT};">${escapeHtml(text)}</p>`
}

function frame(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
${rows}
</table>
</td></tr></table>`
}

function postCard({ post, url }: EmailPost, t: Strings): string {
  return `<tr><td style="padding:0 0 24px;">
<a href="${url}" style="font-family:${FONT};font-size:19px;font-weight:700;line-height:1.3;color:${TEXT};text-decoration:none;">${escapeHtml(post.title)}</a>
<div style="margin-top:4px;font-family:${FONT};font-size:13px;color:${MUTED};">${formatMeta(post, t)}</div>
${post.summary ? `<p style="margin:8px 0 0;font-family:${FONT};font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(post.summary)}</p>` : ''}
<a href="${url}" style="display:inline-block;margin-top:8px;font-family:${FONT};font-size:15px;font-weight:700;color:${BUTTON};text-decoration:none;">${escapeHtml(t.readPost)} &rarr;</a>
</td></tr>`
}

const blogUrl = (locale: Locale, siteUrl: string): string =>
  `${siteUrl}${locale === 'en' ? '' : `/${locale}`}/blog`

/** One post: cover, title, summary and a big button. `note` is an optional personal line. */
export function renderNewPostEmail(
  { post, url }: EmailPost,
  siteUrl: string,
  note?: string
): RenderedEmail {
  const t = strings[post.locale]
  const [cover] = post.images
  const html = frame(`${header(t.newPostLabel, siteUrl)}
${cover ? `<tr><td><a href="${url}"><img src="${absolute(cover, siteUrl)}" width="600" alt="${escapeHtml(post.title)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>` : ''}
<tr><td style="padding:32px;">
<h1 style="margin:0 0 8px;font-family:${FONT};font-size:26px;line-height:1.25;font-weight:700;color:${TEXT};">${escapeHtml(post.title)}</h1>
<div style="margin:0 0 20px;font-family:${FONT};font-size:14px;color:${MUTED};">${formatMeta(post, t)}</div>
${note ? paragraph(note) : ''}
${post.summary ? paragraph(post.summary) : ''}
<div style="margin-top:8px;">${button(url, t.readPost)}</div>
${signature(t)}
</td></tr>
${footer(t, siteUrl)}`)
  return { subject: post.title, html }
}

/** Several posts in one email, newest first. */
export function renderRoundupEmail(
  locale: Locale,
  posts: EmailPost[],
  siteUrl: string
): RenderedEmail {
  const t = strings[locale]
  const html = frame(`${header(t.roundupLabel, siteUrl)}
<tr><td style="padding:32px 32px 8px;">
${paragraph(t.roundupIntro)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
${posts.map((post) => postCard(post, t)).join('\n')}
</table>
${button(blogUrl(locale, siteUrl), t.visitBlog)}
${signature(t)}
</td></tr>
<tr><td style="height:24px;"></td></tr>
${footer(t, siteUrl)}`)
  return { subject: t.roundupSubject, html }
}

/** Welcome email with the latest posts, for Buttondown's welcome email once it can be edited. */
export function renderWelcomeEmail(
  locale: Locale,
  latest: EmailPost[],
  siteUrl: string
): RenderedEmail {
  const t = strings[locale]
  const html = frame(`${header(t.welcomeLabel, siteUrl)}
<tr><td style="padding:32px 32px 8px;">
<h1 style="margin:0 0 16px;font-family:${FONT};font-size:26px;line-height:1.25;font-weight:700;color:${TEXT};">${escapeHtml(t.welcomeTitle)}</h1>
${t.welcomeBody.map(paragraph).join('\n')}
${
  latest.length
    ? `<p style="margin:24px 0 16px;font-family:${FONT};font-size:16px;font-weight:700;color:${TEXT};">${escapeHtml(t.welcomeLatest)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${latest.map((post) => postCard(post, t)).join('\n')}
</table>`
    : ''
}
${button(blogUrl(locale, siteUrl), t.visitBlog)}
<div style="margin-top:24px;">${paragraph(t.welcomeReply)}</div>
${signature(t)}
</td></tr>
<tr><td style="height:24px;"></td></tr>
${footer(t, siteUrl)}`)
  return { subject: t.welcomeSubject, html }
}

/** Wraps an email in a standalone page, for a local look in the browser. */
export function previewPage({ subject, html }: RenderedEmail): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
</head><body style="margin:0;">${html}</body></html>`
}
