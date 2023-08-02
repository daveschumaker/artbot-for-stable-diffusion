/* eslint-disable @next/next/no-img-element */
import PageTitle from 'app/_components/PageTitle'
import clsx from 'clsx'
import ImageParamsForApi from 'models/ImageParamsForApi'
import FixedMenu from '../FixedMenu'
import ModalProvider from '../ModalProvider'
import ContentWrapper from 'app/_components/ContentWrapper'
import MaxWidth from 'app/_components/MaxWidth'

const cleanData = (imageDetails: any) => {
  // @ts-ignore
  const params = new ImageParamsForApi(imageDetails)

  // @ts-ignore

  if (params.source_image) {
    // @ts-ignore
    params.source_image = '[true]'
  }

  // @ts-ignore
  if (params.source_mask) {
    // @ts-ignore
    params.source_mask = '[true]'
  }

  return params
}

export default function SharedImageView({ imageDetails, imageId }: any) {
  console.log(`imageDetails`, imageDetails)

  return (
    <>
      <FixedMenu />
      <ModalProvider>
        <ContentWrapper>
          <MaxWidth>
            <PageTitle>Shared image</PageTitle>
            <div className="flex justify-center w-full">
              <img
                src={`https://s3.amazonaws.com/tinybots.artbot/artbot/images/${imageId}.webp`}
                alt=""
                className="max-h-[256px]"
              />
            </div>
            <div className="flex justify-center w-full px-2 mt-4 mb-4 italic">
              {imageDetails.prompt}
            </div>
            <div className="flex flex-row">
              <div
                className={clsx([
                  'bg-slate-800',
                  'font-mono',
                  'text-white',
                  'text-sm',
                  'overflow-x-auto',
                  'mt-2',
                  'mb-2',
                  'mx-4',
                  'rounded-md',
                  'p-4'
                ])}
              >
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(
                    cleanData({
                      ...imageDetails,
                      ...imageDetails.params
                    }),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </MaxWidth>
        </ContentWrapper>
      </ModalProvider>
    </>
  )
}
