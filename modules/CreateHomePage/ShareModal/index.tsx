/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx'
import InteractiveModal from 'components/UI/InteractiveModal/interactiveModal'
import PageTitle from 'components/UI/PageTitle'
import useLockedBody from 'hooks/useLockedBody'
import ImageParamsForApi from 'models/ImageParamsForApi'
import styles from './component.module.css'
import { CreatePageMode } from 'utils/loadInputCache'
import { Button } from 'components/UI/Button'
import ImageApiParamsToPromptInput from '../../../models/ImageApiParamsToPromptInput'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { IconCopy } from '@tabler/icons-react'
import { useEffect } from 'react'

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

export default function ShareModal({
  handleCloseModal = () => {},
  query,
  setInput,
  shortlinkImageParams
}: {
  handleCloseModal: () => any
  query: any
  setInput: any
  shortlinkImageParams: any
}) {
  const [, setLocked] = useLockedBody(false)

  useEffect(() => {
    setLocked(true)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <InteractiveModal
      className={styles.SharedImageModal}
      handleClose={() => {
        setLocked(false)
        handleCloseModal()
      }}
      maxWidth="480px"
    >
      <div className="flex flex-col w-full px-3">
        <PageTitle>Shared image</PageTitle>
        <div className="flex justify-center w-full">
          <img
            src={`https://s3.amazonaws.com/tinybots.artbot/artbot/images/${
              query[CreatePageMode.SHORTLINK]
            }.webp`}
            alt=""
            className="max-h-[256px]"
          />
        </div>
        <div className="flex justify-center w-full px-2 mt-4 mb-4 italic">
          {shortlinkImageParams.prompt}
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
              'p-4',
              styles['image-details']
            ])}
          >
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(
                cleanData({
                  ...shortlinkImageParams,
                  ...shortlinkImageParams.params
                }),
                null,
                2
              )}
            </pre>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            maxWidth: '100%',
            paddingBottom: '8px'
          }}
        >
          <Button
            onClick={() => {
              let initialState = new ImageApiParamsToPromptInput(
                shortlinkImageParams
              )
              setInput({
                ...(initialState as DefaultPromptInput)
              })
              setLocked(false)
              handleCloseModal()
            }}
          >
            <IconCopy /> Use image parameters
          </Button>
        </div>
      </div>
    </InteractiveModal>
  )
}
