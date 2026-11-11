import { ComponentProps } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import PageTitle from 'app/_components/PageTitle'
import CHANGELOG from '../../../CHANGELOG.md'
import CHANGELOG_2024 from '../../../changelog/2024.md'
import CHANGELOG_2023 from '../../../changelog/2023.md'
import CHANGELOG_2022 from '../../../changelog/2022.md'
import ChangelogContact from './ChangelogContact'
import OpenLinkedEntry from './OpenLinkedEntry'
import {
  ChangelogEntry,
  formatEntryDate,
  groupByYear,
  parseChangelog
} from './parseChangelog'
import styles from './changelog.module.css'

// CHANGELOG.md holds recent entries. Older years are archived in changelog/.
const YEARS = groupByYear(
  [CHANGELOG, CHANGELOG_2024, CHANGELOG_2023, CHANGELOG_2022].flatMap(
    parseChangelog
  )
)

const MarkdownLink = ({ href = '', children }: ComponentProps<'a'>) => {
  // Site paths go through next/link, which adds the /artbot base path.
  if (href.startsWith('/')) {
    return (
      <Link className={styles.link} href={href}>
        {children}
      </Link>
    )
  }

  let sameSite = false
  try {
    sameSite = ['tinybots.net', 'localhost'].includes(new URL(href).hostname)
  } catch {
    // Not an absolute URL, such as a #fragment.
    sameSite = true
  }

  return (
    <a
      className={styles.link}
      href={href}
      {...(sameSite ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </a>
  )
}

const Entry = ({ entry }: { entry: ChangelogEntry }) => (
  <article className={styles.entry} id={entry.id}>
    <h3 className={styles['entry-date']}>
      <a className={styles.anchor} href={`#${entry.id}`}>
        {formatEntryDate(entry.date)}
      </a>
    </h3>
    <div className={styles['entry-body']}>
      <ReactMarkdown
        components={{
          a: MarkdownLink,
          code: ({ children }) => <code className="text-sm">{children}</code>,
          li: ({ children }) => (
            <li className={styles['styled-li']}>{children}</li>
          ),
          ul: ({ children }) => (
            <ul className={styles['styled-ul']}>{children}</ul>
          )
        }}
      >
        {entry.body}
      </ReactMarkdown>
    </div>
  </article>
)

const updates = (count: number) => `${count} update${count === 1 ? '' : 's'}`

export default function ChangelogPage() {
  return (
    <div className="mb-4">
      <OpenLinkedEntry />
      <PageTitle>Changelog</PageTitle>
      <div className="mb-4">
        The latest happenings on ArtBot. Have a feature request or bug report?{' '}
        <ChangelogContact />
      </div>
      <nav aria-label="Changelog years" className={styles['year-nav']}>
        {YEARS.map(({ year }) => (
          <a className={styles['year-link']} href={`#year-${year}`} key={year}>
            {year}
          </a>
        ))}
      </nav>
      {YEARS.map(({ year, entries }, index) => (
        // The newest year starts open. Older years open on demand.
        <details
          className={styles.year}
          id={`year-${year}`}
          key={year}
          open={index === 0}
        >
          <summary className={styles['year-summary']}>
            <h2 className={styles['year-title']}>{year}</h2>
            <span className={styles['year-count']}>
              {updates(entries.length)}
            </span>
          </summary>
          {entries.map((entry) => (
            <Entry entry={entry} key={entry.id} />
          ))}
        </details>
      ))}
    </div>
  )
}
