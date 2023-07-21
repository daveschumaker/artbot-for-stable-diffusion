import { ReactNode } from 'react'
import HeaderNav from './_modules/HeaderNav'
import '../styles/globals.css'
import AppInit from './_modules/AppInit'
import SlidingMenu from './_modules/SlidingMenu'

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppInit />
        <HeaderNav />
        <SlidingMenu />
        {children}
      </body>
    </html>
  )
}
