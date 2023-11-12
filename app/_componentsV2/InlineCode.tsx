import React from 'react'

export function InlineCode({
  children
}: {
  children: React.ReactNode | string
}) {
  return (
    <code className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-300 font-mono px-1 py-0.5 rounded">
      {children}
    </code>
  )
}
