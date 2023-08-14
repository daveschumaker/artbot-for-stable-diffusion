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

  // @ts-ignore
  delete params.nsfw
  // @ts-ignore
  delete params.censor_nsfw
  // @ts-ignore
  delete params.trusted_workers
  // @ts-ignore
  delete params.shared
  // @ts-ignore
  delete params.slow_workers
  // @ts-ignore
  delete params.r2
  // @ts-ignore
  delete params.dry_run

  /*** Remove these as they are the default options ***/
  // @ts-ignore
  if (params.params.post_processing.length === 0) {
    // @ts-ignore
    delete params.params.post_processing
  }

  // @ts-ignore
  if (params.params.clip_skip === 1) {
    // @ts-ignore
    delete params.params.clip_skip
  }

  // @ts-ignore
  if (params.params.n === 1) {
    // @ts-ignore
    delete params.params.n
  }

  // @ts-ignore
  if (!params.params.tiling) {
    // @ts-ignore
    delete params.params.tiling
  }

  // @ts-ignore
  if (params.replacement_filter) {
    // @ts-ignore
    delete params.replacement_filter
  }

  // @ts-ignore
  if (!params.params.return_control_map) {
    // @ts-ignore
    delete params.params.return_control_map
  }

  // @ts-ignore
  if (!params.params.image_is_control) {
    // @ts-ignore
    delete params.params.image_is_control
  }

  console.log(params)

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
