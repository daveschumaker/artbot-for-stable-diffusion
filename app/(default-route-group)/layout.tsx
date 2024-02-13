import { ReactNode } from 'react'
import ContentWrapper from 'app/_components/ContentWrapper'
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
      <ContentWrapper>
        <div className="flex flex-row w-full gap-4">
          <div className="w-full">
            <AppUpdate />
            {children}
          </div>
        </div>
      </ContentWrapper>
      <MobileFooter />
    </>
  )
}
