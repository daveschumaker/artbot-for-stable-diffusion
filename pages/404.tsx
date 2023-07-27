/* eslint-disable @next/next/no-img-element */
import ContentWrapper from 'app/_components/ContentWrapper'
import MaxWidth from 'app/_components/MaxWidth'
import PageTitle from 'app/_components/PageTitle'
import FixedMenu from 'app/_modules/FixedMenu'
import '../styles/globals.css'
import HeaderNav from 'app/_modules/HeaderNav'
import SlidingMenu from 'app/_modules/SlidingMenu'

export default function NotFoundPage() {
  return (
    <div style={{ width: '100%' }}>
      <HeaderNav />
      <SlidingMenu />
      <FixedMenu />
      <ContentWrapper>
        <MaxWidth>
          <div>
            <PageTitle>404 - ArtBot for Stable Diffusion</PageTitle>
            There is nothing for you here...
            <img
              src="/artbot/sad-robot.svg"
              height={60}
              width={60}
              alt="Image not found"
              className="mt-2"
            />
          </div>
        </MaxWidth>
      </ContentWrapper>
    </div>
  )
}
