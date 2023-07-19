/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import { trackEvent } from '../api/telemetry'
import PageTitle from 'app/_components/PageTitle'
import { useEffectOnce } from '../hooks/useEffectOnce'

export default function NotFoundPage() {
  const router = useRouter()
  const { pathname } = router

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/404',
      data: {
        referrer: document.referrer,
        pathname
      }
    })
  })

  return (
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
  )
}
