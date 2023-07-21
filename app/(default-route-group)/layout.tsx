import { ReactNode } from 'react'
import ContentWrapper from 'app/_components/ContentWrapper'
import FixedMenu from 'app/_modules/FixedMenu'
import ModalProvider from 'app/_modules/ModalProvider'
import MaxWidth from 'app/_components/MaxWidth'

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
      <ModalProvider>
        <ContentWrapper>
          <MaxWidth>{children}</MaxWidth>
          <div>HELLO!</div>
        </ContentWrapper>
      </ModalProvider>
    </>
  )
}
