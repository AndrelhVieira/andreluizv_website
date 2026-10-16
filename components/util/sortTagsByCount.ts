export const sortTagsByCount = (tagCounts: Record<string, number>): string[] => {
  return Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a] || a.localeCompare(b))
}
