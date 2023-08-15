/* eslint-disable @next/next/no-img-element */
import PageTitle from 'app/_components/PageTitle'
import clsx from 'clsx'
import FixedMenu from '../FixedMenu'
import ModalProvider from '../ModalProvider'
import ContentWrapper from 'app/_components/ContentWrapper'
import MaxWidth from 'app/_components/MaxWidth'
import { cleanDataForApiRequestDisplay } from 'utils/imageUtils'

export default function SharedImageView({ imageDetails, imageId }: any) {
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
                    cleanDataForApiRequestDisplay({
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
