export interface ChangelogEntry {
  /** As written in the heading, for example `2025.08.18`. */
  date: string
  /** Anchor for linking to the entry, for example `2025-08-18`. */
  id: string
  year: number
  /** The entry's markdown, without its heading. */
  body: string
}

export interface ChangelogYear {
  year: number
  entries: ChangelogEntry[]
}

const ENTRY_HEADING = /^# (\d{4})\.(\d{2})\.(\d{2})[ \t]*$/gm

/**
 * Splits changelog markdown into its dated entries. Each entry starts with a
 * `# YYYY.MM.DD` heading. Text before the first heading (such as links to the
 * archive files) isn't an entry and is left out.
 */
export const parseChangelog = (markdown: string): ChangelogEntry[] => {
  const headings = Array.from(markdown.matchAll(ENTRY_HEADING))

  return headings.map((heading, index) => {
    const [line, year, month, day] = heading
    const start = heading.index! + line.length
    const end = headings[index + 1]?.index ?? markdown.length

    return {
      date: `${year}.${month}.${day}`,
      id: `${year}-${month}-${day}`,
      year: Number(year),
      body: markdown.slice(start, end).trim()
    }
  })
}

/** Groups entries by year, newest first, with each year's entries newest first. */
export const groupByYear = (entries: ChangelogEntry[]): ChangelogYear[] => {
  const years = new Map<number, ChangelogEntry[]>()

  for (const entry of entries) {
    years.set(entry.year, [...(years.get(entry.year) ?? []), entry])
  }

  return Array.from(years, ([year, yearEntries]) => ({
    year,
    entries: yearEntries.sort((a, b) => b.date.localeCompare(a.date))
  })).sort((a, b) => b.year - a.year)
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

/** `2025.08.18` → `August 18, 2025`, without time zone shifts. */
export const formatEntryDate = (date: string) => {
  const [year, month, day] = date.split('.').map(Number)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}
