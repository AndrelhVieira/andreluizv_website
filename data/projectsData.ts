export type ProjectOptions = 'Ritmoso' | 'My Free Flashcards' | 'USS Informática'

type Project = {
  title: ProjectOptions
  description: string
  imgSrc?: string
  href?: string
  /** Only for public repositories */
  githubLink?: string
  soon?: boolean
  freela?: boolean
}

type ProjectsData = {
  [locale: string]: Project[]
}

const projectsData: ProjectsData = {
  en: [
    {
      title: 'Ritmoso',
      description: `Habits, tasks and goals in one calm place. Pick a ready-made plan for a goal and its steps become linked tasks that move your progress on their own, next to habit streaks, countdowns to the dates that matter, a calendar and insights. Free, no ads, in English, Portuguese and Spanish. Built with Next.js, TypeScript, Prisma and Postgres.`,
      imgSrc: '/static/projects/ritmoso-en.webp',
      href: 'https://ritmoso.vercel.app',
    },
    {
      title: 'My Free Flashcards',
      description: `Flashcards with spaced repetition: write the front and the back, study only the cards that are due, and "Missed", "Hard" or "Got it" schedules the next review. Custom categories, Google sign-in with real-time sync between phone and web, works offline and installs as an app (PWA). Built with React, TypeScript, Vite and Firebase.`,
      imgSrc: '/static/projects/flashcards.webp',
      href: 'https://myfreeflashcards.vercel.app',
    },
    {
      title: 'USS Informática',
      description: `One of my first projects as freelancer. A professional presentation of computing services.`,
      imgSrc: '/static/projects/uss.png',
      href: 'https://ussinformatica.com.br',
      freela: true,
    },
  ],
  pt: [
    {
      title: 'Ritmoso',
      description:
        'Hábitos, tarefas e metas num lugar só, sem bagunça. Escolha um plano pronto para uma meta e os passos viram tarefas ligadas que fazem o progresso andar sozinho, junto com sequências de hábitos, contagens regressivas para as datas importantes, calendário e insights. Grátis, sem anúncios, em português, inglês e espanhol. Feito com Next.js, TypeScript, Prisma e Postgres.',
      imgSrc: '/static/projects/ritmoso-pt.webp',
      href: 'https://ritmoso.vercel.app',
    },
    {
      title: 'My Free Flashcards',
      description:
        'Flashcards com revisão espaçada: escreva a frente e o verso, estude só os cards vencidos e marque "Errei", "Difícil" ou "Acertei" para agendar a próxima revisão. Categorias personalizadas, login com Google e sincronização em tempo real entre celular e web, funciona offline e pode ser instalado como app (PWA). Feito com React, TypeScript, Vite e Firebase.',
      imgSrc: '/static/projects/flashcards.webp',
      href: 'https://myfreeflashcards.vercel.app',
    },
    {
      title: 'USS Informática',
      description:
        'Um dos meus primeiros projetos como freelancer. Uma apresentação profissional de serviços de informática.',
      imgSrc: '/static/projects/uss.png',
      href: 'https://ussinformatica.com.br',
      freela: true,
    },
  ],
  es: [
    {
      title: 'Ritmoso',
      description:
        'Hábitos, tareas y metas en un solo lugar, sin caos. Elige un plan listo para una meta y sus pasos se convierten en tareas vinculadas que hacen avanzar el progreso solas, junto con rachas de hábitos, cuentas regresivas para las fechas importantes, calendario e insights. Gratis, sin anuncios, en español, inglés y portugués. Hecho con Next.js, TypeScript, Prisma y Postgres.',
      // No Spanish launch image yet; the English one is the closest
      imgSrc: '/static/projects/ritmoso-en.webp',
      href: 'https://ritmoso.vercel.app',
    },
    {
      title: 'My Free Flashcards',
      description:
        'Flashcards con repetición espaciada: escribe el frente y el reverso, estudia solo las tarjetas pendientes y marca "Fallé", "Difícil" o "Acerté" para programar el próximo repaso. Categorías personalizadas, inicio de sesión con Google y sincronización en tiempo real entre móvil y web, funciona sin conexión y se puede instalar como app (PWA). Hecho con React, TypeScript, Vite y Firebase.',
      imgSrc: '/static/projects/flashcards.webp',
      href: 'https://myfreeflashcards.vercel.app',
    },
    {
      title: 'USS Informática',
      description:
        'Uno de mis primeros proyectos como freelancer. Una presentación profesional de servicios informáticos.',
      imgSrc: '/static/projects/uss.png',
      href: 'https://ussinformatica.com.br',
      freela: true,
    },
  ],
}

export default projectsData
