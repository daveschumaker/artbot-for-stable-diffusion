import { baseHost, basePath } from 'BASE_PATH'
import { InputErrorsProvider } from 'app/_modules/ErrorProvider/context'
import { InputProvider } from 'app/_modules/InputProvider/context'
import LivePaint from 'app/_pages/LivePaintPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Paint - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Live Paint',
    images: [`${baseHost}${basePath}/robots_drawing.png`]
  },
  twitter: {
    images: `${baseHost}${basePath}/robots_drawing.png`
  }
}

export default function Page() {
  return (
    <InputProvider>
      <InputErrorsProvider>
        <LivePaint />
      </InputErrorsProvider>
    </InputProvider>
  )
}
