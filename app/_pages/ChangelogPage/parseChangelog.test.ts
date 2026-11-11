import { readFileSync } from 'node:fs'
import path from 'node:path'
import { formatEntryDate, groupByYear, parseChangelog } from './parseChangelog'

const root = path.join(__dirname, '../../..')
const read = (file: string) => readFileSync(path.join(root, file), 'utf8')
const FILES = [
  'CHANGELOG.md',
  'changelog/2024.md',
  'changelog/2023.md',
  'changelog/2022.md'
]

describe('parseChangelog', () => {
  it('splits entries and leaves out text before the first heading', () => {
    const entries = parseChangelog(
      'See the archive.\n\n# 2025.08.18\n\n- One\n- Two\n\n# 2024.07.05\n- Three\n'
    )

    expect(entries).toEqual([
      {
        date: '2025.08.18',
        id: '2025-08-18',
        year: 2025,
        body: '- One\n- Two'
      },
      { date: '2024.07.05', id: '2024-07-05', year: 2024, body: '- Three' }
    ])
  })

  it('treats only date headings as entries', () => {
    const entries = parseChangelog(
      '# 2025.08.18\n- Text with # 2024.01.01 in it\n## Not a date\n'
    )

    expect(entries).toHaveLength(1)
    expect(entries[0].body).toBe(
      '- Text with # 2024.01.01 in it\n## Not a date'
    )
  })

  it('groups entries by year, newest first', () => {
    const years = groupByYear(
      parseChangelog('# 2024.01.02\n- a\n# 2025.03.04\n- b\n# 2024.05.06\n- c')
    )

    expect(
      years.map(({ year, entries }) => [year, entries.map((e) => e.date)])
    ).toEqual([
      [2025, ['2025.03.04']],
      [2024, ['2024.05.06', '2024.01.02']]
    ])
  })

  it('formats dates without shifting them across time zones', () => {
    expect(formatEntryDate('2025.08.18')).toBe('August 18, 2025')
    expect(formatEntryDate('2023.01.01')).toBe('January 1, 2023')
  })
})

describe('the changelog files', () => {
  const entries = FILES.flatMap((file) => parseChangelog(read(file)))

  it('keeps every entry', () => {
    // 234 entries up to 2025.08.18, plus the upgrade release.
    expect(entries).toHaveLength(235)
  })

  it('has one entry per date, so every anchor is unique', () => {
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length)
  })

  it('keeps each archive to its own year', () => {
    for (const year of [2022, 2023, 2024]) {
      const archived = parseChangelog(read(`changelog/${year}.md`))
      expect(archived.length).toBeGreaterThan(0)
      expect(archived.every((entry) => entry.year === year)).toBe(true)
    }
  })

  it('has no empty entries', () => {
    expect(entries.filter((entry) => !entry.body)).toEqual([])
  })
})
