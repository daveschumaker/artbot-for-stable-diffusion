/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
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
import MasonryLayout from '../../MasonryLayout'
import MenuButton from '../../UI/MenuButton'
import PageTitle from '../../UI/PageTitle'
import TextButton from '../../UI/TextButton'

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
  jobId,
  images = [],
  updateRelatedImages = () => {}
}: {
  jobId: string
  images: Array<any>
  updateRelatedImages: () => void
}) => {
  const size = useWindowSize()
  const [componentState, setComponentState] = useComponentState({
    deleteMode: false,
    deleteSelection: [],
    showDeleteModal: false
  })

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

    // @ts-ignore
    await updateRelatedImages(jobId)

    setComponentState({
      deleteMode: false,
      deleteSelection: [],
      showDeleteModal: false
    })
  }

  const handleImageClick = useCallback(
    (id: string) => {
      let newArray: Array<string> = [...componentState.deleteSelection]
      if (componentState.deleteMode) {
        const index = newArray.indexOf(id)
        if (index >= 0) {
          newArray.splice(index, 1)
        } else {
          newArray.push(id)
        }
      }

      setComponentState({ deleteSelection: newArray })
    },
    [
      componentState.deleteMode,
      componentState.deleteSelection,
      setComponentState
    ]
  )

  const LinkEl = componentState.deleteMode ? NonLink : Link

  return (
    <>
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
        <MasonryLayout columns={imageColumns} gap={8}>
          {images.map(
            (image: {
              id: string
              favorited: boolean
              jobId: string
              base64String: string
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
                      onClick={() => handleImageClick(image.id)}
                    >
                      <img
                        src={'data:image/webp;base64,' + image.base64String}
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
    </>
  )
}

export default RelatedImages
