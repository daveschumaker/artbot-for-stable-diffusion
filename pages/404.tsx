/* eslint-disable @next/next/no-img-element */
import PageTitle from '../components/PageTitle'

export default function NotFoundPage() {
  return (
    <div>
      <PageTitle>404</PageTitle>
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
