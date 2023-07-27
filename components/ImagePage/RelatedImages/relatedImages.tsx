/* eslint-disable @next/next/no-img-element */
import useScrollToLocation from 'hooks/useScrollToLocation'
import Link from 'next/link'
import React from 'react'
import { useCallback } from 'react'
import LazyLoad from 'react-lazyload'
import styled from 'styled-components'
import { trackEvent } from '../../../api/telemetry'
import useComponentState from '../../../hooks/useComponentState'
import { useWindowSize } from '../../../hooks/useWindowSize'
import { bulkDeleteImages } from '../../../utils/db'
import ConfirmationModal from '../../ConfirmationModal'
import CircleCheckIcon from '../../icons/CircleCheckIcon'
import HeartIcon from '../../icons/HeartIcon'
import TrashIcon from '../../icons/TrashIcon'
import MasonryLayout from '../../MasonryLayout'
import FloatingActionButton from '../../UI/FloatingActionButton'
import MenuButton from 'app/_components/MenuButton'
import PageTitle from 'app/_components/PageTitle'
import TextButton from '../../UI/TextButton'
import useRelatedImageModal from './useRelatedImageModal'

const NonLink = styled.div`
  cursor: pointer;
  position: relative;
`

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: gray;
  opacity: 0.6;
`

const SelectCheck = styled(CircleCheckIcon)`
  position: absolute;
  bottom: 4px;
  right: 4px;
`

const StyledHeartIcon = styled(HeartIcon)`
  position: absolute;
  top: 4px;
  right: 4px;
`

const ButtonContainer = styled.div`
  column-gap: 8px;
  display: flex;
  flex-direction: row;
  row-gap: 4px;
  max-width: 240px;
  flex-wrap: wrap;
  justify-content: end;

  @media (min-width: 640px) {
    max-width: 100%;
  }
