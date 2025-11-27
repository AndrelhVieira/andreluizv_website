export type ProjectOptions =
  | 'User Finder'
  | 'User Finder - iOS'
  | 'User Finder - Android'
  | 'Barberstone'
  | 'Translathor'
  | 'USS Informática'
  | 'Spotify Template'

type Project = {
  title: ProjectOptions
  description: string
  imgSrc: string
  href?: string
  githubLink: string
  soon?: boolean
  freela?: boolean
}

type ProjectsData = {
  [locale: string]: Project[]
}

const projectsData: ProjectsData = {
  en: [
    {
      title: 'User Finder',
      description: `The main purpose of this application is to streamline access to the account of friends, employees or even yours, easily providing the path to the main Github projects for that user. You can also see what your latest searches were through your search history. This application was created especially for Android.`,
      imgSrc: '/static/projects/user-finder.png',
      href: 'https://user-finder.vercel.app',
      githubLink: 'https://github.com/AndrelhVieira/User-Finder',
    },
    {
      title: 'User Finder - iOS',
      description: `The same idea of User Finder, but developed for native iOS using Swift.`,
      imgSrc: '/static/projects/user-finder.png',
      githubLink: 'https://github.com/AndrelhVieira/User-Finder-iOS',
    },
    {
      title: 'User Finder - Android',
      description: `The same idea of User Finder, but developed for native Android using Java.`,
      imgSrc: '/static/projects/user-finder.png',
      githubLink: 'https://github.com/AndrelhVieira/User-Finder-Android',
    },
    {
      title: 'Spotify Template',
      description: `The purpose of that project was to learn how to use Tailwind CSS combined with Next JS, one of the most powerful React Frameworks.`,
      imgSrc: '/static/projects/spotify-template.png',
      githubLink: 'https://github.com/AndrelhVieira/next-tailwind-spotify',
    },
    {
      title: 'Barberstone',
      description: `After research into the services provided by barbershops, this project was developed thinking about how we could improve barbershop services, both for customers, barbers and business owners.`,
      imgSrc: '/static/projects/barberstone.png',
      githubLink: 'https://github.com/AndrelhVieira/Barberstone',
      href: 'https://cap-stone-squad-2.vercel.app',
    },
    {
      title: 'Translathor',
      description: `A translator mobile app using React Native with Thor inspired theme. Pretty cool, isn't?`,
      imgSrc: '/static/projects/translathor.png',
      githubLink: 'https://github.com/AndrelhVieira/TranslaThor',
      soon: true,
    },
    {
      title: 'USS Informática',
      description: `One of my first projects as freelancer. A professional presentation of computing services.`,
      imgSrc: '/static/projects/uss.png',
      href: 'https://ussinformatica.com.br',
      githubLink: 'https://github.com/AndrelhVieira/USS_Informatica',
      freela: true,
    },
  ],
  pt: [
    {
      title: 'User Finder',
      description:
        'O principal objetivo deste aplicativo é facilitar o acesso à conta de amigos, funcionários ou até mesmo a sua, fornecendo facilmente o caminho para os principais projetos do Github desse usuário. Você também pode ver quais foram suas últimas pesquisas através do seu histórico de busca. Este aplicativo foi criado especialmente para Android.',
      imgSrc: '/static/projects/user-finder.png',
      href: 'https://user-finder.vercel.app',
      githubLink: 'https://github.com/AndrelhVieira/User-Finder',
    },
    {
      title: 'User Finder - iOS',
      description: 'A mesma ideia do User Finder, mas desenvolvido para iOS nativo usando Swift.',
      imgSrc: '/static/projects/user-finder.png',
      githubLink: 'https://github.com/AndrelhVieira/User-Finder-iOS',
    },
    {
      title: 'User Finder - Android',
      description:
        'A mesma ideia do User Finder, mas desenvolvido para Android nativo usando Java.',
      imgSrc: '/static/projects/user-finder.png',
      githubLink: 'https://github.com/AndrelhVieira/User-Finder-Android',
    },
    {
      title: 'Spotify Template',
      description:
        'O objetivo deste projeto foi aprender a usar o Tailwind CSS combinado com Next JS, um dos mais poderosos frameworks React.',
      imgSrc: '/static/projects/spotify-template.png',
      githubLink: 'https://github.com/AndrelhVieira/next-tailwind-spotify',
    },
    {
      title: 'Barberstone',
      description: `Após uma pesquisa sobre os serviços prestados por barbearias este projeto foi desenvolvido pensando em como poderíamos aperfeiçoar os atendimentos de barbearias, tanto para clientes como para barbeiros e empresários.`,
      imgSrc: '/static/projects/barberstone.png',
      githubLink: 'https://github.com/AndrelhVieira/Barberstone',
      href: 'https://cap-stone-squad-2.vercel.app',
    },
    {
      title: 'Translathor',
      description:
        'Um aplicativo de tradução para dispositivos móveis usando React Native com tema inspirado em Thor. Bem legal, não é?',
      imgSrc: '/static/projects/translathor.png',
      githubLink: 'https://github.com/AndrelhVieira/TranslaThor',
      soon: true,
    },
    {
      title: 'USS Informática',
      description:
        'Um dos meus primeiros projetos como freelancer. Uma apresentação profissional de serviços de informática.',
      imgSrc: '/static/projects/uss.png',
      href: 'https://ussinformatica.com.br',
      githubLink: 'https://github.com/AndrelhVieira/USS_Informatica',
      freela: true,
    },
  ],
  es: [
    {
      title: 'User Finder',
      description:
        'El principal objetivo de esta aplicación es facilitar el acceso a la cuenta de amigos, empleados o incluso la tuya, proporcionando fácilmente el camino hacia los principales proyectos de Github de ese usuario. También puedes ver cuáles han sido tus últimas búsquedas a través de tu historial de búsqueda. Esta aplicación fue creada especialmente para Android.',
      imgSrc: '/static/projects/user-finder.png',
      href: 'https://user-finder.vercel.app',
      githubLink: 'https://github.com/AndrelhVieira/User-Finder',
    },
    {
      title: 'User Finder - iOS',
      description: 'La misma idea de User Finder, pero desarrollada para iOS nativo usando Swift.',
      imgSrc: '/static/projects/user-finder.png',
      githubLink: 'https://github.com/AndrelhVieira/User-Finder-iOS',
    },
    {
      title: 'User Finder - Android',
      description:
        'La misma idea de User Finder, pero desarrollada para Android nativo usando Java.',
      imgSrc: '/static/projects/user-finder.png',
      githubLink: 'https://github.com/AndrelhVieira/User-Finder-Android',
    },
    {
      title: 'Spotify Template',
      description:
        'El objetivo de este proyecto fue aprender a usar Tailwind CSS combinado con Next JS, uno de los frameworks React más potentes.',
      imgSrc: '/static/projects/spotify-template.png',
      githubLink: 'https://github.com/AndrelhVieira/next-tailwind-spotify',
    },
    {
      title: 'Barberstone',
      description:
        'Después de una investigación sobre los servicios prestados por barberías, este proyecto fue desarrollado pensando en cómo podríamos mejorar la atención en las barberías, tanto para los clientes como para los barberos y empresarios.',
      imgSrc: '/static/projects/barberstone.png',
      githubLink: 'https://github.com/AndrelhVieira/Barberstone',
      href: 'https://cap-stone-squad-2.vercel.app',
    },
    {
      title: 'Translathor',
      description:
        'Una aplicación de traducción para dispositivos móviles usando React Native con un tema inspirado en Thor. ¡Muy guay, ¿no?!',
      imgSrc: '/static/projects/translathor.png',
      githubLink: 'https://github.com/AndrelhVieira/TranslaThor',
      soon: true,
    },
    {
      title: 'USS Informática',
      description:
        'Uno de mis primeros proyectos como freelancer. Una presentación profesional de servicios informáticos.',
      imgSrc: '/static/projects/uss.png',
      href: 'https://ussinformatica.com.br',
      githubLink: 'https://github.com/AndrelhVieira/USS_Informatica',
      freela: true,
    },
  ],
}

export default projectsData
