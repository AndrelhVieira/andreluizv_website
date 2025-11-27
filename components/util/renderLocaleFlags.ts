export default function renderLocaleFlags(newLocale: string): string {
  switch (newLocale) {
    case 'en':
      return '🇬🇧'
    case 'pt':
      return '🇧🇷'
    case 'es':
    default:
      return '🇪🇸'
  }
}