`

const RelatedImages = ({
  imageId,
  parentJobId,
  images = [],
  onModalOpen = () => {},
  updateRelatedImages = () => {}
}: {
  imageId: string
  parentJobId: string
  images: Array<any>
  onModalOpen: (value: boolean) => void
  updateRelatedImages: (parentJobId: string) => void
}) => {
  useScrollToLocation()
  const size = useWindowSize()
  const [componentState, setComponentState] = useComponentState({
    deleteMode: false,
    deleteSelection: [],
    showDeleteModal: false,
    initialIndexJobId: 0
  })

  const [showImageModal] = useRelatedImageModal()

  let imageColumns = 2
  // @ts-ignore
  if (size?.width > 1280) {
    imageColumns = 4
    // @ts-ignore
  } else if (size?.width > 800) {
    imageColumns = 3
  }

  const handleDeleteImageClick = async () => {
    trackEvent({
      event: 'BULK_DELETE_CLICK',
      context: 'ImageDetailsPage',
      data: {
        totalImages: componentState.totalImages,
        numImagesDeleted: componentState.deleteSelection.length
      }
    })

    await bulkDeleteImages(componentState.deleteSelection)
    await updateRelatedImages(parentJobId)

    setComponentState({
      deleteMode: false,
      deleteSelection: [],
      showDeleteModal: false
    })
  }

  // TODO: FIXME:
  // const handleAfterDelete = useCallback(async () => {
  //   await updateRelatedImages(parentJobId)
  // }, [parentJobId, updateRelatedImages])

  const handleImageClick = useCallback(
    // @ts-ignore
    ({ e, id, jobId }) => {
      let newArray: Array<string> = [...componentState.deleteSelection]
      if (componentState.deleteMode) {
        const index = newArray.indexOf(id)
        if (index >= 0) {
          newArray.splice(index, 1)
        } else {
          newArray.push(id)
        }
      } else {
        e.preventDefault()
        e.stopPropagation()

        onModalOpen(true)

        // @ts-ignore
        showImageModal({
          jobId,
          images
        })
      }

      setComponentState({ deleteSelection: newArray })
    },
    [
      componentState.deleteMode,
      componentState.deleteSelection,
      images,
      onModalOpen,
      setComponentState,
      showImageModal
    ]
  )

  const LinkEl = componentState.deleteMode ? NonLink : Link

  const filteredImages = images.filter((image) => {
    return image.jobId !== imageId
  })

  if (filteredImages.length === 0) {
    return null
  }

  return (
    <div className="relative">
      {componentState.deleteMode && (
        <FloatingActionButton
          onClick={() => {
            if (componentState.deleteSelection.length > 0) {
              setComponentState({ showDeleteModal: true })
            }
          }}
        >
          <TrashIcon />
          DELETE ({componentState.deleteSelection.length})?
        </FloatingActionButton>
      )}
      {componentState.showDeleteModal && (
        <ConfirmationModal
          multiImage={componentState.deleteSelection.length > 1}
          onConfirmClick={() => handleDeleteImageClick()}
          closeModal={() => {
            setComponentState({
              deleteMode: false,
              deleteSelection: [],
              showDeleteModal: false
            })
          }}
        />
      )}
      <div className="flex flex-row w-full items-center">
        <div className="inline-block w-1/2">
          <PageTitle>Related images</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[36px] relative gap-2">
          <MenuButton
            active={componentState.deleteMode}
            title="Select Images"
            onClick={() => {
              if (componentState.deleteMode) {
                setComponentState({ deleteMode: false, deleteSelection: [] })
              } else {
                setComponentState({
                  deleteMode: true
                })
              }
            }}
          >
            <CircleCheckIcon size={24} />
          </MenuButton>
        </div>
      </div>
      <div className="flex flex-row w-full justify-between">
        {!componentState.deleteMode && (
          <div className="text-sm mb-2 text-teal-500">
            Showing {images.length} related images
          </div>
        )}
        {componentState.deleteMode && (
          <>
            <div className="text-sm mb-2 text-teal-500">
              selected ({componentState.deleteSelection.length})
            </div>
            <ButtonContainer>
              <TextButton
                onClick={() => {
                  setComponentState({ deleteMode: false, deleteSelection: [] })
                }}
                tabIndex={0}
              >
                cancel
              </TextButton>
              {/* <TextButton
              onClick={() => {
                handleSelectAll()
              }}
              tabIndex={0}
            >
              select all
            </TextButton>
            <TextButton onClick={handleDownloadClick} tabIndex={0}>
              download
            </TextButton> */}
              <TextButton
                color="red"
                onClick={() => {
                  if (componentState.deleteSelection.length > 0) {
                    setComponentState({ showDeleteModal: true })
                  }
                }}
                tabIndex={0}
              >
                delete
              </TextButton>
            </ButtonContainer>
          </>
        )}
      </div>
      <div className="mt-4 flex gap-y-2.5 flex-wrap gap-x-2.5">
        <a id="related-images"></a>
        <MasonryLayout columns={imageColumns} gap={8}>
          {filteredImages.map(
            (image: {
              id: string
              favorited: boolean
              jobId: string
              base64String: string
              thumbnail: string
              prompt: string
              timestamp: number
              seed: number
            }) => {
              return (
                <LazyLoad key={image.jobId} once>
                  <div className="relative">
                    <LinkEl
                      href={`/image/${image.jobId}`}
                      passHref
                      // @ts-ignore
                      onClick={(e) =>
                        handleImageClick({
                          e,
                          id: image.id,
                          jobId: image.jobId
                        })
                      }
                    >
                      <img
                        src={
                          'data:image/webp;base64,' +
                          (image.thumbnail || image.base64String)
                        }
                        style={{
                          borderRadius: '4px',
                          width: '100%',
                          display: 'block'
                        }}
                        alt={image.prompt}
                      />
                      {componentState.deleteMode &&
                        componentState.deleteSelection.indexOf(image.id) >=
                          0 && <ImageOverlay></ImageOverlay>}
                      {componentState.deleteMode &&
                        componentState.deleteSelection.indexOf(image.id) ===
                          -1 && <SelectCheck />}
                      {componentState.deleteMode &&
                        componentState.deleteSelection.indexOf(image.id) >=
                          0 && <SelectCheck fill="blue" stroke="white" />}
                      {image.favorited && (
                        <StyledHeartIcon
                          fill="#14B8A6"
                          width={2}
                          size={32}
                          shadow
                        />
                      )}
                    </LinkEl>
                  </div>
                </LazyLoad>
              )
            }
          )}
        </MasonryLayout>
      </div>
    </div>
  )
}

function areEqual(prevProps: any, nextProps: any) {
  const imageIdEqual = prevProps.imageId === nextProps.imageId
  const listEqual = prevProps.images === nextProps.images

  return imageIdEqual && listEqual
}

export default React.memo(RelatedImages, areEqual)
