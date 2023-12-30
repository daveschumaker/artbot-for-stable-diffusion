import { ReactNode } from 'react'
import ContentWrapper from 'app/_components/ContentWrapper'
import FixedMenu from 'app/_modules/FixedMenu'
import MaxWidth from 'app/_components/MaxWidth'
import MobileFooter from 'app/_modules/MobileFooter'
import AppUpdate from 'app/_modules/AppUpdate'

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <FixedMenu />
      <ContentWrapper>
        <AppUpdate />
        <MaxWidth margin="0 auto">{children}</MaxWidth>
      </ContentWrapper>
      <MobileFooter />
    </>
  )
}
