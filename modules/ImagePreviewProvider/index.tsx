import ImageModalV2 from 'components/ImageModalV2'
import usePath from 'hooks/usePath'
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

export interface IShowImagePreviewModal {
  disableNav?: boolean
  handleLoadNext?: any
  handleLoadPrev?: any
  imageDetails: any
  onDeleteCallback?: any
  onCloseCallback?: any
}

interface ImagePreviewContextData {
  setImageData: any
  isImageModalOpen: boolean
  handleModalClose: any
  showImagePreviewModal: any
}

const ImagePreviewContext = createContext<ImagePreviewContextData>({
  setImageData: () => {},
  isImageModalOpen: false,
  handleModalClose: () => {},
  showImagePreviewModal: () => {}
})

export const useImagePreview = () => {
  return useContext(ImagePreviewContext)
}

export const ImagePreviewProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const path = usePath()
  const prevPath = useRef(path)
  const [imageData, setImageData] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [componentProps, setComponentProps] = useState<any>({})

  const handleModalClose = () => {
    setImageData(null)
    setShowModal(false)
    componentProps.onCloseCallback()
  }

  const showImagePreviewModal = ({
    disableNav = false,
    handleLoadNext = () => {},
    handleLoadPrev = () => {},
    imageDetails,
    onDeleteCallback = () => {},
    onCloseCallback = () => {}
  }: IShowImagePreviewModal) => {
    setComponentProps({
      disableNav,
      handleLoadNext,
      handleLoadPrev,
      onCloseCallback,
      onDeleteCallback
    })
    setImageData(imageDetails)
  }

  useEffect(() => {
    if (!path) {
      return
    }

    if (path && !prevPath.current) {
      prevPath.current = path
      return
    }

    if (!showModal && path !== prevPath.current) {
      prevPath.current = path
      return
    }

    if (path !== prevPath.current) {
      handleModalClose()
    }
  }, [path, showModal])

  useEffect(() => {
    if (imageData && !showModal) {
      setShowModal(true)
    }
  }, [imageData, showModal])

  return (
    <ImagePreviewContext.Provider
      value={{
        setImageData,
        isImageModalOpen: showModal,
        handleModalClose,
        showImagePreviewModal
      }}
    >
      <>
        {showModal && (
          <ImageModalV2
            handleClose={handleModalClose}
            imageDetails={imageData}
            {...componentProps}
          />
        )}
        {children}
      </>
    </ImagePreviewContext.Provider>
  )
}
