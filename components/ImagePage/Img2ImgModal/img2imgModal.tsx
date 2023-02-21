/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import {
  uploadImg2Img,
  uploadInpaint
} from '../../../controllers/imageDetailsCommon'
import useComponentState from '../../../hooks/useComponentState'
import { useWindowSize } from '../../../hooks/useWindowSize'
import EyeIcon from '../../icons/EyeIcon'
import { Button } from '../../UI/Button'
import InteractiveModal from '../../UI/InteractiveModal/interactiveModal'
import PageTitle from '../../UI/PageTitle'
import styles from './img2imgModal.module.css'

const Img2ImgModal = ({
  handleClose,
  imageDetails
}: {
  handleClose: () => void
  imageDetails: any
}) => {
  const size = useWindowSize()
  const router = useRouter()
  const { source_image, source_mask } = imageDetails

  const ref = useRef<any>(null)

  const [componentState, setComponentState] = useComponentState({
    containerHeight: 512,
    imageMaxHeight: 700,
    viewMask: false
  })

  useEffect(() => {
    if (ref?.current?.clientHeight) {
      setTimeout(() => {
        let containerHeight = ref?.current?.clientHeight ?? 0
        let imageHeight = containerHeight

        if (window.innerHeight <= containerHeight) {
          containerHeight = window.innerHeight - 80
          imageHeight = window.innerHeight - 170
        }

        setComponentState({
          containerHeight: containerHeight,
          imageMaxHeight: imageHeight
        })
      }, 100)
    }
  }, [imageDetails.source_image, setComponentState])

  let isMobile = false
  if (size && size.width) {
    isMobile = size.width < 640 || false
  }

  return (
    <InteractiveModal
      className={styles['styled-modal']}
      handleClose={handleClose}
      setDynamicHeight={componentState.containerHeight}
    >
      <div className={styles['content-wrapper']} ref={ref}>
        <PageTitle>Source image</PageTitle>
        <div className={styles['image-container']}>
          <img
            className={styles['src-img']}
            src={'data:image/webp;base64,' + source_image}
            alt="source image for img2img request"
          />
          {componentState.viewMask && (
            <img
              className={styles['src-img-mask']}
              src={'data:image/webp;base64,' + source_mask}
              alt="source image mask for img2img request"
            />
          )}
        </div>
        <div className={styles['options-wrapper']}>
          {source_mask && (
            <Button
              onClick={() => {
                if (componentState.viewMask) {
                  setComponentState({ viewMask: false })
                } else {
                  setComponentState({ viewMask: true })
                }
              }}
              width={isMobile ? '100%' : ''}
            >
              <EyeIcon /> Toggle mask
            </Button>
          )}
          <Button
            onClick={() => {
              uploadImg2Img(imageDetails, { useSourceImg: true })
              router.push(`/?panel=img2img&edit=true`)
            }}
            width={isMobile ? '100%' : ''}
          >
            New img2img
          </Button>
          <Button
            onClick={() => {
              uploadInpaint(imageDetails, { clone: false, useSourceImg: true })
              router.push(`/?panel=inpainting&edit=true`)
            }}
            width={isMobile ? '100%' : ''}
          >
            New inpaint
          </Button>
          {source_mask && (
            <Button
              onClick={() => {
                uploadInpaint(imageDetails, {
                  clone: true,
                  useSourceImg: true,
                  useSourceMask: true
                })
                router.push(`/?panel=inpainting&edit=true`)
              }}
              width={isMobile ? '100%' : ''}
            >
              Clone mask
            </Button>
          )}
        </div>
      </div>
    </InteractiveModal>
  )
}

export default Img2ImgModal
